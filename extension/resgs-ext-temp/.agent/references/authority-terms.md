# 游戏用语权威定义（API 查找用）

> 来源：`docs/domain/terms/` 目录下的 card-operations.md、event-resolution.md、game-flow.md、general-operations.md、values.md、zones.md。
> **已剔除纯描述层内容**，保留规则定义和实现映射，用于从游戏用语快速定位 API。

---

## 一、卡牌操作 → API

### 移至 / 置于 / 扣置

| 操作 | 规则要点 | API |
|---|---|---|
| **移至** | 从另一区域移动到目标区域，移动前必须不在目标区域内 | `MoveCardEvent` |
| **置于/入** | 移到目标区域，按默认朝向放置 | `CardManager.moveCard()` |
| **扣置于/入** | 移到目标区域，背面朝上 | `CardManager.moveCard()` + `card.turnTo(false)` |

◆ **装备牌非因使用置入**：不能置入同种子区有牌或封印的子区。
◆ **延时锦囊非因使用置入**：须过使用合法性检测，重造目标列表。

### 弃置

| 规则要点 | API |
|---|---|
| "弃置"是操作，"移至弃牌堆"是结果 | `MoveCardEvent` reason='discard' |
| A **令** B 弃置 → B 自己选牌；A **弃置** B 的牌 → A 选牌 | `ChooseManager` + `MoveCardEvent` |
| 适用[通用缩减规则](#通用缩减规则) | — |

### 交给

| 规则要点 | API |
|---|---|
| A 交给 B 牌 = A 的手牌区 → **处理区** → B 的手牌区 | `MoveCardEvent` reason='give' |
| 经处理区中转，不触发"得到"类技能 | `MoveCardEvent` 两段移动 |

### 获得 / 失去

| 规则要点 | API |
|---|---|
| **获得** = 其他角色的区域 → 处理区 → 自己的手牌区 | `MoveCardEvent` Alias=`ObtainCard` |
| **失去** = 别名，非独立事件 | `MoveCardEvent` Alias=`LoseCard` |
| 获得/失去时机的 before/after | `TimingName.ObtainCardBefore/After`、`LoseCardBefore/After` |

### 交换

双方手牌或装备交换，经处理区中转。同种装备冲突 → 三分支（入装备区 / 入弃牌堆）。

### 重铸

| 规则要点 | API |
|---|---|
| 弃置此牌 → 摸一张牌 | `MoveCardEvent`(discard) + `drawCards(1)` |

### 摸牌

| 规则要点 | API |
|---|---|
| 将牌堆顶 X 张牌置入手牌区 | `player.drawCards(n)` |

### 弃置至 / 补至

| 规则要点 | API |
|---|---|
| 弃置至 X 张 = 弃置直到手牌数 = X | `player.discardTo(X)` |
| 补至 X 张 = 摸牌直到手牌数 = X | `player.drawTo(X)` |

### 通用缩减规则

对于"操作 X 张牌"类操作，若非消耗/唯一效果/▷左最近效果/选项唯一无条件效果/须选是否的效果，则实际操作 `min{能操作的牌数, X}` 张。

---

## 二、使用/打出牌 → API

> ⚠️ UseCardEvent / DropCardEvent 为 M2/M3 内容，以下为规则定义层的预期 API。

### 使用牌

| 规则要点 | 预期 API |
|---|---|
| 使用 = 预使用牌事件 → 使用事件两段式 | `room.useCard()` |
| 不能同时使用两张以上牌 | 操作入口层校验 |

### 打出牌

| 规则要点 | 预期 API |
|---|---|
| 打出 = 使用 - target step，可选"需要打出的牌名" | `room.dropCard()` |
| 不能同时打出两张以上牌 | 操作入口层校验 |

---

## 三、事件结算用语 → API

### 事件 / 结算 / 时机 / 流程

| 用语 | 定义 | API |
|---|---|---|
| **事件** | 操作牌/发动技能/进行响应 = 产生一个事件。若干流程的总和 | `EventProcess` |
| **结算** | 处理事件的过程 | `EventProcess.exec()` |
| **时机** | 一个瞬间。事件发生产生若干时机，按顺序依次生成处理 | `TimingName` 枚举 |
| **流程** | 事件在时机插入发生后的处理过程 | `EventManager.trigger()` |

### 响应

一个事件对另一个事件加以影响的形式。

◆ "角色不能响应"的语义：
- 不能响应【杀】 = 此【杀】不是其使用【闪】的合法目标
- 不能响应锦囊 = 此牌不是其使用【无懈可击】的合法目标
- 不能响应【决斗】/【万箭】/【南蛮】 = 不能因执行效果而打出对应牌 + 不是无懈合法目标

### 无效

1. **一张牌对一个目标无效**：不生成"使用时""生效前""生效时""生效后"四时机。
2. **技能无效**：所有角色不能发动 + 不能产生影响。

| 实现 | API |
|---|---|
| 目标无效标记 | `UseCardEvent.targetList[].invalid` |
| 技能全局失效 | `StateEffectType.Skill_Invalidity` |
| 按观察者失效（无视） | 待实现（pending-impl: PerAgent 版 Invalidity） |

### 取消

移除目标列表 + 终止当前时机，后续时机正常生成。

> 注：无效 ≠ 取消。无效=跳过四个生效时机；取消=终止当前时机、后续时机正常。〖勇决〗在取消后仍可发动。

### 防止

终止对应流程。"操作执行完毕但未对操作对象执行过此操作"——伤害/移动/状态改变三种流程统一语义。

| 防止类型 | API |
|---|---|
| 防止伤害 | `DamageEvent.prevent()` |
| 防止移动 | `MoveCardEvent` 对应方法 |
| 防止状态改变 | `ChangeStateEvent` 对应方法 |

---

## 四、游戏流程用语 → API

### 回合 / 额外回合

| 用语 | API |
|---|---|
| 额定回合按逆时针进行 | `Room._mainProcess` |
| 额外回合在当前回合结束后插入，**后获得者先进行**（LIFO） | `Room.extraTurns.unshift()` |
| 翻面角色获得额外回合 → 翻面后终止 | TurnEvent skip 检测 |

### 上家 / 下家

| 概念 | API |
|---|---|
| 纯座位相邻（忽略死亡/不计座次） | `player.right` / `player.left` |
| 语义上/下家（考虑死亡+不计座次） | `player.prev` / `player.next` ⚠️ 待实现 |

### 阶段

六个阶段：准备 → 判定 → 摸牌 → 出牌 → 弃牌 → 结束。

◆ **跳过阶段**：不生成该阶段所有时机的**状态**（非操作）。同回合同阶段不能跳过两次。
◆ **额外阶段**：动态插入 B 阶段的完整时机序列。

### 终止 vs 结束

| 用语 | 定义 | API |
|---|---|---|
| **终止** | 不生成从当前时机之后的所有时机（含收尾） | TurnEvent/PhaseEvent 截断原语 |
| **结束** | 跳转到收尾时机（收尾时机正常进行） | TurnEvent/PhaseEvent 跳转原语 |

---

## 五、武将牌操作 → API

### 横置 / 重置 / 连环状态

| 操作 | API |
|---|---|
| 横置（竖→横） | `player.turnChain(true)` |
| 重置（横→竖） | `player.turnChain(false)` |
| 连环状态 | `player.isChained()` |
| 触发连环传导 | ⚠️ `DamageEvent.ts` TODO（M4） |

### 翻面 / 叠置

| 操作 | API |
|---|---|
| 翻面（正→背 或 背→正） | `player.turnOver()` |
| 跳过回合检测 | `PlayerState.skip` |

### 明置 / 暗置

| 操作 | API |
|---|---|
| 明置武将牌 | `General.turnTo(true)` ⚠️ 应走 `ChangeStateEvent(open)`（A2） |
| 暗置武将牌 | `General.turnTo(false)` |
| 延迟明置队列 | `Room.deferredOpens` → `processCompleted` drain |

### 移除（武将牌）

将武将牌移出游戏。涉及：弃手牌装备+判定区 / 武将牌上旁入弃牌堆 / 弃标记 / 入武将牌堆——四个同时操作。

---

## 六、数值公式 → API

### 手牌上限

```
初值 Ao（默认=体力值，MaxHand_Initial 可覆盖）
修正 ΣΔA（MaxHand_Correct 累计）
终值 Af = MaxHand_Fixed ?? max{Ao + ΣΔA, 0}
排除牌 MaxHand_Exclude 不计入
```

### 距离

```
初值 = 座次差绝对值（死亡角色不参与、不计入座次的不参与）
修正 ΣΔ（Distance_Correct 累计）
终值 = Distance_Fixed ?? max{初值 + ΣΔ, 1}
与自己的距离始终 = 0
距离不对称（A→B ≠ B→A 可能）
```

### 攻击范围

```
初值（默认=1，武器技能可覆盖 Range_Initial）
修正 ΣΔ（Range_Correct 累计）
终值 = Range_Fixed ?? max{初值 + ΣΔ, 1}
角色不在自己的攻击范围内
```

### 额定摸牌数

非 StateEffect，为事件数据字段修改模式。初值 2 + 修正 + `max{, 0}`，"改为 0"类效果覆盖终值。

### 体力四值

| 字段 | API |
|---|---|
| 体力上限 | `PlayerState.maxhp` |
| 体力值（露出勾玉数） | `Player.inthp` |
| 已损失体力值 | `Player.losshp` (= maxhp - inthp) |
| 体力（可 < 0） | `PlayerState.hp` |

### 点数终值

"点数+X/-X"及 [1, 13] 钳制——无对应 StateEffectType。现有 `Regard_CardData` 可覆盖"点数视为 X"。拼点/判定类技能需要时补充。

---

## 七、区域 → API

| 区域 | `AreaType` | 说明 |
|---|---|---|
| 牌堆 | `Draw` | 公共区域，默认背面朝上 |
| 弃牌堆 | `Discard` | 公共区域，默认正面朝上 |
| 武将牌堆 | `General` | 公共区域 |
| 处理区 | `Processing` | 公共区域（屏幕中间），默认正面朝上 |
| 手牌区 | `Hand` | 私有区域 |
| 装备区 | `Equip` | 私有区域（分子区：武器/防具/坐骑/宝物——用 CardSubType 区分） |
| 判定区 | `Judge` | 私有区域 |
| 武将牌上 | `Up` | 私有区域 |
| 武将牌旁 | `Side` | 私有区域 |

区域 ID 格式：`'{playerId}.{type}'`（私有）或 `'{type}'`（公共）。
