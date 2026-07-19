# 回合事件、阶段事件与身份模式开始前流程：新旧项目实现对比分析

> 基准：`docs/events/turn.md`、`docs/events/phase.md`、`docs/events/standard-mode-setup.md`（2026-07-18 口述裁定）。
> 新项目代码：`shared/core/`（工作区）。旧项目代码：`old/resgsv1` 的 git HEAD（工作区文件已删除，本文所有旧代码引用均来自 `git show HEAD:<路径>`）。
> 技能示例均为旧项目 extensions 中**实际存在**的实现；权威文档清单中的技能若未找到实现，会明确注明。

## 结论速览（重要发现）

| # | 发现 | 位置 |
|---|---|---|
| 1 | **新项目翻面跳过回合后没有把武将牌翻回正面**：旧项目通过 `SkipEvent`（`to_state` 缺省取反）翻回，新 `_skipTurn` 只设 `isSkipped`，`player.skip` 保持 true → 该角色将永久跳过回合 | `shared/core/event/TurnEvent.ts:278` vs 旧 `event.turn.ts` `TurnStartBefore_After` |
| 2 | **新 `TurnEvent.skipPhase(phase)` 无条件跳过当前阶段**：旧版只在 `phase.includes(current.phase)` 时才 `current.skip()`；新版传入任意阶段列表都会把"正在执行的阶段"跳掉（如判定阶段中跳过出牌阶段会误杀判定阶段） | `shared/core/event/TurnEvent.ts:246-264` |
| 3 | **新 `_generatePhases` 对 `skippedPhases` 做了一次性快照**（`new Set(...)`），回合进行中新增的跳过阶段对后续阶段不生效；旧版每次循环实时 `includes` 判断 | `shared/core/event/TurnEvent.ts:211` |
| 4 | **摸牌数 setter 语义回退**：旧 `ratedDrawnum` 一旦为 0 便锁死（"放弃摸牌"不可被后续加牌恢复），新 `drawCount` 任何时候可赋值——`draw_start1`（归零类）/`draw_start2`（加减类）的职责裁定依赖旧的锁定语义 | `shared/core/event/TurnEvent.ts:336` vs 旧 `PhaseEvent.set ratedDrawnum` |
| 5 | 新项目 `GameStart`/`GameStage*` 等开局时机**尚无任何触发点**（`startGame → beforeStart → _mainProcess` 均未 trigger），身份模式 `beforeStart` 未实现（仅测试桩） | `shared/core/room/Room.ts:873` |
| 6 | 六阶段的**规则性行为均未实现**（判定阶段延时锦囊结算、摸 X 张、弃牌规则）：旧项目由 `gamerule_judgephase/drawphase/dropphase` 规则技能承载，新 `drawCount` 目前无消费者 | 旧 `standard/index.ts:109/136/161` |
| 7 | 旧时机命名陷阱：`XxxPhaseStart`＝开始**前**、`XxxPhaseStarted`＝开始**时**；且 `ReadyPhaseStart`、`EndPhaseStart`（开始前）在全部扩展中**零使用** | 旧 `core/event/triggers.ts` |
| 8 | 旧 `TurnEvent` 把 `TurnEnd` 放在 eventTriggers 末位，`end()` 提前结束时 `TurnEnd`（含 `inturn=false` 复位）会被跳过；新版把 `TurnEnd/TurnEndAfter` 移入 endTriggers，修复了该结构性问题 | 新 `TurnEvent.ts:145-150` |
| 9 | 额外回合顺序语义不同：旧 `extraTurns.pop()`（栈，后插先执行），新 `extraTurns.shift()`（队列，先插先执行） | `Room.ts:907` vs 旧 `room.ts:660` |
| 10 | 旧选将流程与规则不符：主公获得**全部**主公武将+（选将数+1）张普通牌（规则为 3+2）；**神/西势力改势力选择未实现**（`kingdom` 直接取主将势力） | 旧 `standard/index.ts:489-527、698` |

---

## 一、回合事件（TurnEvent）

### 时机序列总览

| | 旧项目（`event.turn.ts`） | 新项目（`TurnEvent.ts`） |
|---|---|---|
| eventTriggers | TurnStartBefore → TurnStart → TurnStarted → **TurnEnd** | TurnStartBefore → TurnStart → TurnStartAfter |
| endTriggers | TurnEnded | **TurnEnd** → TurnEndAfter |

新版将 TurnEnd 移入 endTriggers（见速览 #8）。两版执行引擎一致：旧 `EventProcess.trigger_func` 按 `${trigger}_Before` → `room.trigger` → `${trigger}_After` 的**方法名约定**执行回调；新 `EventProcess.triggerFunc` 改为显式的 `Timing.before[] → room.event.trigger → Timing.after[]` 数组（`shared/core/event/EventProcess.ts:152-226`），并在其中注入 `refreshsByTiming`。新方式类型可查、可动态增删（`registerBefore/After`、`removeCallback`），优于旧的字符串拼接方法名。

### 回合开始后❶（轮数计算）

**旧实现**：不在回合事件内，在 `room.ts:654-737` 主循环的默认流程中：`last.player.seat > turn.player.seat` 时依次 `trigger(CircleEnd, last)`、`circleCount+1`、`trigger(CircleStarted, turn)`；每个回合（含额外回合）`turnCount+1` 并重写 `turnId`（`room.ts:726-727`）。问题：模式若实现 `mainProcess` 则须自行复制整套轮数逻辑（3v3 就复制了一份），轮数计算与"下家确定"耦合在同一分支里。

**新实现**：`Room._mainProcess`（`shared/core/room/Room.ts:891-962`）。`turn.isRoundStart = !last || turn.player.seat <= (last.player?.seat ?? 0)`，随后触发 `RoundEnd`（对 last）→ `roundCount++` → `RoundStart`。注意两处差异：
- 判断符 `<=` vs 旧 `>`：座次相等（如场上只剩一名可行动角色连续进行额定回合）时新版会判为新一轮、旧版不会；
- 额定回合才 `turnCount++`，额外回合不重编号 `turnId`（与旧不同，移植依赖 `turnId` 连续性的技能时注意）。

**技能例**：规则时机，权威文档无技能清单，无需示例。

### 回合开始后❷（登场后）

**旧实现**：核心无此时机的自动触发，`OnStaged` 由 **1v1 模式规则**触发。开局：`gamerule_1v1_state_onstart`（`1v1/index.ts:326-350`）在 `GameStarted` 后按响应顺序对每人构造临时 TurnEvent 数据并 `room.trigger(EventTriggers.OnStaged, ...)`；换将登场（`1v1/index.ts:485-505`）在补牌后再次触发。事件数据借用 `TurnEvent.stage_generals: General[]` 字段承载登场武将。问题：登场"事件"不是真实事件（`createEventData` 出的裸数据未 exec），时机数据与回合事件耦合。

**新实现**：`GameStageBefore/GameStage/GameStageAfter` 枚举已定义（`shared/core/event/EventTypes.ts:17-19`），配套 `StageData { player, generals }`（`EventTypes.ts:544`），**尚无触发者**。移植注意：按 turn.md ❷ 的裁定，触发职责仍归模式（1v1 参考）；旧 `stage_generals` 对应新 `StageData.generals`，应使用独立的 StageData 而非复用回合事件数据，避免旧的耦合问题。

**技能例**（清单内，已实现）：
- 〖虎威〗`1v1.guanyu.huwei`（`1v1/generals/shu/guanyu.ts:101`）：`trigger: EventTriggers.OnStaged`，`can_trigger` 检查 `data.stage_generals.includes(this.skill.sourceGeneral)`（本武将牌登场才触发），`choose` 中 `room.preUseCard` 视为使用 1v1 专属【水淹七军】。
- 〖蛮裔①〗`1v1.menghuo.manyi`（`1v1/generals/shu/menghuo.ts:45`）：同挂 `OnStaged`，`from.canUseCard({ name: 'nanmanruqin' })` 检查后视为使用【南蛮入侵】。

### 回合开始后❸（游戏开始时）

**旧实现**：`GameReadyEvent`（`core/event/types/event.ready.ts`）九个时机中的最后一个 `GameStarted`，随开局事件 exec 自动触发。

**新实现**：`TimingName.GameStart` 已定义并在 `TimingEventMap` 映射到 `EventType.Ready`（`EventTypes.ts:643`），但 Room 中**无任何触发点**（速览 #5）；按 setup 文档裁定改由 `GameMode.beforeStart` 顺序化触发。另：turn.md 裁定 R1 的 `GameStartAfter`（游戏开始后）枚举**尚缺**，待实现时补。

**技能例**（清单内，已实现）：
- 〖化身①〗`zuoci.huashen`（`shenhua/generals/shan/zuoci.ts:54-100`）：`trigger: EventTriggers.GameStarted`，弹窗从随机武将中选一张"化身"，并过滤带主公技标签的技能。移植时该效果应挂新 `GameStart`。

### 回合开始后❹（轮次）

**旧实现**：`CircleStarted/CircleEnd`（见❶），事件数据是 TurnEvent 本身，回合事件带 `isCircleStart/isCircleEnd` 标记及 `getCircleStartTurn()` 查询。3v3 模式在自定义 `mainProcess` 中自行触发（`3v3/index.ts:618-650`：所有存活者都有 `3v3.action` 标记时进入新轮并清标记）。

**新实现**：`RoundStart/RoundEnd`（`_mainProcess` 内），TimingData 为 `{ round, turn }`（`EventTypes.ts:813-814`），并记录 `room.roundStartTurn`。语义与旧对齐；差异见❶。

**技能例**：清单技能〖纵傀〗（zongkui）**未找到已实现示例**（全扩展 grep 无果）。该时机的真实使用者为触发侧的 3v3 模式 `mainProcess`，以及 wars 扩展多个武将（如 `wars/generals/xljin/yanghu.ts` 等，均不在本时机的文档清单内）。

### 回合开始后❺（翻面检测）

**旧实现**：`TurnStartBefore_After`（`event.turn.ts`）：先处理休整（`rest-1`，归零则 `death=false` + 复活动画 + `trigger(RestOver)`，未归零则 `isEnd=isComplete=true; isSkip=true` 跳过回合）；再检测 `player.skip`：置跳过标记、发 `#TurnSkip` 战报，并且——关键——

```ts
await this.room.skip(
    this.room.createEventData(SkipEvent, {
        player: this.player, source: this, reason: 'turnstart',
    })
);
```

`SkipEvent.check()` 在 `to_state` 缺省时取 `!player.skip`（`event.state.ts:238-242`），即**把武将牌翻回正面**，符合规则"其翻面，然后终止此回合"。

**新实现**：`_onTurnStartBefore`（`TurnEvent.ts:155-184`）：休整逻辑等价（RestEvent 留 TODO Phase 5），`player.skip` 为 true 时调用 `_skipTurn('#TurnSkip')`——只设置 `isEnd/isComplete/isSkipped`，**没有触发翻面事件把牌翻回**（速览 #1）。这是必须修复的缺陷：否则 `skip` 永远为 true，每回合都被跳过。修复时应经由 `room.skip(player)`（`Room.ts:628` 已有快捷方法，内部走 ChangeState 事件）以便"翻面时"相关技能可响应。另外新版把"回合开始前"细化为可供技能挂载的 `TurnStartBefore` 时机（turn.md ❺ 的补充裁定），旧版该时机同样存在但仅规则使用。

**技能例**：规则逻辑时机，文档无技能清单。

### 回合开始后❻（回合内标志开启）

**旧实现**：`TurnStartBefore_After` 的正常分支 `player.setProperty('inturn', true)`，随后处理鹤翼阵/围攻阵法动画广播（依赖 `SkillTag.Array_Quene/Array_Siege`）。

**新实现**：`TurnEvent.ts:180` `player.inturn = true`（阵法动画 TODO Phase 8）。两版都在"回合开始前"回调内开启，先于 `TurnStart` 时机触发，符合规则中❻早于❼的顺序。

**技能例**：规则时机，无技能清单。

### 回合开始后❼（回合开始时）

**旧实现**：`EventTriggers.TurnStart`，eventTriggers 第二项，无内建回调，纯技能挂点。

**新实现**：`createTiming(TimingName.TurnStart)`（`TurnEvent.ts:140`），同为纯时机。结构等价。

**技能例**：清单技能〖宽释②〗（kuanshi）**未找到已实现示例**。该时机真实示例（非清单）：〖化身②〗`zuoci.huashen` 第三个效果（`shenhua/generals/shan/zuoci.ts:215`）：

```ts
forced: 'cost',
trigger: [EventTriggers.TurnStart, EventTriggers.TurnEnd],
can_trigger(room, player, data: TurnEvent) {
    return this.isOwner(player) && data.player === player &&
        player.upArea.generals.filter((v) => v.hasMark('mark.huashen')).length > 0;
},
```

注意时机差异：旧项目把化身②挂在"回合开始**时**/回合结束时"，而权威文档将化身②裁定在**回合开始后❾**与回合结束前❶。移植时应改挂 `TurnStartAfter`/`TurnEnd`。

### 回合开始后❽

规则上无作用。两个项目均未设枚举，正确省略。

### 回合开始后❾（回合开始后）

**旧实现**：`TurnStarted` + `TurnStarted_After → generatePhase()`：`while` 循环 `phases.shift()`，每次**实时**检查 `skipPhases.includes(phase.phase)`，为执行者 `setProperty('phase', ...)` 后构造 `PhaseEvent` 执行。

**新实现**：`TurnStartAfter` + `_onTurnStarted → _generatePhases()`（`TurnEvent.ts:210-236`）。两处偏差（速览 #2、#3）：

```ts
const skipped = new Set(this.skippedPhases);   // 快照！循环中新增不生效
for (let i = 0; i < this.phases.length && !this.isEnd; i++) {
    const phaseItem = this.phases[i];
    if (skipped.has(phaseItem.phase)) continue;
```

配合 `skipPhase()` 的另一处偏差：

```ts
async skipPhase(phase?: Phase | Phase[]): Promise<void> {
    const current = this._findCurrentPhaseEvent();
    if (phase !== undefined) { /* push 到 skippedPhases */ }
    if (current) { await current.skip(); }   // 旧版仅当 phase.includes(current.phase) 才 skip
}
```

后果：例如【乐不思蜀】判定生效时调用 `turn.skipPhase(Phase.Play)`，会（a）误将正在执行的**判定阶段**跳过，（b）由于快照，真正的出牌阶段反而照常执行。这是从旧版移植时引入的双重回归，建议恢复旧版两点语义：跳过列表实时判断 + 仅当当前阶段在列表中才终止当前阶段。另外旧版 `phases.shift()` 消费式遍历允许技能向 `phases` 头部插入额外阶段（如神速的额外阶段类），新版索引遍历同样支持 `splice` 插入，但语义需在移植额外阶段技能时验证。

**技能例**：清单技能〖当先〗（dangxian）**未找到**；〖化身②〗旧实现挂在 TurnStart（见❼）。该时机真实示例（非清单）：四象·青龙 `sixiang.mark.qinglong`（`standard/sixiang.ts:386-430`）：`trigger: EventTriggers.TurnStarted`，`PriorityType.Rule`，`can_trigger` 检查 `player.judgeCards` 中有乐不思蜀/兵粮寸断，可弃两张手牌弃置其中一张——标准包内唯一挂"回合开始后"的实现，可作移植该时机技能的结构参考。

### 回合结束前❶（回合结束）

**旧实现**：`TurnEnd` 位于 eventTriggers 末位，`TurnEnd_After` 复位 `inturn=false`、`__jiu_times=0`、全体 `jiuState=0`。结构性问题（速览 #8）：`TurnEvent.end()` 设 `isEnd=true` 后主循环跳出，eventTriggers 中尚未执行的 `TurnEnd` 一并被跳过——被 `end()` 的回合既不触发回合结束技能也不复位 `inturn`。

**新实现**：`TurnEnd` 移入 endTriggers（`TurnEvent.ts:145-150`），`end()` 后仍然执行，修复上述问题。`_onTurnEnd`（`TurnEvent.ts:197-206`）：`inturn=false` + 全体 `setMark('jiuState', 0)`。移植注意：旧版酒状态是 **schema 属性** `setProperty('jiuState')`（客户端同步）+ `__jiu_times` 标记两套，新版目前只有 mark 一套，移植【酒】与酒相关技能时需统一状态载体并确认客户端可见性。

**技能例**（均在清单内）：
- 〖博图〗`1v1.lvmeng.botu`（`1v1/generals/wu/lvmeng.ts:34-80`）：`trigger: EventTriggers.TurnEnd`，`forced: 'cost'`；`can_trigger` 用 `room.getHistorys(PhaseEvent → UseCardEvent/UseCardToCardEvent)` 收集本回合出牌阶段自己的用牌，判断 ≥4 张且凑齐 4 花色，`cost` 中 `room.executeExtraTurn(...)` 获得额外回合——展示了"回合结束时机 + 历史查询 + 额外回合"三件套的旧写法。
- 〖镇骨〗延时 `zhengu.delay`（`shenhua/generals/lei/haozhao.ts:105-140`）：`mark: ['mark.zhengu']` 驱动的延时效果挂 `TurnEnd`，effect 中比较来源与目标手牌数决定弃牌——"于其下回合结束前"类延时效果的标准挂点。

### 回合结束前❷ / ❸

规则上无作用，两版均无对应枚举。

### 回合结束前❹❺❻（回合结束后）

**旧实现**：endTriggers 唯一时机 `TurnEnded`。

**新实现**：`TurnEndAfter`（endTriggers 第二项），纯时机。国战敕令流程（❻）两版均未实现。

**技能例**（清单内〖青囊②〗对应）：
- `ex.huatuo.qingnang` 的 lifecycle（`ex/generals/qun/huatuo.ts:96-105`）：

```ts
lifecycle: [{
    trigger: EventTriggers.TurnEnded,
    async on_exec(room, data) {
        this.setInvalids(this.name, false);
        room.players.forEach((v) => v.removeMark('mark.qingnang'));
    },
}],
```

界华佗青囊"每回合限一次/对每名角色限一次"的失效与标记在回合结束后统一复位——`TurnEnded` 在旧项目的典型用途就是这类**状态清理**，移植时对应 `TurnEndAfter`。

### 回合结束前❼（回合内标志关闭）

见❶：旧在 `TurnEnd_After`、新在 `_onTurnEnd`，都与"回合结束"时机合并。规则语义上❼晚于❶（回合结束时的技能仍处于"回合内"），当前两版都在 TurnEnd 回调里立即复位——由于新版回调挂在 `TurnEnd` 的 before（`createTiming(TimingName.TurnEnd, undefined, [callback])` 第三参是 after？见 `createTiming(name, before, after)` 签名，此处传入的是 **after**），即技能触发完才复位，顺序正确；移植"回合外生效"类技能时需针对这个窗口写用例验证。

### 回合间衔接 / 游戏结束时

- 衔接：旧 `do-while (gameState === Gaming)`（`room.ts:653-737`，`finally` 中每回合 `delay(1)`）；新 `while (this.isGaming)`（`Room.ts:895`），带 `MAX_ROUNDS=302` 兜底与"存活+休整 ≤1 判局"。额外回合取用顺序 pop vs shift（速览 #9），移植〖博图〗〖连破〗这类可能叠加额外回合的技能时必须先裁定顺序。
- `GameEnd`：旧 `gameOver → trigger(GameEnd, this.currentTurn)`（数据是回合事件）；新 `gameOver → trigger(GameEnd, { wins, reason })`（`Room.ts:998`，数据是结果对象）。挂 `GameEnd` 的技能（〖兴棹⑥〗，未实现）移植时注意事件数据形状不同。

---

## 二、阶段事件（PhaseEvent）

### 时机命名对照（重要陷阱）

旧命名 `XxxPhaseStart`＝开始**前**、`XxxPhaseStarted`＝开始**时**；新命名 `XxxPhaseStartBefore`＝开始前、`XxxPhaseStart`＝开始时。对照：

| 规则时机 | 旧 EventTriggers | 新 TimingName |
|---|---|---|
| 开始前 | `XxxPhaseStart` | `xxx_start_before` |
| 开始时 | `XxxPhaseStarted`（摸牌另有 `DrawPhaseStartedAfter`） | `xxx_start`（摸牌 `draw_start1/2`） |
| 阶段进行 | `XxxPhaseProceeding` | `xxx_phase` |
| 结束时 | `XxxPhaseEnd`（endTriggers） | `xxx_end`（endTriggers） |

迁移旧技能时**不能按名字直译**（旧 `PlayPhaseStart` ≠ 新 `PlayPhaseStart`），必须查表。新版结构改进：旧用 6 路 `switch` 逐阶段拼装（`event.turn.ts` `PhaseEvent.init`），新用静态表 `PHASE_TIMING`（`TurnEvent.ts:15-68`）映射，消除重复。

其他结构对比：
- `checkEvent()`（执行者存活才继续）两版一致；`skip()`（`isComplete=true; triggerable=false`，非额外阶段回写 `currentTurn.skippedPhases`）两版一致。
- 旧 `PhaseEvent` 有 `PlayPhaseStarted_After`/`PlayPhaseEnd_After` 重置 `__sha_times`（出牌阶段杀次数），新版无——待用牌模块移植时补。
- 旧 `end()` 覆写置 `triggerable=false`；新 `PhaseEvent` 未覆写 `end()`（用基类），行为一致。
- **摸牌数 setter**（速览 #4）：

```ts
// 旧：归零后锁死（放弃摸牌不可逆）
public set ratedDrawnum(value: number) {
    if (this._ratedDrawnum > 0) { this._ratedDrawnum = value; }
    if (this._ratedDrawnum < 0) this._ratedDrawnum = 0;
}
// 新：任何时候可赋值，仅负数钳 0
set drawCount(value: number) {
    if (value < 0) value = 0;
    this.eventData.drawCount = value;
}
```

phase.md 对 `draw_start1/2` 的职责裁定（1＝归零类、2＝加减类）正是建立在"归零之后加减无效"之上，新 setter 丢失了这个保证，移植〖督粮〗等归零类技能前需恢复锁定语义（或在 `draw_start2` 阶段判断 drawCount 是否已被归零）。

### 准备阶段

#### 准备阶段开始前（ready_start_before）

**旧实现**：`ReadyPhaseStart` 枚举存在，但**全部扩展零使用**。**新实现**：`ReadyPhaseStartBefore` 已建（纯时机）。
**技能例**：清单技能〖隐世①〗未实现，**未找到已实现示例**。

#### 准备阶段开始时（ready_start）

**旧实现**：`ReadyPhaseStarted`，大量技能挂点，核心无内建行为。**新实现**：`ReadyPhaseStart`，等价。

**技能例**（清单内）：
- 〖观星〗`zhugeliang.guanxing`（`standard/generals/shu/zhugeliang.ts:45-75`）：`trigger: ReadyPhaseStarted`，`forced: 'cost'`；cost 中 `Math.min(5, room.aliveCount)` 张牌 `getNCards` 后盖放处理区（`cardVisibles: [from]` 仅自己可见），effect 再做排序归位。
- 〖洛神〗`zhenji.luoshen`（`standard/generals/wei/zhenji.ts:103-128`）：同时机，`can_trigger` 显式检查 `data.phase === Phase.Ready && data.executor === player`，选择器循环询问"是否继续判定"。

#### 准备阶段（ready_phase）

**旧实现**：`ReadyPhaseProceeding` 枚举存在、扩展零使用。**新实现**：`ReadyPhase` 已建。与 phase.md"暂时没有作用"一致，两版都是占位。

#### 准备阶段结束时（ready_end）

**旧实现**：`ReadyPhaseEnd`（endTriggers）。**新实现**：`ReadyPhaseEnd`（endTriggers）。规则用途"阵法召唤"在旧项目**不挂此时机**（wars 扩展的阵法召唤走出牌阶段等流程），移植国战时需按新文档把召唤检查放到这里。

**技能例**（非清单，唯一真实使用者）：〖知命〗`qiaozhou.zhiming`（`mexclusive/generals/sp/qiaozhou.ts:17-45`）：`trigger: [EventTriggers.ReadyPhaseEnd, EventTriggers.DropPhaseEnd]`，可将一张牌置于牌堆顶——展示同一效果多时机挂载写法。

### 判定阶段

#### 判定阶段开始前（judge_start_before）

**旧实现**：`JudgePhaseStart`。**新实现**：`JudgePhaseStartBefore`。

**技能例**（清单内）：
- 〖神速①〗`xiahouyuan.shensu`（`shenhua/generals/feng/xiahouyuan.ts:16-52`）：`trigger: JudgePhaseStart`，选择目标视为使用无距离/次数限制的【杀】（`excluesCardTimesLimit/excluesCardDistanceLimit`），cost 中跳过判定与摸牌阶段。
- 〖巧变①〗`zhanghe.qiaobian`（`shenhua/generals/shan/zhanghe.ts:44-70`）：同一技能四个效果分挂 `JudgePhaseStart/DrawPhaseStart/PlayPhaseStart/DropPhaseStart` 四个"开始前"，`can_trigger` 带 `!data.isComplete` 防止已被跳过的阶段重复触发——移植多段式"巧变"类技能的结构模板。

#### 判定阶段开始时（judge_start）

**旧实现**：`JudgePhaseStarted`，核心无行为。**新实现**：`JudgePhaseStart`。

**技能例**：清单技能〖勇略〗未找到。全扩展唯一真实使用者（非清单）：斗地主〖飞扬〗`doudizhu.feiyang`（`doudizhu/index.ts:408-440`）：判定区有牌时可弃两张手牌弃置一张判定牌。

#### 判定阶段（judge_phase）——延时锦囊结算

**旧实现**：规则技能 `gamerule_judgephase`（`standard/index.ts:109-133`）：

```ts
async cost(room, data: PhaseEvent, context) {
    const { from } = context;
    const cards = from.judgeCards.slice();   // 快照
    while (cards.length > 0) {
        await room.usecardsp({ targets: from, card: cards.pop(), ... });  // 后进先出
    }
    return true;
},
```

`slice()` 快照 + `pop()` LIFO 完全符合 phase.md 的快照规则（判定中新置入的延时锦囊本回合不结算）；`usecardsp` 即"特殊使用流程"（无使用者的 UseCardSpecial 事件）。

**新实现**：**未实现**。新项目已具备承接件：`EventType.UseCardSpecial` + `UseCardSpecialEventData`（`EventTypes.ts:380-397`，`settleTarget 只能为0` 等约束已注释）。移植要点：规则技能挂 `JudgePhase` 时机、快照+LIFO、特殊使用流程中"没有使用者"。

#### 判定阶段结束时（judge_phase_end）

旧 `JudgePhaseEnd` 扩展零使用；新 `JudgePhaseEnd` 占位。与文档"暂时没有作用"一致。

### 摸牌阶段

#### 摸牌阶段开始前（draw_start_before）

**旧实现**：`DrawPhaseStart`。**新实现**：`DrawPhaseStartBefore`。

**技能例**（清单内）：〖巧变②〗`zhanghe.qiaobian` 第二效果（`shenhua/generals/shan/zhanghe.ts:88`）：弃一张手牌跳过摸牌阶段，改为获得两名角色各一张手牌。

#### 摸牌阶段开始时❶（draw_start1）

**旧实现**：`DrawPhaseStarted`。**新实现**：`DrawPhaseStart1`。

**技能例**：清单技能〖督粮〗未找到。真实示例（非清单）：〖突袭(1v1)〗`1v1.zhangliao.tuxi`（`1v1/generals/wei/zhangliao.ts:15-70`）：`trigger: DrawPhaseStarted`，`forced: 'cost'`，手牌少于对方时强制触发，`cost` 中 `data.ratedDrawnum--` 少摸一张并获得对方一张手牌。注意：旧项目**并未贯彻**"开始时❶＝归零、❷＝加减"的职责划分（该划分是新项目的用户裁定），1v1 突袭在❶做的是减法；移植时以新裁定重新归类，而非照搬旧挂点。

#### 摸牌阶段开始时❷（draw_start2）

**旧实现**：`DrawPhaseStartedAfter`。**新实现**：`DrawPhaseStart2`。

**技能例**（清单内）：〖突袭（标）〗`zhangliao.tuxi`（`standard/generals/wei/zhangliao.ts:15-108`）：`trigger: DrawPhaseStartedAfter`，选至多两名有手牌的角色，`cost` 中：

```ts
async cost(room, data: PhaseEvent, context) {
    const { targets } = context;
    await data.end();          // 直接结束摸牌阶段，而非 ratedDrawnum = 0
    return targets.length > 0;
},
```

移植警示：旧实现用 `data.end()` 表达"放弃摸牌"，会连带跳过 `DrawPhaseProceeding` 时机上的其他技能；新裁定应改为在 `draw_start1` 将 `drawCount` 归零（并依赖恢复后的锁定语义），保持阶段时机完整。同时机另有〖双雄〗（`shenhua/generals/huo/yanliangwenchou.ts`，清单内）。

#### 摸牌阶段（draw_phase）

**旧实现**：技能侧在 `DrawPhaseProceeding` 修正 `ratedDrawnum`；规则侧 `gamerule_drawphase`（`standard/index.ts:136-158`，`PriorityType.Rule`）在同一时机按最终 `ratedDrawnum > 0` 执行 `drawCards`——技能优先级高于规则，保证修正先于实摸。phase.md 的周瑜-鲁肃叠加例即由此实现（叠加与顺序无关，最终一次结算）。

**新实现**：时机 `DrawPhase` 已建、`drawCount` 已在 TurnEvent 传入（Draw=2 其余 0），但**无规则消费者**——摸牌动作目前不会发生（速览 #6）。移植时需连同优先级机制（`PriorityType.Rule` 后于普通技能）一并实现。

**技能例**（清单内）：
- 〖英姿(1v1)〗`1v1.zhouyu.yingzi`（`1v1/generals/wu/zhouyu.ts:16-32`）：`forced: 'cost'`，cost 仅 `data.ratedDrawnum++`——最小的额定摸牌修正样板。
- 〖好施〗`lusu.haoshi`（`shenhua/generals/lin/lusu.ts:14-34`）：`ratedDrawnum += 2` 并 `room.addEffect('haoshi.delay', from)` 注册延时（把 `data` 存进效果数据，供延时比对同一阶段）。

#### 摸牌阶段结束时（draw_end）

**旧实现**：`DrawPhaseEnd`（endTriggers）。**新实现**：`DrawPhaseEnd`。

**技能例**（清单内）：〖好施〗延时 `haoshi.delay`（`shenhua/generals/lin/lusu.ts:37-75`）：`can_trigger` 校验 `this.getData('data') === data`（只在注册它的那个摸牌阶段结束触发）且手牌 >5，选一半手牌交给手牌最少的其他角色——延时效果与源阶段绑定的标准写法。

### 出牌阶段

#### 出牌阶段开始前（play_start_before）

**旧实现**：`PlayPhaseStart`。**新实现**：`PlayPhaseStartBefore`。

**技能例**（清单内）：
- 〖神速②〗`xiahouyuan.shensu` 第二效果（`shenhua/generals/feng/xiahouyuan.ts:95-130`）：弃一张装备牌+选目标，跳过出牌阶段视为使用【杀】。
- 〖放权〗`liushan.fangquan`（`shenhua/generals/shan/liushan.ts:21-43`）：`trigger: PlayPhaseStart`，cost 中 `await room.currentTurn.skipPhase()`（无参＝跳过当前即将进行的出牌阶段）并注册 `fangquan.delay`。注意其依赖"`skipPhase()` 无参→跳当前"的语义，与新版 `skipPhase(phase)` 的缺陷（速览 #2）无冲突，但移植时两条路径都要测。

#### 出牌阶段开始时（play_start）

**旧实现**：`PlayPhaseStarted`；核心内建 `PlayPhaseStarted_After` 重置 `__sha_times`。规则"构建随机牌名表"未见实现。**新实现**：`PlayPhaseStart`，纯时机（杀次数重置待用牌模块）。

**技能例**（清单内，装备技〖玉玺③〗）：wars【玉玺】（`wars/cards/equip/yuxi.ts:53-85`）：`tag: [SkillTag.Lock]`、`PriorityType.Equip`、`trigger: PlayPhaseStarted`，`can_trigger` 检查 `player.canUseCard({ name: 'zhijizhibi' })`，cost 中 `preUseCard` 强制使用【知己知彼】（`canCancle: false`）。同文件另一效果挂 `DrawPhaseProceeding` 做 `ratedDrawnum++`（玉玺②），一牌两时机可作装备移植模板。

#### 出牌阶段（play_phase）——空闲时间点

**旧实现**：三件配合：
1. `PhaseEvent` 的 `PlayPhaseProceeding` 时机（每次触发＝一个空闲时间点）；
2. `room.trigger` 对该时机的专用分支（`room.ts:824-840`）：以 `data.executor` 为当前角色，收集全部可用主动技/用牌技能并按 `data.times[playerId][effectId]` 与 `maxTimes` 过滤（"出牌阶段限一次"）；
3. `room.handle`（`room.ts:1216-1222`）：玩家做出使用牌/技能等任一操作且未选择结束阶段时 `phase.insert([EventTriggers.PlayPhaseProceeding])` **重新插入**同名时机——事件流程结束后进入的是下一个空闲点，而非回到原时机，与规则"◆ 不回到此空闲时间点"吻合。卡牌使用类技能由 `sgs.CardUse/CardUseEquip` 统一声明 `trigger: PlayPhaseProceeding`（`core/sgs.ts:696`）。

**新实现**：`PlayPhase` 目前是单次时机（PHASE_TIMING 序列一员）；`PhaseEvent.times: Record<string, Record<number, number>>` 字段已保留（`TurnEvent.ts:341`）。按 phase.md 裁定 R8：废弃"无限循环 play_phase"的过渡方案，**拆分空闲时间点为独立时机枚举成员**（枚举待补），濒死中不处于空闲点的约束放进时机生成逻辑。移植注意：旧方案的"insert 重插"天然满足空闲点推进语义，新方案需在时机生成处等价保证；`times` 的清零时机（旧随 PhaseEvent 生命周期消亡）也要保持。

**技能例**（清单内）：〖制衡〗`sunquan.zhiheng`（`standard/generals/wu/sunquan.ts:16-68`）：`trigger: PlayPhaseProceeding`，选择器 `count: [1, -1]`（任意张），`cost` 弃置、`effect` 摸等量——出牌阶段主动技的最小完整样板（次数限制默认每阶段一次，由 `times` 机制承载）。另〖仁德〗〖苦肉〗等同型。

#### 出牌阶段结束时（play_end）

**旧实现**：`PlayPhaseEnd`（endTriggers）；核心内建 `PlayPhaseEnd_After` 再次重置 `__sha_times`。**新实现**：`PlayPhaseEnd`，纯时机。

**技能例**：清单技能（离魂延时、清忠延时等）**未找到已实现示例**。该时机真实用途示例（非清单）：〖国色〗`ex.daqiao.guose` 的 lifecycle（`ex/generals/wu/daqiao.ts:85-96`）：`trigger: PlayPhaseEnd`，`on_exec` 中 `setInvalids(this.name, false)` 解除"此阶段内失效"——对应规则"终止于此阶段内有效的效果"，与 phase.md 该时机的游戏流程操作语义一致。

### 弃牌阶段

#### 弃牌阶段开始前（discard_start_before）

**旧实现**：`DropPhaseStart`。**新实现**：`DiscardPhaseStartBefore`。

**技能例**（清单内）：〖克己〗`lvmeng.keji`（`standard/generals/wu/lvmeng.ts:29-70`）：`trigger: DropPhaseStart`，`forced: 'cost'`，`can_trigger` 通过 `room.getHistorys(PhaseEvent → UseCardEvent/PlayCardEvent)` 检查本回合出牌阶段是否使用/打出过【杀】，未用过则跳过弃牌阶段——"开始前跳过整个阶段"类技能的标准结构（历史查询范围锚定 `room.currentTurn`）。

#### 弃牌阶段开始时（discard_start）

**旧实现**：`DropPhaseStarted`。**新实现**：`DiscardPhaseStart`。

**技能例**（清单内）：〖生息〗`wars.jiangwanfeiyi.shengxi`（`wars/generals/power/jiangwanfeiyi.ts:16-44`）：

```ts
trigger: EventTriggers.DropPhaseStarted,
can_trigger(room, player, data: PhaseEvent) {
    if (this.isOwner(player) && data.isOwner(player)) {
        const damages = room.getHistorys(sgs.DataType.DamageEvent,
            (v) => v.from === player, room.currentTurn);
        return damages.length === 0;    // 本回合未造成伤害
    }
},
async cost(room, data, context) { return await room.drawCards({ player: context.from, count: 2, ... }); },
```

#### 弃牌阶段（discard_phase）——弃牌规则

**旧实现**：规则技能 `gamerule_dropphase`（`standard/index.ts:161-248`）：`can_trigger` 以 `StateEffectType.MaxHand_Exclude` 状态效果过滤"不计入手牌上限"的牌后比较 `> player.maxhand`；选择器 `count = 手牌数 - maxhand`、`canCancle: false`、超时时间随手牌量放宽；cost `dropCards`。"因弃牌阶段的弃牌规则而弃置的牌"可由移动事件的 `reason === 'gamerule_dropphase'` 识别（供〖固政〗等引用）。

**新实现**：**未实现**（时机已建，无规则技能）。移植要点：MaxHand_Exclude 状态过滤、不可取消、弃置 reason 的术语锚定。

#### 弃牌阶段结束时（discard_end）

**旧实现**：`DropPhaseEnd`。**新实现**：`DiscardPhaseEnd`。

**技能例**（清单内）：
- 〖固政〗`zhangzhaozhanghong.guzheng`（`shenhua/generals/shan/zhangzhaozhanghong.ts:100-160`）：`can_trigger` 要求 `!data.isOwner(player)`（他人的弃牌阶段），用 `getHistorys(MoveCardEvent, 过滤 toArea===弃牌堆 且牌仍在弃牌堆, data)` 收集**本阶段**进入弃牌堆的牌，选一张令其收回或自己全部获得——"引用本阶段弃置的牌"的历史查询范围就是阶段事件本身。
- 〖旋风①〗`tenex.lingtong.xuanfeng`（`ex/generals/tenyj1/lingtong.ts:17`）：同挂 `DropPhaseEnd`。

### 结束阶段

#### 结束阶段开始前（end_start_before）

旧 `EndPhaseStart` 全扩展**零使用**；新 `EndPhaseStartBefore` 已建。清单技能〖截辎③〗〖隐世③〗未实现，**未找到已实现示例**。

#### 结束阶段开始时（end_start）

**旧实现**：`EndPhaseStarted`。**新实现**：`EndPhaseStart`。

**技能例**（清单内）：
- 〖闭月〗`diaochan.biyue`（`standard/generals/qun/diaochan.ts:98-118`）：`forced: 'cost'`，cost 即 `drawCards` 一张——该时机最简样板。
- 〖镇骨〗`haozhao.zhengu`（`shenhua/generals/lei/haozhao.ts:14-21`）：`trigger: EndPhaseStarted` 选目标记 `mark.zhengu` 并注册 `zhengu.delay`（其延时挂回合结束，见回合章）——"结束阶段发动 + 下回合结束延时"的成对结构。

#### 结束阶段（end_phase）/ 结束阶段结束时（end_end）

文档均"暂时没有作用"。旧 `EndPhaseProceeding` 零使用；但旧 `EndPhaseEnd` **有少量 lifecycle 使用**：如 ex 界诸葛〖观星〗（`ex/generals/shu/zhugeliang.ts:147-153`）在 `EndPhaseEnd` 将"全放牌堆底可再次发动"的 `end_trigger` 标志复位，另 `ex/generals/mshan/jiangwei.ts` 同类。移植提示：这类复位不应依赖"无作用"时机，新项目应改用技能生命周期/回合结束后（`TurnEndAfter`）承载。

---

## 三、身份模式：开始前流程

### 总体结构对比

**旧实现**：`GameReadyEvent`（`core/event/types/event.ready.ts`）定义 9 个顺序时机：

```
GameStartBefore → AssignRoles → AdjustSeats → ChooseGeneral → ChooseGeneralAfter
→ InitProperty → GameStartReady → InitHandCard → GameStarted
```

`room.startGame`（`room.ts:567-737`）先做座次（seattag/randomSeat）、`addSkill(this.mode.rules)` 加载模式规则技能、ban 势力，然后 `GameReadyEvent.exec()`，各步骤由挂在对应时机上的**规则技能**（旧 `PriorityType.GlobalRule`，已于新项目中删除——GlobalRule 合并入 Rule）完成；身份模式规则集合 `game_role_rules`＋`mode_role = sgs.GameMode({ name: 'role', rules: game_role_rules })`（`standard/index.ts:318-327、1073-1078`）。`AdjustSeats/GameStartReady` 两个时机在身份模式无监听者（空转）。

**新实现**：`GameMode.beforeStart(room)`（`shared/core/room/GameMode.ts:40`，**必须提供**）按 setup 文档顺序化处理；`Room.startGame`（`Room.ts:873-888`）：取模式 → `beforeStart` → `_mainProcess`。当前只有测试桩（`shared/test/game-flow.test.ts:99`：`sgs.modes.set('test', { beforeStart: async () => {} })`），身份模式本体未实现。`EventType.Ready`/`ReadyEventData`/`GameStartBefore`/`GameStart` 枚举已定义但没有 ReadyEvent 类——按文档裁定这是**有意简化**（时机驱动 → 函数顺序驱动），移植时把旧的各 GlobalRule 效果改写为 beforeStart 内的顺序步骤，仅保留 `GameStart(Before)` 等需要供技能挂载的时机触发。

### 1. 游戏目标（胜负判定）

**旧实现**（规则技能，即本节示例）：
- `game_role_gameover`（`standard/index.ts:840-961`，`trigger: ConfirmRole`）：`can_trigger` 覆盖三种终局（主公死亡 / 反贼+内奸全灭 / 仅剩内奸单挑主公），并要求 `room.players.every((v) => v.rest === 0)`（休整者不判局）；cost 中全员亮身份、按 6/8 人身份场计分（`role_rank_score`），`gameOver(...)` 的胜者集合用 `getPlayerByFilter((v) => v.role == 'fanzei', true)` 第二参含死亡者——对应文档"无论是否存活均获胜"。
- 辅助规则：`game_role_PutUpRoleCard`（`standard/index.ts:746`，ConfirmRole：死亡亮身份+内奸计分数据）与 `game_role_RewardAndPunish`（`standard/index.ts:803`，Deathed：主杀忠弃全部牌、杀反摸三，四象朱雀伤害例外）。

可能的问题：胜负判定挂在 `ConfirmRole`（确认身份时）而非死亡结算完全结束后，若未来引入死亡撤销/复活类扩展需重审时机；计分逻辑与胜负判定糅在同一效果里（数据泥团倾向），移植时建议拆分。

**新实现**：未实现。按文档"游戏结束条件与获胜判断作为规则技能加入模式专属技能"移植；新项目死亡事件已有 `DeathConfirmRole` 时机（`EventTypes.ts:171`）可对位旧 `ConfirmRole`。

### 2. 分发身份牌并分配座次序号

**旧实现**：`game_role_AssignRoles`（`standard/index.ts:371-409`）：`role_pool[人数]` 洗乱后 `pool.unshift('zhugong')`，按 players 数组序（即座次序）逐个 `setProperty('role', ...)`——**主公固定落在 1 号位**（等价实现规则"主公座次序号为 1"，省去重排座次）；主公 `setProperty('rolePut', CardPut.Up)` 正面朝上，其余默认扣置；另设 `roleList` 房间属性供 UI。座次本身在 `room.startGame` 依 seattag / randomSeat 分配。可能的问题：`AdjustSeats` 时机空转易误导；`player.setProperty('seat', player.seat)` 这类自赋值仅为触发同步，语义晦涩。

**新实现**：未实现；`PlayerState.rolePut`（`shared/core/schema/PlayerState.ts:24`）与 `Player.rolePut` 访问器（`Player.ts:95-99`）已就绪，与文档"身份牌放置方式 = PlayerState.rolePut"对应。移植时在 beforeStart 内完成"洗身份池 + 主公=1 号位 + rolePut"。

### 3. 选择武将牌

**旧实现**：`game_role_ChooseGeneral`（`standard/index.ts:412-654`）：主公先选——收集**所有** lord 武将真名（role_rank 模式截 3 个），再补 `chooseGeneralCount + 1` 张普通牌，`doRequest` 单选/双将双选；未选中的放回名池洗乱；其余玩家 `doRequestAll` **并发**询问（对应文档"暗置选择、同时亮出"）；支持 `prechooses` 预选；选择结果写 `_head/_deputy`。`gamerule_obtain_skill`（`standard/index.ts:13-54`，`trigger: ChooseGeneralAfter`）为全员发技能，`skill_name.at(0) === '~'`（主公技前缀）非主公跳过。

可能的问题：
- 主公候选为"全部主公牌 + N 张普通"而非文档的"3 张主公牌 + 2 张随机"（速览 #10）；
- **神/西势力改势力选择完全缺失**（第 4 步直接 `kingdom = head.kingdom`）；
- 旧代码 bug：其他玩家的副将登记误用主公 id——`room.recordGeneral(zhugong.playerId, result[1].id, ...)`（`standard/index.ts:646`），应为 `v.player.playerId`。

**新实现**：未实现。基础设施已备：`GeneralManager`、`Room.chooseGeneral(...)` 快捷选择（`Room.ts:702`）、`pickedGeneralNames` 防重复（`Room.ts:153`）。移植注意：按文档修正主公候选数量；补神/西改势力询问；并发询问需要 ChooseManager 支持多人同时会话。

### 4. 选择体力牌

**旧实现**：`game_role_init_property`（`standard/index.ts:657-743`，`trigger: InitProperty`）：主将（国战武将 hp×2 折算）+ 副将合计后减半取整；`player.role === 'zhugong' && room.playerCount >= 5` 时 `hp++/maxhp++`——与文档"玩家数 >4 主公 +1"一致；`inthp/shield/kingdom` 一并初始化；附四象扩展的随机神兽标记发放。问题：势力初始化与体力初始化混在一个效果中（见第 3 步的改势力缺失）。

**新实现**：未实现；Player 侧 `hp/maxhp/inthp` 等属性与 `changeMaxHp` 事件链已就绪。beforeStart 中按文档直接赋值（开局不走事件）。

### 5. 分发起始手牌

**旧实现**：`gamerule_init_handcard`（`standard/index.ts:57-106`，`trigger: InitHandCard`）：

```ts
async cost(room, data) {
    room.drawArea.shuffle();
    for (const player of room.players) {
        await room.drawCards({
            player, count: player.initHandCard,
            source: data, reason: this.name,
            triggerNot: true,          // 不触发移动时机
        });
    }
    return true;
},
```

`triggerNot: true` 正是文档"◆ 游戏开始之前得到牌，不能发动'移至目标区域前/后'技能"（夏侯惇〖清俭〗例）的实现载体；effect 步骤处理线上"手气卡"换牌（房间设置 `luckyCardCount`）。

**新实现**：未实现。`Player.initHandCardCount ?? 4`（`Player.ts:225-226`）已定义；`Room.draw()` 可用，但 `MoveCardOpts` 无 `triggerNot` 参数——新 `EventProcess.triggerNot` 是事件级属性（`EventProcess.ts:47`，为 true 时跳过 `room.event.trigger`），移植时需为开局摸牌提供抑制时机的通道（事件属性透传或专用参数），否则会违反上述规则。

### 6. 进行游戏

**旧实现**：`room.startGame` 的 do-while 主循环（`room.ts:653-737`）：额定回合默认流程由 1 号位（=主公）开始、`last.player.right` 顺延（跳过 `death && rest===0` 者），额外回合 `extraTurns.pop()`。

**新实现**：`Room._mainProcess`（`Room.ts:891-962`）+ `_getNextPlayer`（`Room.ts:968-986`，语义同旧：跳过已死且无休整者，含防死循环 safety 计数）。差异汇总：额外回合 pop→shift（速览 #9）、turnCount/turnId 语义（回合章❶）、新增 `MAX_ROUNDS` 与"存活+休整 ≤1"兜底、`mode_not_found` 即刻 gameOver。

---

## 附：本文引用的主要代码位置

| 内容 | 位置 |
|---|---|
| 新 TurnEvent/PhaseEvent | `shared/core/event/TurnEvent.ts` |
| 新时机/事件数据定义 | `shared/core/event/EventTypes.ts` |
| 新事件执行引擎 | `shared/core/event/EventProcess.ts` |
| 新主循环/开局 | `shared/core/room/Room.ts:811-1002` |
| 新模式接口 | `shared/core/room/GameMode.ts` |
| 旧回合/阶段事件 | `git show HEAD:server/src/core/event/types/event.turn.ts` |
| 旧时机枚举 | `git show HEAD:server/src/core/event/triggers.ts` |
| 旧开局事件 | `git show HEAD:server/src/core/event/types/event.ready.ts` |
| 旧主循环/空闲点分支 | `git show HEAD:server/src/core/room/room.ts`（567-737、824-840、1216-1222） |
| 旧模式接口 | `git show HEAD:server/src/core/mode/mode.ts` |
| 旧身份模式规则 | `git show HEAD:server/src/extensions/standard/index.ts` |
