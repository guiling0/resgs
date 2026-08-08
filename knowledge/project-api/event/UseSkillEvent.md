---
title: UseSkillEvent
type: api
id: api/event/UseSkillEvent
rules:
  - events/use-skill
tags: [API, 事件域（logic/event/）]
---

# UseSkillEvent（类）

- 签名：`export class UseSkillEvent extends EventProcess<EventType.UseSkill>`
- 位置：../../shared/core/logic/event/UseSkillEvent.ts#L16
- 规则：[use-skill](../../rules/events/use-skill.md)

> 技能使用事件
> @rules events/use-skill
> @description 技能发动流程编排（不使用时序驱动，重写 exec()）：排序目标 → choose → 明置武将 → 历史 → limit/awake 标记 → cost → Cost 时机 → effect → Effect 时机

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: UseSkillEventData): TriggerEffect` |  |  |
| effect | ` get effect(): TriggerEffect` |  |  |
| context | ` get context(): EffectContext` |  |  |
| used | ` get used(): boolean` |  |  |
| _prevEffect | `private _prevEffect?: Effect` |  |  |
| init | ` protected async init(): Promise<void>` |  |  |
| exec | ` async exec(): Promise<this>` |  |  |
| _finalize | ` private async _finalize(): Promise<void>` |  |  |
