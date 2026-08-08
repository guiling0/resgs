---
title: JudgeEvent
type: api
id: api/event/JudgeEvent
rules:
  - events/judge
tags: [API, 事件域（logic/event/）]
---

# JudgeEvent（类）

- 签名：`export class JudgeEvent extends EventProcess<EventType.Judge>`
- 位置：../../shared/core/logic/event/JudgeEvent.ts#L15
- 规则：[judge](../../rules/events/judge.md)

> 判定事件
> @rules events/judge
> @description 执行流程：Judge（取判定牌）→ JudgeCard（改判）→ JudgeResult1 → JudgeResult2 → JudgeResultAfter1 → JudgeResultAfter2 → JudgeEnd

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| success | `success: boolean` |  | 当前判定是否成功（由 setCard/resetSuccess 设置） |
| constructor | ` constructor(room: Room, data: JudgeEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| card | ` get card(): GameCard \| undefined` |  |  |
| card | ` set card(v: GameCard \| undefined): VirtualCardData \| undefined` |  |  |
| result | ` get result(): VirtualCardData \| undefined` |  |  |
| result | ` set result(v: VirtualCardData \| undefined): ((result: VirtualCardData) => boolean) \| undefined` |  |  |
| isSuccess | ` get isSuccess(): ((result: VirtualCardData) => boolean) \| undefined` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  |  |
| _onJudgeAfter | ` private async _onJudgeAfter(_room: Room, _data: JudgeEventData): Promise<void>` |  | Judge 之后：从牌堆取牌 → 移到处理区 → setCard |
| _onJudgeResultAfter1Before | ` private async _onJudgeResultAfter1Before(_room: Room, _data: JudgeEventData): Promise<void>` |  | JudgeResultAfter1 之前：广播判定结果 |
| setCard | ` async setCard(card: GameCard): Promise<void>` |  | 设置判定牌（改判技能调用）。 |
| resetSuccess | ` resetSuccess(): void` |  | 重新评估判定是否成功（改判后调用） |
