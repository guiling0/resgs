# 移动/判定/拼点/状态改变/技能使用事件：新旧实现对比分析

> 分析日期：2026-07-18。
> 规则基准：`docs/events/move-card.md`、`judge.md`、`pindian.md`、`change-state.md`、`use-skill.md`。
> 旧实现：`old/resgsv1` @ HEAD `server/src/core/event/types/` 下 `event.move.ts` / `event.judge.ts` / `event.pindian.ts` / `event.state.ts` / `event.skill.ts`。
> 新实现：`shared/core/event/` 下 `MoveCardEvent.ts`（18 测试）、`JudgeEvent.ts`（7 测试）、`ChangeStateEvent.ts`（7 测试）、`UseSkillEvent.ts`；拼点**无新实现**（仅 `EventTypes.ts` 预留数据结构与时机）。

---

## 一、移动事件 MoveCardEvent

### 时机对照

| 规则时机 | 旧实现 | 新实现 |
|---|---|---|
| 确定移动的牌时 | `MoveCardFixed` | `MoveCardFixed`（`_onMoveCardFixed` 空实现扩展点） |
| 移至目标区域前❶/❷ | `MoveCardBefore1/2`（期间可 `cancle`/`preventMove`） | `MoveCardBefore1/2`（`cancel`/`preventMove`，逻辑同源） |
| 移至目标区域后❶ | `MoveCardAfter1`（`_Before` 回调执行实际移动+虚拟牌处理+动画广播） | `MoveCardAfter1`（`_onMoveCardAfter1` 执行移动+`clearMark`+`handler`+虚拟牌处理；动画 TODO Phase 9） |
| 移至目标区域后❷ | `MoveCardAfter2` | `MoveCardAfter2` |
| 结算结束后 | `MoveCardEnd` | `MoveCardEnd` |

### 旧实现要点

- `MoveData` 携带 `movetype/puttype/animation/moveVisibles/cardVisibles/label/log/viewas`；`classify()` 按 `(player, fromArea, toArea, reason, movetype, puttype, ...)` 合并同组。
- `handleVirtualCard`：装备牌进出装备区维护 `setEquip/removeEquip`；延时锦囊四分支（判定区进出记录、处理区→判定区 `vcard.set()`、判定区→判定区 `vcard.set({}, true)`、移出处理/判定区 `deleteVirtualCard`）；其他虚拟牌移到非处理区 `breakVirtualCard`。
- 派生数据类：`PutToCardsData/DrawCardsData/DropCardsData/ObtainCardsData/RecastCardsData/GiveCardsData/SwapCardsData/FlashCardsData/ShowCardsData/RemoveCardData` 统一转发 `room.moveCards`，对应规则中 reason 分类（弃置/获得/重铸/交给/交换等）。
- 查询别名：`getLoseDatas(player, pos)` 仅判断 `fromArea === player.handArea` 等（**原区域属于该玩家即算失去**）；`getObtainDatas` 仅判断 `toArea === player.handArea`。

### 新实现要点

- 结构与旧版同构：`classify/add/update/get/has/getCards/filter/getMoveCount/cancel/preventMove` 均已移植；新增 `pos`（top/bottom 插入位）、`handler`（移动后逐牌回调）、`toast`、按 reason 查询系列（`getLoseByReason/getObtainByReason` 等）。
- 处理区自动清理改为**父事件追踪**：`_onMoveCardAfter1` 中目标为处理区时调 `source._trackProcessingCard(card)`；`EventProcess.processCompleted` 将仍在处理区的追踪牌**直接 `area.move` 到弃牌堆**（不走 MoveCardEvent，注释明言"避免递归追踪"）。
- 装备/延时锦囊的玩家记录（`setEquip/setDelayedScroll` 等）为 TODO Phase 11；虚拟牌分支结构已移植（`vcard.refresh()`/`vcard.destroy`/`vcard.break`）。

### 重点：规则 vs 18 测试覆盖差距表

18 项测试清单（`shared/test/move-card.test.ts`）：1 基本移动、2 classify 合并、3 默认值、4 fromArea 过滤、5 moveType 默认、6 多玩家移动、7 getLoseDatas、8 getObtainDatas、9 查询方法、10 cancel/preventMove、11 update、12 clearMark、13 handler、14 虚拟牌、15 EventManager 工厂、16 Room/Player 快捷、17 pos=top 反转、18 同区域跳过。

| 规则条款 | 新实现状态 | 测试覆盖 |
|---|---|---|
| 五时机链 + Before1/2 取消防止 | ✅ | T1/T10 |
| 别名❶"失去手牌区里的牌"（原区域为手牌区即成立，**无论目标区域**） | ⚠️ **语义收窄**：`getLoseDatas('h')` 要求 `toType !== Hand && toType !== Equip`，且按**区域类型**而非目标区域所属玩家判断 → A 交给 B 手牌（`Hand→Hand`）不判为 A 失去，〖连营〗〖伤逝〗在"交给"场景漏触发 | T7 仅测手牌→弃牌堆 |
| 别名"得到此牌"（目标为其手牌区即成立） | ⚠️ 额外要求 `fromPlayer !== player`：自己装备区→自己手牌不算获得（旧版无此限制，与规则一致） | T8 仅测弃牌堆→手牌 |
| 别名❶❷前后版（before1/2、after1/2 各自成立） | 查询方法与时机正交，语义靠触发时机区分 ✅ | 未按时机分别测 |
| Before2 后固定规则：浮雷弃"霹雳"/敕令改府库/衍生牌消失 | 未实现（M4/M6 随卡牌；`derived` 字段已预留） | 无 |
| 固定规则：正/背面移动+目标区域默认放置 | `moveType` 默认沿用 `card.put`、`putType` 默认 `getDefaultPut` ✅ | T3/T5 |
| 固定规则：虚拟牌四分支 | 结构移植 ✅；处理区→判定区"花色点数改为实体牌的"依赖 `vcard.refresh()` 正确性（文档标注待核对） | T14 仅测普通虚拟牌保留/切断，**延时锦囊四分支无测试** |
| 固定规则：维系区域设定 | 未实现（无维系区域概念） | 无 |
| After2 可操作性约束（仍在目标区域且未移动过） | `isLast()` TODO Phase 6 恒返回 false ⚠️ | 无 |
| After2 后：金蝉脱壳摸牌 | 未实现（随卡牌） | 无 |
| After2 后：原区域为弃牌堆则清除流程信息 | 移动时 `clearMark` 全清（**强于规则**：任何移动都清、A1 时点即清） | T12 |
| 处理区自动清理（因事件 A 置入弃牌堆） | `processCompleted` 直接 `area.move` ⚠️ 规则上这是一次**移动事件 C**，应能触发〖连营〗〖伤逝〗等"失去/移至弃牌堆"时机；直接搬运使处理区牌入弃牌堆**不产生任何时机** | 无专测 |
| 技能使用事件清理时点=即时类效果完毕之前 | `UseSkillEvent._finalize → processCompleted` 在 Effect 时机后执行，时点近似成立；精确语义见 pending-impl | 无 |
| 同时移动多张牌分组/逐牌规则 | `classify` ✅ | T2/T4/T6 |
| 多张置于牌堆顶/底顺序**由移动者决定** | `pos='top'` 固定反转，无询问 ⚠️ | T17（仅验证反转） |
| 牌面信息基准=原区域里的牌面信息 | 未实现（移动无原区域快照，〖决死〗类判定依据缺失） | 无 |
| 改目标区域不变操作者/reason | `update` 保留 ✅ | T11 |
| reason 九分类强类型 | reason 为自由 `string`（'put'/'discard'/'pindian'…约定字符串），旧版有 `MoveCardReason` 枚举 ⚠️ 回退为弱类型 | T3 仅验证默认 'put' |

小结：**时机骨架与数据操作 API 完整且测试充分；差距集中在（a）失去/得到别名语义偏差（连营类技能的判定基础）、（b）处理区清理不走移动事件、（c）After2 可操作性约束、（d）Before2 后固定规则群与牌面信息基准。**

### 技能例：〖连营〗lianying（`standard/generals/wu/luxun.ts`）

旧写法：`trigger: EventTriggers.MoveCardAfter2`，`can_trigger` = `isOwner(player) && data.has_lose(player, 'h') && !player.hasHandCards()`，`forced: 'cost'`（锁定技），cost 中 `room.drawCards({player: from})`。
新移植映射：`TimingName.MoveCardAfter2` + `event.hasLose(player, 'h')` + 摸牌事件（已有）。**阻塞点**：`getLoseDatas('h')` 语义差距（上表）——"交给"场景（如刘备仁德交出最后手牌）会漏触发，移植前须修正。

---

## 二、判定事件 JudgeEvent

### 时机对照

| 规则时机 | 旧实现 | 新实现 |
|---|---|---|
| 判定时 | `Judge`（`_After`：`getNCards` → `moveCards` 处理区 reason=Judge → `setCard` → delay） | `Judge`（`_onJudgeAfter`：`getNCards` → `putTo(Processing, 'judge')` → `setCard`；delay TODO） |
| 成为判定牌后 | `BeJudgeCard` | `JudgeCard` |
| 判定结果确定前 | `JudgeResult1` + `JudgeResult2` | 同名保留（**裁定 R5**：Result1=改判换牌〔鬼才/鬼道〕，Result2=只改结果不换牌〔预留〕） |
| 判定结果确定后❶ | `JudgeResulted1`（`_Before` 重算 `success` + 结果动画） | `JudgeResultAfter1`（`_onJudgeResultAfter1Before` 仅 TODO 动画，**不重算 success**） |
| 判定结果确定后❷ | `JudgeResulted2` | `JudgeResultAfter2` |
| 结算结束后 | `JudgeEnd`（`processCompleted`：`notMoveHandle` 检查 → 判定牌处理区→弃牌堆 → opens drain） | `JudgeEnd`（收尾由基类 `_processingCards` 自动清理；`notMoveHandle` 未移植） |

### 差异与裁定

1. **结果=虚拟牌数据**：两版一致。旧 `createVirtualCardByOne(card, false).vdata`；新 `card.formatVirtualCardData()`。与规则实现注（后续有"只改结果"技能）吻合。
2. **success 重算时点**：旧在 `JudgeResulted1_Before` 兜底重算 `success = isSucc(result)`；新只在 `setCard`/`resetSuccess` 计算。若技能在 Result1/2 期间只改 `result` 数据而忘调 `resetSuccess`，新版不会兜底 ⚠️（建议在 JudgeResultAfter1 前补一次重算，与旧版对齐）。
3. **setCard**：两版逻辑相同（旧牌若仍在处理区先入弃牌堆 → 换牌 → 建虚拟牌数据 → 算 success）；新版多了 `this.card !== card` 防自替换判断。
4. **收尾**：旧 `processCompleted` 显式将判定牌移入弃牌堆并支持 `notMoveHandle` 跳过；新依赖基类处理区追踪清理——牌已被技能拿走（不在处理区）时自然跳过，覆盖〖鬼道〗获得旧判定牌场景 ✅；但清理不走移动事件（同移动事件差距 b）。

7 项测试（`shared/test/judge.test.ts`）：基本流程、setCard 改判、isSuccess、resetSuccess、EventManager 工厂、Room/Player 快捷、死亡 check。

### 技能例：〖鬼才〗guicai（`standard/generals/wei/simayi.ts`）与〖鬼道〗guidao（`shenhua/generals/feng/zhangjiao.ts`）

- 鬼才：`trigger: JudgeResult1`；`can_trigger` 要求 `player.hasCardsInArea()`；skill_cost 选择器选一张**手牌**（`canPlayCard` 过滤）；cost 走 `room.playcard({..., notMoveHandle: true})`（打出事件，牌留在处理区）；effect 中 `data.setCard(play.card.subcards[0])`。
- 鬼道：同时机；差异——选牌范围 `getSelfCards()`（手牌+装备区）且限**黑色**；effect 中**先** `obtainCards` 获得旧判定牌**再** `setCard`。新版 `setCard` 的"旧牌仍在处理区才入弃牌堆"检查天然兼容此顺序 ✅。
- 移植依赖：**打出事件 PlayCardEvent 未实现（M4）**；`canPlayCard`、`notMoveHandle` 语义需随打出事件落地。`setCard`/`JudgeResult1` 侧新实现已就绪。

---

## 三、拼点事件 PindianEvent（未实现 → 移植清单）

新项目现状：`shared/core/event/` **无 PindianEvent.ts**；`EventTypes.ts` 已预留 `PindianEventData`（`player/targets/cards: Map<Player, GameCard>/card_limits/reqOptions/settleTarget/settleWinner/settleLoser/settleResults`）与 4 个时机（`Pindian/PindianCardShow/PindianResult/PindianEnd`，均已挂 `TimingsToEventType` 映射）。数据结构比旧版更完善：旧版每对结算覆写单一 `this.win/this.lose`，多目标下后一对覆盖前一对；新 `settleResults: Map<Player, {winner, loser}>` 按目标留档。

### 移植清单（按旧 `event.pindian.ts` 逐项）

| # | 项目 | 旧实现依据 | 新项目落点/依赖 |
|---|---|---|---|
| 1 | 事件类与时机链 | `eventTriggers=[Pindian, PindianShow]`，结算时逐目标 `this.insert([PindianResulted])` 动态插入 | `EventProcess.insert` 已具备；时机名用 `PindianResult` |
| 2 | check | from 存活；targets 过滤（存活、≠from、`hasHandCards()`）；`from.canPindian(targets, reason)` | 无手牌不能发起（规则◆）；canPindian 状态效果待技能系统 |
| 3 | init | 多目标 `sortResponse`；`cards` Map 补齐发起者与各目标的空位；拼点弹窗 window + 战报 | `PlayerManager.sortResponse` 已有；弹窗/战报 Phase 9 |
| 4 | Pindian_After 选牌 | `doRequestAll` **并行**询问所有未定牌者（默认 `choose_pindian` 选择器，可被 `selectors` Map 按角色覆盖——供〖涉猎〗类技能改选牌来源）；然后**一次 moveCards 同时扣置入处理区**（`reason: Pindian`、`puttype: Down`、无动画） | 并行询问走 ChooseManager（M4）；moveCards `reason='pindian'`、`putType=false`。移动经处理区自动被父事件追踪 |
| 5 | 维系区域=处理区 | 旧版无显式实现 | 裁定：命名牌"拼点牌"基于**卡牌标记**实现，移动即失效（pindian.md 实现映射） |
| 6 | PindianShow_Before 亮出 | 逐牌 `turnTo(Up)` + setLabel + 战报 + 刷新窗口；随后逐目标 insert 结算时机 | 亮出归拼点事件（裁定 R3），**不走 ChangeStateEvent**；触发 `PindianCardShow` 时机（〖伤逝〗响应拼点牌入处理区靠移动事件，与本时机无关） |
| 7 | PindianResulted_Before 判定胜负 | 先查 `getStates(Regard_PindianResult, [cards, reason])` 取**最后一个**非空覆盖（返回单角色=该角色赢；返回数组=数组内者未赢；空数组=均未赢）；无覆盖则点数比较，**点数钳位 1..13**（>13 按 13、<1 按 1）；大者赢、相同均未赢 | 状态效果覆盖待技能系统；点数钳位须保留；结果写入 `settleTarget/settleWinner/settleLoser` 并归档 `settleResults` |
| 8 | setCard(player, card) | 更换某角色的拼点牌（改拼点牌类技能入口） | 直接移植 |
| 9 | processCompleted 收尾 | `notMoveHandle`（bool 或函数）跳过；否则将各仍在处理区的拼点牌 `moveCards` 入弃牌堆（reason=process，**走移动事件**） | 新基类 `_processingCards` 自动清理可覆盖"牌已被拿走则跳过"；但基类清理**不走移动事件**——拼点牌入弃牌堆的时机（规则例：拼点牌置入弃牌堆后〖礼让〗类）会缺失，与移动事件差距 (b) 同源，需统一决策 |
| 10 | 多目标同一张牌 | `cards: Map` 发起者固定一张，逐对结算 | `PindianEventData.cards` 已同构 |
| 11 | 动画/弹窗 | windowId、PindianWin/Lose 卡牌动画、delay(3) | Phase 9 通讯模块 |

规则细节补充（旧版未覆盖、新版实现时应补）：合法目标"从当前回合角色开始按逆时针编号 T1..Tn"（旧版用 sortResponse，语义一致需确认排序起点）；默认目标数上限 1。

---

## 四、状态改变事件 ChangeStateEvent 与明置

### 结构对照

| 维度 | 旧实现 | 新实现 |
|---|---|---|
| 类结构 | 抽象 `StateChangeEvent` + 6 子类（`OpenEvent/CloseEvent/ChainEvent/SkipEvent/ChangeEvent/RemoveEvent`），子类覆写 `StateChanged_Before` | 单类 `ChangeStateEvent<T>` + `detectChangeStateType` 按数据形状推断（`toGeneral`→Change、`general`→Remove、`damageType`→Chain、`toState+generals`→Open/Close、`toState`→Skip） |
| 时机 | `StateChange → StateChanged → StateChangeEnd` | `ChangeState → ChangeStateAfter`；**无 End 时机** ⚠️ |
| 前❶/前❷ | 未区分（单 StateChange） | 裁定 R4：合并为单一 `ChangeState`（数据类型可判别），不扩枚举 |
| prevent | 仅 StateChange 时机可防止 | 同 ✅ |
| Chain/Skip | `to_state ?? !player.chained` 取反、相同则 check 失败 | `_checkToggle` 同逻辑 ✅ |
| Open/Close check | `getCanOpenGenerals` 过滤后须**全数**合法 | `_checkGeneralFilter` 同逻辑 + `count > 0` ✅ |
| Change/Remove | 完整：技能移除/获得、士兵牌替换、`recordGeneral`、Remove 禁君主/士兵牌 | `_setPlayerGeneral` 换牌 + 士兵牌 id；技能增减 TODO Phase 8；**Remove 未禁君主/士兵牌** ⚠️ |

7 项测试（`shared/test/change-state.test.ts`）：detect 检测、Chain、Skip、Open、Close、prevent、EventManager 工厂。

### 重点：明置事件 R2 裁定路径

规则要求（change-state.md）：明置四流程（有消耗触发技→声明+定消耗细节→**明置→势力确定→执行消耗**；无消耗；阵法召唤；其他）；**"明置后"（Open）延迟生成**——在产生明置的事件流程结束之前、处理区清理移动事件之后，按当前回合角色逆时针序逐个生成，已死亡者跳过。

三方路径对比：

| 环节 | 旧实现 | 新实现现状 | R2 裁定目标 |
|---|---|---|---|
| 技能发动引起的明置 | `UseSkillEvent.init` 中非 Secret 技能对 head/deputy 各调 `room.open()` → **OpenEvent 完整事件**（reason='useskill'） | `UseSkillEvent` 步骤 3 **直接 `turnTo(true)`**，不建事件、不进队列 → 〖闺秀①〗等"明置后"技能**收不到时机** ⚠️ | UseSkillEvent 改走 open 方法调用 ChangeStateEvent（待落实，暂不改代码） |
| 明置操作本体 | `OpenEvent.StateChanged_Before`：`setProperty(headOpen/deputyOpen)` + 战报 + **遍历 room.skills 对该武将 `skill.handle()`**（刷新技能可用性）+ `room.opens.push(this)` | `_applyOpen`：`generals.turnTo(true)` + `room.deferredOpens.push(this)`；**无 skill.handle 等价步骤**（技能刷新待 Phase 8） | 事件内部完成属性修改 + **规则技能提供的势力确定** + 注册 deferredOpens |
| "明置后"drain 时点 | 各事件 `processCompleted` 中 `room.events.length === 0` 时 `while shift room.opens → trigger(Opened, open)` | `EventProcess.processCompleted` 中 `eventStack.length === 0` 时 `while shift deferredOpens → trigger(TimingName.Open, open)` — **机制同旧版** | drain 处遍历并**直接触发 Open 时机** ✅ 现路径已如此 |
| drain 时点 vs 规则 | 两版均为"**全部事件结束**"时；规则为"产生明置的事件 A 流程结束之前"——嵌套事件场景下两版一致地**滞后**（A 为子事件时要等最外层结束）。change-state.md 认定"机制吻合" | 同左 | — |
| drain 顺序/过滤 | FIFO（push 顺序），未按逆时针排序、未跳过死亡者 | 同旧版 FIFO；**排序/过滤待实现**（change-state.md 明记） | 从当前回合角色逆时针 + 死亡跳过 |
| 势力确定/野心家/君主替换/珠联璧合/阴阳鱼/先驱 | 未见于核心事件（散在国战扩展） | 未实现 | 国战规则技能（远期） |

结论：新实现的 deferredOpens 骨架与旧版 opens 队列同构、与 R2 目标一致；**当前唯一断裂点是 UseSkillEvent 的直接 `turnTo(true)`**（明置不产生事件、不进队列），其次是 drain 排序/死亡过滤与势力确定未落。

### 技能例：〖闺秀〗guixiu（`wars/generals/power/mifuren.ts`）

- 效果①：`trigger: EventTriggers.Opened`（明置后）+ `data.generals.includes(sourceGeneral)` → 摸 2（forced）。新映射：`TimingName.Open`——**依赖 R2 落实**，否则技能发动引起的明置永远不触发它。
- 效果②：`trigger: StateChange`（RemoveEvent、移除的是本武将牌）→ cost 中 `addEffect('guixiu.delay')` 注册延时效果；`guixiu_delay` 在 `StateChanged` 回复 1 点体力，并用 `lifecycle: StateChangeEnd` 兜底自清。新映射：`ChangeState`（R4 合并后用 `data.is(Remove)` 判型）+ `ChangeStateAfter`；**`StateChangeEnd` 在新版不存在**——delay 效果的兜底清理需改用其他机制（如一次性 refresh 或事件引用比对）⚠️ 移植注意点。

---

## 五、技能使用事件 UseSkillEvent

### 流程对照（旧 `event.skill.ts` init → 新 `exec()`）

| 步骤 | 旧实现 | 新实现 |
|---|---|---|
| 选择结果注入 | 解析 `req.result`，按询问类型提取 `context.cards/targets`；补 from/maxTimes 默认值 | choose 回调返回值 + ChooseManager ID 还原（选择先于事件） |
| 目标排序 | `data.auto_sort` 时 `sortResponse` | `settings.sort !== false` 时 `sortResponse` ✅ |
| choose | `data.choose.call(...)` falsy 终止（不发动） | 同 ✅（`_finalize` 保证栈清理） |
| 明置 | `room.open()` 走明置事件（见第四节） | 直接 `turnTo(true)` ⚠️ R2 待改 |
| 历史 | `insertHistory` | 同 ✅ |
| 动画/配音/战报/指向线/阵法/化身 | priorityType < 3 内联广播；限定/觉醒全局动画+delay；`auto_directline`；阵法 queue/siege 动画；国战化身耦合（huashen 数据+化身牌展示与弃置） | TODO 通讯模块；限定/觉醒仅 `setMark('@limit:...'/'@awake:...')`；化身未移植（国战远期） |
| cost | `data.cost.call(...)` falsy 不发动；`used=true`；`trigger(BeCost)` | 同：cost falsy → `_finalize` 返回；`used=true`；`trigger(TimingName.Cost)` ✅ |
| effect | `data.effect.call(...)`；`trigger(BeEffect)` | 同；`trigger(TimingName.Effect)` ✅ |
| 收尾 | 无显式（EventProcess 通用） | `finally _finalize`：`_currentEffect` 栈 pop + `processCompleted`（异常安全，优于旧版） |

规则四要点核对：同时性（声明+目标+消耗同一询问）——由 skill_cost 选择器随发动询问一并下发，两版一致；消耗原子性——单消耗下天然成立（用户裁定）；发动判定点（消耗完毕即 `used=true`）✅；效果过滤（不能执行的效果跳过）——由 effect 回调内部自理。

### 技能例：〖裸衣〗luoyi（`standard/generals/wei/xuchu.ts`）

`trigger: DrawPhaseProceeding`（阶段时机，非本五事件）、`forced: 'cost'`（强制发动，规则"（可）"之外的锁定路径）；cost 中直接改 `data.ratedDrawnum--`（修改摸牌阶段事件数据）返回 true → `used=true`；effect 中 `addEffect('luoyi.delay')` 注册跨事件延时效果并记录回合。展示 UseSkillEvent 的 cost/effect 两段结构、forced 语义与"效果=修改父事件数据+挂延时效果"两种典型形态；移植依赖 PhaseEvent 的 `ratedDrawnum` 与 addEffect 机制。

---

## 六、技能例移植总表

| 技能 | 时机映射（旧→新） | 阻塞依赖 | 备注 |
|---|---|---|---|
| 〖连营〗lianying | `MoveCardAfter2` → 同名；`has_lose(p,'h')` → `hasLose(p,'h')` | `getLoseDatas('h')` 语义差距（交给他人手牌漏判） | 摸牌事件已有，修语义后可移植 |
| 〖鬼才〗guicai | `JudgeResult1` → 同名 | 打出事件 PlayCardEvent（M4）、canPlayCard | `setCard` 已就绪 |
| 〖鬼道〗guidao | `JudgeResult1` → 同名 | 同上 + obtainCards + getSelfCards | 先 obtain 后 setCard 顺序与新 setCard 兼容 |
| 〖闺秀〗guixiu | `Opened` → `Open`；`StateChange/StateChanged/StateChangeEnd` → `ChangeState/ChangeStateAfter/无` | R2 落实（否则技能明置不触发 Open）；`StateChangeEnd` 缺失需替代清理机制 | 摸牌/回复事件已有 |
| 〖裸衣〗luoyi | `DrawPhaseProceeding`（阶段时机） | PhaseEvent.ratedDrawnum、addEffect 延时效果机制 | 独立于本五事件，验证 UseSkillEvent cost/effect 通路 |

## 七、跨事件共性问题清单（优先级建议）

1. **高**：UseSkillEvent 明置改走 ChangeStateEvent + deferredOpens（R2 裁定，已确认待落实）——闺秀①、国战全部"明置后"技能的前提。
2. **高**：`getLoseDatas`/`getObtainDatas` 别名语义对齐规则（按目标区域**所属玩家**而非区域类型判断；获得不排除自装备区来源）——连营/伤逝类大量 After2 技能的判定基础。
3. **中**：处理区自动清理与拼点/判定收尾改走（或可选走）移动事件，使"因事件 A 移至弃牌堆"产生可响应时机——涉及 `EventProcess.processCompleted` 的 `area.move` 直搬。
4. **中**：JudgeResultAfter1 前补 success 兜底重算（与旧版对齐，防技能改 result 后漏调 resetSuccess）。
5. **中**：拼点事件整体移植（第三节清单；数据结构与时机已预留，核心缺事件类与选牌询问）。
6. **低**：deferredOpens drain 排序（逆时针）与死亡过滤；`ChangeStateEnd` 时机取舍（规则"暂无作用"，但旧技能用作 lifecycle 清理锚点）；Remove 禁君主/士兵牌校验；reason 强类型枚举恢复。
