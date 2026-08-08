---
title: ChangeStateEvent
type: api
id: api/event/ChangeStateEvent
rules:
  - events/change-state
tags: [API, 事件域（logic/event/）]
---

# ChangeStateEvent（类）

- 签名：`export class ChangeStateEvent extends EventProcess<ChangeStateType>`
- 位置：../../shared/core/logic/event/ChangeStateEvent.ts#L46
- 规则：[change-state](../../rules/events/change-state.md)

> 武将牌状态改变事件，统一处理 6 种状态变更（明置/暗置/连环/翻面/变更/移除）
> @rules events/change-state
> @description 执行流程：ChangeState → ChangeStateAfter（执行实际变更）→ ChangeStateEnd（公共）；Open 额外在 ChangeStateAfter 中将事件推入 deferredOpens

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: ChangeStateData & { _type?: ChangeStateType }): Player` |  |  |
| player | ` get player(): Player` |  |  |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  |  |
| _onChangeStateAfter | ` private async _onChangeStateAfter(_room: Room, _data: ChangeStateData): Promise<void>` |  | ChangeStateAfter 之前：执行实际状态变更 |
| _applyOpen | ` private _applyOpen(): void` |  |  |
| _applyClose | ` private _applyClose(): void` |  |  |
| _applyChain | ` private _applyChain(): void` |  |  |
| _applySkip | ` private _applySkip(): void` |  |  |
| prevent | ` async prevent(): Promise<this>` |  | 防止状态改变（仅在 ChangeState 时机可调用） |
| _checkToggle | ` private _checkToggle(prop: 'chained' \| 'skip'): boolean` |  | 连环/翻面：toState 未指定时取当前状态取反 |
| _checkGeneralFilter | ` private _checkGeneralFilter(currentPut: boolean): boolean` |  | 明置/暗置：过滤已在目标状态的武将（明置检查未明置的，暗置检查已明置的）， |

### detectChangeStateType（函数）

- 签名：`export function detectChangeStateType(data: ChangeStateData): ChangeStateType {`
- 位置：../../shared/core/logic/event/ChangeStateEvent.ts#L31
- 规则：[change-state](../../rules/events/change-state.md)

> 根据数据形状推断 ChangeState 的子类型
> @rules events/change-state
> @description 数据形状与子类型的对应关系：
> - `toGeneral` 存在 → Change
> - `general` 存在 → Remove
> - `damageType` 存在 → Chain
> - `toState` + `generals` → Open/Close（toState=true→Open, false→Close）
> - `toState` 单独存在 → Skip
> @param data ChangeState 联合事件数据
> @returns 推断出的 ChangeState 子类型
