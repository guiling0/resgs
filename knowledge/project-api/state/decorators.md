---
title: decorators
type: api
id: api/state/decorators
tags: [API, 状态域（state/）]
---

# decorators（状态域（state/））

### sync（函数）

- 签名：`export function sync(): PropertyDecorator {`
- 位置：../../shared/core/state/decorators.ts#L24

> @sync 简单字段（number/string/boolean）；挂载后赋值产生 set 补丁

### syncMap（函数）

- 签名：`export function syncMap(segment?: string): PropertyDecorator {`
- 位置：../../shared/core/state/decorators.ts#L81

> @syncMap key-value 容器。
> @param segment path 段名（默认字段名；实体集合可自定义，如玩家集合段为 `player`）

### syncArray（函数）

- 签名：`export function syncArray(segment?: string): PropertyDecorator {`
- 位置：../../shared/core/state/decorators.ts#L89

> @syncArray 数组容器（元素仅限简单类型）。
> @param segment path 段名（默认字段名）
