---
title: UseCardEvent
type: api
id: api/event/UseCardEvent
rules:
  - events/use-card
  - terms/description-terms/target
  - terms/description-terms/user
  - terms/description-terms/yechengweimubiao
  - terms/description-terms/zhuanyi
  - terms/resolution-terms/cancel
  - terms/resolution-terms/invalid
  - terms/value-terms/targetCount
tags: [API, 事件域（logic/event/）]
---

# UseCardEvent（类）

- 签名：`export class UseCardEvent extends EventProcess<EventType.UseCard>`
- 位置：../../shared/core/logic/event/UseCardEvent.ts#L27
- 规则：[use-card](../../rules/events/use-card.md)

> 牌的使用事件
> @rules events/use-card
> @description 采用生成式时序（每个时机完成后根据当前状态即时生成下一个）。三种使用路径：正常使用（完整序列：Declare → DeclareAfter → ChooseTarget → Used → 目标扩展段 → Ready → 结算段 → End）；目标是牌（无目标扩展段）；无使用者直接结算延时锦囊效果（仅结算段）。Ready 移除死者并安置装备/延时锦囊牌

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _targetId | `private _targetId: number` |  | 目标自增 id——仅用于同玩家时稳定排序，不回写 |
| _doneTargetPhases | `private _doneTargetPhases: Map<number, Set<string>>` |  | 各目标已完成的目标扩展阶段（index → 已完成时机名集合） |
| constructor | ` constructor(room: Room, data: UseCardEventData)` |  |  |
| [player](../../rules/terms/description-terms/user.md) | ` get player(): Player \| undefined` | [user](../../rules/terms/description-terms/user.md) | 使用者 |
| card | ` get card(): VirtualCard` |  |  |
| targets | ` get targets(): Player[]` |  |  |
| [targetList](../../rules/terms/description-terms/target.md) | ` get targetList(): TargetEntry[]` | [target](../../rules/terms/description-terms/target.md) | 目标列表 |
| [targetCount](../../rules/terms/value-terms/targetCount.md) | ` get targetCount(): number` | [targetCount](../../rules/terms/value-terms/targetCount.md) | 目标对应的角色数 |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _settlingTarget | `private _settlingTarget?: Player` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| exec | ` async exec(): Promise<this>` |  |  |
| _runFixedTriggers | ` private async _runFixedTriggers(): Promise<void>` |  | 执行固定段的 eventTriggers |
| _runTiming | ` private async _runTiming(timing: ReturnType<typeof createTiming>): Promise<void>` |  | 执行单个 timing |
| _runReady | ` private async _runReady(): Promise<void>` |  | 执行 Ready 时机：移除死者、重排序、安置装备/延时锦囊 |
| _finish | ` private async _finish(): Promise<this>` |  | 完成事件：执行 endTriggers + processCompleted |
| _runTargetPhases | ` private async _runTargetPhases(): Promise<void>` |  | 逐阶段 × 逐个当前目标，生成式执行四阶段。每阶段第一个目标设置 isFirstTarget=true |
| _hasDonePhase | ` private _hasDonePhase(entry: TargetEntry, phase: string): boolean` |  |  |
| _markDonePhase | ` private _markDonePhase(entry: TargetEntry, phase: string): void` |  |  |
| _finalizeBecomeTarget | ` private _finalizeBecomeTarget(): void` |  | BecomeTarget 阶段全部完成后定型使用关系 |
| _runSettleLoop | ` private async _runSettleLoop(): Promise<void>` |  | 按 effectTimes 轮询结算。每轮的第一个目标设置 isFirstTarget=true |
| _settleOneTarget | ` private async _settleOneTarget(entry: TargetEntry): Promise<void>` |  | 结算单个目标的一次 |
| _onUseCardDeclare | ` private async _onUseCardDeclare(_room: Room, _data: UseCardEventData): Promise<void>` |  | UseCardDeclare 之前：实体牌移入处理区 |
| _onUseCardUsed | ` private async _onUseCardUsed(_room: Room, _data: UseCardEventData): Promise<void>` |  | UseCardUsed 之前：重排序目标 |
| _onUseCardReady | ` private async _onUseCardReady(_room: Room, _data: UseCardEventData): Promise<void>` |  | UseCardReady 之前：移除死者、重排序；装备牌/延时锦囊牌安置后结束 |
| _equipToFirstTarget | ` private async _equipToFirstTarget(): Promise<void>` |  | 装备牌：将实体牌置入第一个目标的装备区（同栏已有装备一并弃置，经一个移动事件处理） |
| _delayedScrollToFirstTarget | ` private async _delayedScrollToFirstTarget(): Promise<void>` |  | 延时锦囊牌：目标判定区无同名牌时置入判定区；有同名牌则结束（实体牌经处理区清理时消失） |
| _applyResponse | ` private async _applyResponse(): Promise<void>` |  | 响应路径：对被响应的牌设置 offset |
| _onEffectAfter | ` private async _onEffectAfter(entry: TargetEntry): Promise<void>` |  | EffectAfter 之后：执行牌面效果（经 carduses 定义） |
| _onUseCardEnd3 | ` private async _onUseCardEnd3(_room: Room, _data: UseCardEventData): Promise<void>` |  | UseCardEnd3 之后：虚拟牌消失（装备牌与延时锦囊牌的虚拟牌由移动事件安置，不销毁） |
| _sortTargets | ` private _sortTargets(): void` |  | 对目标列表排序。 |
| [transfer](../../rules/terms/description-terms/zhuanyi.md) | ` transfer(oldTarget: Player, newTarget: Player): void` | [zhuanyi](../../rules/terms/description-terms/zhuanyi.md) | 转移目标：取消此目标并生成与角色 B 具有对应关系的新的目标加入目标列表 + 重排序 |
| addTarget | ` addTarget(target: Player): TargetEntry` |  | 新增目标：构建 TargetEntry 加入列表 + 重排序 |
| [becomeTarget](../../rules/terms/description-terms/yechengweimubiao.md) | ` becomeTarget(players: Player[], type?: TargetValidType): void` | [yechengweimubiao](../../rules/terms/description-terms/yechengweimubiao.md) | 也成为目标：将玩家列表作为此牌的合法目标加入目标列表 |
| [cancel](../../rules/terms/resolution-terms/cancel.md) | ` cancel(target: Player): void` | [cancel](../../rules/terms/resolution-terms/cancel.md) | 取消目标：移出目标列表并终止当前时机 |
| [invalid](../../rules/terms/resolution-terms/invalid.md) | ` invalid(target: Player): void` | [invalid](../../rules/terms/resolution-terms/invalid.md) | 标记无效：此牌对该目标无效（跳过生效时机） |
| offset | ` offset(target: Player, offsetEvent: EventProcess): void` |  | 标记被抵消 |

### TargetValidType（类型别名）

- 签名：`export type TargetValidType = 'unlimitedDistance';`
- 位置：../../shared/core/logic/event/UseCardEvent.ts#L20

> 合法性检测的异样规则类型（成为目标的例外条件）
