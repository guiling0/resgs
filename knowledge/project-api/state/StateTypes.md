---
title: StateTypes
type: api
id: api/state/StateTypes
tags: [API, 状态域（state/）]
---

# StateTypes（状态域（state/））

### Primitive（类型别名）

- 签名：`export type Primitive = number | string | boolean;`
- 位置：../../shared/core/state/StateTypes.ts#L9

> 简单值：number / string / boolean

### SyncValue（类型别名）

- 签名：`export type SyncValue = Primitive | null | SyncValue[] | { [key: string]: SyncValue };`
- 位置：../../shared/core/state/StateTypes.ts#L12

> 可同步值（可 JSON 序列化）

### StatePatch（类型别名）

- 签名：`export type StatePatch =`
- 位置：../../shared/core/state/StateTypes.ts#L15

> 状态变更补丁（六种）

### SyncFieldMeta（接口）

- 签名：`export interface SyncFieldMeta`
- 位置：../../shared/core/state/StateTypes.ts#L24

> 同步字段元信息（装饰器挂载到原型）

### StateStoreHost（接口）

- 签名：`export interface StateStoreHost`
- 位置：../../shared/core/state/StateTypes.ts#L32

> 状态存储宿主接口

### joinPath（函数）

- 签名：`export function joinPath(base: string | undefined, seg: string): string {`
- 位置：../../shared/core/state/StateTypes.ts#L40

> 拼接 path 段（根 path 为空时直接返回段名）

### isSyncNode（函数）

- 签名：`export function isSyncNode(v: unknown): boolean {`
- 位置：../../shared/core/state/StateTypes.ts#L45

> 节点标记：可挂载/可同步

### collectSyncMeta（函数）

- 签名：`export function collectSyncMeta(instance: unknown): SyncFieldMeta[] {`
- 位置：../../shared/core/state/StateTypes.ts#L50

> 收集原型链上的同步字段元信息

### toSyncValue（函数）

- 签名：`export function toSyncValue(v: unknown): SyncValue {`
- 位置：../../shared/core/state/StateTypes.ts#L62

> 节点 → 可同步值（快照；容器走 snapshot()，实体走同步字段）
