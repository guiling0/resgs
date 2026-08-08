---
title: Random
type: api
id: api/utils/Random
tags: [API, 工具域（utils/）]
---

# Random（工具域（utils/））

### createRandom（函数）

- 签名：`export function createRandom(seed: number): () => number {`
- 位置：../../shared/core/utils/Random.ts#L5

> 确定性伪随机数生成器（mulberry32）。
> 相同种子产生相同序列，用于对局随机可复现。

### shuffle（函数）

- 签名：`export function shuffle<T>(arr: T[], seed?: number): T[] {`
- 位置：../../shared/core/utils/Random.ts#L17

> 洗牌（改变原数组）；提供 seed 时使用确定性伪随机，否则 Math.random

### randomInt（函数）

- 签名：`export function randomInt(min: number, max: number, seed?: number): number {`
- 位置：../../shared/core/utils/Random.ts#L27

> 生成 [min, max] 区间内的随机整数；提供 seed 时使用确定性伪随机，否则 Math.random
