---
title: TurnEvent
type: api
id: api/event/TurnEvent
rules:
  - events/turn
  - terms/game-flow-terms/end
  - terms/game-flow-terms/phase
tags: [API, 事件域（logic/event/）]
---

# TurnEvent（类）

- 签名：`export class TurnEvent extends EventProcess<EventType.Turn>`
- 位置：../../shared/core/logic/event/TurnEvent.ts#L15
- 规则：[turn](../../rules/events/turn.md)

> 回合事件
> @rules events/turn
> @description 执行流程：TurnStartBefore（休整/翻面处理）→ TurnStart → TurnStartAfter（生成阶段）→ [各阶段 PhaseEvent 依次执行] → TurnEnd（清 inturn/酒状态）→ TurnEndAfter

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: TurnEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| player | ` set player(v: Player): number` |  |  |
| turnId | ` get turnId(): number` |  |  |
| turnId | ` set turnId(v: number): boolean` |  |  |
| isExtraTurn | ` get isExtraTurn(): boolean` |  |  |
| isExtraTurn | ` set isExtraTurn(v: boolean): boolean` |  |  |
| isSkipped | ` get isSkipped(): boolean` |  |  |
| phases | ` get phases(): TurnEventData['phases']` |  |  |
| skippedPhases | ` get skippedPhases(): Phase[]` |  |  |
| isRoundStart | ` get isRoundStart(): boolean` |  |  |
| isRoundStart | ` set isRoundStart(v: boolean): boolean` |  |  |
| isRoundEnd | ` get isRoundEnd(): boolean` |  |  |
| isRoundEnd | ` set isRoundEnd(v: boolean): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _onTurnStartBefore | ` private async _onTurnStartBefore(_room: Room, _data: TurnEventData): Promise<void>` |  |  |
| _onTurnStarted | ` private async _onTurnStarted(_room: Room, _data: TurnEventData): Promise<void>` |  |  |
| _onTurnEnd | ` private async _onTurnEnd(_room: Room, _data: TurnEventData): Promise<void>` |  |  |
| _generatePhases | ` private async _generatePhases(): Promise<void>` |  |  |
| processCompleted | ` async processCompleted(): Promise<void>` |  |  |
| skipPhase | ` async skipPhase(phase?: Phase \| Phase[]): Promise<void>` |  | 跳过指定阶段（或当前阶段） |
| [end](../../rules/terms/game-flow-terms/end.md) | ` async end(): Promise<this>` | [end](../../rules/terms/game-flow-terms/end.md) | 结束回合 |
| isNotSkip | ` isNotSkip(phase: Phase): boolean` |  |  |
| _skipTurn | ` private _skipTurn(): void` |  |  |
| _findCurrentPhaseEvent | ` private _findCurrentPhaseEvent(): PhaseEvent \| undefined` |  |  |
