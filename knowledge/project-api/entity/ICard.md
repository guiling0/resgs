---
title: ICard
type: api
id: api/entity/ICard
tags: [API, 实体域（entity/）]
---

# ICard（类）

- 签名：`export abstract class ICard extends Mark`
- 位置：../../shared/core/entity/ICard.ts#L10

> 卡牌抽象基类——实体牌与虚拟牌的共同牌面能力，继承 Mark 具备标记能力。
> 子类实现 name/suit/number/attr；color 由花色派生（虚拟牌可覆盖为按源牌计算），type/subtype 由注册表按牌名派生。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| name | `abstract readonly name: string` |  | 卡牌名（子类实现） |
| suit | `abstract readonly suit: CardSuit` |  | 花色（子类实现） |
| number | `abstract readonly number: CardNumber` |  | 点数（子类实现） |
| attr | `abstract readonly attr: CardAttr[]` |  | 属性列表（子类实现） |
| color | ` get color(): CardColor` |  | 颜色（由花色派生） |
| type | ` get type(): CardType` |  | 卡牌类别（按牌名查 sgs.carddatas，未注册默认基本牌） |
| subtype | ` get subtype(): CardSubType` |  | 卡牌副类别（按牌名查 sgs.carddatas，未注册默认基本牌） |
| hasAttr | ` hasAttr(attr: CardAttr): boolean` |  | 是否含指定属性 |
| isCommonSha | ` isCommonSha(): boolean` |  | 是否为普通杀（无火/雷属性） |
| isDamageCard | ` isDamageCard(): boolean` |  | 是否为伤害卡牌 |
| isRecoverCard | ` isRecoverCard(): boolean` |  | 是否为回复类卡牌 |
| isBasic | ` isBasic(): boolean` |  | 是否为基本牌 |
| isScroll | ` isScroll(): boolean` |  | 是否为锦囊牌 |
| isEquip | ` isEquip(): boolean` |  | 是否为装备牌 |
| isDelayedScroll | ` isDelayedScroll(): boolean` |  | 是否为延时锦囊牌 |
| isInstantScroll | ` isInstantScroll(): boolean` |  | 是否为即时锦囊牌 |
| isWeapon | ` isWeapon(): boolean` |  | 是否为武器 |
| isArmor | ` isArmor(): boolean` |  | 是否为防具 |
| isDefensiveMount | ` isDefensiveMount(): boolean` |  | 是否为防御坐骑 |
| isOffensiveMount | ` isOffensiveMount(): boolean` |  | 是否为进攻坐骑 |
| isSpecialMount | ` isSpecialMount(): boolean` |  | 是否为特殊坐骑 |
| isTreasure | ` isTreasure(): boolean` |  | 是否为宝物 |
| isMount | ` isMount(): boolean` |  | 是否为坐骑牌 |
