---
title: StateMap
type: api
id: api/state/StateMap
tags: [API, 状态域（state/）]
---

# StateMap（类）

- 签名：`export class StateMap<K extends string, V> extends StateNode`
- 位置：../../shared/core/state/StateMap.ts#L8

> key-value 同步容器（@syncMap 的运行时形态）。
> set/delete/clear 产生 map.add / map.remove 补丁；值为同步节点时自动挂载（注入宿主与 path）。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| size | ` get size(): number` |  |  |
| has | ` has(key: K): boolean` |  |  |
| get | ` get(key: K): V \| undefined` |  |  |
| keys | ` keys(): IterableIterator<K>` |  |  |
| values | ` values(): IterableIterator<V>` |  |  |
| entries | ` entries(): IterableIterator<[K, V]>` |  |  |
| forEach | ` forEach(fn: (value: V, key: K): void` |  |  |
| snapshot | ` snapshot(): Record<string, unknown>` |  | 快照（序列化用） |
| set | ` set(key: K, value: V): this` |  | 设置条目：同步节点自动挂载；产生 map.add 补丁 |
| delete | ` delete(key: K): boolean` |  | 删除条目：产生 map.remove 补丁 |
| clear | ` clear(): void` |  | 清空全部条目 |
