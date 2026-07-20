# 整体架构分析与重构方案

> 分析范围：旧项目 `old/resgsv1`（git HEAD，≈21 万行）与新项目 `shared/` + `server/`（≈1.5 万行 + 87 测试）。
> 规则依据：`docs/definitions/`、`docs/events/`、`docs/terms/` 权威文档及 `.scratch/porting/pending-rulings.md` 裁定（R1-R8）。
> 里程碑对齐：`.scratch/porting/map.md` M1-M8。

---

## 一、旧项目与规则冲突

### 1.1 核心（core）

| # | 问题 | 代码位置 | 冲突的权威规则 |
|---|---|---|---|
| C1 | **出牌阶段空闲点 = 无限循环 playphase 模型**：trigger 内以 `needUseCard({reason:'playphase'})` 循环询问，直到玩家主动结束 | `old/resgsv1/server/src/core/room/room.ts:841-847` | 裁定 **R8**（pending-rulings.md）：空闲时间点应**拆分为独立时机枚举成员**，废弃无限循环模型 |
| C2 | **NeedUseCard/NeedPlayCard 嵌死在 trigger 主循环 order 4/5**：`needUseCardSame`（同时使用）与 `needUseCard`（默认使用）作为扫描层级硬编码在时机循环内，与技能扫描共用一个 switch | `room.ts:900-932`（order 4/5 分支） | `docs/events/use-card-and-need.md` 架构重设计指示：need1（询问式）→ need2（按钮式）→ preUse 应分层建模，**不在当前架构上修补**；合法性三来源需接 StateEffect 查询 |
| C3 | **使用牌事件三子类分裂**：按 condition 返回值分支创建 `UseCardEvent` / `UseCardToCardEvent`（另有 `UseCardSpecialEvent`），时机序列固定 | `room.ts:1083-1120`（playphase 内分支创建）；`core/sgs.ts:76-81`（三类 import） | `docs/events/use-card.md` 用户设计决策：**统一 UseCardEvent**，`buildTriggers()` 按牌类型动态构建时机序列（基本牌/锦囊全套 15 时机、闪剔除声明段、延时锦囊/装备预结算后直接收尾） |
| C4 | **同时机多技能选择与计次逻辑不符元规则**：① 计次仅 `time < context.maxTimes` 单一维度，无"普通技=1 次 / 计数型技=X 次"（〖明哲②〗〖节命〗按数计次）的区分；② 多技能同池时首次 `askForSkillInvoke` 结果被丢弃、强制删至单技能重问，玩家选择权与优先级语义晦涩 | `room.ts:936-944`（check+maxTimes 建池）、`room.ts:956-974`（size>1 丢弃重问） | `docs/definitions/meta-rules.md`：同技能单次 + 计数突破；"每 1 点伤害发动 X 次"需要 EffectData 计数位（`docs/events/damage.md`） |
| C5 | **回合角色离场无重排机制**：待询问玩家队列进循环前固定、逐个 `players.shift()`，`sortResponse` 仅对技能池排一次；回合角色死亡后未选者不会按新回合角色重新逆时针排列 | `room.ts:853-861`（固定队列消费）、`room.ts:947-951`（一次性排序） | `docs/definitions/meta-rules.md`：回合角色离场→下家继承，**未选者按新回合角色重新逆时针排列**；已选者保持不变 |

### 1.2 服务端（server）

| # | 问题 | 代码位置 | 冲突的规则 / 架构指标 |
|---|---|---|---|
| S1 | **全局单例 sgs + 循环依赖**：`sgs.ts` 聚合全部注册表与工厂，且 `import { GameRoom } from './room/room'`，而 room 内部又依赖 sgs——模块死结；全局可变状态使多房间隔离与测试困难 | `old/resgsv1/server/src/core/sgs.ts:24`（引 GameRoom）、`sgs.ts:1-93`（巨型聚合） | CLAUDE.md 架构指标（3）循环依赖、（5）晦涩 |
| S2 | **GameRoom 上帝对象 + 11 Mixin**：trigger 主循环、playphase、useskill 等全部压在单个 room.ts；行为按 `RoomBroadCastMixin`/`RoomPlayerMixin`/…/`RoomFunctionMixin` 混入，职责边界不可见 | `sgs.ts:25-93`（10+ 个 RoomXxxMixin import）；`room.ts:838-1140`（千行级主循环仅其一段） | CLAUDE.md 架构指标（1）僵化、（5）晦涩；新项目已证明可拆为 9 Manager |
| S3 | **逻辑对象塞进网络状态树**：Colyseus 房间把整个游戏逻辑挂在 `this.state.game` 上直接调 `response()`，逻辑层与 Schema 序列化边界互相渗透；同步靠 `getMessage` 消息重放而非 Schema 增量 | `old/resgsv1/server/src/rooms/game.ts:52-57` | CLAUDE.md 设计原则 1（shared 纯逻辑、不依赖网络运行时）；map.md M7：断线重连应由 **Schema 天然支持** |
| S4 | **房间类业务大杂烩**：DB 服务直接 `new` 在房间字段（UserService/GeneralStatsService/ReputationService）；举报/屏蔽/聊天/幸运卡/托管等 20+ `onMessage` 平铺 onCreate；认证/密码/旁观全部内嵌 onAuth | `game.ts:23-26`、`game.ts:50-95`、`game.ts:100-150` | CLAUDE.md 架构指标（1）僵化、（4）脆弱性——对局流程与运营功能无分层 |
| S5 | **核心规则循环与网络请求耦合**：trigger 内直接 `askForSkillInvoke`/`needUseCard` 发 GameRequest，无输入抽象层，headless 跑局/自动化测试不可行 | `room.ts:956-960`、`room.ts:915-921` | ADR-0002：AI 应为 `IPlayerInput` 实现、引擎零改动——旧架构无此接缝 |

### 1.3 客户端（client）

| # | 问题 | 位置 / 证据 | 冲突的规则 / 决策 |
|---|---|---|---|
| CL1 | **绝对路径 symlink 共享核心代码**：LayaAir 工程用 Windows 绝对路径 symlink 引 `server/src/core/`，项目移入 `old/` 后即断链，不可移植 | ADR-0001 上下文 1 | ADR-0001（已裁定弃 LayaAir）；CLAUDE.md 共享代码须经 `@shared/*` 别名解析 |
| CL2 | **引擎与工具链错配**：LayaAir 3.x 的 3D/物理/粒子对卡牌游戏过度（~5MB 包体），IDE 与 VSCode/标准 TS 工具链割裂 | ADR-0001 上下文 2-4 | ADR-0001 2026-07-19 修订：改回 LayaAir 3.4.0（IDE MCP 消除工具链问题、旧项目经验复用、内置系统减少自建工作量） |
| CL3 | **状态恢复依赖消息重放**：客户端通过 `getMessage` 拉取历史消息重放恢复界面，而非订阅 Schema 状态 | `game.ts:52`（`onMessage('getMessage', ...)`） | map.md M7：重连应基于 Colyseus Schema 同步；重放机制脆弱且与录像/旁观需求纠缠（Fog 项） |
| CL4 | **规则校验落在客户端**："武器/坐骑当其他牌使用时不能同时享受其技能"由客户端将装备**暂时置灰失效**实现，服务端无对应校验 | `docs/terms/cards.md` 装备特殊定义（旧实现记录于 pending-impl.md） | 规则执行必须服务端权威；客户端只做表现（新选择系统需服务端防"边用边享受"） |

---

## 二、新重构方案

### 2.1 核心（shared）收尾

引擎层已完成 ~80%（Player、9 Manager、EventProcess + refreshs、14 事件、ChooseManager 多步选择），收尾按 M1-M6 垂直切片推进：

**M1 触发技闭环**
- 打通 trigger 扫描 → `askForSkillInvoke` → UseSkillEvent 桥接（现停在 "TODO Phase 7"）。
- 吸收旧循环教训（C4/C5）：EffectData 增加**计数位**（普通=1 / 计数型=X 次）；发动条件在**轮到该角色选择时**检查而非时机开始预判；主循环支持**"时机结束"信号**与**回合角色离场重排**（meta-rules.md 四原则直接建模，不复刻旧 order 0-7 硬编码层级——优先级仍按 武将→装备→卡牌→规则 分层，但作为数据驱动的 PriorityType 遍历，已有 `triggerEffects` 索引支持）。
- 落实裁定 A1/A2/A8（pending-impl.md）：补 `GameStartAfter` 枚举；UseSkillEvent 明置改走 ChangeStateEvent(open) + deferredOpens（drain 时逆时针排序、跳过死亡者）；空闲时间点拆独立时机枚举（替代旧 playphase 无限循环，解决 C1）。

**M2 使用牌骨架**（解决 C3）
- 统一 UseCardEvent + `buildTriggers()` 动态时机序列；targetList 一次到位（offset/无双/effectTimes/invalid 字段与取消/移除方法，区分"取消目标 vs 目标无效"）。
- 前置补齐：Player `prev`/`next` 访问器（考虑死亡的上/下家）；TurnEvent/PhaseEvent 的**终止 vs 结束**两种截断原语；移动前牌面信息快照。

**M3 响应闭环**（解决 C2）
- 按 `use-card-and-need.md` 重设计使用链路（设计文档 `.scratch/porting/use-card-design.md` 先行）：need1 询问式 / need2 按钮式 / 非技能默认路径三分层，cardSelector 统一扩缩容；不再嵌在 trigger 循环内做 order 分支。
- 濒死响应循环（简化响应顺序 + 技能首轮限定 + 单角色结算）；死亡流程死者技能白名单、回合角色死亡回退、离场四同时处理。

**M4 身份局最小可玩**
- StateEffect 全面接线：距离/攻击范围/手牌上限三级查询（values.md 公式）、Prohibit 系、按来源作用域的"无视"（`Skill_Invalidity_PerAgent` 或等价机制）；PindianEvent；锦囊 + 装备（军争合并牌堆）；判定阶段延时锦囊快照规则；装备"边用边享受"防护做进**服务端选择校验**（解决 CL4）。

**M5 AI / M6 内容**
- 按 ADR-0002：`shared/ai/` 效用评分 + seeded RNG + 决策日志钩子，AI 即 `IPlayerInput` 实现（引擎零改动）；M6 27 武将流水线，每技能实现后同步登记到事件文档时机清单。

### 2.2 服务端（server）

归属 M7，核心思路：**Colyseus 房间只做薄适配层**，与旧 S1-S5 逐条对照：

1. **修复断链重写 GameRoom**：现 `server/src/rooms/GameRoom.ts:2-4` import 的 `../core/schema/RoomState`、`../core/logic/GameLogic` 均不存在（server/src 无 core/ 目录）。重写为：GameRoom 实现 shared 的 `IPlayerInput`，**持有** `shared/core/room/Room` 实例（普通字段，绝不放进 state——避免旧 S3）；`this.state` 仅为 RoomState Schema，增量同步交给 Colyseus。
2. **补全输入回路**：现 `requestChoice` 只单向 `client.send('choice_request')`、`resolvers` Map 建而未用、`onMessage` 空实现——补 response 消息 → resolver 结算 → ChooseManager 恢复的完整回路（含超时/托管默认应答）。
3. **实现 BroadcastManager**：消化 shared 侧 Phase 9 TODO（`Room.ts:258` delay、`Room.ts:555` showCards、`Room.ts:1001` gameOver 广播），可见性规则在此层过滤后下发。
4. **分层**：认证/大厅最小实现独立于对局房间；DB 持久化走 handlers/services（已有 `GameEndHandler` 雏形），房间类不再直接 new DB 服务（避免旧 S4）；断线重连基于 Schema 重同步 + reconnectToken（不做消息重放）。
5. **录像/旁观**：Schema 同步架构下的设计单独出 ADR（map.md Fog 项），不预先实现。

### 2.3 客户端（client = LayaAir 3.4.0）

归属 M8，**具体实现见 `.scratch/client/design.md`**（ADR-0001 修订为 LayaAir 3.4.0）。此处仅锁定架构原则：

- **技术栈**（ADR-0001 2026-07-19 修订）：LayaAir 3.4.0（新版 UI `ui2`：GBox/GButton/GLabel/GImage/GList/GPanel）+ Colyseus 客户端 SDK。
- **状态驱动渲染**：订阅 RoomState Schema 变化驱动 Dirty Flag 更新，不依赖消息重放（解决 CL3）；交互经 choice_request/response 协议回传。
- **共享代码直连**：经 `@shared/*` 别名 import，全栈类型安全（解决 CL1，不再 symlink）。
- **只做表现不做裁决**：所有规则校验以服务端为权威，客户端置灰/高亮仅为提示（CL4 教训）。
- **Prefab 优先**：UI 通过 LayaAir IDE 搭建 .ls/.lh 资源文件，代码只负责逻辑。
- 待讨论项：是否支持单机模式（headless Room + 本地 IPlayerInput 跑在浏览器，map.md Fog 项）。

---

## 附：里程碑对照速查

| 里程碑 | 本方案对应节 | 消化的旧项目问题 |
|---|---|---|
| M1 | 2.1 触发技闭环 + 裁定 A1/A2/A8 | C1、C4、C5 |
| M2 | 2.1 使用牌骨架 | C3 |
| M3 | 2.1 响应闭环 | C2 |
| M4 | 2.1 身份局 + StateEffect 接线 | CL4 |
| M5/M6 | 2.1 AI 与内容 | S5（IPlayerInput 接缝） |
| M7 | 2.2 服务端 | S1-S5、CL3 |
| M8 | 2.3 客户端 | CL1-CL4 |
