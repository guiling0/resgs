---
title: CardTypes
type: api
id: api/types/CardTypes
rules:
  - terms/card-face-terms/color
  - terms/card-face-terms/numberInit
  - terms/card-face-terms/suit
  - terms/card-terms/Basic
  - terms/card-terms/Equip
  - terms/card-terms/GameCard
  - terms/card-terms/Trick
  - terms/card-terms/virtualCard
  - terms/value-terms/cardId
  - terms/zone-terms/armorArea
  - terms/zone-terms/attackMountArea
  - terms/zone-terms/defenseMountArea
  - terms/zone-terms/specialMountArea
  - terms/zone-terms/treasureArea
  - terms/zone-terms/weaponArea
tags: [API, 类型域（types/）]
---

# CardTypes（类型域（types/））

### GameCardId（类型别名）

- 签名：`export type GameCardId = string;`
- 位置：../../shared/core/types/CardTypes.ts#L6
- 规则：[cardId](../../rules/terms/value-terms/cardId.md)

> 游戏牌ID
> @rules terms/value-terms/cardId
> @description 实体牌 ID 格式 {扩展名}.{自增序号}，保证跨扩展不冲突

### VirtualCardId（类型别名）

- 签名：`export type VirtualCardId = number;`
- 位置：../../shared/core/types/CardTypes.ts#L8

> 虚拟牌 ID

### GameCardData（接口）

- 签名：`export interface GameCardData`
- 位置：../../shared/core/types/CardTypes.ts#L15
- 规则：[GameCard](../../rules/terms/card-terms/GameCard.md)

> 实体牌数据（仅用于 sgs 注册；id 由注册扩展包时分配）
> @rules terms/card-terms/GameCard
> @description 游戏牌实体数据，除衍生牌外的所有对局牌均为此类

### VirtualCardData（接口）

- 签名：`export interface VirtualCardData`
- 位置：../../shared/core/types/CardTypes.ts#L37
- 规则：[virtualCard](../../rules/terms/card-terms/virtualCard.md)

> 虚拟牌数据（使用/打出的结算对象数据，subcards 为实体牌 id 列表）
> @rules terms/card-terms/virtualCard
> @description 虚拟牌是使用/打出的结算对象，与被使用/打出的牌对应的实体牌有关联关系

### CardData（接口）

- 签名：`export interface CardData`
- 位置：../../shared/core/types/CardTypes.ts#L55

> 卡牌定义数据（按牌名注册到 sgs.carddatas，供类别/副类别派生与 UI 展示）

### CardAttr（枚举）

- 签名：`export enum CardAttr`
- 位置：../../shared/core/types/CardTypes.ts#L85

> 卡牌属性

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `1` | Fire | 火属性（杀专属） |

### CardSuit（枚举）

- 签名：`export enum CardSuit`
- 位置：../../shared/core/types/CardTypes.ts#L105
- 规则：[suit](../../rules/terms/card-face-terms/suit.md)

> 卡牌花色
> @rules terms/card-face-terms/suit
> @description 花色标识于游戏牌左上角，分红桃/方片/黑桃/梅花四种

### CardNumber（枚举）

- 签名：`export enum CardNumber`
- 位置：../../shared/core/types/CardTypes.ts#L122
- 规则：[numberInit](../../rules/terms/card-face-terms/numberInit.md)

> 卡牌点数初值
> @rules terms/card-face-terms/numberInit
> @description 点数初值标识于游戏牌左上角，数字 2-10 代表点数 2-10，A/J/Q/K 分别代表 1/11/12/13

### CardColor（枚举）

- 签名：`export enum CardColor`
- 位置：../../shared/core/types/CardTypes.ts#L146
- 规则：[color](../../rules/terms/card-face-terms/color.md)

> 卡牌颜色
> @rules terms/card-face-terms/color
> @description 游戏牌按颜色分红色、黑色两种：红桃/方片为红，黑桃/梅花为黑

### CardType（枚举）

- 签名：`export enum CardType`
- 位置：../../shared/core/types/CardTypes.ts#L161
- 规则：[Basic](../../rules/terms/card-terms/Basic.md)、[Trick](../../rules/terms/card-terms/Trick.md)、[Equip](../../rules/terms/card-terms/Equip.md)

> 卡牌类别
> @rules terms/card-terms/Basic
> @rules terms/card-terms/Trick
> @rules terms/card-terms/Equip
> @description 牌类别区分基本牌/锦囊牌/装备牌

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `1` | Basic | 基本牌 |
| `2` | Scroll | 锦囊牌 |
| `3` | Equip | 装备牌 |

### CardSubType（枚举）

- 签名：`export enum CardSubType`
- 位置：../../shared/core/types/CardTypes.ts#L178
- 规则：[Basic](../../rules/terms/card-terms/Basic.md)、[Trick](../../rules/terms/card-terms/Trick.md)、[Equip](../../rules/terms/card-terms/Equip.md)

> 卡牌副类别
> @rules terms/card-terms/Basic
> @rules terms/card-terms/Trick
> @rules terms/card-terms/Equip
> @description 牌副类别细分基本牌/延时与非延时锦囊/各类装备

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `1` | Basic | 基本牌 |
| `21` | InstantScroll | 非延时锦囊牌 |
| `22` | DelayedScroll | 延时锦囊牌 |
| `31` | Weapon | 武器 |
| `32` | Armor | 防具 |
| `33` | DefensiveMount | 防御坐骑 |
| `34` | OffensiveMount | 进攻坐骑 |
| `35` | SpecialMount | 特殊坐骑 |
| `36` | Treasure | 宝物 |

### EquipSubType（枚举）

- 签名：`export enum EquipSubType`
- 位置：../../shared/core/types/CardTypes.ts#L205
- 规则：[Equip](../../rules/terms/card-terms/Equip.md)

> 装备牌副类别
> @rules terms/card-terms/Equip
> @description 装备副类别细分武器/防具/坐骑/宝物

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `31` | Weapon | 武器（[Weapon](../../rules/terms/zone-terms/weaponArea.md)） |
| `32` | Armor | 防具（[Armor](../../rules/terms/zone-terms/armorArea.md)） |
| `33` | DefensiveMount | 防御坐骑（[DefensiveMount](../../rules/terms/zone-terms/defenseMountArea.md)） |
| `34` | OffensiveMount | 进攻坐骑（[OffensiveMount](../../rules/terms/zone-terms/attackMountArea.md)） |
| `35` | SpecialMount | 特殊坐骑（[SpecialMount](../../rules/terms/zone-terms/specialMountArea.md)） |
| `36` | Treasure | 宝物（[Treasure](../../rules/terms/zone-terms/treasureArea.md)） |
