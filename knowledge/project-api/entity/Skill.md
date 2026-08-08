---
title: Skill
type: api
id: api/entity/Skill
rules:
  - terms/card-face-terms/skill
  - terms/resolution-terms/invalid
tags: [API, 实体域（entity/）]
---

# Skill（类）

- 签名：`export class Skill extends Mark`
- 位置：../../shared/core/entity/Skill.ts#L18
- 规则：[skill](../../rules/terms/card-face-terms/skill.md)

> 技能——继承 Mark 具备标记能力。
> 同步字段仅运行时变化项（preshow/showui/invalids）；固定数据经创建消息传递。
> @rules terms/card-face-terms/skill
> @description 技能类——角色拥有的技能包括其武将技能和装备技能

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| id | `id: number` |  | 技能自增 id（房间内唯一） |
| name | `name: string` |  | 技能全名 |
| player | `player?: Player` |  | 所属玩家 |
| sourceGeneral | `sourceGeneral?: General` |  | 来源武将（装备技能为空） |
| fromEquip | `fromEquip: boolean` |  | 是否来源于装备（装备技能为 true） |
| sourceEffect | `sourceEffect?: Effect` |  | 来源效果（化身等技能派生） |
| invalids | `@syncArray() invalids: StateArray<string>` |  | 失效原因列表（非空即失效） |
| preshow | `@sync() preshow: boolean` |  | 是否可预览 |
| showui | `@sync() showui: string` |  | 按钮显示方式 |
| data | `data: Record<string, unknown>` |  | 自定义数据（运行时选项注入） |
| sourceData | `readonly sourceData: SkillData` |  | 源数据（注册构建的技能定义，外部可读；触发配置/回调经此获取） |
| constructor | ` constructor( room: Room, data: SkillData, player?: Player, options: SkillOptions = {}, )` |  |  |
| trueName | ` get trueName(): string` |  | 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） |
| attachedEquip | ` get attachedEquip(): string \| undefined` |  | 附加装备牌名（attached_equip，装备技能所属的装备牌） |
| isEquipSkill | ` isEquipSkill(subtype: CardSubType): boolean` |  | 是否为指定副类别装备的技能（如防具技能：isEquipSkill(CardSubType.Armor)） |
| [isInvalid](../../rules/terms/resolution-terms/invalid.md) | ` get isInvalid(): boolean` | [invalid](../../rules/terms/resolution-terms/invalid.md) | 是否失效 |
| isOpen | ` isOpen(): boolean` |  | 所属武将牌是否明置（明置状态数据未就绪，默认明置） |
| check | ` check(): boolean` |  | 技能是否可用：未被禁用、未被无视且来源正常 |
| _isIgnored | ` private _isIgnored(): boolean` |  | 是否被无视：存在命中 filter 的无视记录且当前结算由无视者发起 |
| _isInScope | ` private _isInScope(source: Player): boolean` |  | 当前结算是否由 source 发起：从事件栈顶向下找最近有发起者的事件 |
| setInvalids | ` setInvalids(reason: string, state: boolean = true): void` |  | 设置失效（同一原因不重复添加） |
| removeSelf | ` async removeSelf(_removeSkill: boolean = false): Promise<void>` |  | 移除自身（含关联效果） |
