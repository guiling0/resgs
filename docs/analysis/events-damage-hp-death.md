# 伤害 / 体力 / 濒死 / 死亡事件：新旧实现分析

> 分析日期：2026-07-18。
> 规则依据：`docs/events/damage.md`、`docs/events/hp-events.md`、`docs/events/dying-death.md`。
> 旧实现：`old/resgsv1` 仓库 `server/src/core/event/types/event.damage.ts`、`event.hp.ts`、`event.die.ts`（`git show HEAD:` 读取）。
> 新实现：`shared/core/event/DamageEvent.ts`、`HpEvent.ts`、`DyingEvent.ts`；测试 `shared/test/damage.test.ts`、`hp-event.test.ts`、`dying-death.test.ts`。

---

## 0. 架构机制总览

| 维度 | 旧实现（resgsv1） | 新实现（shared/core） |
|---|---|---|
| 时机声明 | 魔法方法名 `[`${EventTriggers.X}_Before`]()` / `_After`，靠命名约定被 `trigger_func` 反射调用（晦涩） | `createTiming(name, before[], after[])` 显式构建 `Timing` 对象，`triggerFunc` 按 before → trigger（技能响应）→ after 执行（`EventProcess.ts:152`） |
| 事件数据 | 属性直接挂在事件实例上（`this.to`、`this.number`） | 强类型 `XxxEventData` + 便捷访问器委托到 `eventData` |
| 事件入口 | `static exec` + `room.damage()` 等 room 方法 | `room.event.damage()` 等（EventManager 门面） |
| 广播/日志 | 事件内直接 `room.broadcast` 动画+战报 | 广播留 TODO（Phase 9 / BroadcastManager），仅 logger |
| 濒死标记 | `player.setProperty('indying', eventId)` | `player.setMark('indying', id)`（标记体系） |

两代事件链结构一致：**Damage → ReduceHp →（hp≤0）Dying →（未获救）Death**；LoseHp 同样嵌套 ReduceHp。`buqu`（不屈）数据钩子在两代中均可跳过濒死检查 / 死亡置死。

---

## 1. 伤害事件（DamageEvent）

### 旧实现

- 时机：`DamageStart → CauseDamage1/2 → InflictDamage1/2/3 → CauseDamaged →（嵌套扣减）InflictDamaged → DamageEnd`。扣减体力在 `CauseDamaged_Before` 中嵌套 `room.reducehp(...)`。
- `prevent()`/`transfer(to)` 仅在 6 个前段时机（Start/Cause1-2/Inflict1-3）可调用；transfer = prevent + 以相同六要素对新目标重开 DamageEvent。
- `check_event()` 中 **来源死亡即置 `this.from = undefined`**——这是"死亡角色不再参与结算"的落点，〖反馈〗等技能靠 `data.from` 判空自然失效。
- **连环传导已完整实现**（`DamageEnd_After`）：`triggerChain` 为真时取存活的 `chained` 玩家、`room.sortResponse` 排序，逐个（响应前再验 `chained`）以 `isChain: true` 创建新 DamageEvent。

### 新实现

- 时机一一对应：`DamageStart/Cause1/Cause2/Inflict1/Inflict2/Inflict3/CauseAfter/InflictAfter/End`（`EventTypes.ts`），扣减体力在 `DamageCauseAfter` 的 before 回调 `_onCauseDamaged` 中嵌套 `room.event.reduceHp`，与旧版时点一致。
- `prevent()`/`transfer()` 的 `PREVENT_TIMINGS` 集合与旧版完全相同（`DamageEvent.ts:17`）。
- **连环传导是 TODO**：`_onDamageEnd` 仅处理复活队列后 `if (!this.triggerChain) return`，传导循环处为 `// TODO Phase 5: 连环伤害传导 — 遍历 chained 玩家，逐一创建新的 DamageEvent`（`DamageEvent.ts:157`）。移植时旧版 `DamageEnd_After` 的循环（含 `sortResponse` 排序与逐个 `chained` 复验）可直接作为蓝本。
- `checkEvent()` 只检查 `number > 0`，**未保留旧版"来源死亡置 undefined"逻辑**（见 §6 风险表）。

### 技能例

- **〖奸雄〗**（`standard/generals/wei/caocao.ts`）：`trigger: InflictDamaged`（=新 `DamageInflictAfter`，受到伤害后），条件 `player === data.to && data.channel?.hasSubCards()`，cost 获得 `data.channel.subcards`——伤害六要素中"渠道"的典型消费者。
- **〖刚烈〗**（`standard/generals/wei/xiahoudun.ts`）：`trigger: InflictDamaged`，`context.targets = [data.from]`，cost 为来源判定（非红桃成功），effect 令来源"弃两张手牌，否则 `room.damage({from: 夏侯惇, to: 来源})`"——受伤后时机 + 嵌套新伤害事件的范例。
- **〖反馈〗**（`standard/generals/wei/simayi.ts`）：`trigger: InflictDamaged`，条件 `data.from && data.from.hasCardsInArea()`，cost 选取来源一张区域牌 `obtainCards`——依赖"来源可无"要素（来源已死则 `from` 为 undefined、条件不成立）。
- **〖天香〗**（`wars/generals/standard/wu/xiaoqiao.ts`）：`trigger: InflictDamage3`（受到伤害时❸，与规则清单一致），cost 弃一张红桃手牌，effect 中 `await data.prevent()` 防止本伤害，再按选项对目标 `room.damage({from: data.from, ...})`（伤害后按已损体力摸牌，至多 5）或 `room.losehp`——prevent 时机窗口（Inflict3 属 PREVENT_TIMINGS）的典型用法。

---

## 2. 体力事件族（LoseHp / ReduceHp / RecoverHp / ChangeMaxHp）

### 旧实现

- **LoseHp**：`LoseHpStart → LoseHp（before 嵌套 reducehp）→ LoseHpEnd`；`prevent()` 仅 LoseHpStart 可调；`check()` 要求 `inthp >= number`。
- **ReduceHp**：`init()` 中（早于一切时机）做**连环处理**：来源为属性伤害且自身 `chained` → `room.chain({to_state:false})` 解除自身连环；若非连环伤害且仍有其他 `chained` 玩家 → `damage.triggerChain = true`。实际扣血在 `ReduceHp_After`（"扣减体力时"技能响应之后）：伤害来源时先扣 `shield`、溢出部分 `changeHp`；失去体力来源时直接 `changeHp`（无视护盾），并广播动画战报。濒死检查在 `ReduceHpAfter_After`：非 `buqu` 且 `inthp <= 0` → `room.dying`。
- **RecoverHp**：`check()` 钳制回复量 `min(losshp, number)`、满血返回 false，另有 `Prohibit_RecoverHp` 状态效果拦截；`RecoverHpAfter_Before` 实际加血。
- **ChangeMaxHp**：`MaxHpChangeAfter_Before` 中 `maxhp = max(0, maxhp + number)`，`hp > newmax` 则压到新上限；`number < 0` 且 `maxhp <= 0` → `isEnd = true` 后**直接 `room.die`（不进濒死、无 killer）**，符合"上限归零死亡不可挽救、无来源"的裁定。

### 新实现

- 结构与旧版逐一对应（`LoseHpStart/LoseHp/LoseHpAfter/LoseHpEnd` 等四段时机，`EventTypes.ts:140-155`）。RecoverHp 的钳制/满血判断保留（未移植 `Prohibit_RecoverHp` 状态拦截）；ChangeMaxHp 合并加/减为单事件、`newMax <= 0 → room.event.die` 与旧版一致。
- **连环处理只剩一半**：`ReduceHpEvent._handleChain()`（`init()` 中调用，时点正确）里"解除自身连环"被注释为 `// TODO Phase 5: 调用 ChainEvent 解除连环（待移植）`，仅保留 `triggerChain` 标记逻辑。**注意衍生 bug**：旧版先解除自身再查"是否还有其他 chained 玩家"，新版因解除未生效，`this.room.players.some(p => p.alive && p.chained)` 会把自己算进去，导致 `triggerChain` 恒真（当前传导本身未实现故暂无表现，M4 对接时须一并修正判断顺序）。
- **扣血时点偏移（行为差异）**：旧版在 `ReduceHp` 时机（扣减体力时）之后扣血 → `ReduceHpAfter`（扣减体力后，〖伤逝〗〖乱战①〗清单）时机技能响应时 **hp 已扣**。新版把实际扣血挂在 `createTiming(TimingName.ReduceHpAfter, undefined, [_onReduceHpAfter])` 的 **after** 上 → `reducehp_after` 时机技能响应时 **hp 尚未扣**，读 `hp/losshp` 会得到扣减前的值；濒死检查也顺延到 `ReduceHpEnd` 的 after。与规则"扣减体力后 = 体力已扣完"的语义不符，建议把扣血回调改挂 `ReduceHp` 时机的 after（对齐旧版）。
- 测试覆盖（`damage.test.ts` 6 项 / `hp-event.test.ts` 6 项）：基本伤害、prevent、护盾吸收（shield 1 + 伤害 2 → hp -1）、失去体力无视护盾、事件栈 source 追踪、死亡目标 check=false；回复、回复钳制、满血不回复、上限 ±、上限归零死亡。

### 技能例

体力族在六个样例技能中的消费点：〖天香〗losehp 分支（弃牌红桃转为目标失去体力）；〖涅槃〗的 `recoverTo 3`（回复至 3）；〖放逐〗（`wars/wei/caopi.ts` 同文件）按 `from.losshp` 摸牌——均依赖 RecoverHp/LoseHp 事件与 `losshp` 派生值。

---

## 3. 濒死事件（DyingEvent）

### 旧实现

- 时机：`EntryDying → EntryDyinged → Dying → DyingEnd`；`init()` 设 `indying = eventId` 并发濒死战报。
- **响应循环**：`Dying_Before` 设 `triggerNot = true`（关闭本时机的默认全场扫描），改为手动 `room.trigger(EventTriggers.Dying, this, undefined, () => this.check_event())`——第四参数是**逐响应者条件回调**：每名角色响应后重查 `check_event()`（`hp > 0` 即清 `indying` 返回 false），实现"救活即终止求桃循环"。
- **死亡检查在 `Dying_After`**：`hp <= 0 → room.die({reason:'die_dying'})`，即死亡流程发生在 `DyingEnd`（濒死结算结束后）时机**之前**——与规则"死亡流程结束后继续濒死流程（即濒死结算结束）"一致。
- killer 追溯：`getDamage()` 沿 `DyingEvent.source(reason=dying_reducehp) → ReduceHpEvent.getDamage() → DamageEvent.from` 链，供 DieEvent 使用。

### 新实现

- 时机对应：`DyingEntry/DyingEntryAfter/Dying/DyingEnd`；`checkEvent()`（hp>0 清 `indying` 标记、返回 false）与旧版等价，`dying-death.test.ts` 有专测。
- `_onDying` 同样 `triggerNot = true` + 手动 `room.event.trigger(TimingName.Dying, this)`，**但新 `EventManager.trigger(timingName, data, skipRefreshs)`（`EventManager.ts:332`）没有逐响应者条件回调参数**——目前只能做一轮整体扫描，无法在"每名角色响应一张桃/一个技能之后"重查体力并决定终止/开新时机。规则要求的三分支（>0 存活终止；=0 有响应者 → 新"处于濒死状态时"、顺序改为**从响应者 B 逆时针至回合角色上家**；=0 无响应者 → 死亡）与**技能首轮限定**（一个濒死流程中仅首次轮到时可发〖不屈〗〖涅槃〗类技能，桃/酒不限）均未实现——`dying-death.md` 实现映射表标注为"M3 响应闭环"。
- **ChooseManager 方案**：`shared/core/room/manager/ChooseManager.ts` 已具备所需原语——`request(session)`（单会话，响应/超时/取消 resolve，同一玩家仅一个在途会话）、`multiStep`（多段共享总超时）、超时自动选第一项。M3 计划以"询问循环"落地：DyingEvent 维护响应者队列（当前回合角色起逆时针）→ 逐个 `choose.request` 询问（选项 = 可发濒死技能 + 桃/酒）→ 每次响应结算后查 `player.hp`：>0 终止；=0 则以响应者 B 为起点重排队列（至回合角色上家止）进入新一轮 `Dying` 时机；同时按角色记录"是否已过首轮"以实施技能首轮限定。
- 死亡检查移到了 `_onDyingEnd`（`DyingEnd` 时机的 **after**）：即 `dying_end` 时机技能（〖许身〗等"濒死结算结束后"清单）响应在先、死亡流程在后，**与旧版/规则顺序相反**（见 §6）。killer 追溯提前到此处 `_findKiller()`（同样的 ReduceHp→Damage 链），经 `DeathEventData.killer` 传给 DeathEvent。

### 技能例

- **〖涅槃〗**（`wars/generals/standard/shu/pangtong.ts`）：`tag: [SkillTag.Limit]` 限定技，`trigger: EventTriggers.Dying`（处于濒死状态时），条件 `data.player === player`；effect 依次 `dropCards`（弃全部区域牌）→ `restore`（复原武将牌）→ `drawCards 3` → `recoverTo 3`。救活后旧版靠 `check_event()` 条件回调终止循环——正是新版缺失的能力；"首轮拒发后新时机不能再发"的限定在旧版也未见显式实现（依赖限定技本身一次性）。

---

## 4. 死亡事件（DeathEvent）

### 旧实现（DieEvent）

- 时机：`BeforeDeath → ConfirmRole → Death → Deathed → DieEnd`。
- `init()`：`headOpen/deputyOpen = true`（国战暗置武将翻至正面朝上，非明置）；**回合角色死亡回退**：`if (room.currentTurn.player === this.player) await room.currentTurn.end()` → 旧 `TurnEvent.end()` 设 `isEnd = true` + `skipPhase()`（跳过当前阶段），`generatePhase` 的 `while (this.phases.length > 0 && !this.isEnd)` 停止生成后续阶段——回合事件的 endTriggers（回合结束前时机）仍会执行，粗粒度达成"跳过剩余阶段、直入回合结束"。
- `BeforeDeath_After`：`definWarsKindom()`（国战势力确定）、`death = true`、遍历 `room.skills` 对死者武将的技能 `handle()`（重扫状态）、从伤害链取 `killer`、广播死亡战报（自杀/被杀/无来源三种文案）。
- `Death_After`（"其离场"）：弃置手牌+装备 → 判定区/武将牌上/旁置入弃牌堆 → 清 mark（`__offline/__trustship/__escape/1v1_generals/$前缀` 白名单除外）→ 解除 `chained`（带动画）/`skip` → `rest === 0` 时武将牌回武将牌堆。
- `Deathed_After`：国战君主死亡 → 同势力全员 `kingdom = ye_xxx`（野心家）；`rest === 0` → while 循环 `skill.removeSelf()` 失去所有技能。
- 覆写 `trigger_func`：`room.trigger(trigger, this, this.room.players)` 显式传全体玩家（含死者）为扫描范围——保证〖断肠〗等死者技能在死亡流程内仍可响应。

### 新实现

- 时机：`DeathBefore → DeathConfirmRole → Death → DeathAfter → DeathEnd`（裁定 R6 全保留，`DeathConfirmRole` 对应口述"确认身份前"）。
- `init()`：`head?.turnTo(true)/deputy?.turnTo(true)` + **同款回合回退** `if (room.currentTurn?.player === this.player) await room.currentTurn.end()`；新 `TurnEvent.end()`（`TurnEvent.ts:266`）= `super.end()` + `skipPhase()`。**规则要求的两分支回退**（"回合结束前❶"之前死亡 → 处理完当前时机后**直入回合结束前❶**；之后死亡 → 正常走完）尚未区分实现，映射表标注"TurnEvent 终止语义联动 M2/M3"。
- `_onConfirmRole`（ConfirmRole 的 before）：非 `buqu` 则 `death = true`；killer 未传入时从 `source instanceof DyingEvent` 兜底。国战处理、身份翻明+胜负判定、死亡广播均未移植（`_deathLog()` 三种文案已备好但无调用方）。
- `_onDeathAfter`：仅清 mark（`rest === 0` 时 `clearMark()`，无白名单）+ 解除 `chained/skip`。**离场四项同时处理（弃牌/入弃牌堆/弃标记/武将牌回堆）与奖惩均未实现**（M4，奖惩=模式规则技）。
- `_onDeathEnd`：`removeSelf` 死者全部 skills + effects（对应旧 `Deathed_After` 后半）。
- 未实现项还包括：死亡结算开始前"体力 > 0 → 改为 0"（M3 待核对）、"死亡流程中死者白名单外技能无效"（trigger 需特判，pending-impl）。
- 测试（`dying-death.test.ts` 6 项）：濒死无人救→死亡、triggers 结构、已死不触发、hp>0 清 indying、死亡清连环翻面、完整链 Damage→ReduceHp→Dying→Death + 事件栈清空。

### 技能例

- **〖行殇〗**（`wars/generals/standard/wei/caopi.ts`）：`trigger: EventTriggers.Death`（死亡时），条件 `data.player !== player && data.player.hasCardsInArea()`，cost `obtainCards(target.getSelfCards())` 获得死者所有牌。之所以可行，正因"死亡时"时机位于 `Death_After` 弃置（离场）**之前**——新实现移植离场处理时必须保持该顺序（Death 时机响应完再执行离场回调）。规则文档另注：步练师被行殇拿走【白银狮子】不触发失去装备技（死亡流程中死者白名单外技能无效——即上文 pending-impl 项）。

---

## 5. 六要素与时机映射对照

| 六要素 | 旧字段 | 新字段 |
|---|---|---|
| 渠道 | `channel: VirtualCard`（+`skill`） | `channel: VirtualCard \| string`（+`skill` 属性） |
| 属性 | `damageType: DamageType` | 同 |
| 来源（可无） | `from?: GamePlayer`（死亡时置 undefined） | `player: Player`（**无死亡置空逻辑**） |
| 受伤角色 | `to` | `target` |
| 伤害值 | `number`（默认 1） | 同 |
| 连环标记 | `isChain` / `triggerChain` | 同 |

九个伤害时机、四段 LoseHp/ReduceHp/RecoverHp 时机、濒死四时机、死亡五时机的枚举均已在 `EventTypes.ts` 完整对应（见各规则文档"实现映射"表）。

---

## 6. 差异与风险清单（汇总）

| # | 项 | 旧 | 新 | 定性 |
|---|---|---|---|---|
| 1 | 连环传导 | `DamageEnd_After` 完整实现 | `DamageEvent.ts:157` TODO（位置正确） | 待移植（M4） |
| 2 | 连环解除 | `ReduceHp.init` 中 `room.chain` 解除 | `_handleChain` 中注释掉；且因未解除自身，"仍有其他 chained"判断会误含自己 → `triggerChain` 恒真 | 待移植 + 需修判断顺序（M4） |
| 3 | 实际扣血时点 | `ReduceHp` 时机后（扣减体力后时机 hp 已扣） | `ReduceHpAfter` 时机的 after（该时机技能读到扣前 hp） | **行为偏差**，建议改挂 `ReduceHp` after |
| 4 | 濒死→死亡时点 | `Dying_After`（`DyingEnd` 时机前完成死亡流程） | `DyingEnd` 时机的 after（顺序颠倒） | **行为偏差**，建议移回 `Dying` 后 |
| 5 | 濒死响应循环 | `room.trigger` 第四参数条件回调逐响应者检查 | 新 trigger 无该参数；循环/简化顺序/首轮限定未实现 | M3：ChooseManager 询问循环（§3） |
| 6 | 来源死亡置空 | `check_event` 中 `from = undefined` | 无 | 待补（〖反馈〗类依赖） |
| 7 | 回合角色死亡回退 | 粗粒度 `currentTurn.end()`（跳过剩余阶段） | 同款粗粒度；规则两分支（回合结束前❶前/后）均未区分 | M2/M3 联动 TurnEvent |
| 8 | 离场处理 + 奖惩 | `Death_After` 完整（弃牌/入堆/清标记白名单/武将回堆） | 仅清标记+连环/翻面 | M4 |
| 9 | 死者技能白名单 | `trigger_func` 传全体玩家扫描 | 未实现 | pending-impl |
| 10 | 死亡前 hp>0 改 0 | 未见实现 | 未实现 | M3 待核对（〖武魂〗判定死亡例依赖） |
| 11 | 国战处理（势力/君主/胜负） | `BeforeDeath/Deathed` 内实现 | 未移植 | 后续模式阶段 |
| 12 | `Prohibit_RecoverHp` 状态拦截 | RecoverHp.check 中查询 | 未移植 | 状态效果体系接入时补 |
| 13 | "每 1 点伤害发动 X 次"语义 | — | 未实现（效果触发计数） | pending-impl（规则文档已注） |
