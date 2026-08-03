# R2 战斗生死（Battle & Death / 端到端）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r2.md](../issues/r2.md)

## 需求

让对局产生**伤害与死亡**：牌的使用/打出、伤害结算、体力变化、濒死求桃、死亡离场与奖惩，端到端可视化。

1. **牌的使用**：UseCardEvent（预使用→使用，预结算 8 时机 + 循环 AB 结算，见 [use-card.md](../../domain/events/use-card.md)、[use-card-and-need.md](../../domain/events/use-card-and-need.md)）；基本牌杀/闪/桃的合法性与目标选择；「杀」次数语义
2. **牌的打出**：DropCardEvent（需要打出/预打出/打出，见 [drop-card.md](../../domain/events/drop-card.md)）
3. **伤害结算**：DamageEvent 九时机 + 伤害值确定点 + 属性/连环伤害字段（见 [damage.md](../../domain/events/damage.md)）
4. **体力变化**：失去/扣减/回复体力、体力上限改变（见 [hp-events.md](../../domain/events/hp-events.md)）
5. **濒死与死亡**：濒死响应循环（全场求桃）、死亡事件（身份确认/离场/奖惩，见 [dying-death.md](../../domain/events/dying-death.md)）
6. **击杀奖惩**：击杀者摸 3 弃 2（身份局规则）
7. **协议新增**：`choice / card.move / face.ani / toast` 消息 + 客户端监听（血量变化+掉血参数、濒死求桃、死亡离场）
8. **观察台 v1**：血量动画、濒死/死亡弹窗

## 目标

- 全 AI 对局出现完整战斗链：杀→闪响应→伤害扣血→濒死求桃→死亡离场→奖惩
- 伤害时「体力 + 掉血参数」同批次到达客户端

## 前置依赖

- R1（对局骨架）

## 验收标准

1. 全 AI 对局出现：杀/闪响应、伤害扣血、濒死求桃、死亡离场、击杀奖惩，日志事件链完整
2. 观察台：血量动画、濒死/死亡弹窗出现；`choice/card.move/face.ani/toast` 消息在消息流可见且客户端监听生效
3. 同步原子性：扣血 + 掉血参数在同一条 patches 消息中到达（观察台日志确认）
4. 事件时序：询问（choice）发出前状态已 flush
5. docs/domain/events 对照：damage/hp-events/dying-death/use-card/drop-card/use-card-and-need 六档语义落地

## 产出物

- `shared/core/event/`（UseCardEvent/DropCardEvent/DamageEvent/HpEvent/DyingEvent/DeathEvent）
- 牌使用技能（cardskills）框架初版：sha/shan/tao 使用逻辑
- `shared/core/transport/messages.ts` 新增 choice/card.move/face.ani/toast
- 客户端监听 + 观察台 v1
