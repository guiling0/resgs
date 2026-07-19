# 项目词汇表 (Ubiquitous Language)

> 新会话先读此文件了解领域术语。不要全量加载 docs/ 目录。

---

## 详细文档索引

领域的详细权威定义**分文档**存放，本词汇表只保留开发概念与索引（防止膨胀）。游戏规则术语的权威定义在下列文档中，词条迁入后本表仅在索引行中列出术语名：

| 目录 | 内容 | 覆盖术语 |
|---|---|---|
| `docs/analysis/` | **实现分析**：新旧项目逐时机/逐用语对比、技能框架诊断、整体架构重构方案 | 见 [analysis/README.md](docs/analysis/README.md)（7 份文档索引 + Bug 清单 B1-B7 指路） |
| `docs/definitions/` | 游戏**基础定义**（按主题分档） | [skill.md](docs/definitions/skill.md)：技能（状态类/触发类）、六要素、发动、操作、即时类/延时类/状态类效果<br>[meta-rules.md](docs/definitions/meta-rules.md)：优先级原则（技能>牌面>规则）、插入结算原则、多角色结算原则（a 结算方向 / b 同一时机轮流选择+同技单次+离场转下家）、优先级确定原则（武将>装备>牌>流程） |
| `docs/events/` | 每个**事件**一档：事件→时机定义（时序、各时机语义、数据字段） | [standard-mode-setup.md](docs/events/standard-mode-setup.md)：身份模式开始前流程（游戏目标/身份座次/选将/体力牌/起始手牌）<br>[turn.md](docs/events/turn.md)：回合事件（回合开始后❶-❾ / 回合结束前❶-❼ / 序号→TimingName 映射总表）<br>[phase.md](docs/events/phase.md)：阶段事件（六阶段全时机 + 判定阶段延时锦囊流程 + 出牌阶段空闲时间点 + 弃牌规则）<br>[use-skill.md](docs/events/use-skill.md)：技能使用事件（声明/选目标/消耗同时性、消耗原子性、效果过滤、Cost/Effect 时机）<br>[pindian.md](docs/events/pindian.md)：拼点事件（合法目标/同一张牌逐对拼点/赢与未赢判定）<br>[move-card.md](docs/events/move-card.md)：移动事件（处理区自动清理/原因列举/五时机+失去得到别名/虚拟牌四分支/维系区域设定/多张差异/牌面信息按原区域）<br>[change-state.md](docs/events/change-state.md)：牌状态改变事件（前❶❷/后/结算结束后 + 明置事件四流程/势力确定/明置后延迟生成/君主替换）<br>[judge.md](docs/events/judge.md)：判定事件（判定牌确定/改判/结果=虚拟牌数据/五时机）<br>[damage.md](docs/events/damage.md)：伤害事件（四种方式/9 时机/伤害值确定点/每点伤害计次语义/结算结束后触发连环）<br>[hp-events.md](docs/events/hp-events.md)：失去体力事件 + 扣减体力事件（两来源分支/连环重置/濒死链）+ 回复体力 + 加减体力上限（合并为体力上限改变事件）<br>[dying-death.md](docs/events/dying-death.md)：濒死事件（响应循环/技能首轮限定/简化顺序）+ 死亡事件（确认身份/离场/奖惩/回合角色死亡回退）<br>[use-card-and-need.md](docs/events/use-card-and-need.md)：需要使用牌事件（need1/2/3→实现两时机）+ 预使用牌事件（声明/选实体牌/选目标/虚拟牌信息继承） + 合法性三来源 + 杀次数语义 + ⚠️ 架构待重设计<br>[use-card.md](docs/events/use-card.md)：牌的使用事件（预结算 8 时机/循环 AB 使用结算/结束后❶❷❸/目标动态增减与重排序/两次无效判定/统一 UseCardEvent 设计）<br>[drop-card.md](docs/events/drop-card.md)：需要打出/预打出/打出牌事件（无目标无动态时机/牌被打出时/打出结束/处理区清理由外层使用流程完成） |
| `docs/terms/` | 每类**游戏用语**一档：技能描述中的标准用语定义 | [cards.md](docs/terms/cards.md)：身份牌、武将牌、体力牌（inthp/losshp）、游戏牌、衍生牌、基本牌、装备牌、锦囊牌、实体牌/虚拟牌<br>[card-face.md](docs/terms/card-face.md)：花色/颜色/点数、姓名、性别、势力、珠联璧合<br>[zones.md](docs/terms/zones.md)：区域、牌堆、弃牌堆、武将牌堆、处理区、手牌区、装备区（六子区）、判定区、武将牌上/旁、仓廪、府库、维系区域、废除/恢复（封印）<br>[values.md](docs/terms/values.md)：体力四值、手牌上限、伤害/回复值基数、距离、攻击范围、变量X/Y/Z、之差、等量、势力数/角色数、最大/最小、至多/至少、任意数量、额定摸牌数、玩家数、目标对应的角色数、游戏牌ID、点数终值<br>[description.md](docs/terms/description.md)：七类技能标签、可、符号（〖〗【】""{}/▶▷→）、转移、依次、需/须/并、扣减体力、使用/打出者、来源、渠道、属性/连环伤害、回复体力两式、选择、A令B、各、相邻/围攻/队列/大小势力、不计入距离/座次、阵法召唤、军令、转化、可见、杀死 等<br>[game-flow.md](docs/terms/game-flow.md)：回合、额外回合、上/下家、阶段（六阶段/缺省指代/额外阶段/跳过）、终止/结束流程、角色<br>[event-resolution.md](docs/terms/event-resolution.md)：事件、结算、时机、流程、响应、无效（目标无效/技能无效）、取消（使用牌/移动）、无视（按观察者失效 vs 令无效）、防止（伤害/移动/状态改变）、起点<br>[card-operations.md](docs/terms/card-operations.md)：通用缩减规则、移至、置于/入、扣置、弃置、交给、获得/得到、失去、交换、重铸、摸牌、弃置至/补至、洗牌、使用、打出、如手牌般使用/打出、拼点、判定、视为、观看、展示、亮出、弃（标记）、合纵<br>[general-operations.md](docs/terms/general-operations.md)：横置/重置/连环状态/触发连环、翻面/叠置、复原、明置/暗置、移除、变更 |

> 实现事件类、技能与解析技能描述时，以上述文档为准。同名术语若"游戏概念"与"开发概念"不同义，开发概念保留在本词汇表并标注消歧。

---

## 游戏概念

| 术语 | 英文 | 定义 |
|---|---|---|
| 事件 | EventProcess | **开发概念**：游戏内一个原子流程类，持有 eventTriggers/endTriggers，`exec()` 逐个消费时机。游戏定义（事件/结算/时机/流程/响应）见 [event-resolution.md](docs/terms/event-resolution.md)。 |
| 时机 | TimingName | **开发概念**：时机枚举（80+ 成员），`const enum`。游戏定义（时机的语义与顺序）见 [event-resolution.md](docs/terms/event-resolution.md)。 |
| 效果 | Effect | **开发概念**：技能的具体执行单元类，触发类与状态类**互斥**。游戏定义（即时类/延时类/状态类效果）见 [skill.md](docs/definitions/skill.md)。 |
| 技能 | Skill | **开发概念**：Effect 的容器类。一个武将技能 = 1 个 Skill + N 个 Effect。游戏定义（状态类/触发类技能、六要素、发动流程）见 [skill.md](docs/definitions/skill.md)。 |
| 刷新 | refreshs | 效果的 on_refresh 回调，在每次 trigger 的前后执行。用于更新效果内部的临时状态（如计数条件）。 |
| 区域 | Area | **开发概念**：AreaId = `'{playerId}.{type}'`（玩家私有）或 `'{type}'`（公共），解析见 `parseAreaId`。游戏定义（17 种区域、牌面朝向、特殊规则）见 [zones.md](docs/terms/zones.md)。 |
| 标记 | Mark | 任意实体（Room/ Player/ GameCard/ General/ Skill/ Effect）上可存储的键值数据。实现 `MarkHost` 接口。 |
| 濒死 | Dying | 体力 ≤0 进入濒死状态，询问全场是否使用桃救。无人救 → 进入 Death 事件。 |
| 使用 | UseCard | **开发概念**：UseCardEvent（M2 待实现）。游戏定义（预使用牌事件→使用事件、不能同时使用两张）见 [card-operations.md](docs/terms/card-operations.md)。 |
| 打出 | DropCard | **开发概念**：DropCardEvent（M3 待实现）。游戏定义见 [card-operations.md](docs/terms/card-operations.md)。 |
| 弃置 | Discard | **开发概念**：MoveCardEvent（reason='discard'），无独立事件。游戏定义（操作 vs 移至弃牌堆的结果、谁选牌、缩减规则）见 [card-operations.md](docs/terms/card-operations.md)。 |

## 架构约定

| 术语 | 定义 |
|---|---|
| create vs build | create = 创建实例并放入区域（createGameCard → 牌堆）；build = 仅注册索引（buildCard → cardNames Map）。同名区分见 CardManager。 |
| sgs | 全局单例 `globalThis.sgs`，持有所有静态数据（modes/ cards/ generals/ skills/ effects/ translations）。任何位置可直接 `sgs.xxx` 访问，无需 import。 |
| sync 参数 | 控制 Phase 9 客户端通知开关（true=通知客户端，false=纯服务端操作）。不影响 Colyseus Schema 自动同步。 |
| 事件栈 | `room.eventStack: EventProcess[]`，当前正在执行的事件链。栈顶事件为当前事件，新创建的事件 push 到栈顶，processCompleted 时 pop。 |
| 选择会话 | `ChooseManager.request()` 创建的单次玩家交互。同玩家新请求自动取消旧会话。超时链：session.timeout → room.options.responseTime → 15s。 |

## 实体关系

```
Room ──has──▶ 9 个 Manager (card/player/general/skill/event/choose/broadcast/area/vcard)
  │
  ├──▶ Player ──has──▶ head/deputy (General)
  │      │
  │      └──▶ 卡牌区域 (Hand/Equip/Judge/Up/Side)
  │
  ├──▶ GameCard ──linked──▶ VirtualCard (技能转化)
  │
  ├──▶ Skill ──has──▶ Effect[] (triggerEffects / stateEffects)
  │
  └──▶ EventProcess ──triggers──▶ EventManager.trigger() ──lookup──▶ triggerEffects 索引
```

## 优先级

技能在时机触发时的调度顺序（PriorityType）：

```
None → General(武将技) → Equip(装备技) → Card(卡牌技) → Rule(规则技) → GlobalRule(全局规则)
```

同一优先级内按响应顺序（从当前回合玩家顺时针）遍历。

---

> 实现细节见 `shared/core/` 代码。词汇表仅定义领域概念，不放代码结构。
