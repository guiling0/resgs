# M3-04 — DropCardEvent 骨架

**What to build:** `DropCardEvent` 打出牌事件类——无目标、固定时序、M4 南蛮/决斗场景激活。

**Blocked by:** None — 可立即开始（可与 M3-01 并行）

**Status:** ready-for-agent

- [x] `DropCardEvent extends EventProcess<EventType.DropCard>`：eventTriggers [Declare, Droped] + endTriggers [End]
- [x] Declare before：实体牌移入处理区
- [x] End after：虚拟牌消失
- [x] 验证：打出杀（M4 南蛮场景 mock）→ 实体牌入处理区 → 虚拟牌消失
- [x] 现有测试无回归
