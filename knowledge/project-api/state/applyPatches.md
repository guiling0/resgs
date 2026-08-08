---
title: applyPatches
type: api
id: api/state/applyPatches
tags: [API, 状态域（state/）]
---

# applyPatches（状态域（state/））

### applyPatches（函数）

- 签名：`export function applyPatches(root: object, patches: StatePatch[]): void {`
- 位置：../../shared/core/state/applyPatches.ts#L53

> 将补丁应用到镜像端状态树（按 path 定位赋值）。
> 段0 命中实体段映射 → 集合+id 定位实体；否则视为 Room 字段。
