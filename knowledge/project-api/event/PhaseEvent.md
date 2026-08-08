---
title: PhaseEvent
type: api
id: api/event/PhaseEvent
rules:
  - events/turn
  - terms/game-flow-terms/end
  - terms/game-flow-terms/phase
tags: [API, 事件域（logic/event/）]
---

# PhaseEvent（类）

- 签名：`export class PhaseEvent extends EventProcess<EventType.Phase>`
- 位置：../../shared/core/logic/event/TurnEvent.ts#L226
- 规则：[phase](../../rules/terms/game-flow-terms/phase.md)

> 阶段事件
> @rules terms/game-flow-terms/phase
> @description 每名角色的回合分为准备、判定、摸牌、出牌、弃牌、结束六个阶段。每个阶段时机序列：{Phase}StartBefore → {Phase}Start → {Phase} → {Phase}End；摸牌阶段的 DrawPhaseStart1/Start2 提供两次修正摸牌数的时机

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _drawCountLocked | `private _drawCountLocked: boolean` |  | draw_start1 归零后锁定，阻止 draw_start2 再修改 |
| constructor | ` constructor(room: Room, data: PhaseEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| phase | ` get phase(): Phase` |  |  |
| isExtraPhase | ` get isExtraPhase(): boolean` |  |  |
| drawCount | ` get drawCount(): number` |  |  |
| drawCount | ` set drawCount(value: number): void` |  |  |
| zeroDrawCount | ` zeroDrawCount(): void` |  | draw_start1 类效果：额定摸牌数改为 0，锁定后续 draw_start2 修改 |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _phaseTiming | ` private _phaseTiming(phase: Phase): { triggers: TimingName[]; end: TimingName }` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| skip | ` async skip(): Promise<this>` |  | 跳过当前阶段 |
| isExecutor | ` isExecutor(player: Player, phase: Phase = this.phase): boolean` |  |  |
| [end](../../rules/terms/game-flow-terms/end.md) | ` async end(): Promise<this>` | [end](../../rules/terms/game-flow-terms/end.md) | 结束阶段 |
