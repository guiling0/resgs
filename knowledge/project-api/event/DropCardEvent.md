---
title: DropCardEvent
type: api
id: api/event/DropCardEvent
rules:
  - events/drop-card
  - terms/description-terms/user
tags: [API, 事件域（logic/event/）]
---

# DropCardEvent（类）

- 签名：`export class DropCardEvent extends EventProcess<EventType.DropCard>`
- 位置：../../shared/core/logic/event/DropCardEvent.ts#L14
- 规则：[drop-card](../../rules/events/drop-card.md)

> 打出牌事件
> @rules events/drop-card
> @description 执行流程：Declare（实体牌移入处理区）→ Droped → End（虚拟牌消失）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: DropCardEventData): Player` |  |  |
| [player](../../rules/terms/description-terms/user.md) | ` get player(): Player` | [user](../../rules/terms/description-terms/user.md) | 打出者 |
| card | ` get card(): VirtualCard` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _onDeclare | ` private async _onDeclare(_room: Room, _data: DropCardEventData): Promise<void>` |  | Declare 之前：实体牌移入处理区 |
| _onEnd | ` private async _onEnd(_room: Room, _data: DropCardEventData): Promise<void>` |  | End 之后：虚拟牌消失 |
