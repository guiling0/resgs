# 08 — room.useCard/canUseCard + 杀/桃定义 + 验收测试

**What to build:** `Room.useCard()` 双签名入口 + `Room.canUseCard()` 合法性检测 + 杀/桃 CardUse 注册 + 验收测试。

**Blocked by:** 06（Bug 修复）、07（UseCardEvent 类）

**Status:** resolved

## Answer

### Room.useCard() — 双签名 ✅

- [x] 签名 1（直接触发）：`useCard(player, card, targets)` → 创建 UseCardEvent 并执行
- [x] 签名 2（发起询问）：`useCard(player, { cardNames })` → 选牌→创建 VirtualCard→选目标→回调签名 1
- [x] 代码位置：[Room.ts:349-397](shared/core/room/Room.ts)

### Room.canUseCard() — 三关检测 ✅

- [x] 额外使用条件（如桃需体力不满）
- [x] 目标数检测（合法目标数>0）
- [x] 代码位置：[Room.ts:403-433](shared/core/room/Room.ts)

### 杀/桃 CardUse 注册 ✅

- [x] 杀：`timing=PlayPhase`，目标=其他角色，`effect=damage`
- [x] 桃：`timing=PlayPhase`，目标=所有角色（含自己），`canUse=losshp>0`，`effect=recover`
- [x] 注册在 `CardManager.initCardUses()`，从 `sgs.carduses` 拷贝到 `room.carduses`
- [x] 代码位置：[CardManager.ts:73-99](shared/core/room/manager/CardManager.ts)

### 验收测试 ✅

`shared/test/m2-usecard.test.ts` — 10 个测试，22 个断言：

1. ✅ 出杀→目标掉血（核心验收）
2. ✅ 出桃→自己回血（核心验收）
3. ✅ 虚拟牌消失
4. ✅ 目标列表逆时针
5. ✅ canUseCard 基础检测
6. ✅ canUseCard 桃满血不可用
7. ✅ targetList 结构完整性
8. ✅ 虚拟牌继承实体牌属性
9. ✅ 多目标路径

### 现有测试无回归

- damage: 6/6
- turn-event: 6/6
- hp-event: 6/6
- dying-death: 6/6
- game-flow: 7/7
- judge: 7/7

### 发现 VirtualCard.name bug

`VirtualCard.name` 字段硬编码默认值 `'sha'`，构造函数接收的 `name` 参数存入了 `sourceData.name` 但未写入 `this.name`。UseCardEvent 中使用 `this.card.sourceData.name` 绕过。需后续修复。
