---
title: ChooseTypes
type: api
id: api/types/ChooseTypes
tags: [API, 类型域（types/）]
---

# ChooseTypes（类型域（types/））

### ChooseCount（类型别名）

- 签名：`export type ChooseCount = number | [number, number];`
- 位置：../../shared/core/types/ChooseTypes.ts#L7

> 选择数量约束：精确数量 或 [最小, 最大]（负数 max = 无上限）

### SelectorType（枚举）

- 签名：`export enum SelectorType`
- 位置：../../shared/core/types/ChooseTypes.ts#L10

> 选择器类型

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `Card` | Card | 选择卡牌 |
| `Player` | Player | 选择玩家 |
| `General` | General | 选择武将牌 |
| `Option` | Option | 选择选项 |
| `Command` | Command | 选择指令 |
| `Confirm` | Confirm | 确认 |

### SelectorConfig（接口）

- 签名：`export interface SelectorConfig<T = any>`
- 位置：../../shared/core/types/ChooseTypes.ts#L26

> 选择器配置（UI 层概念）

### SelectorLifecycle（接口）

- 签名：`export interface SelectorLifecycle<T = any>`
- 位置：../../shared/core/types/ChooseTypes.ts#L46

> 选择器生命周期回调

### SelectorWindow（接口）

- 签名：`export interface SelectorWindow`
- 位置：../../shared/core/types/ChooseTypes.ts#L58

> 选择器窗口配置

### SelectorContext（接口）

- 签名：`export interface SelectorContext`
- 位置：../../shared/core/types/ChooseTypes.ts#L70

> 选择器上下文

### ChooseData（接口）

- 签名：`export interface ChooseData`
- 位置：../../shared/core/types/ChooseTypes.ts#L87

> 一次选择步骤的数据（多类型选择器可并存）

### ChooseSession（接口）

- 签名：`export interface ChooseSession`
- 位置：../../shared/core/types/ChooseTypes.ts#L93

> 选择会话

### ChooseResult（接口）

- 签名：`export interface ChooseResult`
- 位置：../../shared/core/types/ChooseTypes.ts#L130

> 选择结果

### PlayPhaseResult（枚举）

- 签名：`export enum PlayPhaseResult`
- 位置：../../shared/core/types/ChooseTypes.ts#L152

> 出牌阶段操作类型
