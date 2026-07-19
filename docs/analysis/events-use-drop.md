# 使用/打出事件 新旧实现对比分析

> 分析日期：2026-07-18
> 规则基准：`docs/events/use-card-and-need.md`、`docs/events/use-card.md`、`docs/events/drop-card.md`
> 旧实现：`old/resgsv1` git HEAD — `server/src/core/event/types/event.use.ts`、`event.play.ts`、`server/src/core/event/triggers.ts`
> 新实现：`shared/core/event/EventTypes.ts`、`shared/core/event/EventProcess.ts`
> 技能例：旧 `server/src/extensions/standard/generals/shu/machao.ts`（铁骑）、`liubei.ts`（激将）、`guanyu.ts`（武圣）

---

## 1. 总览

| | 旧项目 | 新项目 |
|---|---|---|
| 事件类 | 三个子类：`UseCardEvent`（角色目标）/ `UseCardToCardEvent`（牌目标：闪/无懈/金蝉）/ `UseCardSpecialEvent`（判定阶段延时锦囊生效）+ `PlayCardEvent` | **未实现**——`shared/core/event/` 下无 UseCardEvent.ts / DropCardEvent.ts |
| need/pre | `NeedUseCardData` / `PreUseCardData` / `PreSameUseCardData` / `NeedPlayCardData` / `PrePlayCardData`（EventData 子类，非独立事件；流程在 `room.needUseCard/preUseCard` 等方法中） | 仅 `NeedUseCardData` / `NeedDropCardData` 接口（EventTypes.ts:549-606），流程未实现 |
| 数据结构 | class（带 `has()`、`get_prompt()`、`handleUse()` 方法） | 纯 interface：`UseCardEventData` / `UseCardToCardEventData` / `UseCardSpecialEventData` / `DropCardEventData`（EventTypes.ts:321-404） |
| 时机 | `EventTriggers` 枚举（triggers.ts:69-94），事件类内以 `[`${EventTriggers.X}_After`]()` 方法名约定挂钩子 | `TimingName` 枚举（EventTypes.ts:79-105）+ `Timing{name,before,after}` 对象由 `EventProcess.triggerFunc` 顺序执行 |
| 设计决策 | 三子类分流程 | 文档决策**统一为单一 UseCardEvent**，时机构建时按牌类型动态生成序列。⚠️ 但 EventTypes.ts 的 `EventType` 仍保留 `UseCard/UseCardToCard/UseCardSpecial` 三类型且 `TimingEventMap` 按三类型联合映射（EventTypes.ts:684-726）——数据层尚未与该决策对齐 |

## 2. 时机对照表

| 规则名 | 旧 EventTriggers | 新 TimingName | 备注 |
|---|---|---|---|
| 需要使用此牌时❶/❷/❸ | `NeedUseCard1/2/3` | `UseCardNeed1/2`（**无 need3**） | 新项目决策 need3 并入 need2；旧项目 need3 实际在用（武圣） |
| 声明使用牌（动作） | 无 | `UseCardDeclare` | 新增拆分 |
| 声明使用牌后 | `DeclareUseCard` | `UseCardDeclareAfter` | |
| 选择目标后 | `ChooseTarget` | `UseCardChooseTarget` | 新注释为"选择使用牌目标"，与规则名"选择目标后"需核对 |
| 牌被使用时 | `CardBeUse` | `UseCardUsed` | |
| 指定目标时/成为目标时 | `AssignTarget` / `BecomeTarget` | `UseCardAssignTarget` / `UseCardBecomeTarget` | 逐目标动态生成 |
| 指定目标后/成为目标后 | `AssignTargeted` / `BecomeTargeted` | `UseCardAssignTargetAfter` / `UseCardBecomeTargetAfter` | 同上 |
| 使用结算准备工作结束时 | `UseCardReady` | `UseCardReady` | |
| 对当前目标使用结算开始时 | `CardEffectStart` | `UseCardEffectStart` | |
| 对当前目标生效前 | `CardEffectBefore` | `UseCardEffectBefore` | 响应窗口 |
| 被抵消后 | `BeOffset` | `UseCardOffset` | |
| 对当前目标生效时/后 | `CardEffect` / `CardEffected` | `UseCardEffect` / `UseCardEffectAfter` | |
| 使用结算结束后❶❷❸ | `UseCardEnd1/2/3` | `UseCardEnd1/2/3` | |
| 需要打出牌时❶/❷/❸ | `NeedPlayCard1/2/3` | `DropCardNeed1/2`（无 need3） | |
| 声明打出牌 | 无 | `DropCardDeclare` | 新增；规则文档映射表未列 |
| 牌被打出时 | `CardBePlay` | `DropCardDroped` | 新注释误写"打出牌后" |
| 打出结算结束后 | `PlayCardEnd` | `DropCardEnd` | |

⚠️ 规则文档 `use-card.md` 第（2）段"选择目标后"标注的代码为 `usecard_assign_target_after`，与第（6）段"指定目标后"重复——应为 `usecard_choose_target` 的笔误，移植时以 TimingName 枚举为准核对。

---

## 3. 分时机对比

### 3.1 need / pre（需要使用牌、预使用牌）

**旧实现**：非独立事件。`NeedUseCardData`（event.use.ts:44-78）持有 `from / cards:{name,method}[] / targetSelector / reqOptions / used / playphase_skills / effectTimes / useNow`，提供 `has(name,method)` 检测。`PreUseCardData`（event.use.ts:80-239）额外持有 `can_use_cards / can_use_skills / card / targets / cardSelector`（实体牌选择标准，缺省=手牌区一张同名牌）、`targetSelector`（提供则默认跳过次数检测）、`cancel`，并内置 `get_prompt()`（濒死求桃 / 杀求闪 / 三种无懈场景的专用提示）与 `handleUse()`（cancel 则返回 false，否则执行 `used` 事件）。另有 `PreSameUseCardData`（多人同时询问，如无懈）。流程入口为 `room.needUseCard / needUseCardSame`（room.ts:841/905/918 等调用点）。

**新实现**：仅 `NeedUseCardData` 接口（EventTypes.ts:549-585），字段含 `player / cards / response / useCardEventData / immediateSettle` 等，`card_limits / target_limits / skills` 注释标明"暂时未实现"。TimingDataMap 已把 `UseCardNeed1/2` 绑定到该数据（EventTypes.ts:817-818）。`Effect.isViewAsOrPlayPhase`（shared/core/skill/Effect.ts:88-96）已引用 need1/2 时机为视为技预留。**无 PreUseCardData 对应物、无询问流程**。按 `use-card-and-need.md` 第五节，整个 need/pre 链路将在 M2 重设计（cardSelector、杀次数、按钮式 need2 均未实现）。

**技能例：〖激将〗（旧 liubei.ts）**——need2 询问式接管使用流程：

```ts
trigger: EventTriggers.NeedUseCard2,
can_trigger(room, player, data) {
    ... data.is(sgs.DataType.NeedUseCardData) && data.from === player && data.has('sha') ...
},
async effect(room, data: PreUseCardData, context) {
    room.deleteVirtualCard(data.card);
    data.used.card = undefined;
    for (const player of players) {           // 其他蜀势力逐个询问
        const play = await room.needPlayCard({ from: player, cards: ['sha'], ... });
        if (play) { data.used.card = room.createVirtualCardByData(play.card.vdata); break; }
    }
    if (!data.used.card) data.cancel = true;  // 无人代打 → 取消预使用
}
```

要点：need2 技能在 `PreUseCardData` 上工作——替换 `data.used.card`、置 `data.cancel`，即"步骤未履行=视为未发动"由 pre 数据的 cancel 语义承载。

**技能例：〖武圣〗（旧 guanyu.ts）**——need3 选牌标准类（新项目将并入 need2 按钮式）：

```ts
trigger: EventTriggers.NeedUseCard3,   // 另一效果挂 NeedPlayCard3（打出侧）
getSelectors: ... room.createChooseCard({ selectable: from.getSelfCards(),
    filter: (item) => item.color === CardColor.Red,
    onChange(type, item) { if (type==='add') sha.addSubCard(item); ... this._use_or_play_vcard = sha; } })
async cost(room, data, context) { return true; }
```

要点：旧 need3 技能只做一件事——把选中的红色实体牌塞进虚拟杀（`_use_or_play_vcard`），无 effect。证明旧项目 `NeedUseCard3/NeedPlayCard3` **实际在用**，与 `use-card-and-need.md` 中"旧项目注册为 usecard_need3 但无用"的表述不符；新项目移植武圣时须走"need2 按钮式 = 不发动need1 + 选此技能 + 定选牌标准"的合并方案。

### 3.2 声明 ~ 预结算（declare → ready）

**旧实现**（UseCardEvent，event.use.ts:347-501）：
- `init()`：查 `card_skill = sgs.getCardUse(name, method)` → 重置全员 `skipWuxie` → `insertHistory` → 初始时机序列 `[DeclareUseCard, ChooseTarget, CardBeUse, UseCardReady]` + 结束序列 `[UseCardEnd1..3]`。指向线/语音动画广播 → `card_skill.onuse` → **实体牌 moveCards 入处理区**（reason: Use；无实体牌时仅广播动画）→ 目标列表生成（`addTarget` 逐个建 `TargetListItem{index自增, target, generator:None, invalid, offset, subTargets, wushuang, effectTimes}`）。
- 动态四段：`CardBeUse_After` 起以 `generatorReady(trigger)` 逐目标插入时机——取 `targetList` 中 `generator !== trigger` 的第一个目标 → `insert([trigger])` → `current = target`；每个 `_After` 里 `sort()` 重排（sortResponse 或 sortClockwise），全部目标的 generator 到位后进入下一段（AssignTarget → BecomeTarget → AssignTargeted → BecomeTargeted）。`generator` 字段即规则的"未生成过此步骤时机"检测，中途 `becomTarget/transferCurrent` 插入的新目标（generator=None）自然被补生成。
- `UseCardReady_After`：死亡目标 `removeTarget` → 延时锦囊：实体牌入目标判定区、`card.useFrom = from`、`isEnd=true`（无目标则 `deleteVirtualCard`）；装备：同花色旧装备入弃牌堆 + 新牌入装备区 + `deleteVirtualCard` + `isEnd=true`；其他牌：`sort()` 后 `generatorEffect()` 进入主结算。
- 目标操作集：`addTarget / removeTarget / sort / invalidCurrent / invalidTargets / cancleCurrent`（仅 BecomeTarget/AssignTarget 时机可取消，同时 `triggerable=false` 终止当前时机）/ `cancle / transferCurrent`（=cancleCurrent+addTarget+sort）/ `becomTarget / targetCantResponse`。
- `UseCardToCardEvent`（event.use.ts:937-1137）：固定序列 `[DeclareUseCard, CardBeUse, UseCardReady, CardEffectStart, CardEffectBefore, CardEffect, CardEffected]`——无 ChooseTarget、无 assign/become 四段；规则"闪/无懈/金蝉 (1)~(7) 技能不能发动"靠子类刨除时机 + 各技能 can_trigger 里的事件类型检查实现。

**新实现**：`UseCardEventData.targetList`（EventTypes.ts:346-355）字段与旧 `TargetListItem` 一一对应（index/target/subTargets/generator/invalid/offset/wushuang/settleCount），`generator` 类型改为 `TimingTrigger`，`offset: any` 注释"任何一个事件"。改名：`effectTimes→settleCount`、`baseDamage→damageBase`、`baseRecover→recoverBase`；`settleTarget?: number` 替代旧 `current` 引用。**时机构建、目标动态生成、targetList 操作集均未实现**。新 `EventProcess` 基类已具备等价机制：`insert(timings, appoint?)` 支持动态插时机、`triggerNot/triggerable` 两个跳过语义、`_trackProcessingCard` + `processCompleted` 自动把处理区的牌清入弃牌堆。

**技能例：〖铁骑〗（旧 machao.ts）**——挂"指定目标后"逐目标时机：

```ts
trigger: EventTriggers.AssignTargeted,
can_trigger(room, player, data: UseCardEvent) {
    return this.isOwner(player) && data.card.name === 'sha' && data.from === player;
},
context(room, player, data: UseCardEvent) {
    return { targets: [data.current.target] };   // 当前逐个结算到的目标
},
async cost(room, data, context) {
    return await room.judge({ player: from, isSucc: (r) => r.color === CardColor.Red, ... });
},
async effect(room, data: UseCardEvent, context) {
    if (judge?.success) await data.targetCantResponse([target]);
}
```

要点：逐目标时机中技能通过 `data.current` 取"当前目标"；`targetCantResponse` 加入 `cantResponse` 列表后，主结算的响应触发会过滤这些角色（见 3.3）。新项目 `UseCardEventData` 尚无 current/cantResponse 对应字段（settleTarget 为 index 形式），移植时需补齐。

### 3.3 主结算循环（effect_start → effect_before → [offset] → effect → effect_after）

**旧实现**（event.use.ts:671-754）：
- `generatorEffect()`：取 `generator !== CardEffectStart && !invalid` 的第一个目标插入 `CardEffectStart`，实现规则"循环点 A→B"逐目标推进；循环点 A 的无效检查即 `!v.invalid` 过滤（无效目标不生成"使用结算开始时"）。
- `CardEffectStart_After`：`current.invalid`（第一次无效判断后）→ 直接下一个目标；否则 `insert([CardEffectBefore])`。
- `CardEffectBefore_Before`：`triggerNot = true` 并**手动** `room.trigger(CardEffectBefore, this, playerAlives 排除 cantResponse)`——即响应窗口不走事件自身的自动 trigger，以便控制可响应者名单。
- `CardEffectBefore_After`：有 `current.offset` 时先查 wushuang——`current.wushuang` 含使用者且牌为杀 → 移除一个标记、清空 offset、**重新插入 CardEffectBefore**（= 规则"依次使用两张闪"的第二个生效前）；否则 `insert([BeOffset])` → `BeOffset_After` 里结束当前目标转下一个。无 offset → `insert([CardEffect, CardEffected])`。
- `CardEffected_After`：执行 `this.effect ?? card_skill.effect`（事件级 effect 字段允许技能改写牌面效果）→ 下一个目标。

**新实现**：`TimingName.UseCardEffectStart/EffectBefore/Offset/Effect/EffectAfter` 枚举与 `TimingEventMap` 映射已定义（三类使用事件共用，EventTypes.ts:695-714），循环逻辑未实现。`UseCardEventData` 保留 `targetList[].wushuang` 与 `offset` 字段，具备承载无双二闪逻辑的数据位。

**技能例**：同〖铁骑〗——其 `targetCantResponse` 的语义完全依赖 `CardEffectBefore_Before` 的"手动 trigger + cantResponse 过滤"实现，移植主结算时此耦合必须一并还原。

### 3.4 收尾（end1-3 与虚拟牌清理）

**旧实现**：`endTriggers = [UseCardEnd1, UseCardEnd2, UseCardEnd3]` 三个收尾时机；`processCompleted()`（event.use.ts:756-764）中**仅基本牌/普通锦囊** `deleteVirtualCard`（= 规则"虚拟牌消失+对应关系中断"）；装备在 ready 段已删、延时锦囊保留虚拟牌与对应关系（`card.useFrom` 记录使用者供 UseCardSpecialEvent 计分/追责）。
`UseCardSpecialEvent`（event.use.ts:1140-1306）：判定阶段延时锦囊生效流程，单目标 `TargetListItem`，序列 `[CardEffectStart, CardEffectBefore, CardEffect, CardEffected]`（无 declare/used/assign/become——符合规则"特殊使用流程跳过预结算"），可被无懈 offset。

**新实现**：`UseCardEnd1/2/3` 时机已定义；`EventProcess.processCompleted` 已有处理区清牌通用机制，但虚拟牌生命周期管理（deleteVirtualCard 对应物）未实现。

### 3.5 打出牌（DropCard）

**旧实现**（event.play.ts）：`NeedPlayCardData`（cards 为 string[]，不提供则可打出所有牌）/ `PrePlayCardData`（有 `cardSelector`、`cancel`、`handlePlay()`；**无 targets**——打出无目标）。`PlayCardEvent` 极简：序列 `[CardBePlay]` + `[PlayCardEnd]`，`init()` 仅动画广播 + 实体牌入处理区（reason: Play）+ insertHistory。**无 processCompleted 覆写、无 deleteVirtualCard**——与规则"打出后实体牌停留在处理区，由外层使用结算结束统一清理"一致（〖激将〗张飞打杀例）。

**新实现**：`DropCardEventData`（EventTypes.ts:399-404）仅 `player / card / forcePlayCardVoice` 三字段；`NeedDropCardData`（EventTypes.ts:587-606）含 `dropCardEventData / immediateSettle`。时机 `DropCardNeed1/2、DropCardDeclare、DropCardDroped、DropCardEnd` 已定义。事件类与流程未实现。

**技能例：〖激将〗第二效果（旧 liubei.ts）**——need 时机代打链路：

```ts
trigger: EventTriggers.NeedPlayCard1,
forced: 'cost',
async effect(room, data: NeedPlayCardData, context) {
    for (const player of players) {
        const play = await room.needPlayCard({ from: player, cards: ['sha'], notMoveHandle: true, ... });
        if (play) {
            const sha = room.createVirtualCardByData(play.card.vdata);
            data.played = (await room.prePlayCard(Object.assign({ from, card: sha }, data.copy()))) as any;
            break;
        }
    }
}
```

要点：need1 打出技能内部可再发起嵌套的 `needPlayCard`（他人代打）→ 以代打牌的 vdata 重建虚拟牌 → `prePlayCard` 以**原打出者**名义完成打出并回写 `data.played`。`notMoveHandle` 控制实体牌不由内层清理，与"打出实体牌由外层统一清理"呼应。

---

## 4. 新项目未实现清单（事实）

1. **UseCardEvent / UseCardToCardEvent / UseCardSpecialEvent / DropCardEvent 事件类均不存在**——`shared/core/event/` 仅有数据接口与时机枚举；全仓库引用这些时机的只有 EventTypes.ts 自身与 `Effect.isViewAsOrPlayPhase`。
2. need/pre 流程（`room.needUseCard / preUseCard / needPlayCard / prePlayCard` 对应物）未实现；`PreUseCardData / PrePlayCardData / PreSameUseCardData` 无对应接口。
3. cardSelector（实体牌选择标准/范围扩缩）、targetSelector、杀的使用次数三语义（空闲时间点计数/无次数限制/不计入限制）、额定目标数计算——均未实现（规则文档已标 M2）。
4. targetList 操作集（addTarget/removeTarget/cancle/transferCurrent/becomTarget/invalidXxx/targetCantResponse/sort）与 current/cantResponse 运行时状态未实现。
5. 虚拟牌生命周期（deleteVirtualCard、延时锦囊保留对应关系、useFrom 追责）未实现。
6. need2 按钮式技能协同（客户端按钮 + `_use_or_play_vcard` 约定）未实现。

## 5. 从旧项目移植的注意点

1. **统一 UseCardEvent 与现有 EventType 三分法冲突**：EventTypes.ts 仍保留 `UseCard/UseCardToCard/UseCardSpecial` 三类型及对应 Data 接口与 TimingEventMap 联合映射。按 `use-card.md` 决策统一为单类前，应先收敛数据层（否则移植会把旧三分法固化）。
2. **动态时机生成的移植**：旧的 `generatorReady/generatorEffect + generator 字段 + 每步 sort()` 是规则"逐目标展开 + 重排序 + 未生成过时机检测"的核心；新 `EventProcess.insert()` 可承载，但需把"每处理完一个目标再取下一个"写成 after 回调循环（新基类是 Timing 队列而非方法名约定）。
3. **响应窗口的特殊触发**：旧 `CardEffectBefore_Before` 置 `triggerNot=true` 后手动 `room.trigger(..., 排除 cantResponse)`。新 EventProcess 的 `triggerNot` 语义已保留（triggerFunc 跳过自动 trigger），移植时需在 before 回调中实现同样的"手动定向触发"，否则〖铁骑〗类 `targetCantResponse` 失效。
4. **无双二闪**：`wushuang` 数组消耗一个标记 → 清 offset → 重插 `CardEffectBefore` 的循环写法需原样保留（规则"生成第二个生效前"）。
5. **need3 处理**：旧武圣/激将分别挂 `NeedUseCard3/NeedPlayCard3` 与 `NeedUseCard2/NeedPlayCard1`；新枚举无 need3——移植选牌标准类技能（武圣、龙胆、丈八等数十个）时统一改挂 need2 按钮式，且要实现"点按钮=不发动need1+选此技能+定选牌标准"的合并语义与"步骤未履行=视为未发动"（旧 `data.cancel`）回滚。
6. **闪/无懈/金蝉的时机剔除**：旧靠 UseCardToCardEvent 子类刨除时机；新统一方案须在时机构建分支中剔除 declare_after~become_target_after 段，并注意旧序列实际保留了 DeclareUseCard/CardBeUse（技能靠 can_trigger 类型检查不触发）——新实现按规则文档剔除更彻底，移植旧技能时其 can_trigger 的事件类型检查要同步改写。
7. **打出的实体牌清理**：PlayCardEvent 不清理处理区（无 processCompleted 覆写）。新 `EventProcess._trackProcessingCard + processCompleted` 会**自动**清入弃牌堆——移植 DropCardEvent 时必须避开该自动清理（或由外层使用事件 track），否则违反规则"实体牌停留处理区至外层使用结算结束"（〖纳蛮①〗时序例）。
8. **死亡目标差异**：延时锦囊目标死亡→终止使用流程 vs 基本牌/普通锦囊→不移出目标列表只断当前时机；旧代码只在 `UseCardReady_After` 统一 removeTarget 死者，主结算段的死者处理依赖 `check_event/triggerable`——移植时按规则文档的表格语义显式实现，勿照抄旧代码的隐式行为。
9. **字段改名对照**：`effectTimes→settleCount`、`baseDamage→damageBase`、`baseRecover→recoverBase`、`current→settleTarget(index)`；旧技能代码引用 `data.current.target` 处移植时需按新形态改写。
10. **规则文档笔误**：`use-card.md`（2）段时机代码误标 `usecard_assign_target_after`（应为 choose_target）；新枚举 `DropCardDroped` 注释"打出牌后"与规则名"牌被打出时"不一致；`UseCardChooseTarget` 注释与规则名亦待核对——移植前先修文档/注释避免挂错时机。
