---
title: EventManager
type: api
id: api/event/EventManager
tags: [API, 事件域（logic/event/）]
---

# EventManager（类）

- 签名：`export class EventManager`
- 位置：../../shared/core/logic/event/EventManager.ts#L44

> 事件管理器——事件创建、触发调度、refreshs 注册、复活队列（logic 层，RoomHost 持有）。
> 权威端经 room.event 访问（host 注入后可用）。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(readonly room: Room)` |  |  |
| _currentEffect | `_currentEffect?: Effect` |  | 当前正在执行的 Effect（UseSkillEvent 执行 cost/effect 期间设置，嵌套栈） |
| refreshsByTiming | `readonly refreshsByTiming: Map<` |  | refreshs 回调索引（时机 → before/after，事件触发前注入） |
| create | ` create<T extends EventProcess, D>( EventClass: new (room: Room, data: D): Promise<T>` |  | 泛型事件工厂：创建事件 → 补全元数据（effect/reason 未显式传入时取当前技能上下文）→ 执行 → 返回。 |
| damage | ` damage(opts: DamageEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<Damag…` |  | 创建并执行伤害事件 |
| loseHp | ` loseHp(opts: LoseHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<LoseH…` |  | 创建并执行失去体力事件 |
| reduceHp | ` reduceHp(opts: ReduceHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<R…` |  | 创建并执行扣减体力事件 |
| dying | ` dying(opts: DyingEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DyingEv…` |  | 创建并执行濒死事件 |
| die | ` die(opts: DeathEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DeathEvent>` |  | 创建并执行死亡事件 |
| recover | ` recover(opts: RecoverHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<R…` |  | 创建并执行回复体力事件 |
| changeMaxHp | ` changeMaxHp(opts: ChangeMaxHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Pro…` |  | 创建并执行体力上限改变事件 |
| changeState | ` changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<…` |  | 创建并执行状态改变事件（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） |
| judge | ` judge(opts: JudgeEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<JudgeEv…` |  | 创建并执行判定事件 |
| pindian | ` pindian(opts: PindianEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<Pin…` |  | 创建并执行拼点事件 |
| moveCards | ` moveCards( datas: MoveCardData[], opts: { source?: EventProcess; reason?: string; effect?: Effect; getMove…` |  | 创建并执行移动卡牌事件 |
| insertHistory | ` insertHistory(event: EventProcess): void` |  | 将事件记录到历史（委托 room.insertHistory → host） |
| drainFuhuos | ` async drainFuhuos(): Promise<void>` |  | 异步处理所有待执行的复活回调 |
| registerRefreshs | ` registerRefreshs<T extends Skill \| Effect>( source: T, refreshs: Array<TimingCallback<never, T>> \| undefin…` |  | 注册技能/效果的 refreshs 到时机索引 |
| unregisterRefreshs | ` unregisterRefreshs<T extends Skill \| Effect>( source: T, refreshs: Array<TimingCallback<never, T>> \| undef…` |  | 注销技能/效果的 refreshs |
| trigger | ` async trigger( timingName: TimingName, data: EventProcess \| Record<string, unknown>, skipRefreshs: boolean…` |  | 触发一个时机——按优先级调度触发效果。 |
| _getAvailable | ` private _getAvailable( timingName: TimingName, priority: PriorityType, player: Player, data: EventProcess …` |  | 取某时机某优先级下玩家的可发动效果（过滤 check/canTrigger/次数限制） |
| _invokeSkill | ` private async _invokeSkill( effect: TriggerEffect, player: Player, data: EventProcess \| Record<string, unk…` |  | 创建 UseSkillEvent 并执行。返回 false 表示「时机结束」信号（ctx.endTiming） |
| _orderToPriority | ` private _orderToPriority(order: number): PriorityType` |  |  |

### RefreshEntry（接口）

- 签名：`export interface RefreshEntry`
- 位置：../../shared/core/logic/event/EventManager.ts#L35

> refreshs 回调条目（fn 已 bind，this 指向 source）
