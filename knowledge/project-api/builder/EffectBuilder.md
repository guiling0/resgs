---
title: EffectBuilder
type: api
id: api/builder/EffectBuilder
tags: [API, 构建器域（builder/）]
---

# EffectBuilder（构建器域（builder/））

### EffectBuilder（接口）

- 签名：`export interface EffectBuilder<T extends TimingTrigger = TimingTrigger>`
- 位置：../../shared/core/builder/EffectBuilder.ts#L19

> EffectBuilder 实例接口——链式构建效果数据，不负责注册；name 为必传构造参数

### EffectBuilder（函数）

- 签名：`export function EffectBuilder<T extends TimingTrigger = TimingTrigger>(name: string): EffectBuilder<T> {`
- 位置：../../shared/core/builder/EffectBuilder.ts#L59

> EffectBuilder 工厂（sgs.EffectBuilder）——无需 new

### Effect（函数）

- 签名：`export function Effect(input: Pick<EffectData, 'name'> & Partial<EffectData>): EffectData {`
- 位置：../../shared/core/builder/EffectBuilder.ts#L218

> 构建并注册效果数据（sgs.createEffect）——name 必传，内部经 EffectBuilder 复用默认值；已注册则直接返回已有数据
