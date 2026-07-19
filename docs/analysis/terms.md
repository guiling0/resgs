# 用语实现与 Room 操作对比分析

> 依据权威文档：`docs/terms/cards.md`、`card-operations.md`、`description.md`、`event-resolution.md`。
> 旧代码引用自 `old/resgsv1` 仓库 HEAD（路径省略前缀 `server/src/`）。

---

## 第一部分：操作用语 → 旧 extensions 技能实现实例

| 用语 | 权威定义要点 | 旧技能实例 | 旧实现文件 | 核心 API |
|---|---|---|---|---|
| 弃置 | 将一名角色区域里的牌移至弃牌堆；A 弃置 B 的牌 = A 选牌执行 | 〖挑衅〗 | `extensions/shenhua/generals/shan/jiangwei.ts` | `room.dropCards({player, cards})` |
| 获得 | 将牌移至其手牌区的操作；"得到"是结果 | 〖突袭〗 | `extensions/standard/generals/wei/zhangliao.ts` | `room.obtainCards({player, cards})` |
| 交给 | A 将牌移至 B 的手牌区；牌不能是 B 拥有的 | 〖仁德〗 | `extensions/standard/generals/shu/liubei.ts` | `room.giveCards({from, to, cards})` |
| 展示 | 翻至正面朝上再翻回；牌不移动 | 【火攻】 | `extensions/standard/cards/scroll/huogong.ts` | `room.showCards({player, cards})` |
| 交换 | 先同时置入处理区，再同时置入目标区域 | 〖缔盟〗 | `extensions/shenhua/generals/lin/lusu.ts` | `room.swapCards({player, cards1, toArea1, cards2, toArea2})` |
| 摸牌 | 获得牌堆顶的 X 张牌 | 〖英姿〗 | `extensions/standard/generals/wu/zhouyu.ts` | `data.ratedDrawnum++`（额定摸牌数）/ `room.drawCards({player, count})` |
| 视为 | 信息以 B 为准；"视为使用"= 使用无对应实体牌的牌 | 〖武圣〗 | `extensions/standard/generals/shu/guanyu.ts` | `room.createVirtualCardByNone('sha')` + `addSubCard` |
| 转移（目标） | 取消原目标 + 生成新目标 + 重排序 | 〖流离〗 | `extensions/standard/generals/wu/daqiao.ts` | `data.transferCurrent(target)` |
| 转移（伤害）/防止 | 先防止 A 的伤害，再对 B 造成同来源/渠道/属性伤害 | 〖天香〗 | `extensions/shenhua/generals/feng/xiaoqiao.ts` | `data.transfer(target)`（内部先 `prevent()`） |
| 无效 | 对目标无效 = 吃掉四个生效时机，结算照常收尾 | 【仁王盾】 | `extensions/standard/cards/equip/renwangdun.ts` | `data.invalidCurrent()` |
| 取消 | 移出目标列表并终止当前时机 | 〖千幻〗 | `extensions/wars/generals/power/yuji.ts` | `data.cancleCurrent()` |
| 无视 | 仅在来源的结算过程中防具技能无效 | 【青釭剑】 | `extensions/standard/cards/equip/qinggangjian.ts` | `StateEffectType.Skill_Invalidity` + mark |

### 各实例代码要点

**弃置——〖挑衅〗**（目标不使用【杀】则姜维弃置其一张牌）：选牌器 `room.createDropCards(from, { selectable: target.getSelfCards() })` 由姜维（from）从目标的牌中选择，再执行 `room.dropCards({ player: from, cards, source: data, reason: this.name })`。与 card-operations.md"◆ 谁选牌：A 弃置 B 的牌 = A 执行弃置（A 选牌）"一致：`dropCards.player` 是执行弃置的角色，而非牌的拥有者。

**获得——〖突袭〗**（放弃摸牌，获得至多两名角色各一张手牌）：cost 中 `await data.end()` 结束摸牌阶段额定摸牌，effect 中逐目标 `room.obtainCards({ player: from, cards })`。牌来自他人手牌区 → 移至自己手牌区，即"获得"操作；目标"因其他角色弃置/获得而失去牌"可触发响应。

**交给——〖仁德〗**：cost 执行 `room.giveCards({ from, to: target, cards })`；effect 用 `give.getMoveCount()` 累计本回合给出数，跨过 2 张时 `room.recoverhp`。对应文档区分：交给是操作，对方"因交给而**得到**"（结果）——计数基于移动事件的实际结果数。

**展示——【火攻】**：目标选一张手牌后 `room.showCards({ player: current.target, cards: show_result })`，牌不移动；随后使用者依据展示牌的花色弃置同花色手牌（`room.dropCards`）并 `room.damage({ damageType: DamageType.Fire, channel: card, isChain: false })`。注意 card-operations.md"◆ 执行展示效果须同时记录此牌的牌面信息"——旧实现直接用 `show_result.map(v => v.suit)` 现场取值，未做"记录"快照（新项目映射表也标注该规则未实现）。

**交换——〖缔盟〗**：`room.swapCards({ player, cards1: tar1.getHandCards(), toArea1: tar2.handArea, cards2: tar2.getHandCards(), toArea2: tar1.handArea })`。两叠牌先入处理区再互换，处理区的牌不属于任何角色（不构成"交给/得到"），符合文档对交换不触发〖恩怨①〗的说明。

**摸牌——〖英姿〗**：摸牌阶段 `data.ratedDrawnum++`，走额定摸牌数通道（对应 description.md"额定摸牌数"）；直接摸牌的例子见〖天香〗effect 中 `room.drawCards({ player: target, count: target.losshp })`。

**视为——〖武圣〗**：在 `NeedUseCard3` / `NeedPlayCard3` 时机（"需要使用/打出牌时❸"，即**转化**）创建虚拟【杀】：`room.createVirtualCardByNone('sha')`，选中红色牌时 `sha.addSubCard(item)` 链接实体牌。对应 cards.md 虚拟牌定义："使用和打出的都是虚拟牌"，红色实体牌只是 subcards。

**转移（目标）——〖流离〗**：`BecomeTarget`（成为目标时）时机，弃一张牌为消耗，effect 中 `await data.transferCurrent(targets.at(0))`。新目标合法性在选择器 filter 中用 `targets[0].canUseCard(sha, [item], ..., { excluesCardTimesLimit, excluesCardDistanceLimit })` 检测。

**转移（伤害）+ 防止——〖天香〗**：`InflictDamage3`（受到伤害时）时机弃红桃手牌，effect 中 `await data.transfer(target)`。旧 `event/types/event.damage.ts:116-119` 的 `transfer` 实现为先 `await this.prevent()` 再造成新伤害——与 description.md"伤害转移 = 先防止 A 受到的伤害，然后对 B 造成同来源、同渠道、同属性的伤害"一致。`prevent`/`transfer` 均受 `preventTriggers` 白名单（event.damage.ts:11）限制，仅特定时机可调用。

**无效——【仁王盾】**：`CardEffectStart` 时机检测黑色【杀】且自己是当前目标，`await data.invalidCurrent()`。对应 event-resolution.md：对目标无效仅吃掉"使用结算开始时/生效前/生效时/生效后"四个时机，使用流程收尾照常。

**取消——〖千幻〗**：`BecomeTarget` 时机，将一张"幻"置入弃牌堆（`room.puto({ toArea: room.discardArea })`）为消耗，effect 中 `await data.cancleCurrent()`。对应文档：取消 = 将目标移出目标列表并终止此时机（之后所有该目标时机都被吃掉，区别于"无效"）。

**无视——【青釭剑】**：`AssignTargeted` 时机对目标 `setMark('qinggangjian_invalidity', true)`，配套 `StateEffect` 以 `Skill_Invalidity` 使"attached_equip 为防具（`CardSubType.Armor`）且拥有者带 mark"的技能失效，并在 5 个 lifecycle 时机（生效前被无效结束/被【闪】抵消/确定伤害值/防止伤害/使用事件结束）清除 mark。按 event-resolution.md 注，青釭剑属于"令无效"（所有人眼中无效），该实现语义正确；但真正按观察者失效的"无视"（〖陷阵〗型，仅在来源眼中无效）旧机制无法表达——`Skill_Invalidity` 是全局失效，新项目需补**来源作用域**的失效机制（映射表已标注未实现）。

---

## 第二部分：旧 room.handle.ts 与新 Room.ts 操作入口对比

旧入口：`core/room/mixins/room.handle.ts`（委托 `core/event/types/event.move.ts` 各 `XxxData.exec`）。
新入口：`shared/core/room/Room.ts` 快捷方法（委托 `shared/core/room/manager/EventManager.ts`）。

### discard（弃牌）

**旧问题**：`DropCardsData.check()`（event.move.ts:648 起）的禁止弃置过滤存在真实 bug——filter 回调参数 `v` 未被使用，检测的永远是第一张牌：

```ts
this.cards = this.cards.filter((v) => {
    return !this.room
        .getStates(StateEffectType.Prohibit_DropCards, [
            this.player,
            this.cards.at(0),   // ← 应为 v
            this.reason,
        ])
        .some((i) => i);
});
```

**新方案**：新 `Room.discard(player, cards)` 目前无任何禁止检测，直接 `moveCards(reason: 'discard')`。按 card-operations.md 弃置条目："A 不能弃置 B 的……牌 = A **选择时**不能选 B 的……牌"——禁止弃置应实现为**选择端**的逐张过滤（选择器 filter 按单张牌判定，天然避免旧的 `at(0)` 错误）；"弃置 X 张/所有"的通用缩减规则（min{能弃的牌数, X}）同样落在选择端的 count 计算。执行端 `discard` 保持薄封装即可。

### draw（摸牌）

**旧问题**：`DrawCardsData.exec`（event.move.ts:586）先取牌后检查：

```ts
const cards = await room.getNCards(draw.count, draw.drawPos);
if (draw.check()) { ... }
```

`check()`（要求 `player.alive && count > 0`）失败时已经执行过 `getNCards`，可能触发洗牌副作用。

**新方案**：新 `Room.draw` 无 alive/count 前置检查（Room.ts:408-426）。应把旧 `check` 的意图前移：先检测 `player.alive && count > 0` 再 `getNCards`。规则依据：摸牌 = "获得**牌堆顶**的 X 张牌"（card-operations.md），获得的执行者必须存活；牌不足时先洗牌（"洗牌"条目：弃牌堆置入牌堆后洗混）已由 `getNCards → shuffleDiscardToDraw` 覆盖。

### obtain（获得）

**旧**：`ObtainCardsData.check()` 过滤 `v.area !== this.player.handArea` 并检测死亡——符合"移至一个区域：此牌移动前必须不在该区域内"（card-operations.md）。

**新**：`Room.obtain` 逻辑一致（`alive` + `c.area !== toArea` 过滤），已对齐。**差距**：两版均未实现"得到牌后须将所有手牌洗混；若在使用结算中得到且后续效果须对其中至少一张操作，则洗混除这些牌外的手牌"（card-operations.md 获得条目）。新项目实现洗混时应挂在 MoveCardEvent 的得到结果（`getObtainDatas`）之后。

### give（交给）

**旧问题**：`GiveCardsData.check()`（event.move.ts:940 附近）只排除了目标的手牌：

```ts
this.cards = this.cards.filter(
    (v) => !this.to.getHandCards().includes(v)
);
```

而 card-operations.md 要求"这些牌不能是 B **拥有**的牌"，且 description.md 定义"\<角色> 的牌 = 其**手牌区和装备区**里的牌"——B 装备区里的牌同样不能交给 B，旧代码漏检。

**新方案**：新 `Room.give` 的过滤 `!toPlayer.getHandCards().includes(c)` 原样继承了该缺陷。应改为排除 toPlayer 手牌区**和装备区**里的牌（B 拥有的牌）。另外文档的多牌多角色"同时交给"分配语义（每名角色至少一张、合计 X 张、同时移动）应由选择端 + `moveCardsRaw` 多条 MoveCardData 一次事件完成，保证"同时"。

### swap（交换）

**旧问题**：`SwapCardsData.exec`（event.move.ts:986）置入处理区时按牌**当前**的 put 状态分组：

```ts
const up_cards = [...swap.cards1, ...swap.cards2].filter(
    (v) => v.put === CardPut.Up
);
const down_cards = [...].filter((v) => v.put === CardPut.Down);
```

未强制"扣置"。card-operations.md 交换条目要求手牌交换"同时将所有手牌**扣置入处理区**"（背面朝上）。此外旧实现是纯通用双叠互换，装备区交换的"同种装备冲突"分支（均冲突→全入弃牌堆；均不冲突→互入装备区；单方冲突→冲突方入弃牌堆）完全没有实现。

**新方案**：新 `Room.swap` 先 `putTo(处理区, reason: 'swap.put')` 再分移，同样无 put 控制、无三种形态。按文档应：①手牌/确定牌交换强制以背面朝上置入处理区（需要 MoveCardOpts 支持 put/movetype）；②装备区交换单独实现冲突分支；③经处理区中转的结构保留——处理区的牌不属于任何角色，天然满足"交换不构成交给/得到（不触发〖恩怨①〗）"的裁定。

### judge（判定）

**旧**：`judge` 直接 `cast(JudgeEvent).exec()`，judge 数据允许外部注入 `card/result/success`（注释说明一般不需要）。

**新**：`Room.judge(player, isSuccess)` → `event.judge`，isSuccess 回调判定成败。判定 = "触发一个判定事件的操作"（card-operations.md），判定亮牌 = "亮出牌堆顶的牌 = 置入处理区"（亮出条目 1），新实现已由 `JudgeEvent._onJudgeAfter`（牌堆取牌 → putTo 处理区）覆盖（见 card-operations.md 实现映射表 ✅）。两版基本对齐；改判类技能（如〖鬼道〗）需要的"替换判定牌/修改结果"能力在新版应通过判定事件的时机回调暴露，而非旧版的构造参数注入。

### damage（伤害）

**旧问题**：`DamageEvent.prevent`（event.damage.ts:105-106）在非白名单时机被调用时**静默忽略**：

```ts
public async prevent() {
    if (preventTriggers.includes(this.trigger as any)) {
```

不在 `preventTriggers` 内直接跳过且无任何报错/日志，调用方无从得知防止失败——晦涩性坏味道。

**新方案**：新 `Room.damage(player, target, damageType, number, channel, isChain)` 为 6 个位置参数，`channel/isChain` 总是伴随出现（数据泥团），建议改为单一对象参数（与 `event.damage(opts)` 对齐）。规则层面：新 `DamageEvent.prevent()` 已实现（event-resolution.md 映射 ✅），但**伤害转移** `transfer` 尚无对应入口——按 description.md 转移条目，需提供"防止原伤害 + 对 B 造成同来源、同渠道、同属性、等值伤害"的组合方法，且转移后的伤害在 B 处独立结算（触发 B 侧技能）。时机受限的调用应显式报错或返回失败标记，避免旧版的静默忽略。

### recover（回复体力）

**旧问题**：两处叠加导致负体力回复算错。`room.handle.ts:212-215`：

```ts
public async recoverTo(this: GameRoom, data: HandleData<RecoverHpEvent>) {
    data.number = data.number - data.player?.hp;
    return this.recoverhp(data);
}
```

未与体力上限取 min（description.md 要求回复 **min{X,Z} − Y**）；且 `event.hp.ts` 的 `RecoverHpEvent.check` 以 `losshp` 为上限缩减（`const y = this.player.losshp; if (y < this.number) this.number = y`）。按 description.md 负体力例：体力上限 1、体力 −1 的庞统"将体力回复至 3"应回复 **2** 点至体力 1；旧代码算出 number = 3−(−1) = 4，再被 losshp=1 截断为 1，最终体力 0——错误。

**新方案**：新 `Room.recoverTo` 已正确实现 `amount = min(targetHp − hp, maxhp − hp)`（Room.ts:291-300），符合 min{X,Z} − Y。但 `shared/core/event/HpEvent.ts:55-66` 的 `RecoverHpEvent.check` 仍以 `losshp`（= maxhp − inthp，inthp 最小为 0）为缩减上限：

```ts
const lost = p.losshp;
if (lost === 0) return false;
if (lost < this.number) {
    this.number = lost;
}
```

负体力时 `losshp` 小于实际可回复量（庞统例：losshp=1，但可回复 2），recoverTo 传入的 2 会被错误截断为 1。修改方案：缩减上限改用 `maxhp − hp`（hp ≥ 0 时与 losshp 相等，负体力时符合 cards.md"濒死时需要依靠 hp（具体体力，可能小于 0）"及庞统裁定）。

### 汇总

| 操作 | 旧问题 | 新现状 | 待改 |
|---|---|---|---|
| discard | Prohibit 检测恒取第一张牌（`at(0)` bug） | 无禁止检测 | 禁止/缩减落到选择端逐张过滤 |
| draw | 先 getNCards 后 check，副作用泄漏 | 无 alive/count 前置检查 | 前置检查再取牌 |
| obtain | — | 已对齐 | 补"得到后洗混手牌" |
| give | 只排除目标手牌，漏装备区 | 继承同缺陷 | 排除目标手牌区+装备区的牌 |
| swap | 未强制扣置；无装备冲突分支 | 同样缺失 | 扣置入处理区 + 装备同种冲突分支 |
| judge | 判定牌构造参数注入 | 已对齐（亮出→处理区） | 改判能力走时机回调 |
| damage | prevent 非法时机静默忽略 | 6 位置参数；缺 transfer | 对象参数；补伤害转移；失败显式化 |
| recover | recoverTo 无 min{X,Z}；check 用 losshp | recoverTo 正确；check 仍用 losshp | 缩减上限改为 maxhp − hp |
