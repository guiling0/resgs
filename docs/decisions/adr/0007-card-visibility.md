# 0007-卡牌可见性（记录层 + 效果层）

> 状态：已定案 · 日期：2026-08-08

## 背景

对局中一张牌对某玩家是否可见，决定其能否被查看/选择。规则上"正面朝上的牌对所有玩家可见"，其余情况（扣置但指定可见、特定角色可见）需单独建模。旧项目为四层判断 + 两种同步方式，均需迁移到新项目的同步字段体系。

旧项目实现：

1. **查询点** `GameCard.canVisible(player)`：`put === Up`（正面朝上）→ 区域 `visibles` → `player.canVisibleCard[reason]` 记录 → `getStates(FieldCardEyes)` 状态效果。
2. **记录层** `player.canVisibleCard: { [reason]: GameCard[] }`，经 `setCardVisible(cards, view, reason)` 维护，增量同步用 `propertyChanges`（`card_visible` / `card_invisible`），客户端收到后复刻 `setCardVisible` 双向维护。
3. **效果层** `FieldCardEyes` 状态效果（如木牛流马"辎"对你可见），随 `MsgAddEffect` / `MsgRemoveEffect` 同步挂载，定义在 sgs 两端注册，客户端本地实时执行 `getStates` 判断。

新项目现状：`GameCard.put` 已为 `@sync` 字段；`Area` 无 `visibles`；`StateEffect` 仅有索引登记，缺生命周期；`Player` 无可见性数据。

## 结论

### 1. 查询点（三层，对齐旧项目，去掉 Area.visibles）

```ts
// GameCard
canVisible(player: Player): boolean {
    if (this.put) return true;    // ① 正面朝上全可见
    if (player.isVisible(this)) return true;   // ② 记录层
    return this.room.getStates(FieldCardEyes, [player, this]).some(Boolean); // ③ 效果层
}
```

### 2. 记录层：Player 同步字段（替代旧项目 canVisibleCard + propertyChanges）

```ts
// Player
/** 对本人可见的牌：reason → 牌 id 列表（记录层，注册式） */
@sync() visibleCardIds: { [reason: string]: GameCardId[] } = {};

setCardVisible(cards: GameCard[], view = true, reason = 'default') {
    // 语义与旧项目一致：view=true push 去重；view=false 移除，空则删键
}
```

**同步差异是关键**：旧项目靠 `propertyChanges` + 客户端复刻 `setCardVisible` 双向维护；新项目 `@sync` 字段由 StateStore 自动打补丁——**服务器改数据即同步，客户端只读，无需复刻维护逻辑**。单场对局可见性记录量小（辎、观星等），整对象同步无性能问题。

旧项目 `area.visibles`（区域可见）**并入记录层**：移动牌时指定 `cardVisibles` 直接调目标玩家 `setCardVisible`，`Area` 不单独维护可见性。

### 3. 效果层：FieldCardEyes（延续 getStates）

- `StateEffectType` 枚举补 `FieldCardEyes`（回调签名 `(player, card) => boolean`）。
- 状态效果挂载/移除生命周期 + 同步消息补齐后，定义在 sgs 两端注册、挂载消息同步实例 → 客户端本地持有挂载列表，直接执行 `getStates(FieldCardEyes)`，结果与服务器一致。

### 4. 同步完整链

| 层级 | 数据 | 同步 |
|---|---|---|
| ① 正面朝上 | `card.put`（已有 @sync） | 自动补丁 |
| ② 记录层 | `player.visibleCardIds`（新增 @sync） | 自动补丁 |
| ③ 效果层 | 状态效果挂载消息 + sgs 定义 | 挂载同步 + 两端同构 |

客户端本地数据即可算出 `canVisible(me)`，与旧项目"客户端也能判断"的目标一致。

## 关联

- 0006 状态效果求值框架（FieldCardEyes 查询点依赖 getStates 与求值栈防环）
- R1 区域管理（移动牌时的 cardVisibles 参数）
- 木牛流马：FieldCardEyes 回调 `this.isOwner(from) && card.hasMark('%zi')`
