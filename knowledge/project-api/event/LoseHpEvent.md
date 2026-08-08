---
title: LoseHpEvent
type: api
id: api/event/LoseHpEvent
rules:
  - events/damage
  - events/lose-hp
  - events/reduce-hp
  - terms/description-terms/channel
  - terms/description-terms/lianhuanshanghai
  - terms/description-terms/shuxingshanghai
  - terms/description-terms/source
  - terms/description-terms/zhuanyi
  - terms/resolution-terms/origin
  - terms/resolution-terms/prevent
tags: [API, 事件域（logic/event/）]
---

# LoseHpEvent（类）

- 签名：`export class LoseHpEvent extends EventProcess<EventType.LoseHp>`
- 位置：../../shared/core/logic/event/DamageEvent.ts#L232
- 规则：[lose-hp](../../rules/events/lose-hp.md)

> 失去体力事件
> @rules events/lose-hp
> @description 执行流程：LoseHpStart → LoseHp（扣减体力）→ LoseHpEnd（复活队列）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: LoseHpEventData): Player` |  |  |
| player | ` get player(): Player` |  | 失去体力的角色 |
| player | ` set player(v: Player): number` |  |  |
| number | ` get number(): number` |  | 失去的体力数值 |
| number | ` set number(v: number): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _onLoseHp | ` private async _onLoseHp(_room: Room, _data: LoseHpEventData): Promise<void>` |  | LoseHp 之前：执行扣减体力 |
| _onLoseHpEnd | ` private async _onLoseHpEnd(_room: Room, _data: LoseHpEventData): Promise<void>` |  | LoseHpEnd 之后：处理复活队列 |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| [prevent](../../rules/terms/resolution-terms/prevent.md) | ` async prevent(): Promise<this>` | [prevent](../../rules/terms/resolution-terms/prevent.md) | 防止失去体力（仅在 LoseHpStart 时机可调用） |
