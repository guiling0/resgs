# 0003-FreeKill 同类项目借鉴评估

> 状态：已定案 · 日期：2026-08-02

## 背景

重构全量追齐 old/resgsv1 前，评估同类开源项目 **FreeKill**（新月杀，Lua + Qt，GPL-3.0）的架构，作为横向参考。素材：`freekill-core` 核心 Lua 脚本 + `fkbook-all-in-one` 文档源码（本地镜像于 `.tmp/freekill-core/`、`.tmp/freekill/`）。

## 评估结论

### 已裁定不借鉴（旧项目已有等价物或更优）

| 项目 | FreeKill 做法 | 裁定 | 依据 |
|---|---|---|---|
| 效果类型化 | 状态技拆 8 种类型（distance/prohibit/atkrange/maxcards/targetmod/filter/invalidity/visibility） | **不借鉴** | 旧项目 `StateEffectType` 已细分 30+ 类型（Distance_/MaxHand_/Prohibit_/Range_/Regard_/TargetMod_/Skill_Invalidity 等），比 FreeKill 更具体；`.tmp/shared-backup` 的 EffectBuilder 已为每类型备专门方法，按旧项目为准 |
| 次数限制四档 | max_phase/turn/round/game_use_time + max_branches 细分时段 | **不借鉴** | 旧项目 `maxTimes` 已满足追齐需求 |
| 附加技能机制 | related_skills / add_skills / attached_skill_name | **不借鉴** | 旧项目已有等价机制（related_skills、分发技能等） |
| 私人牌堆 | derived_piles（失去技能时弃置） | **不借鉴** | 旧项目"武将牌堆"区域已覆盖同等语义 |
| CBOR 协议 | json line → cbor 流 | **不借鉴** | 本项目纯消息协议初期 JSON 足够 |

### 已采纳（落点映射）

| 项目 | FreeKill 做法 | 落点 |
|---|---|---|
| AI 收益推演 | 技能内联 AI 策略（keep_value/use_value/use_priority 数值打分 + 沙盒推演） | R4 AutoInput：起步用数值打分启发式，沙盒推演作后续增强 |
| 技能内联 AI 与测试 | `addAI(策略)` + `addTest(fn)` 随技能文件 | R5-R8 内容追齐：sgs-extension 技能学习义务产出技能时同步带 AI 与测试 |
| Exppattern 牌型 DSL | `Exppattern:Parse(".|.|."):matchExp(card)` 统一响应/视为/使用合法性表达 | R3/R5 评估在 TS 实现迷你版（响应指定牌型、转化技"视为"） |
| 事件打断与多触发 | `broken` + `killed`（被杀后只 refresh）+ `triggerableTimes` 多触发计数 | R0 EventProcess：吸收 broken/killed 语义与多触发计数 |
| 事件四段生命周期 | GameEvent：prepare/main/clear/exit + 状态机 + end_id | R0 EventProcess：补齐状态机与 end_id |
| 可见性早设计 | LogMessage 按观察者过滤（旁观不见手牌/身份） | R0-R1 即预留 visibilityFor hook（porting-map 风险 8 提前） |
| 结构化日志 | LogMessage 结构化数据 + 客户端翻译渲染 | R1 观察台日志流：结构化消息 + 客户端渲染 |
| 请求同源校验 | 客户端/服务端共享请求处理器，合法性同源 | R2/R4 选择会话：合法性函数放 shared，客户端实时调用 |
| 确定性模拟验证 | FkTest 注入回复序列 + 断点 + runInRoom | 观察台辅助：半自动化回归工具，不做强制验收 |

## 待讨论

- 技能定义 API 扁平化：FreeKill `CreateSkill{name}.addEffect(...)` 比我们 SkillBuilder/EffectBuilder 两段式更简（奸雄 20 行 vs 现 caocao.ts 骨架）。是否保留 Builder + 新增简写工厂，涉及 resgs-ext-temp 契约，开工前议。

## 参考素材定位

- `.tmp/freekill-core/`：FreeKill 核心 Lua（逻辑参考，不搬代码）
- `.tmp/fkbook/`：FreeKill 文档源码（for-creators/rule + api-reference 最有价值）

> 参考优先级保持：`old/resgsv1/` > `old/shared-backup-2026-08-01/` > FreeKill（同类参考） > 自主思考。
