---
title: VirtualCard
type: api
id: api/entity/VirtualCard
rules:
  - terms/card-terms/virtualCard
tags: [API, 实体域（entity/）]
---

# VirtualCard（类）

- 签名：`export class VirtualCard extends ICard`
- 位置：../../shared/core/entity/VirtualCard.ts#L23
- 规则：[virtualCard](../../rules/terms/card-terms/virtualCard.md)

> 虚拟牌——使用/打出的结算对象，链接实体牌（subcards）派生牌面属性。
> 仅权威端创建使用（结算瞬态对象），镜像端只消费 toData 导出的 VirtualCardData。
> 单实体牌继承其花色/点数/属性；多实体牌花色点数取无，颜色按子牌同色判定。
> @rules terms/card-terms/virtualCard
> @description 虚拟牌实体——使用/打出结算的虚拟牌运行时对象

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| name | `readonly name: string` |  |  |
| subcards | `readonly subcards: GameCard[]` |  | 实体牌列表 |
| destroyed | `destroyed: boolean` |  | 是否已销毁（销毁后不可再参与结算） |
| _suit | `private _suit: CardSuit` |  | 花色 |
| _number | `private _number: CardNumber` |  | 点数 |
| _attr | `private _attr: CardAttr[]` |  | 属性列表 |
| _color | `private _color: CardColor` |  | 颜色（refresh 计算） |
| constructor | ` constructor(room: Room, name: string, subcards: GameCard[] = [], overrides?: VirtualCardOverrides): CardSuit` |  |  |
| suit | ` get suit(): CardSuit` |  | 花色 |
| number | ` get number(): CardNumber` |  | 点数 |
| attr | ` get attr(): CardAttr[]` |  | 属性列表（副本） |
| color | ` get color(): CardColor` |  | 颜色（覆盖项优先，否则按实体牌派生） |
| cardIds | ` get cardIds(): string[]` |  | 实体牌 ID 列表 |
| _data | `private _data?: VirtualCardData` |  | 导出数据缓存（引用稳定，字段随 refresh 同步更新） |
| toData | ` toData(): VirtualCardData` |  | 导出虚拟牌数据（供权威端发消息，镜像端消费此类型；返回引用稳定，供装备/判定记录匹配） |
| set | ` set(overrides: VirtualCardOverrides = {}, _reset: boolean = true): void` |  | 重新设置虚拟牌属性 |
| hasSubCards | ` hasSubCards(): boolean` |  | 是否挂有实体牌 |
| addSubCards | ` addSubCards(cards: GameCard[]): void` |  | 添加实体牌：建立子牌与虚拟牌的双向链接 |
| delSubCard | ` delSubCard(card: GameCard): void` |  | 移除实体牌：断开子牌与虚拟牌的链接 |
| clearSubCards | ` clearSubCards(): void` |  | 清空实体牌：断开全部子牌链接 |
| refresh | ` refresh(overrides: VirtualCardOverrides = {}): void` |  | 刷新牌面属性：显式覆盖优先，未提供时按实体牌派生 |
| defaultColor | ` private defaultColor(): CardColor` |  | 派生颜色：单实体牌继承；多实体牌全黑→黑、全红→红、混合→无色 |

### VirtualCardOverrides（接口）

- 签名：`export interface VirtualCardOverrides`
- 位置：../../shared/core/entity/VirtualCard.ts#L9

> 虚拟牌牌面覆盖项（refresh 用，未提供字段按实体牌派生）
