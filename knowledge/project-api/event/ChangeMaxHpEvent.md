---
title: ChangeMaxHpEvent
type: api
id: api/event/ChangeMaxHpEvent
rules:
  - events/change-max-hp
  - events/recover-hp
tags: [API, 事件域（logic/event/）]
---

# ChangeMaxHpEvent（类）

- 签名：`export class ChangeMaxHpEvent extends EventProcess<EventType.ChangeMaxHp>`
- 位置：../../shared/core/logic/event/HpEvent.ts#L86
- 规则：[change-max-hp](../../rules/events/change-max-hp.md)

> 体力上限改变事件（统一处理增加/减少，number 正为加、负为减）
> @rules events/change-max-hp
> @description 执行流程：ChangeMaxHpStart → ChangeMaxHpAfter（实际修改）→ ChangeMaxHpEnd；上限降至 ≤0 时触发死亡

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: ChangeMaxHpEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| number | ` get number(): number` |  | 变化值（正=增加，负=减少） |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  |  |
| checkEvent | ` checkEvent(): boolean` |  |  |
| _onChangeMaxHpAfter | ` private async _onChangeMaxHpAfter(_room: Room, _data: ChangeMaxHpEventData): Promise<void>` |  | ChangeMaxHpAfter 之前：修改体力上限并裁剪当前体力 |
