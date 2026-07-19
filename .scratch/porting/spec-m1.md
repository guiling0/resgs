# M1 触发技闭环 Spec

> 状态: `ready-for-agent`
> 里程碑: M1 触发技闭环
> 父文档: [map.md](map.md)

---

## Problem Statement

`EventManager.trigger()` 在扫描到可用触发效果后，停在 `TODO Phase 7` 注释——**任何触发技都无法发动**。玩家受到伤害后〖刚烈〗不会触发，回合开始时〖闭月〗不会摸牌。引擎层的 80% 工作（事件/区域/选择系统）已经就绪，但最后一条链路断开，整个游戏无法进行。

---

## Solution

在 `EventManager.trigger()` 中补齐触发技的主循环：扫描 → 询问 → 创建 UseSkillEvent → 执行 → 重试 → 直到无人可选。

```
trigger()
  discovery (已有)          ← 扫描 triggerEffects，按优先级+逆时针排序
      ↓
  execution loop (新增)     ← 对每个玩家，按优先级逐个询问
      ↓
  askForSkillInvoke (新增)  ← forced='mute'自动发动 / forced='cost'走ChooseManager
      ↓
  UseSkillEvent.exec() (已有) ← choose→cost→effect 管线
      ↓
  re-scan (新增)            ← 同玩家同优先级允许再次尝试，直到无人可选
      ↓
  refreshs-after (已有)     ← 不变
```

验收：headless 测试中注册一个"受到伤害后摸一张牌"技能，造成伤害→技能自动发动→手牌+1。

---

## User Stories

1. As a 玩家, I want 锁定技在时机到达时自动发动, so that 〖马术〗、〖空城〗等被动效果无需手动确认即可生效
2. As a 玩家, I want 普通触发技在时机到达时弹出确认询问, so that 我可以选择是否发动〖刚烈〗、〖反馈〗
3. As a 玩家, I want 拒绝发动后不消耗任何资源, so that 我可以在更有利的时机使用技能
4. As a 玩家, I want 同一时机多个技能按武将>装备>卡牌>规则的优先级依次询问, so that 〖护驾〗在八卦阵之前触发
5. As a 玩家, I want 同优先级下从当前回合角色逆时针询问, so that 响应顺序符合游戏规则
6. As a 玩家, I want 每名角色对同一技能每时机最多选择一次, so that 〖鬼才〗不能无限改判
7. As a 玩家, I want maxTimes>1 的技能可以发动多次, so that 〖明哲②〗按手牌数发动
8. As a 玩家, I want 技能发动后同一优先级可以再次检测, so that 发动〖刚烈〗后仍可在同一时机发动其他技能（如果还有）
9. As a 游戏开发者, I want 触发技的测试可以在 headless 环境下跑通, so that M1-M6 无需真实客户端即可验证
10. As a 游戏开发者, I want 无消耗技能也能正确发动, so that 〖制衡〗（转化技）不会因为 costResult 为空而被误判为"未发动"

---

## Implementation Decisions

### D1: 修改点

**唯一修改文件**：`shared/core/room/manager/EventManager.ts` 的 `trigger()` 方法，在第 454 行 TODO 处插入执行循环。

### D2: 执行循环结构

```
while (true):
  let someoneActed = false
  for priority in [General, Equip, Card, Rule]:
    for player in sortResponse(alives):
      effects = triggerEffects[timing][priority].getFor(player)
      available = effects.filter(check && times[player][effect.id] < maxTimes)
      if available.length === 0: continue
      
      forcedMute = [e for e in available if e.settings.forced === 'mute']
      forcedCost = [e for e in available if e.settings.forced === 'cost']
      
      for each in forcedMute:  // 锁定技自动发动
        create UseSkillEvent → exec()
        times[player][effect.id]++
        someoneActed = true
      
      if forcedCost.length > 0:  // 普通技走询问
        choice = await askForSkillInvoke(player, forcedCost)
        if choice:
          create UseSkillEvent → exec()
          times[player][effect.id]++
          someoneActed = true
          continue  // 同玩家同优先级重试
  
  if !someoneActed: break
```

### D3: askForSkillInvoke 接口

不引入新的网络消息类型。使用现有 `ChooseManager.request()` + `IPlayerInput.requestChoice()`：

- 对于 `forced='cost'` 的技能：发起一次 `type: 'confirm'` 的选择会话，选项为 [发动, 不发动]
- 对于 `forced='mute'` 的技能：跳过询问，直接返回确认
- headless 测试中通过 mock `IPlayerInput` 控制回答

### D4: maxTimes 取值

现行代码在扫描期调用 `context()` 回调仅为了读取 `maxTimes`——有副作用风险且性能差。改为在 `EffectData` 中增加可选的 `maxTimes` 字段（默认 1，-1 表示无限制），不依赖 `context()` 回调。

### D5: 无消耗技能（B4）

`UseSkillEvent.exec()` 中 `costResult` 为空时直接 `finalize`，导致 `used` 恒为 `false`。修改逻辑：若 `EffectData.cost` 未定义 → 无消耗技能 → `choose` 返回真值即视为发动 → `used=true` → 执行 `effect`。

### D6: 明置武将牌（A2）

`UseSkillEvent.exec()` 步骤 3 当前直接 `turnTo(true)`。改为：通过 `ChangeStateEvent(open)` 明置 + 注册到 `deferredOpens`；drain 时按当前回合角色逆时针排序并触发明置后时机。此改动在 M1 中仅做**接口预留**（因为 ChangeStateEvent 已有），完整实现在 M3 濒死/死亡流程中一起测试。

### D7: 翻面跳过回合（B1）

`TurnEvent` 开头检测 `PlayerState.skip` → 若为 true → 翻回正面 + 跳过当前回合。修复：跳过回合后执行 `player.skip = false`（翻回正面），防止永久跳过。

### D8: "时机结束"信号

触发循环需支持：技能效果可声明"此时机结束"（如〖潜袭〗终止伤害流程 → 〖寒冰剑〗无时机）。在 `EffectContext` 中增加 `endTiming: boolean`，`exec()` 返回后检查此标志 → 若为 true → 跳出循环、不继续询问其余玩家。

---

## Testing Decisions

### 测试文件

`shared/test/m1-trigger-bridge.test.ts`

### 测试接口（Seam）

使用 `setupIntegrationTest` 辅助函数（已有），在 headless Room 中：

1. 通过 `SkillManager` 注册测试用 `SkillData` + `EffectData`
2. 通过 mock `IPlayerInput` 控制技能确认的回答
3. 触发对应事件（如 `DamageEvent`）
4. 验证手牌数/标记/事件历史的变化

### 测试用例

1. **锁定技自动发动**：注册 mock 锁定技（`forced='mute'`，时机=受到伤害后，效果=摸一张牌）→ 造成伤害 → 手牌+1，无需 mock 输入
2. **普通技确认后发动**：注册 mock 普通技（`forced='cost'`）→ mock 确认 → 手牌+1
3. **普通技拒绝后不发动**：mock 拒绝 → 手牌数不变
4. **maxTimes=1 限次**：同回合造成两次伤害 → 只发动一次
5. **多玩家逆时针顺序**：3 人局，当前回合=P2 → 伤害 P1 → 响应顺序应为 P2,P3,P1
6. **多优先级顺序**：同时注册武将技+装备技 → 武将技先于装备技询问

### 参考现有测试

- [shared/test/damage.test.ts](shared/test/damage.test.ts) — DamageEvent 触发链
- [shared/test/choose-manager.test.ts](shared/test/choose-manager.test.ts) — ChooseManager mock 模式
- [shared/test/setup.ts](shared/test/setup.ts) — `setupIntegrationTest` 签名

---

## Out of Scope

- UseCardEvent / DropCardEvent（M2）
- 响应闭环：闪/桃/无懈的询问（M3）
- 濒死/死亡流程中的技能触发（M3）
- 转化技（视为技）的 need1/need2 链路（M2）
- 明置武将牌的完整 deferredOpens 排序与死亡过滤（M3）
- 回合角色离场→下家继承重排（M3/M4）
- 客户端 UI 的确认弹窗（C4）

---

## Further Notes

- 旧项目参考：`old/resgsv1/server/src/core/room/room.ts` 第 838-1140 行的 trigger 主循环（含 order 0-7 硬编码 switch、askForSkillInvoke、needUseCard）
- 新项目设计已抛弃旧 order 0-7 硬编码，改用数据驱动的 `PriorityType` + `triggerEffects` Map 索引
- 元规则（meta-rules.md）的多角色结算原则 b 是本次实现的核心规则依据
- 相关 Bug B1/B4/B7 在 M1 范围内顺修；A1/A2/A8 裁定至少预留接口
