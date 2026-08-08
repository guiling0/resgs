---
title: MoveCardEvent
type: api
id: api/event/MoveCardEvent
rules:
  - events/move-card
  - terms/card-op-terms/gain
  - terms/card-op-terms/lose
  - terms/resolution-terms/cancel
tags: [API, 事件域（logic/event/）]
---

# MoveCardEvent（类）

- 签名：`export class MoveCardEvent extends EventProcess<EventType.Move>`
- 位置：../../shared/core/logic/event/MoveCardEvent.ts#L34
- 规则：[move-card](../../rules/events/move-card.md)

> 移动卡牌事件
> @rules events/move-card
> @description 执行流程：MoveCardFixed → Before1 → Before2 → After1（实际移动）→ After2 → MoveCardEnd；MoveCardBefore1/2 期间可调用 cancel()/preventMove() 取消或阻止移动

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| move_datas | `move_datas: MoveCardData[]` |  | 分类后的移动数据 |
| getMoveLabel | `getMoveLabel?: (data: MoveCardData)` |  | 移动标签生成函数（可由调用方覆盖） |
| log | `log?: (data: MoveCardData)` |  | 战报生成函数（可由调用方覆盖） |
| constructor | ` constructor(room: Room, data: MoveEventData): MoveCardData[]` |  |  |
| datas | ` get datas(): MoveCardData[]` |  | eventData.datas 便捷访问 |
| datas | ` set datas(v: MoveCardData[]): void` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| init | ` protected async init(): Promise<void>` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _onMoveCardFixed | ` private async _onMoveCardFixed(_room: Room, _data: MoveEventData): Promise<void>` |  | MoveCardFixed: 固定移动（对移动数据做最终校正，子类或外部可覆写） |
| _onMoveCardAfter1 | ` private async _onMoveCardAfter1(_room: Room, _data: MoveEventData): Promise<void>` |  | MoveCardAfter1 之前：执行实际卡牌移动 |
| handleVirtualCard | ` protected async handleVirtualCard( card: GameCard, fromArea: AreaId, toArea: AreaId, ): Promise<void>` |  | 移动后处理虚拟牌及装备牌关联 |
| classify | ` public classify(): void` |  | 对移动数据分类赋默认值并归类。 |
| add | ` public add(data: MoveCardData, reclassify: boolean = true): void` |  | 增加一条移动数据，可选延迟归类（批量添加时最后统一调用 classify） |
| update | ` public update(cards: GameCard[], newData: Partial<MoveCardData> = {}): void` |  | 修改指定牌的移动数据。 |
| get | ` get(card: GameCard): MoveCardData \| undefined` |  | 获取本次移动中包含指定牌的 MoveCardData |
| has | ` has(card: GameCard): boolean` |  | 本次移动中是否包含指定牌的移动 |
| getCards | ` getCards(filter: (data: MoveCardData, card: GameCard): GameCard[]` |  | 获取本次移动中符合条件的牌 |
| getCard | ` getCard(filter: (data: MoveCardData, card: GameCard): GameCard \| undefined` |  | 获取本次移动中符合条件的牌（返回第一张，短路查找） |
| filter | ` filter(filter: (data: MoveCardData, card: GameCard): MoveCardData[]` |  | 获取符合条件的移动数据 |
| has_filter | ` has_filter(filter: (data: MoveCardData, card: GameCard): boolean` |  | 移动中是否包含符合条件的数据 |
| getMoveCount | ` getMoveCount(): number` |  | 获取移动的总牌数 |
| [getLoseByReason](../../rules/terms/card-op-terms/lose.md) | ` getLoseByReason(player: Player, reason: string, pos: string = 'he'): MoveCardData[]` | [lose](../../rules/terms/card-op-terms/lose.md) | 获取某玩家因指定原因会失去的牌的数据 |
| [getLoseCardsByReason](../../rules/terms/card-op-terms/lose.md) | ` getLoseCardsByReason(player: Player, reason: string, pos: string = 'he'): GameCard[]` | [lose](../../rules/terms/card-op-terms/lose.md) | 获取某玩家因指定原因会失去的牌 |
| [hasLoseByReason](../../rules/terms/card-op-terms/lose.md) | ` hasLoseByReason(player: Player, reason: string, pos: string = 'he'): boolean` | [lose](../../rules/terms/card-op-terms/lose.md) | 是否有因指定原因失去牌的数据 |
| [getObtainByReason](../../rules/terms/card-op-terms/gain.md) | ` getObtainByReason(player: Player, reason: string): MoveCardData[]` | [gain](../../rules/terms/card-op-terms/gain.md) | 获取某玩家因指定原因会得到的牌的数据 |
| [getObtainCardsByReason](../../rules/terms/card-op-terms/gain.md) | ` getObtainCardsByReason(player: Player, reason: string): GameCard[]` | [gain](../../rules/terms/card-op-terms/gain.md) | 获取某玩家因指定原因会得到的牌 |
| [hasObtainByReason](../../rules/terms/card-op-terms/gain.md) | ` hasObtainByReason(player: Player, reason: string): boolean` | [gain](../../rules/terms/card-op-terms/gain.md) | 是否有因指定原因得到牌的数据 |
| [cancel](../../rules/terms/resolution-terms/cancel.md) | ` async cancel(cards?: GameCard[], prevent: boolean = true): Promise<this>` | [cancel](../../rules/terms/resolution-terms/cancel.md) | 取消移动（仅在 MoveCardBefore1/2 时机可调用） |
| preventMove | ` async preventMove(): Promise<this>` |  | 阻止整个移动事件（仅在 MoveCardBefore1/2 时机可调用） |
| findAreaOf | ` private findAreaOf(card: GameCard)` |  | 查询牌所在区域（经 card.area 直接读取） |
