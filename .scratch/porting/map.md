# 移植路线图 (Porting Map)

> 组织原则：**垂直切片**——每个里程碑交付一个可验证的可玩性增量，而非"完成某一层"。
> 惰性建单：只为当前里程碑建细粒度 issue，后续里程碑开工时再拆。

---

## Notes

### 现状断面（2026-07-18 全量探索结论）

- **旧项目**（`old/resgsv1/`，git HEAD 为完整版）：≈21 万行。全局单例 sgs + GameRoom 上帝对象 + 11 Mixin + 消息重放同步。standard 包 = **27 武将 + 40 卡牌定义**（4 基本 + 16 装备 + 锦囊，含军争元素）+ 身份局规则。
- **新项目**（`shared/` + `server/`）：≈1.5 万行 + 87 测试用例。引擎层 ~80%（事件/区域/标记/选择系统就绪且有测试），业务层 ~5%（`sgs.skills/modes` 运行时为空），网络层 ~10%（GameRoom 断链），客户端 0%。
- **引擎已完成**：Player、9 Manager、EventProcess + refreshs、Skill/Effect 骨架、14 个事件（Turn/Phase/Damage/Dying/Death/Hp/MoveCard/Judge/ChangeState/UseSkill）、GameMode + startGame、ChooseManager（含多步选择）。
- **引擎缺口**：① trigger 扫描到效果后停在 `TODO Phase 7: askForSkillInvoke`（触发技无法发动）② UseCardEvent / DropCardEvent / PindianEvent 缺失 ③ StateEffect 查询（getStates）无调用方。

### 里程碑

| 里程碑 | 范围 | 验收标准 |
|---|---|---|
| **M1 触发技闭环** | trigger→askForSkillInvoke→UseSkillEvent 桥接（搁置的"Phase 7 Step 2"）。只依赖已有事件。 | 测试技能"受伤摸一张牌"经 mock 确认后自动发动，锁定技自动发动 |
| **M2 使用牌骨架** | UseCardEvent 完整时序骨架 + targetList 完整结构（offset/无双/effectTimes 字段与方法一次到位）；杀/桃 CardUse 定义；**无响应路径** | 出杀→目标掉血；出桃→自己回血 |
| **M3 响应闭环** | DropCardEvent（打出）；NeedUseCard/NeedPlayCard 触发层（旧 trigger Level 4/5）；闪响应；濒死求桃 | headless 完整回合：摸→出杀→响应闪→伤害→濒死→桃救→弃牌 |
| **M4 身份局最小可玩** | standard 模式（身份分配/胜负判定）；PindianEvent；StateEffect 接线（距离/范围/Prohibit→canUseCard/maxhand）；锦囊 + 装备（含军争牌，跟随旧包合并牌堆）；无懈/借刀等交互路径激活 | headless 8 人身份局用 mock 输入从开局跑到分出胜负 |
| **M5 AI + 自动对战** | AI Phase A（[spec](../ai/spec.md)）+ seeded RNG + headless 自动对战 | N 局自动对战无异常、胜负分布合理 |
| **M6 标准包内容完备** | 27 武将技能流水线移植（每武将一 issue，测试驱动，开工时建单） | 27 武将全部可用，技能测试全绿 |
| **M7 联机** | 修复重写 server GameRoom（当前 import 断链）+ BroadcastManager + 最小认证/大厅 + 断线重连（Schema 天然支持）；录像/旁观设计出 ADR | 真实连接打完一局（临时 CLI/调试客户端） |
| **M8 客户端** | LayaAir 3.4.0，方案见 `.scratch/client/design.md`，本路线图不展开 | — |
| **→ C0 项目骨架** | LayaAir IDE 项目创建 + shared/ 引入 + 入口场景搭建。M4 后启动，与 M5 并行 | 加载界面可见 |
| **→ C1 场景+UI骨架** | 全部场景 .ls 搭建 + 核心 Prefab .lh 创建 + 场景切换流 | 场景切换：Load→Entry→Lobby→Room→Game |
| **→ C2 网络+大厅** | Colyseus SDK 集成 + 登录/大厅/房间 Schema 绑定 | 能进入房间、看到其他玩家 |
| **→ C3 游戏桌面渲染** | GameScene 完整渲染：座位/手牌/武将/装备/体力（Schema onChange → Dirty Flag → UI） | Schema 驱动 UI 正确更新 |
| **→ C4 交互系统** | 选牌/选将/选目标 UI + 技能按钮 + 出牌操作 | 可完成一局游戏操作 |
| **→ C5 动画+音效** | 飞牌/伤害/恢复动画 + BGM/音效（LayaAir Tween/Spine/SoundManager） | 游戏动起来 |
| **→ C6 录像回放** | IndexedDB + 快照 + 消息驱动回放 + 进度条拖拽（继承旧项目 Replay 方案） | 拖拽回放 |

### 旧项目资源（old/ 删除前抢救清单）

- `old/resgsv1/server/src/core/event/`（git HEAD）— UseCard/DropCard/Pindian 事件参考
- `old/resgsv1/server/src/extensions/standard/` — 27 武将 + 40 卡牌 + 身份局规则参考
- 旧 `discuss/porting-guide.md` 已删除；其 O01-O23 Bug 清单要点：移植事件时同步修复（大部分已在 Phase 1-7 修复，UseCard 相关的 O10 等随 M2 处理）
- ~~`trigger_note.md`~~ 已废弃（用户判定无实际作用），时机语义以用户口述的 `docs/events/` 权威定义为准

## Decisions-so-far

1. **垂直切片**而非按层推进（用户确认，2026-07-18）
2. **UseCardEvent 骨架完整、路径渐激活**：M2 一次移植完整时序骨架 + targetList 结构，只用基本牌验证；无懈/借刀等交互 M4 激活（用户确认）
3. **三切分**：原"引擎闭环"大里程碑拆为 M1 触发技 / M2 使用牌 / M3 响应，单一关注点（用户确认）
4. **惰性建单**：只为当前里程碑建 issue（用户确认）
5. **顺序：技能→AI→网络**：M5 AI 在 M7 联机之前，自动对战反哺技能调试（用户确认，前次会话）
6. **军争牌堆**：跟随旧 standard 包合并牌堆（酒/藤甲/火攻等），不做纯标准版拆分
7. **GameRoom 断链修复归 M7**：headless 阶段（M1-M6）不依赖 server 编译
8. **事件/用语/定义权威由用户口述**：trigger_note.md 废弃；基础定义落 `docs/definitions/`、事件→时机定义落 `docs/events/`（每事件一档）、技能用语落 `docs/terms/`（每类型一档），`CONTEXT.md` 做索引并随迁移瘦身。实现事件与技能以这些文档为准（2026-07-18）
9. **客户端架构（2026-07-19 修订：LayaAir 3.4.0）**：
   - 纯 Colyseus Schema 同步（唯一通道），动画/音频由服务端事件触发
   - 录像：eventId + 定期快照 + 事件日志（继承旧项目 IndexedDB + Pako 方案）
   - LayaAir UI2 统一承载游戏渲染 + UI 面板（不再分离 PixiJS/Vue）
   - Schema onChange → Dirty Flag → UI 更新（继承旧项目 PlayerComp 模式）
   - 卡牌 = Prefab 预制体（CardItem.lh）+ 对象池（Laya.Pool）管理
   - 场景 = LayaAir Scene.open/close 切换 + 层级叠加
   - 客户端里程碑 C0-C6 嵌入路线图（M4 后启动，与 M5-M7 并行）
10. **使用/打出链路重设计（2026-07-19 拷问确认）**：26 条决策已写入 use-card-and-need.md §5

## Fog

- 录像/旁观在 Schema 同步架构下的设计（**已定**：eventId+快照方案，C6 实现）
- 客户端是否支持单机模式（旧 AloneServerRoom 的替代方案）（C4 后评估）
- NPC 玩家（特殊规则 AI，非填座 AI）
- M6 武将移植顺序（复杂度梯度 vs 势力分组，开工时定）
- 客户端 ChooseManager session 渲染方案（C4 详设）
