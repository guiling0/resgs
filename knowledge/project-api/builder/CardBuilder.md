---
title: CardBuilder
type: api
id: api/builder/CardBuilder
tags: [API, 构建器域（builder/）]
---

# CardBuilder（构建器域（builder/））

### CardBuilder（接口）

- 签名：`export interface CardBuilder`
- 位置：../../shared/core/builder/CardBuilder.ts#L6

> CardBuilder 实例接口——链式构建实体牌数据，不负责注册

### CardBuilder（函数）

- 签名：`export function CardBuilder(name: string): CardBuilder {`
- 位置：../../shared/core/builder/CardBuilder.ts#L23

> CardBuilder 工厂（sgs.CardBuilder）——无需 new

### Card（函数）

- 签名：`export function Card(input: Partial<GameCardData> = {}): GameCardData {`
- 位置：../../shared/core/builder/CardBuilder.ts#L83

> 全可选字段构建实体牌数据（sgs.createCard）——内部经 CardBuilder 复用默认值与派生逻辑
