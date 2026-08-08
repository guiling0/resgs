---
title: AreaTypes
type: api
id: api/types/AreaTypes
rules:
  - terms/zone-terms/area
  - terms/zone-terms/discardArea
  - terms/zone-terms/drawArea
  - terms/zone-terms/equipArea
  - terms/zone-terms/granaryArea
  - terms/zone-terms/handArea
  - terms/zone-terms/judgeArea
  - terms/zone-terms/processingArea
  - terms/zone-terms/reserveArea
  - terms/zone-terms/sideArea
  - terms/zone-terms/treasuryArea
  - terms/zone-terms/upArea
tags: [API, 类型域（types/）]
---

# AreaTypes（类型域（types/））

### AreaId（类型别名）

- 签名：`export type AreaId = string;`
- 位置：../../shared/core/types/AreaTypes.ts#L2

> 区域 ID——格式：'{playerId}.{type}'（玩家私有）或 '{type}'（公共）

### CardPut（类型别名）

- 签名：`export type CardPut = boolean;`
- 位置：../../shared/core/types/AreaTypes.ts#L5

> 牌放置方式（面朝方向）：true 正面朝上（Up），false 背面朝上（Down）

### AreaType（枚举）

- 签名：`export enum AreaType`
- 位置：../../shared/core/types/AreaTypes.ts#L12
- 规则：[area](../../rules/terms/zone-terms/area.md)

> 区域类型
> @rules terms/zone-terms/area
> @description 放置牌的场所，分为公共区域与独立区域

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `draw` | Draw | 牌堆（[Draw](../../rules/terms/zone-terms/drawArea.md)） |
| `discard` | Discard | 弃牌堆（[Discard](../../rules/terms/zone-terms/discardArea.md)） |
| `processing` | Processing | 处理区（[Processing](../../rules/terms/zone-terms/processingArea.md)） |
| `granary` | Granary | 仓廪（[Granary](../../rules/terms/zone-terms/granaryArea.md)） |
| `treasury` | Treasury | 府库（[Treasury](../../rules/terms/zone-terms/treasuryArea.md)） |
| `reserve` | Reserve | 后备区/仁区（[Reserve](../../rules/terms/zone-terms/reserveArea.md)） |
| `hand` | Hand | 手牌区（[Hand](../../rules/terms/zone-terms/handArea.md)） |
| `equip` | Equip | 装备区（[Equip](../../rules/terms/zone-terms/equipArea.md)） |
| `judge` | Judge | 判定区（[Judge](../../rules/terms/zone-terms/judgeArea.md)） |
| `up` | Up | 武将牌上（[Up](../../rules/terms/zone-terms/upArea.md)） |
| `side` | Side | 武将牌旁（[Side](../../rules/terms/zone-terms/sideArea.md)） |
