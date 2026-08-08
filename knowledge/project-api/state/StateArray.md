---
title: StateArray
type: api
id: api/state/StateArray
tags: [API, 状态域（state/）]
---

# StateArray（类）

- 签名：`export class StateArray<T extends Primitive> extends StateNode`
- 位置：../../shared/core/state/StateArray.ts#L9

> 数组同步容器（@syncArray 的运行时形态），元素仅限简单类型（number/string/boolean 或联合类型）。
> insert/remove/replace 产生 arr.insert / arr.remove / arr.replace 补丁。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _arr | `private _arr: T[]` |  |  |
| length | ` get length(): number` |  |  |
| at | ` at(index: number): T \| undefined` |  |  |
| toArray | ` toArray(): T[]` |  | 拷贝为普通数组 |
| snapshot | ` snapshot(): unknown[]` |  | 快照（序列化用） |
| insert | ` insert(index: number, value: T): void` |  | 在 index 处插入元素：产生 arr.insert 补丁 |
| remove | ` remove(index: number): void` |  | 移除 index 处元素：产生 arr.remove 补丁 |
| replace | ` replace(index: number, value: T): void` |  | 替换 index 处元素：产生 arr.replace 补丁 |
| push | ` push(value: T): void` |  | 尾部追加 |
| pop | ` pop(): T \| undefined` |  | 尾部弹出 |
| clear | ` clear(): void` |  | 清空全部元素 |
