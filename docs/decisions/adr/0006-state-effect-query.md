# 0006-状态效果求值框架（getStates 延续 + 循环调用解决）

> 状态：已定案 · 日期：2026-08-08

## 背景

状态效果（距离修正、手牌上限、技能失效等）采用**惰性求值**方案：效果定义携带回调，挂载后按类型索引登记，查询点实时遍历求值。该方案延续自旧项目 `getStates`，但旧项目存在两个循环调用缺陷：

1. **固有递归**：`Effect.check()` → `isInvalid` → `getStates(Skill_Invalidity)`。旧项目靠 `getStates` 内特判堵洞（被判定对象自身定义了失效回调 → 直接返回空）。
2. **用户回调环**：`condition` / 状态回调里调用 `getStates` 或组合查询（`distance` 等），被遍历效果的回调又调回来 → 无限递归。旧项目无系统性防护，靠编写者自觉。

新项目 `Room` 已具备 `stateEffectsById` / `stateEffectsByType` 索引与 `getStateEffectsByType`，`StateEffect` 仅登记索引，缺求值方法与生命周期（挂载/移除）。

## 结论

### 1. getStates 形态（Room 方法）

```ts
private _stateQueryStack: StateEffectType[] = [];

getStates<Type extends StateEffectType>(
    type: Type,
    args: Parameters<EffectState[Type]>
): ReturnType<EffectState[Type]>[] {
    // 同类型递归进入 → 环，中断并告警
    if (this._stateQueryStack.includes(type)) {
        this.logger.warn(`[getStates] 循环检测：${type} 递归进入，已中断`);
        return [];
    }
    this._stateQueryStack.push(type);
    try {
        return this.getStateEffectsByType(type)
            .filter((v) => v !== args[0] && v.check())      // 排除"自己判定自己"
            .map((v) => v.state![type].call(v, ...args))
            .filter((v) => v !== undefined);
    } finally {
        this._stateQueryStack.pop();
    }
}
```

### 2. 同类型求值栈防环（核心）

- 任何环（A→B→C→A）绕回同一类型时必被截断，不可能死循环。
- 合法场景不受影响：单次求值中同一类型只会被查询一次（组合器单向调用叶子）。
- 固有递归自动覆盖：`check()` → `isInvalid` → `getStates(Skill_Invalidity, [v])` 第二次进入时栈中已有该类型 → 截断 → 被判定效果视为"未被状态效果失效"，自动实现旧项目特判语义，无需按类型特判。
- `v !== args[0]` 保留：防止"定义了失效回调的效果判定自己失效"的自判定。

### 3. 分层约定（栈是兜底，约定才是正道）

- **叶子回调只读事实**：修正值/判定函数只读 hp、手牌、装备、标记、区域、回合阶段等原始数据，**不调用 getStates / distance / range / maxhand**。
- **组合器单向依赖**：`distance()`、`maxhand()` 是唯一允许调 `getStates` 的地方，消费叶子、叶子不反向调用 → 有向无环。
- 需要"读距离"的条件（如距离为 1）→ 读组合器已求值的结果，不在 condition 里嵌套调用。

### 4. 与旧项目对比

| | 旧项目 | 新项目 |
|---|---|---|
| 防环 | 两个类型特判 + 自觉 | 统一栈检测覆盖全部类型 |
| 违规反馈 | 无 | warn 日志 |
| 失效豁免 | 特判代码 | 栈检测自然覆盖 |

### 5. 待补项

- `StateEffectType` 枚举补全（Distance_*、MaxHand_*、Range_*、Skill_Invalidity、FieldCardEyes 等）。
- 状态效果挂载/移除生命周期与同步协议（`MsgAddEffect` / `MsgRemoveEffect` 等价物）。
- **变更提示**：无视（`ignoreRecords` 注册式记录）的整体实现**或将修改为状态效果实现**——归入 `Skill_Invalidity` 查询点，依托失效框架统一（失效可判定/可同步）。当前保留注册式记录实现，是否迁移待定。

## 关联

- 0007 卡牌可见性（FieldCardEyes 查询点依赖本框架）
- 0008 技能"修改描述"（SkillModify 查询点依赖本框架）
- R3 技能框架
