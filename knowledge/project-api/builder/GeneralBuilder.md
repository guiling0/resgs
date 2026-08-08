---
title: GeneralBuilder
type: api
id: api/builder/GeneralBuilder
tags: [API, 构建器域（builder/）]
---

# GeneralBuilder（构建器域（builder/））

### GeneralBuilder（接口）

- 签名：`export interface GeneralBuilder`
- 位置：../../shared/core/builder/GeneralBuilder.ts#L5

> GeneralBuilder 实例接口——链式构建武将数据，不负责注册；name 为必传构造参数

### GeneralBuilder（函数）

- 签名：`export function GeneralBuilder(name: string): GeneralBuilder {`
- 位置：../../shared/core/builder/GeneralBuilder.ts#L34

> GeneralBuilder 工厂（sgs.GeneralBuilder）——无需 new

### General（函数）

- 签名：`export function General(input: Pick<GeneralData, 'name'> & Partial<GeneralData>): GeneralData {`
- 位置：../../shared/core/builder/GeneralBuilder.ts#L141

> 构建并注册武将数据（sgs.createGeneral）——name 必传，内部经 GeneralBuilder 复用默认值；已注册则直接返回已有数据
