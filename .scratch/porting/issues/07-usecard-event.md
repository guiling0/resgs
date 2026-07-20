# 07 — UseCardEvent 完整类 + targetList 结构

**What to build:** 创建统一的 `UseCardEvent` 类——`_buildTriggers()` 按卡牌类型构建完整的 17 时机序列（含逐目标展开的 assign/become/assign_after/become_after + 循环 A→B 的 effect_start→effect_before→effect→effect_after）。targetList 完整字段与方法一次到位。实体牌路径走通（手牌→处理区→弃牌堆），虚拟牌生命周期正确。

**Blocked by:** 05（CardUse 类型 + EventTypes 统一）

**Status:** resolved

## Answer

新增文件: [shared/core/event/UseCardEvent.ts](shared/core/event/UseCardEvent.ts)

### 类结构

```
UseCardEvent extends EventProcess<EventType.UseCard>
  ├── constructor: 默认值填充 + _buildTriggers()
  ├── 便利访问器: player, card, targets, targetList, currentTarget
  ├── _buildTriggers(): 按 card.type 分支
  │     ├── 基本牌/普通锦囊 → _buildBasicTriggers()（全套 17 时机）
  │     └── 装备/延时锦囊 → 骨架预留（M4 实现）
  ├── _buildBasicTriggers():
  │     ├── eventTriggers: Declare → DeclareAfter → ChooseTarget → Used
  │     │   → _buildTargetTimings()（逐目标 assign/become/assign_after/become_after）
  │     │   → Ready → _buildSettleTimings()（逐目标 EffectStart → EffectBefore → [Offset] → Effect → EffectAfter）
  │     └── endTriggers: End1 → End2 → End3
  ├── init(): 首次创建 TargetEntry → _sortTargets()
  └── targetList 管理:
        ├── _sortTargets(): 按座位排序（顺时针=降序），同玩家按 index
        ├── changeTarget(): 转移目标 + 重排序
        ├── cancelTarget(): 移出目标列表
        ├── markInvalid(): 标记无效
        └── offsetTarget(): 标记被抵消（M3 接线）
```

### 关键设计

- [x] `index` 是自增 ID，排序时不更新（不在 `_reindexTargets`）
- [x] 排序规则：主键=玩家座位（逆时针 1→2→3，顺时针反向），次键=index
- [x] `clockwise` 默认 `true`
- [x] `UseCardOffset` 条件生成：仅 `entry.offset` 存在时插入（M2 始终 undefined）
- [x] 固定操作注册为 timing before/after 回调（不在 exec 主循环中硬编码）
- [x] 实体牌路径：`_onUseCardDeclare` before → MoveCardEvent(hand→processing, reason='use')
- [x] 虚拟牌消失：`_onUseCardEnd3` after → `room.vcard.destroy(card)`
- [x] 牌面效果执行：`_onEffectAfter` after → 查 `room.carduses.get(card.name)` → 调 `effect()`

### Room.ts

- [x] 新增 `carduses: Map<string, CardUseData>` 字段

### 编译与测试

- [x] tsc 零新错误
- [x] damage.test.ts: 6/6
- [x] m1-trigger-bridge.test.ts: 6/6
