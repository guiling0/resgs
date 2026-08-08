---
title: EventTypes
type: api
id: api/types/EventTypes
rules:
  - events/change-max-hp
  - events/change-state
  - events/damage
  - events/death
  - events/drop-card
  - events/dying
  - events/judge
  - events/lose-hp
  - events/move-card
  - events/phase
  - events/pindian
  - events/recover-hp
  - events/reduce-hp
  - events/turn
  - events/use-card
  - events/use-skill
  - terms/resolution-terms/event
  - terms/resolution-terms/timing
  - terms/value-terms/drawCount
tags: [API, 类型域（types/）]
---

# EventTypes（类型域（types/））

### TimingName（枚举）

- 签名：`export enum TimingName`
- 位置：../../shared/core/types/EventTypes.ts#L22
- 规则：[timing](../../rules/terms/resolution-terms/timing.md)

> 时机枚举——全部触发时机（技能触发/事件调度共用）
> @rules terms/resolution-terms/timing
> @description 时机是一个瞬间，一个事件发生时会产生若干个时机

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `game_stage_before` | GameStageBefore | 登场前 |
| `game_stage` | GameStage | 登场时 |
| `game_stage_after` | GameStageAfter | 登场后 |
| `game_start_before` | GameStartBefore | 游戏开始前（[游戏开始前](../../rules/events/turn.md#游戏开始前)） |
| `game_start` | GameStart | 游戏开始后（[游戏开始后](../../rules/events/turn.md#游戏开始后)） |
| `game_end` | GameEnd | 游戏结束时（[游戏结束时](../../rules/events/turn.md#游戏结束时)） |
| `round_start` | RoundStart | 每轮开始时（[每轮开始时](../../rules/events/turn.md#每轮开始时)） |
| `round_end` | RoundEnd | 轮次结束 |
| `rest_start` | RestStart | 休整开始 |
| `rest_end` | RestEnd | 休整结束 |
| `turn_start_before` | TurnStartBefore | 回合开始前（[回合开始前](../../rules/events/turn.md#回合开始前)） |
| `turn_start` | TurnStart | 回合开始时（[回合开始时](../../rules/events/turn.md#回合开始时)） |
| `turn_start_after` | TurnStartAfter | 回合开始后（[回合开始后](../../rules/events/turn.md#回合开始后)） |
| `turn_end` | TurnEnd | 回合结束前（[回合结束前](../../rules/events/turn.md#回合结束前)） |
| `turn_end_after` | TurnEndAfter | 回合结束后（[回合结束后](../../rules/events/turn.md#回合结束后)） |
| `ready_start_before` | ReadyPhaseStartBefore | 准备阶段开始前（[准备阶段开始前](../../rules/events/phase.md#准备阶段开始前)） |
| `ready_start` | ReadyPhaseStart | 准备阶段开始时（[准备阶段开始时](../../rules/events/phase.md#准备阶段开始时)） |
| `ready_phase` | ReadyPhase | 准备阶段（[准备阶段](../../rules/events/phase.md#准备阶段)） |
| `ready_end` | ReadyPhaseEnd | 准备阶段结束时（[准备阶段结束时](../../rules/events/phase.md#准备阶段结束时)） |
| `judge_start_before` | JudgePhaseStartBefore | 判定阶段开始前（[判定阶段开始前](../../rules/events/phase.md#判定阶段开始前)） |
| `judge_start` | JudgePhaseStart | 判定阶段开始时（[判定阶段开始时](../../rules/events/phase.md#判定阶段开始时)） |
| `judge_phase` | JudgePhase | 判定阶段（[判定阶段](../../rules/events/phase.md#判定阶段)） |
| `judge_phase_end` | JudgePhaseEnd | 判定阶段结束时（[判定阶段结束时](../../rules/events/phase.md#判定阶段结束时)） |
| `draw_start_before` | DrawPhaseStartBefore | 摸牌阶段开始前（[摸牌阶段开始前](../../rules/events/phase.md#摸牌阶段开始前)） |
| `draw_start1` | DrawPhaseStart1 | 摸牌阶段开始时1（[摸牌阶段开始时1](../../rules/events/phase.md#摸牌阶段开始时1)） |
| `draw_start2` | DrawPhaseStart2 | 摸牌阶段开始时2（[摸牌阶段开始时2](../../rules/events/phase.md#摸牌阶段开始时2)） |
| `draw_phase` | DrawPhase | 摸牌阶段（[摸牌阶段](../../rules/events/phase.md#摸牌阶段)） |
| `draw_end` | DrawPhaseEnd | 摸牌阶段结束时（[摸牌阶段结束时](../../rules/events/phase.md#摸牌阶段结束时)） |
| `play_start_before` | PlayPhaseStartBefore | 出牌阶段开始前（[出牌阶段开始前](../../rules/events/phase.md#出牌阶段开始前)） |
| `play_start` | PlayPhaseStart | 出牌阶段开始时（[出牌阶段开始时](../../rules/events/phase.md#出牌阶段开始时)） |
| `play_phase` | PlayPhase | 出牌阶段（[出牌阶段](../../rules/events/phase.md#出牌阶段)） |
| `play_end` | PlayPhaseEnd | 出牌阶段结束时（[出牌阶段结束时](../../rules/events/phase.md#出牌阶段结束时)） |
| `discard_start_before` | DiscardPhaseStartBefore | 弃牌阶段开始前（[弃牌阶段开始前](../../rules/events/phase.md#弃牌阶段开始前)） |
| `discard_start` | DiscardPhaseStart | 弃牌阶段开始时（[弃牌阶段开始时](../../rules/events/phase.md#弃牌阶段开始时)） |
| `discard_phase` | DiscardPhase | 弃牌阶段（[弃牌阶段](../../rules/events/phase.md#弃牌阶段)） |
| `discard_end` | DiscardPhaseEnd | 弃牌阶段结束时（[弃牌阶段结束时](../../rules/events/phase.md#弃牌阶段结束时)） |
| `end_start_before` | EndPhaseStartBefore | 结束阶段开始前（[结束阶段开始前](../../rules/events/phase.md#结束阶段开始前)） |
| `end_start` | EndPhaseStart | 结束阶段开始时（[结束阶段开始时](../../rules/events/phase.md#结束阶段开始时)） |
| `end_phase` | EndPhase | 结束阶段（[结束阶段](../../rules/events/phase.md#结束阶段)） |
| `end_end` | EndPhaseEnd | 结束阶段结束时（[结束阶段结束时](../../rules/events/phase.md#结束阶段结束时)） |
| `movecard_fixed` | MoveCardFixed | 确定移动的牌时（[确定移动的牌时](../../rules/events/move-card.md#确定移动的牌时)） |
| `movecard_before1` | MoveCardBefore1 | 移至目标区域前1（[移至目标区域前1](../../rules/events/move-card.md#移至目标区域前1)） |
| `movecard_before2` | MoveCardBefore2 | 移至目标区域前2（[移至目标区域前2](../../rules/events/move-card.md#移至目标区域前2)） |
| `movecard_after1` | MoveCardAfter1 | 移至目标区域后1（[移至目标区域后1](../../rules/events/move-card.md#移至目标区域后1)） |
| `movecard_after2` | MoveCardAfter2 | 移至目标区域后2（[移至目标区域后2](../../rules/events/move-card.md#移至目标区域后2)） |
| `movecard_end` | MoveCardEnd | 移动结算结束后（[移动结算结束后](../../rules/events/move-card.md#移动结算结束后)） |
| `usecard_need1` | UseCardNeed1 | 其需要使用此牌时1（[其需要使用此牌时1](../../rules/events/use-card.md#其需要使用此牌时1)） |
| `usecard_need2` | UseCardNeed2 | 其需要使用此牌时2（[其需要使用此牌时2](../../rules/events/use-card.md#其需要使用此牌时2)） |
| `usecard_declare` | UseCardDeclare | 声明使用牌（[声明使用牌](../../rules/events/use-card.md#声明使用牌)） |
| `usecard_declare_after` | UseCardDeclareAfter | 声明使用牌后（[声明使用牌后](../../rules/events/use-card.md#声明使用牌后)） |
| `usecard_choose_target` | UseCardChooseTarget | 选择目标后（[选择目标后](../../rules/events/use-card.md#选择目标后)） |
| `usecard_used` | UseCardUsed | 牌被使用时（[牌被使用时](../../rules/events/use-card.md#牌被使用时)） |
| `usecard_assign_target` | UseCardAssignTarget | （连续若干个）指定目标时 |
| `usecard_become_target` | UseCardBecomeTarget | （连续若干个）成为目标时 |
| `usecard_assign_target_after` | UseCardAssignTargetAfter | （连续若干个）指定目标后 |
| `usecard_become_target_after` | UseCardBecomeTargetAfter | （连续若干个）成为目标后 |
| `usecard_ready` | UseCardReady | 使用结算准备工作结束时（[使用结算准备工作结束时](../../rules/events/use-card.md#使用结算准备工作结束时)） |
| `usecard_effect_start` | UseCardEffectStart | 对当前目标使用结算开始时（[对当前目标使用结算开始时](../../rules/events/use-card.md#对当前目标使用结算开始时)） |
| `usecard_effect_before` | UseCardEffectBefore | 对当前目标生效前（[对当前目标生效前](../../rules/events/use-card.md#对当前目标生效前)） |
| `usecard_offset` | UseCardOffset | 被抵消后（[被抵消后](../../rules/events/use-card.md#被抵消后)） |
| `usecard_effect` | UseCardEffect | 对当前目标生效时（[对当前目标生效时](../../rules/events/use-card.md#对当前目标生效时)） |
| `usecard_effect_after` | UseCardEffectAfter | 对当前目标生效后（[对当前目标生效后](../../rules/events/use-card.md#对当前目标生效后)） |
| `usecard_end1` | UseCardEnd1 | 使用结算结束后1（[使用结算结束后1](../../rules/events/use-card.md#使用结算结束后1)） |
| `usecard_end2` | UseCardEnd2 | 使用结算结束后2（[使用结算结束后2](../../rules/events/use-card.md#使用结算结束后2)） |
| `usecard_end3` | UseCardEnd3 | 使用结算结束后3（[使用结算结束后3](../../rules/events/use-card.md#使用结算结束后3)） |
| `dropcard_need1` | DropCardNeed1 | 其需要打出此牌时1（[其需要打出此牌时1](../../rules/events/drop-card.md#其需要打出此牌时1)） |
| `dropcard_need2` | DropCardNeed2 | 其需要打出此牌时2（[其需要打出此牌时2](../../rules/events/drop-card.md#其需要打出此牌时2)） |
| `dropcard_declare` | DropCardDeclare | 声明打出牌（[声明打出牌](../../rules/events/drop-card.md#声明打出牌)） |
| `dropcard_droped` | DropCardDroped | 牌被打出时（[牌被打出时](../../rules/events/drop-card.md#牌被打出时)） |
| `dropcard_end` | DropCardEnd | 打出结算结束后（[打出结算结束后](../../rules/events/drop-card.md#打出结算结束后)） |
| `pindian` | Pindian | 进行拼点时（[进行拼点时](../../rules/events/pindian.md#进行拼点时)） |
| `pindian_card_show` | PindianCardShow | 拼点牌被亮出时（[拼点牌被亮出时](../../rules/events/pindian.md#拼点牌被亮出时)） |
| `pindian_result` | PindianResult | （连续若干个）拼点结果确定后 |
| `pindian_end` | PindianEnd | 拼点结算结束后（[拼点结算结束后](../../rules/events/pindian.md#拼点结算结束后)） |
| `change_state` | ChangeState | 牌状态改变前（[牌状态改变前](../../rules/events/change-state.md#牌状态改变前)） |
| `change_state_after` | ChangeStateAfter | 牌状态改变后（[牌状态改变后](../../rules/events/change-state.md#牌状态改变后)） |
| `open` | Open | 明置后时机（[明置后时机](../../rules/events/change-state.md#明置后时机)） |
| `judge` | Judge | 判定时（[判定时](../../rules/events/judge.md#判定时)） |
| `judge_card` | JudgeCard | 成为判定牌后（[成为判定牌后](../../rules/events/judge.md#成为判定牌后)） |
| `judge_result1` | JudgeResult1 | 判定结果确定前1（[判定结果确定前1](../../rules/events/judge.md#判定结果确定前1)） |
| `judge_result2` | JudgeResult2 | 判定结果确定前2（[判定结果确定前2](../../rules/events/judge.md#判定结果确定前2)） |
| `judge_result_after1` | JudgeResultAfter1 | 判定结果确定后1（[判定结果确定后1](../../rules/events/judge.md#判定结果确定后1)） |
| `judge_result_after2` | JudgeResultAfter2 | 判定结果确定后2（[判定结果确定后2](../../rules/events/judge.md#判定结果确定后2)） |
| `judge_end` | JudgeEnd | 判定结算结束后（[判定结算结束后](../../rules/events/judge.md#判定结算结束后)） |
| `damage_start` | DamageStart | 伤害结算开始时（[伤害结算开始时](../../rules/events/damage.md#伤害结算开始时)） |
| `damage_cause1` | DamageCause1 | 造成伤害时1（[造成伤害时1](../../rules/events/damage.md#造成伤害时1)） |
| `damage_cause2` | DamageCause2 | 造成伤害时2（[造成伤害时2](../../rules/events/damage.md#造成伤害时2)） |
| `damage_inflict1` | DamageInflict1 | 受到伤害时1（[受到伤害时1](../../rules/events/damage.md#受到伤害时1)） |
| `damage_inflict2` | DamageInflict2 | 受到伤害时2（[受到伤害时2](../../rules/events/damage.md#受到伤害时2)） |
| `damage_inflict3` | DamageInflict3 | 受到伤害时3（[受到伤害时3](../../rules/events/damage.md#受到伤害时3)） |
| `damage_cause_after` | DamageCauseAfter | 造成伤害后（[造成伤害后](../../rules/events/damage.md#造成伤害后)） |
| `damage_inflict_after` | DamageInflictAfter | 受到伤害后（[受到伤害后](../../rules/events/damage.md#受到伤害后)） |
| `damage_end` | DamageEnd | 伤害结算结束后（[伤害结算结束后](../../rules/events/damage.md#伤害结算结束后)） |
| `losehp_start` | LoseHpStart | 失去体力开始（[失去体力开始](../../rules/events/lose-hp.md#失去体力开始)） |
| `losehp` | LoseHp | 失去体力时（[失去体力时](../../rules/events/lose-hp.md#失去体力时)） |
| `losehp_after` | LoseHpAfter | （[LoseHpAfter](../../rules/events/lose-hp.md)） |
| `losehp_end` | LoseHpEnd | 失去体力结算结束后（[失去体力结算结束后](../../rules/events/lose-hp.md#失去体力结算结束后)） |
| `reducehp_start` | ReduceHpStart | 扣减体力开始（[扣减体力开始](../../rules/events/reduce-hp.md#扣减体力开始)） |
| `reducehp` | ReduceHp | 扣减体力时（[扣减体力时](../../rules/events/reduce-hp.md#扣减体力时)） |
| `reducehp_after` | ReduceHpAfter | 扣减体力后（[扣减体力后](../../rules/events/reduce-hp.md#扣减体力后)） |
| `reducehp_end` | ReduceHpEnd | 扣减体力结算结束后（[扣减体力结算结束后](../../rules/events/reduce-hp.md#扣减体力结算结束后)） |
| `recoverhp_start` | RecoverHpStart | 回复体力开始（[回复体力开始](../../rules/events/recover-hp.md#回复体力开始)） |
| `recoverhp` | RecoverHp | （[RecoverHp](../../rules/events/recover-hp.md)） |
| `recoverhp_after` | RecoverHpAfter | 回复体力后（[回复体力后](../../rules/events/recover-hp.md#回复体力后)） |
| `recoverhp_end` | RecoverHpEnd | 回复体力结算结束后（[回复体力结算结束后](../../rules/events/recover-hp.md#回复体力结算结束后)） |
| `change_maxhp_start` | ChangeMaxHpStart | 体力上限改变开始时（[体力上限改变开始时](../../rules/events/change-max-hp.md#体力上限改变开始时)） |
| `change_maxhp` | ChangeMaxHp | 体力上限改变前（[体力上限改变前](../../rules/events/change-max-hp.md#体力上限改变前)） |
| `change_maxhp_after` | ChangeMaxHpAfter | 体力上限改变后（[体力上限改变后](../../rules/events/change-max-hp.md#体力上限改变后)） |
| `change_maxhp_end` | ChangeMaxHpEnd | 改变体力上限结算结束后（[改变体力上限结算结束后](../../rules/events/change-max-hp.md#改变体力上限结算结束后)） |
| `dying_entry` | DyingEntry | 进入濒死状态时（[进入濒死状态时](../../rules/events/dying.md#进入濒死状态时)） |
| `dying_entry_after` | DyingEntryAfter | 进入濒死状态后（[进入濒死状态后](../../rules/events/dying.md#进入濒死状态后)） |
| `dying` | Dying | （连续若干个）处于濒死状态时 |
| `dying_end` | DyingEnd | 濒死结算结束后（[濒死结算结束后](../../rules/events/dying.md#濒死结算结束后)） |
| `death_before` | DeathBefore | 死亡前（[死亡前](../../rules/events/death.md#死亡前)） |
| `death_confirm_role` | DeathConfirmRole | 确认死亡角色（[确认死亡角色](../../rules/events/death.md#确认死亡角色)） |
| `death` | Death | 死亡时（[死亡时](../../rules/events/death.md#死亡时)） |
| `death_after` | DeathAfter | 死亡后（[死亡后](../../rules/events/death.md#死亡后)） |
| `death_end` | DeathEnd | 死亡结算结束后（[死亡结算结束后](../../rules/events/death.md#死亡结算结束后)） |
| `skill_obtain` | SkillObtain | 获得技能时 |
| `skill_lose` | SkillLose | 失去技能时 |
| `effect_obtain` | EffectObtain | 获得效果时 |
| `effect_lose` | EffectLose | 失去效果时 |
| `cost` | Cost | 执行消耗后（[执行消耗后](../../rules/events/use-skill.md#执行消耗后)） |
| `effect` | Effect | 发动技能后（[发动技能后](../../rules/events/use-skill.md#发动技能后)） |
| `event_end` | EventEnd | 事件结束 |
| `all_event_end` | AllEventEnd | 所有事件结束 |

### TimingTrigger（类型别名）

- 签名：`export type TimingTrigger = TimingName | string;`
- 位置：../../shared/core/types/EventTypes.ts#L327

> 触发时机（内置时机名或自定义时机名）

### EventType（枚举）

- 签名：`export enum EventType`
- 位置：../../shared/core/types/EventTypes.ts#L332

> 事件类型

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `Turn` | Turn | 回合 |
| `Phase` | Phase | 阶段 |
| `Move` | Move | 移动 |
| `UseCard` | UseCard | 使用牌 |
| `DropCard` | DropCard | 打出牌 |
| `Pindian` | Pindian | 拼点 |
| `Open` | Open | 明置 |
| `Close` | Close | 暗置 |
| `Chain` | Chain | 连环 |
| `Skip` | Skip | 跳过 |
| `Change` | Change | 更换 |
| `Remove` | Remove | 移除 |
| `Judge` | Judge | 判定 |
| `Damage` | Damage | 伤害 |
| `LoseHp` | LoseHp | 失去体力 |
| `ReduceHp` | ReduceHp | 扣减体力 |
| `RecoverHp` | RecoverHp | 回复体力 |
| `ChangeMaxHp` | ChangeMaxHp | 体力上限改变 |
| `Dying` | Dying | 濒死 |
| `Death` | Death | 死亡 |
| `UseSkill` | UseSkill | 使用技能 |

### TurnEventData（接口）

- 签名：`export interface TurnEventData`
- 位置：../../shared/core/types/EventTypes.ts#L380

> 回合事件数据

### PhaseEventData（接口）

- 签名：`export interface PhaseEventData`
- 位置：../../shared/core/types/EventTypes.ts#L400

> 阶段事件数据

### MoveCardData（接口）

- 签名：`export interface MoveCardData`
- 位置：../../shared/core/types/EventTypes.ts#L418

> 单条移动数据——描述一批卡牌的移动方式

### MoveCardOpts（接口）

- 签名：`export interface MoveCardOpts`
- 位置：../../shared/core/types/EventTypes.ts#L456

> moveCards 快捷方法的可选参数（MoveCardData 除去 cards/toArea/player/fromArea）

### MoveEventData（接口）

- 签名：`export interface MoveEventData`
- 位置：../../shared/core/types/EventTypes.ts#L474

> 移动事件数据——可包含多条移动，每条描述一批卡牌的移动方式

### TargetEntry（接口）

- 签名：`export interface TargetEntry`
- 位置：../../shared/core/types/EventTypes.ts#L486

> 使用牌目标条目

### UseCardEventData（接口）

- 签名：`export interface UseCardEventData`
- 位置：../../shared/core/types/EventTypes.ts#L506

> 统一的使用牌事件数据

### CardUseData（接口）

- 签名：`export interface CardUseData`
- 位置：../../shared/core/types/EventTypes.ts#L548

> 牌的默认使用方式定义

### UseModifiers（接口）

- 签名：`export interface UseModifiers`
- 位置：../../shared/core/types/EventTypes.ts#L575

> 使用牌时的修正器（临时优先于状态效果）

### DropCardEventData（接口）

- 签名：`export interface DropCardEventData`
- 位置：../../shared/core/types/EventTypes.ts#L591

> 打出牌事件数据

### PindianEventData（接口）

- 签名：`export interface PindianEventData`
- 位置：../../shared/core/types/EventTypes.ts#L603

> 拼点事件数据

### OpenEventData（接口）

- 签名：`export interface OpenEventData`
- 位置：../../shared/core/types/EventTypes.ts#L633

> 明置事件数据

### CloseEventData（接口）

- 签名：`export interface CloseEventData`
- 位置：../../shared/core/types/EventTypes.ts#L643

> 暗置事件数据

### ChainEventData（接口）

- 签名：`export interface ChainEventData`
- 位置：../../shared/core/types/EventTypes.ts#L653

> 连环事件数据

### SkipEventData（接口）

- 签名：`export interface SkipEventData`
- 位置：../../shared/core/types/EventTypes.ts#L663

> 跳过事件数据

### ChangeEventData（接口）

- 签名：`export interface ChangeEventData`
- 位置：../../shared/core/types/EventTypes.ts#L671

> 更换武将牌事件数据

### RemoveEventData（接口）

- 签名：`export interface RemoveEventData`
- 位置：../../shared/core/types/EventTypes.ts#L681

> 移除武将牌事件数据

### ChangeStateType（类型别名）

- 签名：`export type ChangeStateType =`
- 位置：../../shared/core/types/EventTypes.ts#L689

> ChangeState 六种子类型

### ChangeStateData（类型别名）

- 签名：`export type ChangeStateData =`
- 位置：../../shared/core/types/EventTypes.ts#L698

> ChangeState 联合数据类型

### JudgeEventData（接口）

- 签名：`export interface JudgeEventData`
- 位置：../../shared/core/types/EventTypes.ts#L709

> 判定事件数据

### DamageEventData（接口）

- 签名：`export interface DamageEventData`
- 位置：../../shared/core/types/EventTypes.ts#L723

> 伤害事件数据

### LoseHpEventData（接口）

- 签名：`export interface LoseHpEventData`
- 位置：../../shared/core/types/EventTypes.ts#L739

> 失去体力事件数据

### ReduceHpEventData（接口）

- 签名：`export interface ReduceHpEventData`
- 位置：../../shared/core/types/EventTypes.ts#L747

> 扣减体力事件数据

### RecoverHpEventData（接口）

- 签名：`export interface RecoverHpEventData`
- 位置：../../shared/core/types/EventTypes.ts#L755

> 回复体力事件数据

### ChangeMaxHpEventData（接口）

- 签名：`export interface ChangeMaxHpEventData`
- 位置：../../shared/core/types/EventTypes.ts#L763

> 体力上限改变事件数据

### DyingEventData（接口）

- 签名：`export interface DyingEventData`
- 位置：../../shared/core/types/EventTypes.ts#L773

> 濒死事件数据

### DeathEventData（接口）

- 签名：`export interface DeathEventData`
- 位置：../../shared/core/types/EventTypes.ts#L781

> 死亡事件数据

### UseSkillEventData（接口）

- 签名：`export interface UseSkillEventData`
- 位置：../../shared/core/types/EventTypes.ts#L791

> 技能使用事件数据

### StageData（接口）

- 签名：`export interface StageData`
- 位置：../../shared/core/types/EventTypes.ts#L803

> 登场数据

### NeedUseCardData（接口）

- 签名：`export interface NeedUseCardData`
- 位置：../../shared/core/types/EventTypes.ts#L811

> 需要使用牌数据

### NeedDropCardData（接口）

- 签名：`export interface NeedDropCardData`
- 位置：../../shared/core/types/EventTypes.ts#L853

> 需要打出牌数据

### EventDataMap（接口）

- 签名：`export interface EventDataMap`
- 位置：../../shared/core/types/EventTypes.ts#L884
- 规则：[event](../../rules/terms/resolution-terms/event.md)

> 事件类型到事件数据的映射
> @rules terms/resolution-terms/event
> @description 事件是若干个相关流程的总和，可能被其他事件响应

### EventMeta（接口）

- 签名：`export interface EventMeta`
- 位置：../../shared/core/types/EventTypes.ts#L909

> 事件元数据：所有事件数据均携带（全部可选）

### EventOpts（接口）

- 签名：`export interface EventOpts`
- 位置：../../shared/core/types/EventTypes.ts#L921

> 事件自由扩展字段（快捷方法最后一个参数；_data 写入事件自定义数据）

### EventData（类型别名）

- 签名：`export type EventData<T extends EventType> = EventDataMap[T] & EventMeta;`
- 位置：../../shared/core/types/EventTypes.ts#L933

> 事件数据（按事件类型取值，均携带事件元数据）

### TimingEventMap（接口）

- 签名：`export interface TimingEventMap`
- 位置：../../shared/core/types/EventTypes.ts#L938

> 时机到所属事件类型的映射

### TimingDataMap（接口）

- 签名：`export interface TimingDataMap`
- 位置：../../shared/core/types/EventTypes.ts#L1078

> 时机到事件数据的直接映射（未接入事件系统的特殊时机）

### TimingData（类型别名）

- 签名：`export type TimingData<T extends TimingTrigger> = T extends keyof TimingEventMap`
- 位置：../../shared/core/types/EventTypes.ts#L1102

> 时机对应的事件数据（时机 → 事件类型 → 事件数据 的两级推断）

### Timing（接口）

- 签名：`export interface Timing<T extends TimingTrigger = 'none'>`
- 位置：../../shared/core/types/EventTypes.ts#L1111

> 时机定义：名称 + before/after 回调

### DamageType（枚举）

- 签名：`export enum DamageType`
- 位置：../../shared/core/types/EventTypes.ts#L1123

> 伤害类型
