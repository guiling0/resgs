# 项目重构路线图（追齐 old/resgsv1 全量）

> 组织原则：**shared 全量重写**为零依赖纯 TS 引擎（2026-08-01 项目重构重启）。
> 游戏状态同步 = **纯消息收发**（自定义协议，弃 Colyseus 状态同步；保留 Colyseus 房间管理）。
> 单机测试 = **客户端本地直跑游戏逻辑**（不启动服务端）。
> 开发模式 = **端到端功能增量**：每个增量 = shared/core 逻辑 + 对应传输协议消息 + 客户端监听/UI，完成即在客户端可视化验证通过 → 进入下一个增量。
> **协议分散原则**：传输协议不设集中里程碑，随功能增量分散构建——R1 建传输通道最小版，此后每个增量同步扩展其消息类型与客户端监听（逻辑做到哪，客户端就能监听到哪）。
> 验证手段 = **人类 + AI 的实际可视化对局 + 日志为主**（不依赖自动化断言；旧 19 个手写测试仅作实现参考，不迁移）。
> 最终目标 = **与 old/resgsv1 完全追齐**：核心逻辑、标准/扩展内容、服务端（用户/DB/联机/录像）、客户端（大厅/房间/游戏/录像/聊天/动画）全覆盖。
> 参考优先级：`old/resgsv1/` > `old/shared-backup-2026-08-01/`（与 `.tmp/shared-backup/` 同源）> FreeKill（同类参考） > 自主思考。

---

## 2026-08-02 对齐结论（superpowers 工作流 brainstorming 产出）

| 议题 | 结论 |
|---|---|
| 追齐范围 | **完全追齐**，含服务端与客户端（不再「忽略服务端」） |
| 扩展追齐方式 | 5 扩展（1v1/3v3/exyj/oxsp/wars）**以新 API（SkillBuilder/EffectBuilder）重写**；用户主导小部分，大部分由 sgs-extension 技能自主学习旧项目实现并与旧项目对齐 |
| 静态数据 | **代码驱动 + 生成器**：武将/技能/牌/模式全部用 Builder API 代码定义；datas JSON 仅作迁移素材，由生成脚本批量转出「武将壳子」代码，行为由技能实现填充 |
| 武将包范围 | **全量 20+ 包**（standard/mobile/ol/ten/shenhua/wars 系列等） |
| 增量排序 | **核心先行分层推进**，增量重新划分为 R0-R10 |

---

## 增量路线图（R0-R10）

| 阶段 | 增量 | 产出物（逻辑 + 协议 + 客户端） | 可视化验证（人类+AI 对局 + 日志） |
|---|---|---|---|
| **一 核心引擎** | **R0 引擎地基** | `core/state/`：StateStore/StateMap/StateArray/StateNode + @sync/@syncMap/@syncArray + StatePatch 基础类型 + 事务批次（beginBatch/endBatch）+ 帧 flush；实体（GameCard/VirtualCard/General/Player/Skill/Effect）+ MarkHost 通用化；EventProcess/EventTypes（TimingName 80+）/EventManager（trigger 调度 + refreshs + 效果索引 + 优先级）；sgs/register 重写；传输层补齐（ITransport/LocalTransport/codec/Envelope，R0 前已有雏形）；扩展契约 global.d.ts 核对 | tsc；冒烟脚本：装饰器 setter→flush→apply 回放一致 + 事务批次原子性 + 扩展加载不崩（本增量无 UI） |
| | **R1 对局骨架（端到端 v0）** | Room 重写（新构造签名）+ 9 Manager + GameState + Turn/Phase（六阶段）+ MoveCard + 区域管理；**GameClient v0**（snapshot/patches 应用 + event 路由）；**观察台 v0**（Laya UI：座位面板 + 日志流 + 消息流视图 + 控制按钮）；AutoInput 初版 | 全 AI 对局跑完一局：回合六阶段流转 / 摸牌 2 张 / 弃牌超上限 / game.over 正常；客户端监听 game.start → 构建座位 UI，回合/血量/手牌变化（patches）实时更新；日志显示事件序列 |
| | **R2 战斗生死（端到端）** | UseCard/DropCard/Damage/Hp/Dying/Death 按 docs/domain/events 实现 + 击杀奖惩 + need/use 事件链；**协议新增**：choice / face.ani / toast / card.move + 客户端监听（血量变化+掉血参数、濒死求桃、死亡离场） | 全 AI 对局出现：杀/闪响应 → 伤害扣血 → 濒死求桃 → 死亡离场 → 奖惩；观察台血量动画、濒死/死亡弹窗、日志完整事件链 |
| | **R3 技能框架（端到端）** | Judge / UseSkill（声明/选目标/消耗/效果）+ 技能框架 + SkillBuilder/EffectBuilder 完善 + 标记系统（@syncMap）；标准武将 2-3 个（曹操奸雄、关羽武圣、刘备仁德）；**协议新增**：judge 结果、技能 choice + 客户端监听（判定结果展示、技能发动提示、标记显示） | 全 AI 对局触发判定（延时锦囊/技能判定）、技能发动、标记显示在座位；观察台判定结果、技能日志 |
| | **R4 单机闭环** | 内置身份模式（standard-mode-setup.md）+ SoloInputHub + AutoInput 完善 + 选择 UI + GameView 完备 + 单机入口；**同步完备性验证**：LocalTransport snapshot/patches 回放一致 + 事件消息顺序（状态先于业务消息）；同步修复 client/ 与 server/ 引用 | **人类 vs AI 完整一局**（选将→出牌→伤害→濒死→死亡→胜负）；观察台验证「询问前状态先行」「扣血+动画同批次原子」 |
| **二 标准内容** | **R5 标准内容追齐** | standard + ex.standard（军争）全部牌与武将技能实现；**复杂机制全档启用**：拼点（pindian.md）、明置/势力（change-state.md）、连环传导（damage.md）、翻面/叠置、转化技、延时锦囊判定；客户端监听配套 | 标准包全部武将技能在人类 vs AI 对局中可复现；docs/domain/events 14 档全部落地；日志正确 |
| | **R6 数据管线** | datas 生成器（old datas JSON → 武将壳子 TS 代码，含武将名/势力/体力/技能名列表/翻译表）；**全量 20+ 包**壳子装载进 sgs.generals/sgs.modes；概念表/翻译表迁移 | 生成器产出可编译壳子代码；20+ 包武将全部可装载；行为逐包由后续增量填充 |
| **三 扩展模式** | **R7 模式扩展（1v1/3v3）** | 1v1 模式（旧 extensions/1v1 重写，含专属武将包）+ 3v3 模式（冷/热阵营选将、奖惩规则）；对应武将包行为实现 | 各模式完整一局可玩（人类 vs AI），规则正确（胜负/奖惩/阵营） |
| | **R8 高级扩展** | exyj（一将成名）、oxsp、wars（含 mode/rule）重写；国战机制（明置武将/势力/珠联璧合/君主技，change-state 全档） | 各扩展对局可复现新玩法，日志正确 |
| **四 客户端/服务端** | **R9 客户端体验追齐** | clientv0 功能逐项迁移到 LayaAir 新客户端：大厅（列表/创建/进入）、房间（座位/准备/开始）、游戏桌（手牌/技能按钮/选择 UI）、聊天、录像回放、音效、武将皮肤动画、设置/关于；复用 R0-R4 建立的传输层 | 对照 clientv0 功能清单逐项勾选；人类 vs AI 对局中全部 UI 功能可用 |
| | **R10 服务端追齐** | Colyseus 房间完整化（LobbyRoom/GameRoom：join/seat/ready/start/chat/托管/投降）+ 用户系统（注册/登录/JWT）+ DB（MongoDB：User/MatchState）+ 录像存储与回放接口 + 联机纯消息传输接入 + 断线重连 + 管理接口 | 联机多人对局端到端（两台浏览器互连）；断线重连恢复状态；录像可回放 |

依赖链：`R0→R1→R2→R3→R4`（核心串行）；`R5` 依赖 R4；`R6` 依赖 R0 的装载机制，可与 R5 并行；`R7/R8` 依赖 R5+R6；`R9` 依赖 R4（可在 R5-R8 期间渐进并行）；`R10` 依赖 R4+R9。
**里程碑**：M1 = R0-R4（核心闭环 + 单机可玩）；M2 = R5-R6（标准内容 + 数据管线）；M3 = R7-R8（扩展模式）；M4 = R9-R10（客户端 + 服务端全量追齐）。
**协议分散**：不设集中协议里程碑——R1 建立传输通道最小版（LocalTransport + codec + Envelope 骨架），此后每个增量扩展消息清单与客户端监听（messages.ts 类型仍集中定义，开发节奏分散）。
重写期间 client/server 编译暂断（import 断裂），R4 一并恢复；R0-R3 用独立 tsconfig 只检查 shared。

## 观察台演进（测试基础设施，随增量增强）

| 版本 | 出现于 | 能力 |
|---|---|---|
| v0 | R1 | 消息驱动座位面板（座位/血量/手牌数/牌堆/弃牌堆，收 game.start 构建）+ 日志流 + 消息流视图（snapshot/patches/event）+ 控制按钮（开始/重开/AI 速度） |
| v1 | R2-R3 | 血量动画、濒死/死亡弹窗、判定结果展示、标记显示、技能发动日志 |
| v2 | R4 | 完整 GameView：人类操作（选择 UI + 手牌点击交互） |

观察台 = Laya UI 实现（游戏场景内的调试面板，参考 old/resgsv1/clientv0/src/ui/ 的座位布局设计）。

## 同步方案要点（R0-R4 实现依据）

### 装饰器自动化（替代 changeProperty + 手写复杂消息体）

```ts
class PlayerState extends SyncNode {
  @sync() hp: number = 4;                        // 简单字段：setter 自动 mark
  @syncMap() marks: StateMap<string, MarkState>; // map / key-value 合并为一种
  @syncArray() hand: StateArray<string>;         // array
}
```

- legacy 属性装饰器（工程配置 `experimentalDecorators: true` + `useDefineForClassFields: false`）
- 嵌套对象挂载时注入 `_store` + `_path`（`players/p1/marks/guanxing`），深层字段变化自动产生 set patch——mark 系统零手写
- **三个复杂类型统一容器**（map 与 key-value 合并），不再每个复杂类型各写收发消息体

### 发送时机（三层策略）

| 层 | 触发点 | 效果 |
|---|---|---|
| ① 帧级 flush（主） | 16ms tick：pending 非空 → 打包一条 patches 消息 | 有界（一帧最多一条）+ 及时（≤16ms）；无变化不发空消息 |
| ② 事务批次（原子） | `beginBatch()/endBatch()` 包裹关键逻辑（伤害、摸牌等）；帧 tick 遇 batch 开启则跳过 | 扣血 + 动画参数同批次同一条消息到达，客户端同帧处理 |
| ③ 关键点 flush（顺序） | 发送业务消息（choice/delay/动画指令）前 `flush()` | 先状态、后询问，UI 时序正确 |

### 消息协议

```
host→client：{kind:'snapshot', seq, state} | {kind:'patches', seq, patches} | {kind:'event', seq, event}
client→host：{kind:'event', seq, event}
```

- StatePatch 强类型联合：`set / map.add / map.remove / arr.insert / arr.remove / replace`
- Envelope：`{t: MessageType, id, d}`（choice/delay/card.move/toast/chat/log/game.over/...）
- 单机 LocalTransport 直投（serialize 副本，客户端 apply 镜像，不共享引用）；联机（R10）Colyseus 只当传输通道（send('game', payload)）与房间管理，**不参与状态 schema**
- **协议分散开发**：MessageType 枚举与 Envelope 类型集中定义于 messages.ts，但消息类型随功能增量逐个添加——R1 先建通道与基础消息（snapshot/patches/log/game.start/game.over），R2 加 choice/card.move/face.ani/toast，R3 加 judge/技能消息；每个增量的验收包含「该功能消息在观察台消息流中可见」

## 数据策略（2026-08-02 确认：代码驱动 + 生成器）

1. **唯一数据源 = 代码**：武将/技能/牌/模式/翻译全部以 Builder API（SkillBuilder/EffectBuilder/GeneralBuilder/CardBuilder/ModeBuilder + factories）在扩展包代码中定义，与新旧引擎形态一致，类型安全、单一权威
2. **datas JSON = 迁移素材**：`old/resgsv1/server/src/extensions/datas/`（或 `.tmp/shared-backup/datas/`）的 20+ 包 JSON 不参与运行时；R6 编写生成脚本，批量产出「武将壳子」TS 代码（姓名/势力/体力/性别/技能名列表/翻译/素材路径），登记进对应扩展包
3. **技能行为由 skill 自主学习实现**：壳子的技能回调（condition/choose/cost/effect）由 AI 依据 sgs-extension 技能学习义务，探索 `old/resgsv1/server/src/extensions/` 旧实现后补全，行为与旧项目对齐
4. **数据库不承载静态数据**：DB 仅存用户/录像等运营数据（R10）；若远期需运营热更，在服务端加载层做缓存，不进 shared 核心

## 扩展追齐流程（技能学习义务落地）

每个扩展/武将包重写遵循 AGENTS.md「技能学习义务」：

1. **学习总结**：分析 old/resgsv1 对应扩展（extensions/1v1、3v3、exyj、oxsp、wars、datas/*.json）的结构与技能编写模式
2. **更新权威定义**：新 API 与旧实现有出入时，更新 `.trae/skills/sgs-extension/references/` 下对应文件；出现新规则概念时同步 docs/domain/
3. **双向转换**：维护「标注描述」↔「详细描述」对应关系（sgs-extension 既有能力）
4. **自测校验**：重写后以人类 vs AI 对局 + 日志验证技能效果与旧项目一致
5. **用户主导边界**：用户负责少量关键/复杂技能示范（如奸雄已实现），其余由 AI 自主完成并在「改动确认制」下提交

## 当前状态（2026-08-02）

- 文档体系已重构（domain/decisions/planning 三级），规则已迁至 AGENTS.md；本计划按 superpowers 工作流重新划分
- shared/ 仅 9 个骨架文件（Room 空壳/transport 雏形/Player/sgs/GameState/RoomOptions）——**I0-I3 实际尚未开始**，R0 即起点
- 客户端 client/ 有完整 LayaAir 资源 + Entry/Lobby 骨架，无游戏逻辑
- 扩展包 resgs-ext-temp 已有 standard 牌 + 曹操奸雄示例（新 API 形态样板）
- 备份：`old/resgsv1/`（追平目标，含 server/src/core 60 文件 + extensions 5 个 + clientv0 + datas.zip）、`old/shared-backup-2026-08-01/`（引擎重写素材，12 事件类/15 room 文件/11 状态类/19 测试）
- **下一步**：R0 引擎地基（core/state/ + 装饰器 + 实体 + 事件框架，先最小原型验证）

## 技术决策

1. 游戏状态同步 = 纯消息收发（自定义协议），弃 Colyseus 状态同步
2. Colyseus 仅作联机传输通道与房间管理（R10 启用，**不参与状态 schema**）
3. 装饰器自动化：@sync/@syncMap/@syncArray，字段声明即同步
4. 发送时机：帧级 flush（60fps）+ 事务批次（beginBatch/endBatch）+ 关键点显式 flush
5. 单机测试 = 客户端本地直跑 Room（host 在浏览器内）；R1 起即走完整消息通道（LocalTransport 直投 serialize 副本，客户端 apply 镜像，不共享引用）
6. 事件系统调度语义保留（docs/domain/events 为验收标准），实现重写
7. sgs 注册表 API 面逐项不变（扩展包 extension/resgs-ext-temp 兼容硬约束）
8. 全部状态类实现 toJSON/fromJSON（snapshot 与子对象快照用）
9. 开发模式 = **端到端功能增量**：每增量 = 逻辑 + 协议消息 + 客户端监听/UI，完成即可视化验证通过 → 下一增量
10. 验证手段 = 人类+AI 实际可视化对局 + 日志为主；自动化断言仅保留 R0 冒烟脚本
11. **协议分散原则**：传输协议不设集中里程碑，随功能增量分散构建（消息类型集中定义，开发节奏分散）
12. 静态数据 = 代码驱动 + 生成器（见「数据策略」），datas JSON 仅作迁移素材
13. 参考优先级：`old/resgsv1/` > `old/shared-backup-2026-08-01/` > FreeKill（同类参考） > 自主思考
14. **审查与优化但逻辑不变**：所有实现参考 old/resgsv1，重写时先审查旧代码（识别坏味道：冗余/僵化/循环依赖/晦涩等），优化后写入重构项目；**游戏行为逻辑不变**——事件时机序列与调度语义、技能效果行为、伤害/濒死/死亡结算、sgs 注册表 API 面为不可变部分；架构组织/状态同步/类型/依赖/加载方式等为可优化部分
15. **参考起点**：以 `.tmp/shared-backup/`（= `old/shared-backup-2026-08-01/`，上一轮已做 Manager 拆分/Builder/强类型等优化的中间产物）为架构起点，逐文件对照 `old/resgsv1/server/src/core/` 核对逻辑一致性，兼顾复用优化成果与逻辑不偏
16. **Bug 裁定权归用户**：审查旧代码发现疑似 bug 时，**不自行判断修复**，优先询问用户是否为「逻辑 bug」——核心游戏规则存在大量反直觉逻辑，是否修复由用户裁定；确认后按其指示处理并记录差异
17. **FreeKill 同类参考**：FreeKill（新月杀）作为横向参考，借鉴点与落点见 [ADR 0003](../../decisions/adr/0003-freekill-reference.md)；效果类型以旧项目 StateEffectType（30+ 细分）为准、次数限制用 maxTimes、附加技能/私人牌堆用旧项目等价机制——均不照搬 FreeKill
18. **实体分层**：实体不区分 Server/Client 双类，只写一份（状态 + 纯派生 getter + 查询，query/ 并入实体）；能力层分层——`entity/`（状态+getter+查询+能力方法薄转发，两端）、`registry/`（静态注册表，两端）、`logic/`（PlayerHost 等能力实现 + RoomEngine + 事件/触发副作用，仅权威端运行时存在）、`view/`（PlayerView 镜像端能力实现）；实体非查询能力经 PlayerHost/PlayerView 接口注入（host/view 仅注入其一，运行时注入差异决定行为；shared 两端同源、单机客户端即 host，故隔离 = 运行时注入差异而非编译期）；权威结算与客户端显示走同一查询函数；状态类 Effect 必须纯查询（只读已同步状态）。详见 [ADR 0004](../../decisions/adr/0004-entity-layering.md)

## 追平验收清单（R4/R6/R8/R10 各阶段勾选，每项以实际对局+日志确认）

### 单机核心（R4 后全量勾选）
1. **开局**：8 人身份局 → 身份分配正确、选将弹窗可确认、起始手牌 4 张、牌堆 108 张
2. **回合流转**：六阶段正确流转、摸牌 2 张、弃牌超上限弹出弃牌选择
3. **出牌阶段**：手牌可点、杀/桃/闪可用、结束按钮生效、card.move 动画正确（牌堆→手牌、手牌→弃牌等）
4. **规则事件**：对 AI 造成伤害 → 血量/濒死/死亡流程；击杀奖惩；game.over 面板
5. **同步观察**：伤害时「体力 + 掉血参数」同批次到达（观察台日志确认一条 patches 含两条变化）；询问前状态已先行
6. **技能**：至少 3 个标准包技能（奸雄/武圣/仁德）触发、选择 UI 弹出、效果生效
7. **标记**：技能标记显示在座位 UI（经 @syncMap 自动同步）
8. **AI 推进**：全 AI 对局可完整跑完，无挂死/死锁

### 内容追齐（R6 后勾选）
9. **标准内容**：standard + 军争全部牌（108 + 军争牌）与武将技能生效，docs/domain/events 14 档事件全部落地
10. **数据管线**：生成器可复现 20+ 包全部武将壳子；sgs.generals/modes 装载完整；翻译/概念表可用

### 扩展追齐（R8 后勾选）
11. **1v1/3v3**：模式规则（胜负/奖惩/选将）与旧项目一致，各可完整对局
12. **exyj/oxsp/wars**：扩展可加载可玩，特殊机制（如 wars 模式）正确
13. **国战**：明置武将/势力/珠联璧合/君主技（change-state 全档）可复现

### 客户端/服务端追齐（R10 后勾选）
14. **客户端**：大厅/房间/游戏桌/聊天/录像/音效/皮肤动画/设置 功能与 clientv0 对齐（逐项清单）
15. **服务端**：注册/登录/JWT、房间（join/seat/ready/start/chat/托管/投降）、DB（User/MatchState）、录像存储与回放、断线重连
16. **联机**：两台浏览器多人对局端到端，状态经纯消息同步一致

## AI 行为规格（自建 AutoInput，old/resgsv1 无 AI）

| 场景 | 行为 |
|---|---|
| 出牌阶段 | 有可用牌就 UseCard（简单启发式），无可用牌返回结束 |
| 响应 | 有桃救濒死、有闪出闪、有杀打出杀 |
| 弃牌阶段 | 超上限按手牌顺序弃至上限 |
| 选择会话 | 复用 ChooseManager 抽出的 autoSelect（按 count 选前 N 个可选项） |
| 目标选择 | 选第一个合法目标 |

## 关键文件

- [shared/core/entity/Room.ts](shared/core/entity/Room.ts) — 改造源：Room 职责全集、新构造签名、game 兜底 hack 消除点
- shared/core/state/decorators.ts（新建）— @sync/@syncMap/@syncArray 自动化核心
- shared/core/state/StateStore.ts（新建）— 帧 flush + 事务批次 + apply 枢纽
- shared/core/event/EventManager.ts — trigger 调度锚点（自 room/ 迁至 event/）
- [shared/core/sgs.ts](shared/core/sgs.ts) + register.ts — 扩展包 API 兼容契约
- old/resgsv1/clientv0/src/ui/ — 客户端 UI 资产参考（座位布局/卡牌交互/大厅房间）
- docs/domain/events/ 14 档 — 事件实现验收标准
- extension/resgs-ext-temp/types/global.d.ts — sgs 公共 API 契约
- old/resgsv1/server/src/core/ — 追平目标（60 文件完整核心，功能/体验参照）
- old/resgsv1/server/src/extensions/ — 5 扩展 + datas 数据源（技能学习素材）
- old/shared-backup-2026-08-01/（= .tmp/shared-backup/）— 重写素材（12 事件类/15 room 文件/11 状态类/19 测试）
- .tmp/freekill-core/ — FreeKill 核心 Lua（同类逻辑参考，仅借鉴不搬代码；借鉴清单见 [ADR 0003](../../decisions/adr/0003-freekill-reference.md)）
- .tmp/fkbook/ — FreeKill 文档源码（for-creators/rule + api-reference 最有价值）

## 风险与对策

1. **全量重写回归风险（最高）**：无自动化测试。对策：功能增量制——每增量完成即人类+AI 对局回归；观察台日志作为行为证据；docs/domain/events 逐档对照
2. **装饰器实现细节**：legacy 属性装饰器 + 类字段初始化顺序（useDefineForClassFields:false 下装饰器先于字段赋值？）——R0 先用最小原型验证（一个 @sync 字段 + 一个 @syncMap 容器冒烟），再铺开 11 个状态类
3. **patch 时序**：帧 flush 的 tick 与事务批次交错。对策：帧 tick 遇 batch 跳过、endBatch 强制 flush；关键点（发业务消息前）显式 flush；R1 起消息流观察台验证
4. **SelectSession 序列化边界**：toWire/fromWire 是正确性关键，步骤级联（multiStep 已选列表回传）在 wire 层保住（R2 选择会话随 choice 消息落地，R4 完整）
5. **协议分散的完整性**：消息清单随增量增长，易遗漏某功能的消息或监听。对策：messages.ts 集中枚举定义（新增消息必有类型条目）；每增量验收包含「该功能消息在观察台消息流中可见 + 客户端监听生效」
6. **sgs API 兼容**：扩展包是黑盒消费者，R0 以 global.d.ts 为契约逐项核对；落地后先跑扩展加载 + 单机开局
7. **内置 mode 缺失**：sgs.modes 为空，R4 需按 standard-mode-setup.md 实现身份模式（隐藏工作量，已列 R4）
8. **可见性**：首版 `visibility:'all'` 调试，serialize 预留 visibilityFor hook，联机期细化
9. **AI 能力边界**：AI 行为规格已定义（上表），保证对局可推进不挂死即可，不做智能决策
10. **全量 20+ 包工作量（新增）**：上千武将行为实现是最大工作量。对策：R6 生成器批量产壳子；技能行为按包分批，由 sgs-extension 技能自主学习旧实现逐包推进；每包完成即对局验证
11. **技能学习义务节奏（新增）**：学习动作遵循「改动确认制」，学习更新（.trae/skills/sgs-extension/references/）与内容实现交替进行，防止学习动作阻塞内容推进
12. **客户端资产迁移（新增）**：clientv0 的动画/音效/皮肤资产与 Laya UI 预制件需迁入新客户端；R9 按功能模块逐项迁移，避免一次性大搬迁
13. **服务端联机风险（新增）**：Colyseus 联机 + 断线重连是独立复杂度。对策：置于 R10 最后，R4 后单机已完整可玩，联机失败不阻塞核心交付
