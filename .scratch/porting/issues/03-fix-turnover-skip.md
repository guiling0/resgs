# 03 — fix: 翻面永久跳过回合 (B1)

**What to build:** 修复 `TurnEvent` 中翻面角色跳过回合后 `skip` 状态未重置的问题——跳过当前回合后应翻回正面，否则角色永久跳过所有后续回合。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `TurnEvent` 跳过回合流程：检测 `skip=true` → 跳过当前回合时机 → 执行 `player.skip = false`（翻回正面）
- [x] 跳过回合后正确进入下一回合的"回合开始后❶"
- [x] `shared/test/turn-event.test.ts` 新增测试：翻面角色跳过一回合 → 下回合正常进行
