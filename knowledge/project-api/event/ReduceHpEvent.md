---
title: ReduceHpEvent
type: api
id: api/event/ReduceHpEvent
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

# ReduceHpEvent（类）

- 签名：`export class ReduceHpEvent extends EventProcess<EventType.ReduceHp>`
- 位置：../../shared/core/logic/event/DamageEvent.ts#L322
- 规则：[reduce-hp](../../rules/events/reduce-hp.md)

> 扣减体力事件
> @rules events/reduce-hp
> @description 执行流程：ReduceHpStart → ReduceHp → ReduceHpAfter（实际扣减）→ ReduceHpEnd（濒死检查）；连环处理在 init() 中早于所有时机执行

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: ReduceHpEventData): Player` |  |  |
| player | ` get player(): Player` |  | 扣减体力的角色 |
| player | ` set player(v: Player): number` |  |  |
| number | ` get number(): number` |  | 扣减数值 |
| number | ` set number(v: number): Promise<void>` |  |  |
| init | ` protected async init(): Promise<void>` |  |  |
| _handleChain | ` private _handleChain(): void` |  | 处理连环状态的解除与传导标记 |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _onReduceHpAfter | ` private async _onReduceHpAfter(_room: Room, _data: ReduceHpEventData): Promise<void>` |  | ReduceHpAfter 之后：实际修改 hp（护盾优先吸收） |
| _onReduceHpEnd | ` private async _onReduceHpEnd(_room: Room, _data: ReduceHpEventData): Promise<void>` |  | ReduceHpEnd 之后：检查是否需要进入濒死 |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _getDamage | ` private _getDamage(): DamageEvent \| undefined` |  | 获取关联的伤害事件 |
| _getLoseHp | ` private _getLoseHp(): LoseHpEvent \| undefined` |  | 获取关联的失去体力事件 |
