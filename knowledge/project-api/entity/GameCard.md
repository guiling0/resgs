---
title: GameCard
type: api
id: api/entity/GameCard
rules:
  - terms/card-terms/GameCard
  - terms/value-terms/cardId
tags: [API, 实体域（entity/）]
---

# GameCard（类）

- 签名：`export class GameCard extends ICard`
- 位置：../../shared/core/entity/GameCard.ts#L18
- 规则：[GameCard](../../rules/terms/card-terms/GameCard.md)

> 实体牌——游戏牌实体，牌面能力继承自 ICard。
> 源数据（sourceData）保留并对外可读，属性经 getter 动态暴露。
> 同步挂载场景属 R1 区域管理。
> @rules terms/card-terms/GameCard
> @description 游戏牌实体类——对局中每张牌的运行时对象

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| area | `area?: Area` |  | 当前所在区域（加入区域时设置，移出时清空） |
| sourceData | `readonly sourceData: GameCardData` |  | 源数据（注册构建的实体牌数据，外部可读；状态效果修正直接改此数据） |
| put | `@sync() put: boolean` |  | 放置方式（true=正面朝上，false=背面朝上）——TODO(R1): 区域管理的放置同步语义细化 |
| vcard | `vcard?: VirtualCard` |  | 关联虚拟牌（使用/打出结算中的临时关联）——TODO(R1): 区域管理维护 |
| constructor | ` constructor(room: Room, data: GameCardData)` |  |  |
| [id](../../rules/terms/value-terms/cardId.md) | ` get id(): GameCardId` | [cardId](../../rules/terms/value-terms/cardId.md) | 实体牌 id |
| name | ` get name(): string` |  | 卡牌名 |
| suit | ` get suit(): CardSuit` |  | 花色 |
| number | ` get number(): CardNumber` |  | 点数 |
| attr | ` get attr(): CardAttr[]` |  | 属性列表（副本） |
| derived | ` get derived(): boolean` |  | 是否为衍生牌 |
| turnTo | ` turnTo(put: boolean): void` |  | 设置放置方式（正面/背面） |
| formatVirtualCardData | ` formatVirtualCardData(): VirtualCardData` |  | 生成以本牌为子牌的虚拟牌数据（判定/展示场景用） |
| resources | ` get resources(): CardAssets \| undefined` |  | 牌资源（未注册返回 undefined） |
| getImage | ` getImage(): string` |  | 牌图（完整 url） |
| getAudio | ` getAudio(gender: CardGender, animationName?: string): string` |  | 配音（完整 url；animationName 指定动画分支时取该分支专属配音，未命中走默认配音） |
| getAnimation | ` getAnimation(name: string): CardAnimation \| undefined` |  | 动画分支 |
