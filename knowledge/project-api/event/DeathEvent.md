---
title: DeathEvent
type: api
id: api/event/DeathEvent
rules:
  - events/death
  - events/dying
  - terms/description-terms/killer
tags: [API, 事件域（logic/event/）]
---

# DeathEvent（类）

- 签名：`export class DeathEvent extends EventProcess<EventType.Death>`
- 位置：../../shared/core/logic/event/DyingEvent.ts#L133
- 规则：[death](../../rules/events/death.md)

> 死亡事件
> @rules events/death
> @description 执行流程：DeathBefore → DeathConfirmRole（确认死亡）→ Death → DeathAfter（弃牌清标记）→ DeathEnd（移除技能效果）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: DeathEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| [killer](../../rules/terms/description-terms/killer.md) | ` get killer(): Player \| undefined` | [killer](../../rules/terms/description-terms/killer.md) | 击杀者（优先使用 DyingEvent 传入的值） |
| killer | ` set killer(v: Player \| undefined): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| init | ` protected async init(): Promise<void>` |  |  |
| check | ` check(): boolean` |  |  |
| _onConfirmRole | ` private async _onConfirmRole(_room: Room, _data: DeathEventData): Promise<void>` |  | DeathConfirmRole 之前：确认死亡、确定击杀者 |
| _onDeathAfter | ` private async _onDeathAfter(_room: Room, _data: DeathEventData): Promise<void>` |  | DeathAfter 之后：弃置所有牌、清除标记 |
| _onDeathEnd | ` private async _onDeathEnd(_room: Room, _data: DeathEventData): Promise<void>` |  | DeathEnd 之后：移除该角色所有技能和效果 |
