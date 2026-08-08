---
title: SkillBuilder
type: api
id: api/builder/SkillBuilder
tags: [API, 构建器域（builder/）]
---

# SkillBuilder（构建器域（builder/））

### SkillBuilder（接口）

- 签名：`export interface SkillBuilder`
- 位置：../../shared/core/builder/SkillBuilder.ts#L10

> SkillBuilder 实例接口——链式构建技能数据，不负责注册；name 为必传构造参数

### SkillBuilder（函数）

- 签名：`export function SkillBuilder(name: string): SkillBuilder {`
- 位置：../../shared/core/builder/SkillBuilder.ts#L42

> SkillBuilder 工厂（sgs.SkillBuilder）——无需 new

### Skill（函数）

- 签名：`export function Skill(input: Pick<SkillData, 'name'> & Partial<SkillData>): SkillData {`
- 位置：../../shared/core/builder/SkillBuilder.ts#L137

> 构建并注册技能数据（sgs.createSkill）——name 必传，内部经 SkillBuilder 复用默认值并连带注册效果；已注册则直接返回已有数据
