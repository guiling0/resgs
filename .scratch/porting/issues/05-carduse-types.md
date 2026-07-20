# 05 — 类型预构：CardUse 类型 + sgs 注册 + EventTypes 统一

**What to build:** 定义 `CardUseData` 接口并在 `sgs` 全局挂载注册表；将 `UseCardEventData`/`UseCardToCardEventData`/`UseCardSpecialEventData` 三套独立类型收敛为统一的 `UseCardEventData` + `TargetEntry` 结构，旧类型标注 deprecated。通过 tsc 编译检查，无运行时功能变更。

**Blocked by:** None — 可立即开始

**Status:** resolved

## Answer

修改了三个文件：

### EventTypes.ts
- [x] `TargetEntry` 提取为独立接口：`index`、`target`、`subTargets`、`generator`、`invalid`、`offset`、`effectTimes`、`settleCount`（不含 `wushuang`——无双由后续裁定）
- [x] `CardUseData` 接口定义在 EventTypes.ts（因依赖 Room/Player 类型，不在 CardTypes.ts）：`name`、`cardName`、`defaultTiming`、`targetSelector`、`distanceCondition`、`effect`、`canUse`、`timesLimit`
- [x] `UseModifiers` 接口：`unlimitedTimes`、`unlimitedDistance`、`noCount`、`canUseSkill`、`subTarget`
- [x] `UseCardEventData` 统一——`targetList: TargetEntry[]` + 保留所有字段
- [x] `UseCardToCardEventData` / `UseCardSpecialEventData` 标注 `@deprecated`
- [x] `EventDataMap` 中 UseCardToCard/UseCardSpecial 映射到统一的 `UseCardEventData`
- [x] `TimingEventMap` 中全部 UseCard 时机统一映射到 `EventType.UseCard`

### sgs.ts
- [x] `sgs.carduses: Map<string, CardUseData>` 注册表

### tsconfig.json
- [x] 移除 `ignoreDeprecations: "6.0"`（项目 TS 5.1.3 不支持）
- [x] tsc --noEmit 零新错误（3 个预存错误与本次修改无关）

### 现有测试
- [x] damage.test.ts: 6/6
- [x] m1-trigger-bridge.test.ts: 6/6
- [x] choose-manager.test.ts: 14/14
