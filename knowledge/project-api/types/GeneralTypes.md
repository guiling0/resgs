---
title: GeneralTypes
type: api
id: api/types/GeneralTypes
rules:
  - terms/card-face-terms/gender
  - terms/card-face-terms/kingdom
  - terms/card-terms/GeneralCard
tags: [API, 类型域（types/）]
---

# GeneralTypes（类型域（types/））

### GeneralId（类型别名）

- 签名：`export type GeneralId = string;`
- 位置：../../shared/core/types/GeneralTypes.ts#L4

> 武将 ID（武将名即 id）

### GeneralKingdom（类型别名）

- 签名：`export type GeneralKingdom = string;`
- 位置：../../shared/core/types/GeneralTypes.ts#L10
- 规则：[kingdom](../../rules/terms/card-face-terms/kingdom.md)

> 武将势力（可用逗号分割多势力，如 "wei,shu"）
> @rules terms/card-face-terms/kingdom
> @description 势力标识于武将牌左上角，分为魏/蜀/吴/群/西和神六种

### GeneralHp（类型别名）

- 签名：`export type GeneralHp = number | [number, number] | [number, number, number];`
- 位置：../../shared/core/types/GeneralTypes.ts#L12

> 武将体力（number 或 [初始体力, 上限, 护盾]）

### Gender（枚举）

- 签名：`export enum Gender`
- 位置：../../shared/core/types/GeneralTypes.ts#L19
- 规则：[gender](../../rules/terms/card-face-terms/gender.md)

> 性别
> @rules terms/card-face-terms/gender
> @description 性别由武将牌的姓名/插画/历史记载获知，分男性、女性两种

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `0` | None | 无性别 |
| `1` | Male | 男 |
| `2` | Female | 女 |
| `9` | Doublesex | 双性 |

### GeneralData（接口）

- 签名：`export interface GeneralData`
- 位置：../../shared/core/types/GeneralTypes.ts#L35
- 规则：[GeneralCard](../../rules/terms/card-terms/GeneralCard.md)

> 武将数据（注册到 sgs.generals，武将名即 id）
> @rules terms/card-terms/GeneralCard
> @description 武将牌数据——角色的武将牌上标识的姓名即其姓名
