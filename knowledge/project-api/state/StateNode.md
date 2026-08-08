---
title: StateNode
type: api
id: api/state/StateNode
tags: [API, 状态域（state/）]
---

# StateNode（类）

- 签名：`export class StateNode`
- 位置：../../shared/core/state/StateNode.ts#L4

> 同步节点基类（挂载后注入宿主 `_store` 与自身完整 path `_path`）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _store | `_store?: StateStoreHost` |  | 宿主状态存储（挂载后注入；未挂载为 undefined） |
| _path | `_path: string \| undefined` |  | 自身完整 path（挂载后注入；未挂载为 undefined） |
