# 02 — fix: 无消耗技能恒不发动 (B4)

**What to build:** 修复 `UseSkillEvent.exec()` 中无消耗技能（`EffectData.cost` 未定义）被误判为"未发动"的问题。按照 skill.md 定义：无消耗技能在声明+选目标后即视为发动。

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `UseSkillEvent.exec()` 执行流程分叉：有 `cost` 回调 → 现有逻辑；无 `cost` 回调 → `choose` 返回真值即视为发动
- [ ] 无消耗技能：`choose` 返回真值 → `used=true` → 执行 `effect` → 触发 `Effect` 时机
- [ ] 无消耗技能：`choose` 返回 falsy → 不发动，正常 finalize
- [ ] `shared/test/` 新增测试：注册无消耗技能 → 确认发动 → 效果执行；拒绝发动 → 效果不执行
