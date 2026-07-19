# 02 — fix: 无消耗技能恒不发动 (B4)

**What to build:** UseSkillEvent 中 `choose` 和 `cost` 回调未提供时默认返回 `true`，使无消耗技能（如旧项目转化技）可正确走完发动流程。

> 旧项目的无消耗技能利用"不提供 cost 默认 true → 直接执行 effect"的模式工作，新项目沿用此设计——不需要修改 UseSkillEvent 的执行逻辑，只需要补默认值。

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent → **resolved**（通过 `choose`/`cost` 默认 `true` 解决）

## Answer

修改了三处：
1. `EffectContext.cost` 类型从 `Record<string, any[]>` 改为 `any`（与 `cost()` 返回值一致）
2. `UseSkillEvent.exec()` 中无 `choose` 回调时 `ctx.choose` 默认 `true`
3. `UseSkillEvent.exec()` 中无 `cost` 回调时 `costResult` 默认 `true`（无需 `if (!costResult)` 检查）

- [x] 无 `choose` 回调 → 默认 `true`，传入 `ctx.choose`
- [x] 无 `cost` 回调 → 默认 `true`，跳过 `if (!costResult)` 检查 → `used=true` → 执行 `effect`
- [x] 有 `cost` 回调且返回 falsy → 正常终止，不发动
- [x] `EffectContext.cost` 类型改为 `any`
- [x] 删除 `Effect.inTrigger()`（房间注册时已按时机分类，不再需要）
- [x] 现有测试全部通过
