---
title: ModeBuilder
type: api
id: api/builder/ModeBuilder
tags: [API, 构建器域（builder/）]
---

# ModeBuilder（构建器域（builder/））

### ModeBuilder（接口）

- 签名：`export interface ModeBuilder`
- 位置：../../shared/core/builder/ModeBuilder.ts#L6

> ModeBuilder 实例接口——链式构建游戏模式数据，不负责注册；name 为必传构造参数

### ModeBuilder（函数）

- 签名：`export function ModeBuilder(name: string): ModeBuilder {`
- 位置：../../shared/core/builder/ModeBuilder.ts#L27

> ModeBuilder 工厂（sgs.ModeBuilder）——无需 new

### Mode（函数）

- 签名：`export function Mode(input: Pick<GameModeData, 'name'> & Partial<GameModeData>): GameModeData {`
- 位置：../../shared/core/builder/ModeBuilder.ts#L103

> 构建并注册模式数据（sgs.createMode）——name 必传，内部经 ModeBuilder 复用默认值；已注册则直接返回已有数据
