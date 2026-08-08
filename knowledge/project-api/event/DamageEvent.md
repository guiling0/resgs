---
title: DamageEvent
type: api
id: api/event/DamageEvent
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

# DamageEvent（类）

- 签名：`export class DamageEvent extends EventProcess<EventType.Damage>`
- 位置：../../shared/core/logic/event/DamageEvent.ts#L25
- 规则：[damage](../../rules/events/damage.md)

> 伤害事件
> @rules events/damage
> @description 执行流程：DamageStart → Cause1 → Cause2 → Inflict1 → Inflict2 → Inflict3 → CauseAfter（扣减体力）→ InflictAfter → DamageEnd（复活队列 + 连环传导）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| triggerChain | `triggerChain: boolean` |  | 是否触发连环伤害（默认 false；ReduceHpEvent 连环处理时标记） |
| constructor | ` constructor(room: Room, data: DamageEventData)` |  |  |
| [player](../../rules/terms/description-terms/source.md) | ` get player(): Player \| undefined` | [source](../../rules/terms/description-terms/source.md) | 来源（造成伤害的角色） |
| player | ` set player(v: Player \| undefined): Player` |  |  |
| target | ` get target(): Player` |  | 受到伤害的角色 |
| target | ` set target(v: Player): DamageType` |  |  |
| [damageType](../../rules/terms/description-terms/shuxingshanghai.md) | ` get damageType(): DamageType` | [shuxingshanghai](../../rules/terms/description-terms/shuxingshanghai.md) | 伤害类型（普通/属性伤害） |
| damageType | ` set damageType(v: DamageType): number` |  |  |
| number | ` get number(): number` |  | 伤害值 |
| number | ` set number(v: number): VirtualCard \| string \| undefined` |  |  |
| [channel](../../rules/terms/description-terms/channel.md) | ` get channel(): VirtualCard \| string \| undefined` | [channel](../../rules/terms/description-terms/channel.md) | 渠道（造成伤害的牌/技能） |
| channel | ` set channel(v: VirtualCard \| string \| undefined): boolean` |  |  |
| [isChain](../../rules/terms/description-terms/lianhuanshanghai.md) | ` get isChain(): boolean` | [lianhuanshanghai](../../rules/terms/description-terms/lianhuanshanghai.md) | 是否为连环伤害 |
| isChain | ` set isChain(v: boolean): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| _onCauseDamaged | ` private async _onCauseDamaged(_room: Room, _data: DamageEventData): Promise<void>` |  | DamageCauseAfter 之前：执行扣减体力 |
| [_onDamageEnd](../../rules/terms/resolution-terms/origin.md) | ` private async _onDamageEnd(_room: Room, _data: DamageEventData): Promise<void>` | [origin](../../rules/terms/resolution-terms/origin.md) | DamageEnd 之后：处理复活队列 + 连环伤害传导 |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| [prevent](../../rules/terms/resolution-terms/prevent.md) | ` async prevent(): Promise<this>` | [prevent](../../rules/terms/resolution-terms/prevent.md) | 防止伤害（仅在防止时机内可调用） |
| [transfer](../../rules/terms/description-terms/zhuanyi.md) | ` async transfer(to: Player): Promise<this>` | [zhuanyi](../../rules/terms/description-terms/zhuanyi.md) | 转移伤害（仅在防止时机内可调用，目标不能是自身） |
