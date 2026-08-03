# R3 技能框架（Skill Framework / 端到端）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r3.md](../issues/r3.md)

## 需求

建立**技能运行框架**并验证 2-3 个标准武将技能：判定、技能使用事件、触发/状态效果、标记系统。

1. **判定**：JudgeEvent 五时机 + 判定牌确定/改判 + 判定结果=虚拟牌数据（见 [judge.md](../../domain/events/judge.md)）；延时锦囊（乐不思蜀/闪电）进判定阶段
2. **技能使用**：UseSkillEvent（声明/选目标/消耗同时性、消耗原子性、效果过滤、Cost/Effect 时机，见 [use-skill.md](../../domain/events/use-skill.md)）
3. **技能框架**：SkillBuilder/EffectBuilder 完善（触发效果：trigger/can_trigger/condition/choose/cost/effect/forced；状态效果互斥）；SkillManager 索引与优先级调度；refreshs 回调
4. **标记系统**：MarkHost + `@syncMap` 自动同步，标记显示在座位 UI
5. **标准武将样例**：曹操（奸雄）、关羽（武圣）、刘备（仁德）——奸雄已存在于 resgs-ext-temp，武圣/仁德按同一形态补充
6. **协议新增**：judge 结果、技能发动 choice + 客户端监听（判定结果展示、技能发动提示、标记显示）

## 目标

- 全 AI 对局中技能可触发、判定可执行、标记可显示
- 验证技能框架 API 可用，为 R5（标准内容全量）铺路

## 前置依赖

- R2（战斗生死：技能效果作用在伤害/牌使用之上）

## 验收标准

1. 全 AI 对局触发判定（延时锦囊判定/技能判定），判定结果在观察台展示
2. 三个技能样例全部可发动：奸雄（受伤摸牌）、武圣（红牌当杀）、仁德（给牌/补牌），选择 UI 弹出、效果生效、日志正确
3. 技能标记（如仁德的「仁德」计数）经 `@syncMap` 显示在座位 UI
4. UseSkillEvent 消耗原子性：声明/选目标/消耗同批处理，消耗失败则效果不结算
5. docs/domain/events 对照：judge/use-skill/change-state（明置基础）三档语义落地

## 产出物

- `shared/core/event/`（JudgeEvent/UseSkillEvent）
- `shared/core/skill/`（Skill/Effect/SkillManager/Builder 完善）
- 标准武将：caocao/guanyu/liubei（resgs-ext-temp 扩展包内）
- `shared/core/transport/messages.ts` 新增 judge/技能消息
- 客户端监听 + 观察台 v1 扩展（判定展示/标记显示）
