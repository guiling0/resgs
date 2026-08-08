---
title: StateStore
type: api
id: api/state/StateStore
tags: [API, 状态域（state/）]
---

# StateStore（类）

- 签名：`export class StateStore implements StateStoreHost`
- 位置：../../shared/core/state/StateStore.ts#L11

> 状态存储：节点挂载与补丁收集。
> 由 Room 持有（`room.store`），节点挂载后 `_store` 指向本实例。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _pending | `private _pending: StatePatch[]` |  |  |
| logger | `private readonly logger: ILogger` |  |  |
| constructor | ` constructor(logger: ILogger = consoleLogger): void` |  |  |
| attach | ` attach(node: StateNode, path: string): void` |  | 挂载节点：注入宿主与 path，递归挂载已有容器字段 |
| markDirty | ` markDirty(patch: StatePatch): void` |  | 收集脏补丁 |
| flush | ` flush(): StatePatch[]` |  | 产出并清空待发补丁（无变化返回空数组） |
