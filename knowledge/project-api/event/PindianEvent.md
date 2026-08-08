---
title: PindianEvent
type: api
id: api/event/PindianEvent
rules:
  - events/pindian
tags: [API, 事件域（logic/event/）]
---

# PindianEvent（类）

- 签名：`export class PindianEvent extends EventProcess<EventType.Pindian>`
- 位置：../../shared/core/logic/event/PindianEvent.ts#L14
- 规则：[pindian](../../rules/events/pindian.md)

> 拼点事件
> @rules events/pindian
> @description 执行流程：Pindian（选牌并扣置入处理区）→ PindianCardShow（亮出拼点牌）→ 逐目标 PindianResult（拼点结果确定后）→ PindianEnd

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(room: Room, data: PindianEventData): Player` |  |  |
| player | ` get player(): Player` |  |  |
| targets | ` get targets(): Player[]` |  |  |
| cards | ` get cards(): Map<Player, GameCard>` |  | 各角色的拼点牌 |
| settleResults | ` get settleResults(): Map<Player, { winner?: Player; loser?: Player[] }> \| undefined` |  | 发起者与每名目标的拼点结果 |
| _buildTriggers | ` private _buildTriggers(): void` |  |  |
| check | ` check(): boolean` |  | 发起者存活且有手牌（或已指定拼点牌），目标为存活且有手牌（或已指定拼点牌）的其他角色 |
| exec | ` async exec(): Promise<this>` |  |  |
| _runTiming | ` private async _runTiming(timing: ReturnType<typeof createTiming>): Promise<void>` |  | 执行单个 timing |
| _finish | ` private async _finish(): Promise<this>` |  | 完成事件：执行 endTriggers + processCompleted |
| _onPindianAfter | ` private async _onPindianAfter(_room: Room, _data: PindianEventData): Promise<void>` |  | Pindian 之后：各角色选牌并扣置入处理区 |
| _askForPindianCard | ` private async _askForPindianCard(player: Player): Promise<GameCard \| undefined>` |  | 询问角色选择拼点牌——TODO(R2): 选择系统接线后改为询问玩家，当前默认取手牌第一张 |
| _onPindianCardShowBefore | ` private async _onPindianCardShowBefore(_room: Room, _data: PindianEventData): Promise<void>` |  | PindianCardShow 之前：亮出全部拼点牌 |
| _settleOne | ` private _settleOne(target: Player): void` |  | 确定发起者与目标的拼点结果：点数大者赢，点数相同均未赢；无牌一方不结算 |
