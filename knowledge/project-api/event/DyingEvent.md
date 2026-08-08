---
title: DyingEvent
type: api
id: api/event/DyingEvent
rules:
  - events/death
  - events/dying
  - terms/description-terms/killer
tags: [API, 事件域（logic/event/）]
---

# DyingEvent（类）

- 签名：`export class DyingEvent extends EventProcess<EventType.Dying>`
- 位置：../../shared/core/logic/event/DyingEvent.ts#L15
- 规则：[dying](../../rules/events/dying.md)

> 濒死事件
> @rules events/dying
> @description 执行流程：DyingEntry → DyingEntryAfter → Dying（求桃）→ DyingEnd；若 hp 仍 ≤0 则创建 DeathEvent（含 killer 追溯）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: DyingEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| [killer](../../rules/terms/description-terms/killer.md) | ` get killer(): Player \| undefined` | [killer](../../rules/terms/description-terms/killer.md) | 造成濒死的角色 |
| killer | ` set killer(v: Player \| undefined): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| init | ` protected async init(): Promise<void>` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _onDying | ` private async _onDying(_room: Room, _data: DyingEventData): Promise<void>` |  | Dying 之前：求桃阶段，显式触发 Dying 时机 |
| _onDyingEnd | ` private async _onDyingEnd(_room: Room, _data: DyingEventData): Promise<void>` |  | DyingEnd 之后：若未救活则追溯 killer 并进入死亡 |
| _findKiller | ` private _findKiller(): Player \| undefined` |  | 从事件链追溯造成濒死的角色： |
