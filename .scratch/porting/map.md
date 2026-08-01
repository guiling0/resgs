# 项目重构路线图

> 组织原则：**shared 全量重写**为零依赖纯 TS 引擎（2026-08-01 项目重构重启）。
> 游戏状态同步 = **纯消息收发**（自定义协议，弃 Colyseus 状态同步；保留 Colyseus 房间管理）。
> 单机测试 = **客户端本地直跑游戏逻辑**（不启动服务端）。
> 开发模式 = **端到端功能增量**：每个增量 = shared/core 逻辑 + 对应传输协议消息 + 客户端监听/UI，完成即在客户端可视化验证通过 → 进入下一个增量。
> **协议分散原则**：传输协议不设集中里程碑，随功能增量分散构建——I1 建传输通道最小版，此后每个增量同步扩展其消息类型与客户端监听（逻辑做到哪，客户端就能监听到哪）。
> 验证手段 = **人类 + AI 的实际可视化对局 + 日志为主**（不依赖自动化断言；19 个旧手写测试弃用）。
> 首要目标 = **忽略服务端**，让 shared/core 游戏核心逻辑可运行，追平 old/resgsv1 的核心闭环一局。

---

## 增量路线图（I0-I5 主线，I6+ 扩展）

| 增量 | 产出物（逻辑 + 协议 + 客户端） | 可视化验证（人类+AI 对局 + 日志） |
|---|---|---|
| **I0 状态层** | `core/state/`：StateStore / StateMap / StateArray / StateNode / decorators（@sync/@syncMap/@syncArray）+ 11 状态类纯 TS 化 + **StatePatch 基础类型**（subscribe 即消息通道雏形） | tsc；冒烟脚本：装饰器 setter→flush→apply 回放一致 + 事务批次原子性（本增量无 UI，验证即冒烟） |
| **I1 对局骨架（端到端 v0）** | Room 重写（新构造签名）+ 8 Manager + 实体 + MarkHost 通用化 + select(autoSelect) + sgs/register 重写 + EventProcess/EventTypes/EventManager + Turn/Phase/MoveCard；**LocalTransport 最小版 + codec（serialize/deserialize）+ GameClient v0**（snapshot/patches 应用 + event 路由）；**观察台 v0**（Laya UI：座位面板 + 日志流 + 消息流视图） | 全 AI 对局跑完一局：回合六阶段流转 / 摸牌 2 张 / 弃牌超上限 / game.over 正常；**客户端监听 game.start → 构建座位 UI**，回合/血量/手牌变化（patches）实时更新；日志显示事件序列 |
| **I2 战斗生死（端到端）** | UseCard/DropCard/Damage/Hp/Dying/Death 按 docs/events 实现 + 击杀奖惩；**协议新增**：choice / face.ani / toast 等消息 + 客户端监听（血量变化+掉血参数、濒死求桃、死亡离场） | 全 AI 对局出现：杀/闪响应 → 伤害扣血 → 濒死求桃 → 死亡离场 → 奖惩；观察台血量动画、濒死/死亡弹窗、日志完整事件链 |
| **I3 判定技能（端到端）** | Judge / UseSkill + 技能框架 + 标准武将 2-3 个（曹操奸雄、关羽武圣、刘备仁德）+ 标记系统（@syncMap）；**协议新增**：judge 结果、技能 choice 消息 + 客户端监听（判定结果展示、技能发动提示、标记显示） | 全 AI 对局触发判定（延时锦囊/技能判定）、技能发动、标记显示在座位；观察台判定结果、技能日志 |
| **I4 单机闭环** | 内置身份模式（standard-mode-setup）+ SoloInputHub + AutoInput + 选择 UI + GameView 完备 + 单机入口；**同步完备性验证**：LocalTransport snapshot/patches 回放一致 + 事件消息顺序（状态先于业务消息）；同步修复 client/ 与 server/ 引用 | **人类 vs AI 完整一局**（选将→出牌→伤害→濒死→死亡→胜负）；观察台验证「询问前状态先行」「扣血+动画同批次原子」 |
| **I5+ 扩展增量** | 按扩展内容增量：拼点、明置与势力（change-state 全档）、连环传导、更多标准武将、扩展包（resgs-ext-temp）接入——**每项同样 = 逻辑 + 协议消息 + 客户端监听** | 每增量完成即可视化验证：新增玩法在人类 vs AI 对局中可复现，日志正确 |

依赖链：`I0→I1→I2→I3→I4`；I2/I3 可部分并行（I3 判定依赖 I2 流程稳定，建议串行）；I5+ 逐项独立。
**协议分散**：不设集中协议里程碑——I1 建立传输通道最小版（LocalTransport + codec + Envelope 骨架），此后每个增量扩展消息清单与客户端监听（messages.ts 类型仍集中定义，开发节奏分散）。
重写期间 client/server 编译暂断（import 断裂），I4 一并恢复；I0-I3 用独立 tsconfig 只检查 shared。

## 观察台演进（测试基础设施，随增量增强）

| 版本 | 出现于 | 能力 |
|---|---|---|
| v0 | I1 | 消息驱动座位面板（座位/血量/手牌数/牌堆/弃牌堆，收 game.start 构建）+ 日志流 + 消息流视图（snapshot/patches/event）+ 控制按钮（开始/重开/AI 速度） |
| v1 | I2-I3 | 血量动画、濒死/死亡弹窗、判定结果展示、标记显示、技能发动日志 |
| v2 | I4 | 完整 GameView：人类操作（选择 UI + 手牌点击交互） |

观察台 = Laya UI 实现（游戏场景内的调试面板，参考 client-dom/src/pages/game.ts 的座位布局设计；client-dom 为 DOM 试作，已 gitignore，仅作布局参考）。

## 同步方案要点（I0-I4 实现依据）

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
- 单机 LocalTransport 直投（serialize 副本，客户端 apply 镜像，不共享引用）；联机 Colyseus 只当传输通道（send('game', payload)）与房间管理，**不参与状态 schema**（远期）
- **协议分散开发**：MessageType 枚举与 Envelope 类型集中定义于 messages.ts，但消息类型随功能增量逐个添加——I1 先建通道与基础消息（snapshot/patches/log/game.start/game.over），I2 加 choice/card.move/face.ani/toast，I3 加 judge/技能消息；每个增量的验收包含「该功能消息在观察台消息流中可见」

## 当前状态（2026-08-01 项目重构重启）

- shared/ 已从 git 移除，备份于 `.tmp/shared-backup/`（保留 165 文件实现细节供参考）
- 旧工单（l0/l1 issues、handover、pending-*、server-architecture）、旧分析（docs/analysis/）、旧计划（laya-migration-plan.md）已删除
- 客户端 UI 骨架已构造（加载/登录/大厅/等待房间），**无游戏逻辑**
- **下一步**：I0 状态层（core/state/ + 装饰器，先最小原型验证）

## 技术决策

1. 游戏状态同步 = 纯消息收发（自定义协议），弃 Colyseus 状态同步
2. 保留 Colyseus 房间管理（join/seat/chat/ready/start 等）——**远期，本轮不排期**
3. 装饰器自动化：@sync/@syncMap/@syncArray，字段声明即同步
4. 发送时机：帧级 flush（60fps）+ 事务批次（beginBatch/endBatch）+ 关键点显式 flush
5. 单机测试 = 客户端本地直跑 Room（host 在浏览器内）；**I1 起即走完整消息通道**（LocalTransport 直投 serialize 副本，客户端 apply 镜像，不共享引用）
6. 事件系统调度语义保留（docs/events 为验收标准），实现重写
7. sgs 注册表 API 面逐项不变（扩展包 extension/resgs-ext-temp 兼容硬约束）
8. 全部状态类实现 toJSON/fromJSON（snapshot 与子对象快照用）
9. 开发模式 = **端到端功能增量**：每增量 = 逻辑 + 协议消息 + 客户端监听/UI，完成即可视化验证通过 → 下一增量
10. 验证手段 = 人类+AI 实际可视化对局 + 日志为主；自动化断言仅保留 I0 冒烟脚本
11. **协议分散原则**：传输协议不设集中里程碑，随功能增量分散构建（消息类型集中定义，开发节奏分散）

## 追平验收清单（I4 后全量勾选，每项以实际对局+日志确认）

1. **开局**：8 人身份局 → 身份分配正确、选将弹窗可确认、起始手牌 4 张、牌堆 108 张
2. **回合流转**：六阶段正确流转、摸牌 2 张、弃牌超上限弹出弃牌选择
3. **出牌阶段**：手牌可点、杀/桃/闪可用、结束按钮生效、card.move 动画正确（牌堆→手牌、手牌→弃牌等）
4. **规则事件**：对 AI 造成伤害 → 血量/濒死/死亡流程；击杀奖惩；game.over 面板
5. **同步观察**：伤害时「体力 + 掉血参数」同批次到达（观察台日志确认一条 patches 含两条变化）；询问前状态已先行
6. **技能**：至少 2 个标准包技能（如曹操奸雄、关羽武圣）触发、选择 UI 弹出、效果生效
7. **标记**：技能标记显示在座位 UI（经 @syncMap 自动同步）
8. **AI 推进**：全 AI 对局可完整跑完（AI 行为规格见下），无挂死/死锁

## AI 行为规格（自建 AutoInput，old/resgsv1 无 AI）

| 场景 | 行为 |
|---|---|
| 出牌阶段 | 有可用牌就 UseCard（简单启发式），无可用牌返回结束 |
| 响应 | 有桃救濒死、有闪出闪、有杀打出杀 |
| 弃牌阶段 | 超上限按手牌顺序弃至上限 |
| 选择会话 | 复用 ChooseManager 抽出的 autoSelect（按 count 选前 N 个可选项） |
| 目标选择 | 选第一个合法目标 |

## 关键文件

- [shared/core/room/Room.ts](shared/core/room/Room.ts) — 改造源：Room 职责全集、新构造签名、game 兜底 hack 消除点
- shared/core/state/decorators.ts（新建）— @sync/@syncMap/@syncArray 自动化核心
- shared/core/state/StateStore.ts（新建）— 帧 flush + 事务批次 + apply 枢纽
- shared/core/event/EventManager.ts — trigger 调度锚点（自 room/ 迁至 event/）
- [shared/core/sgs.ts](shared/core/sgs.ts) + register.ts — 扩展包 API 兼容契约
- client-dom/src/pages/game.ts — UI 资产参考（座位布局/卡牌交互设计；DOM 试作仅参考不复用）
- docs/events/ 14 档 — 事件实现验收标准
- extension/resgs-ext-temp/types/global.d.ts — sgs 公共 API 契约
- old/resgsv1/server/src/core/ — 追平目标（60 文件完整核心，功能/体验参照）
- .tmp/shared-backup/ — 重写素材（12 事件类/15 room 文件/11 状态类/19 测试）

## 风险与对策

1. **全量重写回归风险（最高）**：无自动化测试。对策：功能增量制——每增量完成即人类+AI 对局回归；观察台日志作为行为证据；docs/events 逐档对照
2. **装饰器实现细节**：legacy 属性装饰器 + 类字段初始化顺序（useDefineForClassFields:false 下装饰器先于字段赋值？）——I0 先用最小原型验证（一个 @sync 字段 + 一个 @syncMap 容器冒烟），再铺开 11 个状态类
3. **patch 时序**：帧 flush 的 tick 与事务批次交错。对策：帧 tick 遇 batch 跳过、endBatch 强制 flush；关键点（发业务消息前）显式 flush；I1 起消息流观察台验证
4. **SelectSession 序列化边界**：toWire/fromWire 是正确性关键，步骤级联（multiStep 已选列表回传）在 wire 层保住（I2 选择会话随 choice 消息落地，I4 完整）
5. **协议分散的完整性**：消息清单随增量增长，易遗漏某功能的消息或监听。对策：messages.ts 集中枚举定义（新增消息必有类型条目）；每增量验收包含「该功能消息在观察台消息流中可见 + 客户端监听生效」
6. **sgs API 兼容**：扩展包是黑盒消费者，I1 以 global.d.ts 为契约逐项核对；落地后先跑扩展加载 + 单机开局
7. **内置 mode 缺失**：sgs.modes 为空，I4 需按 standard-mode-setup.md 实现身份模式（隐藏工作量，已列 I4）
8. **可见性**：首版 `visibility:'all'` 调试，serialize 预留 visibilityFor hook，联机期细化
9. **AI 能力边界**：AI 行为规格已定义（上表），保证对局可推进不挂死即可，不做智能决策
