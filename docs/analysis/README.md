# 实现分析文档（docs/analysis/）

> 本目录存放**新旧项目实现对比分析**：权威规则文档（`docs/definitions|events|terms`）定义"应该是什么"，本目录回答"旧项目怎么做的（问题何在）、新项目怎么做（缺口何在）、如何移植/重设计"。
> 生成方式：2026-07-18 基于旧项目 git HEAD 与新项目代码的并行深度分析。技能实例均来自旧项目 `extensions/` 真实代码。

## 目录

| 文档 | 覆盖范围 | 关键发现 |
|---|---|---|
| [events-turn-phase.md](events-turn-phase.md) | 回合事件 14 时机 + 阶段事件 24 时机 + 开始前流程 6 步，约 25 个技能例 | B1 翻面跳过后未翻回（永久跳过）；B2 skipPhase 双重回归；B3 drawCount 丢失归零锁死语义 |
| [events-use-drop.md](events-use-drop.md) | need/pre/使用事件三子类/打出事件，含 10 条移植注意 | 旧 need3 实际在用（武圣）；响应窗口 triggerNot+手动定向触发；打出实体牌须避开处理区自动清理 |
| [events-damage-hp-death.md](events-damage-hp-death.md) | 伤害 9 时机 + 体力族 + 濒死/死亡，13 项差异风险清单 | B8 扣血发生在 ReduceHpAfter 之后（时机技能读到扣前 hp）；B9 濒死转死亡在 DyingEnd 之后（与规则顺序相反）；B10 _handleChain 未解除自身致 triggerChain 误判 |
| [events-move-judge-state.md](events-move-judge-state.md) | 移动/判定/拼点/状态改变/技能使用 | B5 getLoseDatas('h') 漏判交给；B6 处理区清理不产生时机；拼点 11 项移植清单；settleResults 修复旧版多目标覆写缺陷 |
| [terms.md](terms.md) | 8 个操作用语技能例 + 7 个 room 操作入口对比 | recoverTo/check 缩减基准不一致；damage 缺 transfer；give 洗混未覆盖 |
| [skill-framework.md](skill-framework.md) | 旧技能框架逐例拆解 + 新框架六要素缺口 + 8 条修改方向 | B4 无消耗技能恒不发动；B7 selectors/autoRemove 无消费方；触发主循环补全为首位任务 |
| [architecture.md](architecture.md) | 旧整体架构 13 个冲突点 + 新重构方案（核心/服务端/客户端），对齐 M1-M8 | 双通道同步废弃、GameRoom 薄适配层、客户端 LayaAir 3.4.0 架构原则（具体实现见 .scratch/client/design.md） |

## 与其他文档的关系

- **Bug 清单**（B1-B7）与**裁定落实待办**（A1/A2/A8）汇总在 [.scratch/porting/pending-impl.md](../../.scratch/porting/pending-impl.md) 顶部——实现对应里程碑时消化
- 裁定记录见 [.scratch/porting/pending-rulings.md](../../.scratch/porting/pending-rulings.md)（R1-R8）
- 里程碑路线见 [.scratch/porting/map.md](../../.scratch/porting/map.md)（M1-M8）
