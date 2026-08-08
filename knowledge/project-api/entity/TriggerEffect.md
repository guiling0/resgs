---
title: TriggerEffect
type: api
id: api/entity/TriggerEffect
rules:
  - terms/card-face-terms/skill
tags: [API, 实体域（entity/）]
---

# TriggerEffect（类）

- 签名：`export class TriggerEffect extends Effect`
- 位置：../../shared/core/entity/TriggerEffect.ts#L16
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 触发类效果——响应事件时机的效果。
> 触发配置执行（can_trigger/choose/cost/effect 回调）与发动行为判定在此类。
> @rules terms/card-face-terms/skill
> @description 触发类效果类——技能的触发类能力实现

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions)` |  |  |
| getMaxTimes | ` getMaxTimes(player: Player, data: TimingData<TimingTrigger>): number` |  | 解析最大发动次数。number=固定值，function=实时计算，-1=无限制。 |
| canAutoExecute | ` canAutoExecute(): boolean` |  | 是否可以自动发动（无需询问玩家）。 |
| isViewAsOrPlayPhase | ` get isViewAsOrPlayPhase(): boolean` |  | 是否为使用/打出/出牌阶段类效果（需要牌相关询问流程） |
| canTrigger | ` canTrigger(player: Player, data: TimingData<TimingTrigger>): boolean` |  | 时机条件检测（无回调默认通过） |
| buildContext | ` buildContext(player: Player, data: TimingData<TimingTrigger>): EffectContext` |  | 构建本次发动上下文（无回调返回最小上下文） |
| hasChoose | ` get hasChoose(): boolean` |  | 是否有发动前选择回调 |
| execChoose | ` execChoose(player: Player, ctx: EffectContext): Promise<unknown>` |  | 执行发动前选择回调 |
| hasCost | ` get hasCost(): boolean` |  | 是否有技能消耗回调 |
| execCost | ` execCost(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown>` |  | 执行技能消耗 |
| hasEffect | ` get hasEffect(): boolean` |  | 是否有技能效果回调 |
| execEffect | ` execEffect(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown>` |  | 执行技能效果 |
