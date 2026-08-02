# SkillTag 与优先级参考

> 来源：[SkillTypes.ts](../../shared/core/skill/SkillTypes.ts)。

## SkillTag 枚举

| 标签 | 值 | 说明 | 影响 |
|---|---|---|---|
| `None` | 0 | 普通技能 | 无特殊行为 |
| `Lock` | 1 | 锁定技 | check() 忽略 limit/awake 计数；通常配合 `forced:'mute'` |
| `Head` | 2 | 主将技 | 需主将位才可用 |
| `Deputy` | 3 | 副将技 | 需副将位才可用 |
| `Awake` | 4 | 觉醒技 | 发动后永久不可用（同 Limit 逻辑） |
| `Limit` | 5 | 限定技 | 发动后 `@limit:{id}` 标记为 false，check() 检测此标记 |
| `Lord` | 6 | 主公技/君主技 | 受身份限制；但**获得**的主公技不受限制 |
| `Array` | 7 | 阵法技-围攻 | 国战阵法相关 |
| `Secret` | 8 | 奥秘技 | 发动时不触发明置 |
| `Eternal` | 9 | 持恒技 | 始终有效 |
| `Mission` | 10 | 使命技 | — |
| `ZhuShuai` | 11 | 主帅技 | TODO：逻辑待实现 |
| `QianFeng` | 12 | 先锋技 | TODO：逻辑待实现 |

## Effect.check() 的标签检查逻辑

```typescript
// Effect.check() 中的标签影响：
if (isLimit || isAwake) {
    const count = player?.countMark(this.name, this.id) ?? 0;
    if (count > 0) return false;  // 已发动过 → 不可用
}
if (hasTag(SkillTag.Head) && !player.hasHead()) return false;
if (hasTag(SkillTag.Deputy) && !player.hasDeputy()) return false;
```

## 标签组合惯例

| 组合 | 含义 | forced 设置 |
|---|---|---|
| `[]` | 普通触发技（需询问） | `'cost'` |
| `[Lock]` | 锁定技 | `'mute'` |
| `[Limit]` | 限定技（需询问） | `'cost'` |
| `[Awake]` | 觉醒技 | `'mute'` |
| `[Lock, Limit]` | 锁定+限定（不常见） | `'mute'` |
| `[Lord]` | 主公技 | `'cost'` |

## PriorityType 调度顺序

```
General(1)  →  Equip(2)  →  Card(3)  →  Rule(4)
  武将技         装备技       卡牌技      规则技
```

同优先级内按**从当前回合角色逆时针**遍历玩家。每个玩家在同一时机对同一技能只能选择一次（普通技）或至多 X 次（计数型，如"对手牌数计次"的明哲②）。

## 旧项目与新项目 SkillTag 差异

旧项目标签定义在 `old/resgsv1` 的 `skill.types.ts` 中，大部分一一对应。新增的 `Eternal`（持恒技）、`Mission`（使命技）、`ZhuShuai`/`QianFeng`（主帅/先锋）为新版扩展。
