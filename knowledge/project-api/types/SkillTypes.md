---
title: SkillTypes
type: api
id: api/types/SkillTypes
rules:
  - terms/card-face-terms/skill
tags: [API, 类型域（types/）]
---

# SkillTypes（类型域（types/））

### SkillId（类型别名）

- 签名：`export type SkillId = number;`
- 位置：../../shared/core/types/SkillTypes.ts#L11

> 技能 id（房间内自增）

### EffectId（类型别名）

- 签名：`export type EffectId = number;`
- 位置：../../shared/core/types/SkillTypes.ts#L13

> 效果 id（房间内自增）

### EffectType（枚举）

- 签名：`export enum EffectType`
- 位置：../../shared/core/types/SkillTypes.ts#L16

> 效果类别（触发类与状态类互斥）

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `trigger` | Trigger | 触发类效果 |
| `state` | State | 状态类效果 |

### PriorityType（枚举）

- 签名：`export enum PriorityType`
- 位置：../../shared/core/types/SkillTypes.ts#L24

> 效果优先级

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `1` | General | 武将技能 |

### SkillTag（枚举）

- 签名：`export enum SkillTag`
- 位置：../../shared/core/types/SkillTypes.ts#L36

> 技能标签

### StateEffectType（枚举）

- 签名：`export enum StateEffectType`
- 位置：../../shared/core/types/SkillTypes.ts#L97

> 状态效果类型

### TimingCallback（接口）

- 签名：`export interface TimingCallback<T extends TimingTrigger, This>`
- 位置：../../shared/core/types/SkillTypes.ts#L100

> 刷新回调（注册到时机 before/after，data 按 trigger 推断事件数据）

### AutoRemoveCallback（接口）

- 签名：`export interface AutoRemoveCallback<T extends TimingTrigger, This>`
- 位置：../../shared/core/types/SkillTypes.ts#L110

> 自动移除回调（返回 true 时移除临时效果，data 按 trigger 推断事件数据）

### SkillOptions（接口）

- 签名：`export interface SkillOptions`
- 位置：../../shared/core/types/SkillTypes.ts#L120

> 技能运行时选项

### EffectOptions（接口）

- 签名：`export interface EffectOptions`
- 位置：../../shared/core/types/SkillTypes.ts#L140

> 效果运行时选项

### SkillData（接口）

- 签名：`export interface SkillData`
- 位置：../../shared/core/types/SkillTypes.ts#L154
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 技能定义数据（注册到 sgs.skills，技能全名即 id）
> @rules terms/card-face-terms/skill
> @description 技能是角色于游戏规则和用语操作规范外拥有的能力或能进行的操作，包括武将技能和装备技能

### EffectSettings（接口）

- 签名：`export interface EffectSettings`
- 位置：../../shared/core/types/SkillTypes.ts#L182

> 效果设置

### EffectContext（接口）

- 签名：`export interface EffectContext`
- 位置：../../shared/core/types/SkillTypes.ts#L212

> 技能发动上下文

### TriggerEffectData（接口）

- 签名：`export interface TriggerEffectData<T extends TimingTrigger = TimingTrigger>`
- 位置：../../shared/core/types/SkillTypes.ts#L225

> 触发类效果数据（data 按 T 推断事件数据）

### StateEffectData（接口）

- 签名：`export interface StateEffectData extends Partial<StateCallbackMap>`
- 位置：../../shared/core/types/SkillTypes.ts#L262

> 状态类效果数据（状态回调直接继承）

### EffectData（接口）

- 签名：`export interface EffectData`
- 位置：../../shared/core/types/SkillTypes.ts#L269
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 效果定义数据（注册到 sgs.effects）
> @rules terms/card-face-terms/skill
> @description 效果是技能的具体实现载体，按类别分为触发类效果与状态类效果

### StateCallbackMap（接口）

- 签名：`export interface StateCallbackMap`
- 位置：../../shared/core/types/SkillTypes.ts#L292

> 状态回调签名映射
