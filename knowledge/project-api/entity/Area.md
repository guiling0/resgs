---
title: Area
type: api
id: api/entity/Area
tags: [API, 实体域（entity/）]
---

# Area（类）

- 签名：`export class Area`
- 位置：../../shared/core/entity/Area.ts#L12

> 区域——放置实体牌与武将牌的场所（公共区域或玩家私有区域）。
> 无可同步属性，不继承 StateNode。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| type | `readonly type: AreaType` |  | 区域类型 |
| room | `readonly room: Room` |  | 所属房间 |
| player | `readonly player?: Player` |  | 所属玩家（公共区域为 undefined） |
| defaultPut | `defaultPut: CardPut` |  | 默认放置方式（牌进入区域时的面朝方向） |
| disable | `disable: boolean` |  | 是否废除（封印） |
| _cards | `private readonly _cards: GameCard[]` |  |  |
| _generals | `private readonly _generals: General[]` |  |  |
| constructor | ` constructor(room: Room, type: AreaType, player?: Player, defaultPut: CardPut = false): AreaId` |  |  |
| areaId | ` get areaId(): AreaId` |  | 区域 id（玩家私有：'{playerId}.{type}'，公共：'{type}'） |
| cards | ` get cards(): GameCard[]` |  | 区域内的实体牌（副本） |
| generals | ` get generals(): General[]` |  | 区域内的武将牌（副本） |
| count | ` get count(): number` |  | 实体牌数量 |
| generalCount | ` get generalCount(): number` |  | 武将牌数量 |
| isPublic | ` get isPublic(): boolean` |  | 是否为公共区域 |
| isPrivate | ` get isPrivate(): boolean` |  | 是否为玩家私有区域 |
| isPlayer | ` get isPlayer(): boolean` |  | 是否为玩家角色区域（手牌/装备/判定区） |
| add | ` add(cards: (GameCard \| General): void` |  | 向区域加入牌（默认置底；top/bottom/random/指定下标），并记录牌所在区域 |
| pushOne | ` private pushOne<T>(arr: T[], card: T, pos: 'top' \| 'bottom' \| 'random' \| number): void` |  |  |
| remove | ` remove(cards: (GameCard \| General): void` |  | 从区域移除牌（同时清空牌所在区域记录） |
| removeOne | ` private removeOne<T>(arr: T[], card: T): void` |  |  |
| has | ` has(card: GameCard \| General): boolean` |  | 区域中是否含指定牌 |
| get | ` get<T extends GameCard \| General>( count: number, type: new (...args: never[]): T[]` |  | 获取牌：按类型/位置/过滤条件取 count 张（不足时返回已有部分） |
| getOne | ` getOne<T extends GameCard \| General>( type: new (...args: never[]): T \| undefined` |  | 获取一张牌（参数同 get） |
| shuffle | ` shuffle(kind?: 'cards' \| 'generals', cards?: (GameCard \| General): void` |  | 洗牌：kind 限定仅洗实体牌或仅洗武将牌（不提供洗全部）；cards 提供时仅打乱这些牌 |
