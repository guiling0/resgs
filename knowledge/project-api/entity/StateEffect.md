---
title: StateEffect
type: api
id: api/entity/StateEffect
rules:
  - terms/card-face-terms/skill
tags: [API, 实体域（entity/）]
---

# StateEffect（类）

- 签名：`export class StateEffect extends Effect`
- 位置：../../shared/core/entity/StateEffect.ts#L13
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 状态类效果——持续生效的修正效果，状态回调由 state 配置承载。
> @rules terms/card-face-terms/skill
> @description 状态类效果类——技能的状态类能力实现

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions)` |  |  |
