# 01 — prefactor: maxTimes 字段抽离

**What to build:** 将 `maxTimes` 从 `context()` 回调的返回值中抽离为 `EffectData` 的直接字段，消除扫描期为读 maxTimes 而调用 `context()` 的副作用风险。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `EffectData` 接口新增 `maxTimes?: number` 字段（默认 1，-1 表示无限制）
- [x] `EffectBuilder` 新增 `.maxTimes(n: number)` 方法
- [x] `EventManager.trigger()` 扫描阶段：`max` 取值改为 `e._jsonData.maxTimes ?? 1`，不再调用 `context()` 回调
- [x] `context()` 回调调用时机延迟到 askForSkillInvoke 阶段（由 04 工单消费）
- [x] 现有 87 个测试全部通过（行为不变）
