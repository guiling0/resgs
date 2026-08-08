---
title: RecoverHpEvent
type: api
id: api/event/RecoverHpEvent
rules:
  - events/change-max-hp
  - events/recover-hp
tags: [API, 事件域（logic/event/）]
---

# RecoverHpEvent（类）

- 签名：`export class RecoverHpEvent extends EventProcess<EventType.RecoverHp>`
- 位置：../../shared/core/logic/event/HpEvent.ts#L14
- 规则：[recover-hp](../../rules/events/recover-hp.md)

> 回复体力事件
> @rules events/recover-hp
> @description 执行流程：RecoverHpStart → RecoverHpAfter（实际回复）→ RecoverHpEnd

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: RecoverHpEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| number | ` get number(): number` |  |  |
| number | ` set number(v: number): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _onRecoverHpAfter | ` private async _onRecoverHpAfter(_room: Room, _data: RecoverHpEventData): Promise<void>` |  | RecoverHpAfter 之前：实际回复体力 |
