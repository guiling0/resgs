---
title: Effect
type: api
id: api/entity/Effect
rules:
  - terms/card-face-terms/skill
  - terms/resolution-terms/invalid
tags: [API, 实体域（entity/）]
---

# Effect（类）

- 签名：`export abstract class Effect extends Mark`
- 位置：../../shared/core/entity/Effect.ts#L14
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 效果——继承 Mark 具备标记能力，按类别派生 TriggerEffect/StateEffect。
> 固定数据（id/name/来源引用）经创建消息传递，无运行时同步字段。
> @rules terms/card-face-terms/skill
> @description 效果类——技能能力的运行时载体

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| id | `id: number` |  | 效果自增 id（房间内唯一） |
| name | `name: string` |  | 效果名 |
| skill | `skill?: Skill` |  | 所属技能 |
| player | `player?: Player` |  | 所属玩家 |
| type | `type: EffectType` |  | 效果类别（触发/状态） |
| data | `data: Record<string, unknown>` |  | 自定义数据（运行时选项注入） |
| sourceData | `readonly sourceData: EffectData` |  | 源数据（注册构建的效果定义，外部可读；触发/状态配置经此获取） |
| constructor | ` constructor( room: Room, data: EffectData, skill?: Skill, player?: Player, type: EffectType = EffectType.T…` |  |  |
| hasTrigger | ` get hasTrigger(): boolean` |  | 是否为触发类效果 |
| hasState | ` get hasState(): boolean` |  | 是否为状态类效果 |
| [isInvalid](../../rules/terms/resolution-terms/invalid.md) | ` get isInvalid(): boolean` | [invalid](../../rules/terms/resolution-terms/invalid.md) | 是否失效（仅效果自身失效状态；源技能失效由所属技能判定） |
| hasSkillTag | ` hasSkillTag(tag?: SkillTag): boolean` |  | 是否拥有指定技能标签（未传时判断是否有任意标签） |
| isLock | ` get isLock(): boolean` |  | 是否锁定技效果 |
| isLimit | ` get isLimit(): boolean` |  | 是否限定技效果 |
| isAwake | ` get isAwake(): boolean` |  | 是否觉醒技效果 |
| isLord | ` get isLord(): boolean` |  | 是否主公技效果 |
| isArray | ` get isArray(): boolean` |  | 是否阵法技效果 |
| isOpen | ` isOpen(): boolean` |  | 所属武将牌是否明置（武将牌数据未就绪时默认明置） |
| check | ` check(): boolean` |  | 效果是否可用（通用检测）：自身失效、源技能失效、标签固定检测。 |
| removeSelf | ` async removeSelf(_removeSkill: boolean = false): Promise<void>` |  | 移除自身（含关联技能）——TODO(R3): 技能管理器（SkillManager）实现后接线 |
