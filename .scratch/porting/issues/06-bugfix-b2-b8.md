# 06 — Bug 修复：B2/B3/B5/B6/B8

**What to build:** 修复 4 个与 UseCard/Damage 链路相关的 Bug（B2 确认无问题），每个有独立测试验证。

**Blocked by:** None — 可立即开始（与 05 并行）

**Status:** resolved

## Answer

### B2: skipPhase 误杀 — 不是 Bug
当前 `skipPhase` 只跳过 `_generatePhases` 中尚未开始的阶段，不误杀正在执行的阶段。符合规则。

### B3: drawCount 归零锁死 ✅
- [x] `PhaseEvent` 新增 `_drawCountLocked: boolean` 标志
- [x] `set drawCount()` 被锁定后忽略修改
- [x] 新增 `zeroDrawCount()` 方法：`drawCount=0` + 锁定（供 draw_start1 类效果调用）

修改文件: [TurnEvent.ts:328-340](shared/core/event/TurnEvent.ts)

### B5: getLoseByReason / getObtainByReason ✅
- [x] `getLoseByReason`：原区域是 A 的手牌/装备区 + 目标区域不是 A 的手牌/装备区 = 失去
- [x] `getObtainByReason`：原区域不是 A 的手牌区 + 目标区域是 A 的手牌区 = 获得

修改文件: [MoveCardEvent.ts:531-582](shared/core/event/MoveCardEvent.ts)

### B6: 处理区清理走 MoveCardEvent ✅
- [x] `_processingCards` 从 `GameCard[]` 改为 `{card, reason}[]`
- [x] `_trackProcessingCard` 新增 `reason` 参数
- [x] `MoveCardEvent` 传 `data.reason` 给 `_trackProcessingCard`
- [x] `processCompleted` 按原因分组 → `room.event.moveCards()` 创建 MoveCardEvent

修改文件: [EventProcess.ts:52-58,270-288](shared/core/event/EventProcess.ts), [MoveCardEvent.ts:141-143](shared/core/event/MoveCardEvent.ts)

### B8: 扣血时机 ✅
- [x] `_onReduceHpAfter` 从 `ReduceHpAfter` 的 `after` 移到 `before`
- [x] 技能在 ReduceHpAfter 时机读到的是扣血后的 HP

修改文件: [DamageEvent.ts:393-395](shared/core/event/DamageEvent.ts)

### 测试
- [x] damage.test.ts: 6/6
- [x] m1-trigger-bridge.test.ts: 6/6
- [x] move-card.test.ts: 18/18
- [x] turn-event.test.ts: 6/6
- [x] hp-event.test.ts: 6/6
- [x] dying-death.test.ts: 6/6
- [x] game-flow.test.ts: 7/7
- [x] judge.test.ts: 7/7
