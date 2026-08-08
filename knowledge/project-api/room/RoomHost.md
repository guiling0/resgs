---
title: RoomHost
type: api
id: api/room/RoomHost
rules:
  - terms/card-op-terms/discard
  - terms/card-op-terms/discardTo
  - terms/card-op-terms/draw
  - terms/card-op-terms/drawTo
  - terms/card-op-terms/dropCard
  - terms/card-op-terms/flashCards
  - terms/card-op-terms/give
  - terms/card-op-terms/judge
  - terms/card-op-terms/moveCards
  - terms/card-op-terms/obtain
  - terms/card-op-terms/pindian
  - terms/card-op-terms/putFaceDown
  - terms/card-op-terms/putTo
  - terms/card-op-terms/recast
  - terms/card-op-terms/showCards
  - terms/card-op-terms/shuffleDiscardToDraw
  - terms/card-op-terms/swap
  - terms/card-op-terms/useCard
  - terms/card-op-terms/watch
  - terms/description-terms/arraycall
  - terms/description-terms/damage
  - terms/description-terms/for_each
  - terms/description-terms/junling
  - terms/description-terms/recover
  - terms/description-terms/recover_to
  - terms/description-terms/reduce_hp
  - terms/description-terms/repeat
  - terms/description-terms/shiqujineng
  - terms/game-flow-terms/turn
  - terms/general-op-terms/chain
  - terms/general-op-terms/change
  - terms/general-op-terms/close
  - terms/general-op-terms/open
  - terms/general-op-terms/remove
  - terms/general-op-terms/reset
  - terms/general-op-terms/restore
  - terms/general-op-terms/skip
  - terms/general-op-terms/stack
  - terms/resolution-terms/ignore
  - terms/zone-terms/area
tags: [API, 房间宿主域（logic/room/）]
---

# RoomHost（类）

- 签名：`export class RoomHost implements VirtualCardAbility`
- 位置：../../shared/core/logic/room/RoomHost.ts#L41

> 房间主机——权威端房间业务逻辑聚合（仅权威端运行时存在）。
> 能力经 mixin 组合注入：vcard（虚拟牌）+ event（事件系统：管理器 + 事件栈 + 历史 + 移动族）。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| vcard | `readonly vcard: VirtualCardHost` |  | vCard 能力（mixin 注入） |
| event | `readonly event: EventManager` |  | 事件管理器（触发调度/事件创建/refreshs） |
| eventStack | `readonly eventStack: EventProcess[]` |  | 当前事件栈（执行中的事件链，不含 Turn/Phase） |
| turnStack | `readonly turnStack: TurnEvent[]` |  | 回合栈 |
| phaseStack | `readonly phaseStack: PhaseEvent[]` |  | 阶段栈 |
| deferredOpens | `readonly deferredOpens: EventProcess<EventType.Open>[]` |  | 延迟明置队列（事件栈排空后按序触发 Open 时机） |
| fuhuos | `readonly fuhuos: Array<()` |  | 复活回调队列（伤害/失去体力结束后排空） |
| _history | `private readonly _history: EventProcess[]` |  | 事件历史（insertHistory/getLastOneHistory） |
| mode | `mode?: GameModeData` |  | 游戏模式（startGame 时从 sgs.modes 获取） |
| currentTurn | ` get currentTurn(): TurnEvent \| undefined` |  | 当前回合（栈顶） |
| currentPhase | ` get currentPhase(): PhaseEvent \| undefined` |  | 当前阶段（栈顶） |
| constructor | ` constructor(readonly room: Room)` |  |  |
| [damage](../../rules/terms/description-terms/damage.md) | ` damage( player: Player \| undefined, target: Player, number: number, damageType: DamageType, opts?: EventOp…` | [damage](../../rules/terms/description-terms/damage.md) | 造成伤害 |
| loseHp | ` loseHp(player: Player, number: number, opts?: EventOpts): Promise<LoseHpEvent>` |  | 失去体力 |
| [reduceHp](../../rules/terms/description-terms/reduce_hp.md) | ` reduceHp(player: Player, number: number, opts?: EventOpts): Promise<ReduceHpEvent>` | [reduce_hp](../../rules/terms/description-terms/reduce_hp.md) | 扣减体力 |
| [recover](../../rules/terms/description-terms/recover.md) | ` recover(player: Player, number: number, opts?: EventOpts): Promise<RecoverHpEvent>` | [recover](../../rules/terms/description-terms/recover.md) | 回复体力 |
| [recoverTo](../../rules/terms/description-terms/recover_to.md) | ` async recoverTo(player: Player, toHp: number, opts?: EventOpts): Promise<RecoverHpEvent \| undefined>` | [recover_to](../../rules/terms/description-terms/recover_to.md) | 将体力回复至X点 |
| changeMaxHp | ` changeMaxHp(player: Player, number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent>` |  | 改变体力上限 |
| dying | ` dying(player: Player, opts?: EventOpts): Promise<DyingEvent>` |  | 进入濒死 |
| die | ` die(player: Player, opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent>` |  | 死亡 |
| [judge](../../rules/terms/card-op-terms/judge.md) | ` judge(player: Player, opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent>` | [judge](../../rules/terms/card-op-terms/judge.md) | 判定：触发一个判定事件 |
| [pindian](../../rules/terms/card-op-terms/pindian.md) | ` pindian( player: Player, targets: Player[], opts?: EventOpts & Partial<Omit<PindianEventData, 'player' \| '…` | [pindian](../../rules/terms/card-op-terms/pindian.md) | 拼点：触发一个拼点事件 |
| changeState | ` changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<…` |  | 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） |
| [startGame](../../rules/terms/game-flow-terms/turn.md) | ` async startGame(): Promise<void>` | [turn](../../rules/terms/game-flow-terms/turn.md) | 开始游戏：获取模式 → beforeStart → 主流程 |
| [mainProcess](../../rules/terms/game-flow-terms/turn.md) | ` async mainProcess(): Promise<void>` | [turn](../../rules/terms/game-flow-terms/turn.md) | 游戏主流程：按额定回合与额外回合交替创建并执行回合事件 |
| _getNextPlayer | ` private _getNextPlayer(last: TurnEvent \| undefined): Player` |  | 确定下一名执行回合的玩家（跳过死亡；休整玩家由回合事件处理） |
| [repeat](../../rules/terms/description-terms/repeat.md) | ` async repeat(times: number, fn: (): Promise<void>` | [repeat](../../rules/terms/description-terms/repeat.md) | 依次操作：重复执行操作 X 次 |
| [forEachPlayer](../../rules/terms/description-terms/for_each.md) | ` async forEachPlayer( players: Player[], fn: (player: Player): Promise<void>` | [for_each](../../rules/terms/description-terms/for_each.md) | 各执行操作：玩家数组按响应顺序依次执行操作 |
| [loseGeneralSkills](../../rules/terms/description-terms/shiqujineng.md) | ` async loseGeneralSkills(player: Player): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有武将技能：移除该玩家所有非规则、非装备来源的技能 |
| [loseAllSkills](../../rules/terms/description-terms/shiqujineng.md) | ` async loseAllSkills(player: Player): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有技能：移除该玩家所有技能 |
| [loseSkillsOfGeneral](../../rules/terms/description-terms/shiqujineng.md) | ` async loseSkillsOfGeneral(player: Player, general: General): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有武将牌上的技能：移除该玩家指定武将牌来源的所有技能 |
| [command](../../rules/terms/description-terms/junling.md) | ` async command(from: Player, to: Player, command?: number): Promise<void>` | [junling](../../rules/terms/description-terms/junling.md) | 军令：发起者确定军令，执行者选择是否执行并结算 |
| _executeCommand | ` private async _executeCommand(from: Player, to: Player, command: number): Promise<void>` |  | 军令分支结算（军令 1~6） |
| getCommands | ` getCommands(count: number = 2): number[]` |  | 随机获取军令：从军令牌堆随机获取不重复的军令并移除 |
| returnCommand | ` returnCommand(command: number): void` |  | 将军令放回军令牌堆（含去重） |
| xiance | ` async xiance(from: Player, to: Player, miaoji?: number): Promise<void>` |  | 献策：发起者给执行者献计，执行者选择是否执行并结算 |
| _executeMiaoji | ` private async _executeMiaoji(from: Player, to: Player, miaoji: number): Promise<void>` |  | 妙计分支结算（妙计 80~91） |
| getMiaoji | ` getMiaoji(count: number = 1): number[]` |  | 随机获取妙计：从妙计牌堆随机获取不重复的妙计并移除 |
| returnMiaoji | ` returnMiaoji(miaoji: number): void` |  | 将妙计放回妙计牌堆（含去重） |
| [arraycall](../../rules/terms/description-terms/arraycall.md) | ` async arraycall(player: Player, type: 'queue' \| 'siege'): Promise<void>` | [arraycall](../../rules/terms/description-terms/arraycall.md) | 阵法召唤 |
| _canArrayCall | ` private _canArrayCall(player: Player, type: 'queue' \| 'siege'): boolean` |  | 阵法召唤前置条件（1-5） |
| _siegeCondition5 | ` private _siegeCondition5(player: Player): boolean` |  | 围攻条件5：A 的上家的上家或下家的下家无势力，且中间角色与 A 势力不同 |
| _queueCondition5 | ` private _queueCondition5(player: Player): boolean` |  | 队列条件5：A 按顺时针或逆时针路径至无势力角色，路径上无与 A 势力不同的角色 |
| _findQueueTarget | ` private _findQueueTarget(player: Player, direction: 'clockwise' \| 'anticlockwise'): Player \| undefined` |  | 沿方向查找路径上第一个无势力角色（路径上出现不同势力角色即失败） |
| _arraycallQueue | ` private async _arraycallQueue(player: Player): Promise<void>` |  | 队列阵法召唤流程：a、b 均满足时先逆时针后顺时针，已明置过的角色不再参与 |
| _arraycallQueueDir | ` private async _arraycallQueueDir( player: Player, direction: 'clockwise' \| 'anticlockwise', opened: Set<Pl…` |  | 沿单一方向执行队列阵法召唤检测：响应者明置后继续检测下一名，否则终止 |
| _arraycallSiege | ` private async _arraycallSiege(player: Player): Promise<void>` |  | 围攻阵法召唤流程：下家的下家先、上家的上家后，各询问一次 |
| _askArrayCallResponse | ` private async _askArrayCallResponse(_responder: Player, _caller: Player): Promise<boolean>` |  | 询问响应者是否明置武将牌响应阵法召唤（明置后势力与发动者相同才可选择） |
| [open](../../rules/terms/general-op-terms/open.md) | ` open(player: Player, generals: General[]): Promise<ChangeStateEvent>` | [open](../../rules/terms/general-op-terms/open.md) | 明置武将 |
| [close](../../rules/terms/general-op-terms/close.md) | ` close(player: Player, generals: General[]): Promise<ChangeStateEvent>` | [close](../../rules/terms/general-op-terms/close.md) | 暗置武将 |
| [chain](../../rules/terms/general-op-terms/chain.md) | ` chain(player: Player): Promise<ChangeStateEvent>` | [chain](../../rules/terms/general-op-terms/chain.md) | 横置：武将牌竖放的角色将其武将牌横放（进入连环状态） |
| [reset](../../rules/terms/general-op-terms/reset.md) | ` reset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` | [reset](../../rules/terms/general-op-terms/reset.md) | 重置：武将牌横放的角色将其武将牌竖放（脱离连环状态） |
| chainOrReset | ` chainOrReset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` |  | 横置/重置：按当前连环状态取反（便捷方法） |
| [skip](../../rules/terms/general-op-terms/skip.md) | ` skip(player: Player, toState?: boolean): Promise<ChangeStateEvent>` | [skip](../../rules/terms/general-op-terms/skip.md) | 翻面 |
| [stack](../../rules/terms/general-op-terms/stack.md) | ` stack(player: Player, toState?: boolean): Promise<ChangeStateEvent>` | [stack](../../rules/terms/general-op-terms/stack.md) | 叠置：与翻面同一逻辑 |
| [change](../../rules/terms/general-op-terms/change.md) | ` change(player: Player, general: General \| 'head' \| 'deputy', toGeneral: General): Promise<ChangeStateEvent>` | [change](../../rules/terms/general-op-terms/change.md) | 变更武将 |
| [remove](../../rules/terms/general-op-terms/remove.md) | ` remove(player: Player, general: General): Promise<ChangeStateEvent>` | [remove](../../rules/terms/general-op-terms/remove.md) | 移除武将 |
| [restore](../../rules/terms/general-op-terms/restore.md) | ` async restore(player: Player): Promise<void>` | [restore](../../rules/terms/general-op-terms/restore.md) | 复原：按武将牌状态组合重置/翻面 |
| [addIgnore](../../rules/terms/resolution-terms/ignore.md) | ` addIgnore(source: Player, target: Player, filter?: (skill: Skill): void` | [ignore](../../rules/terms/resolution-terms/ignore.md) | 无视：source 无视 target 的满足 filter 的技能 |
| [removeIgnore](../../rules/terms/resolution-terms/ignore.md) | ` removeIgnore(source: Player, target: Player, filter?: (skill: Skill): void` | [ignore](../../rules/terms/resolution-terms/ignore.md) | 移除无视 |
| insertHistory | ` insertHistory(event: EventProcess): void` |  | 记录事件到历史 |
| getLastOneHistory | ` getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T): T \| undefined` |  | 查询最后一个指定类型的历史事件 |
| [moveCards](../../rules/terms/card-op-terms/moveCards.md) | ` async moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [moveCards](../../rules/terms/card-op-terms/moveCards.md) | 移至：将牌从另一区域移动到此区域 |
| [moveCardsRaw](../../rules/terms/card-op-terms/moveCards.md) | ` async moveCardsRaw(datas: MoveCardData[], opts?: { getMoveLabel?: (data: MoveCardData): Promise<MoveCardEv…` | [moveCards](../../rules/terms/card-op-terms/moveCards.md) | 移至：将牌从另一区域移动到此区域（完整数据数组） |
| getNCards | ` async getNCards(count: number, pos: 'top' \| 'bottom' = 'top'): Promise<GameCard[]>` |  | 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），洗牌后仍不足则平局结束游戏并返回空。 |
| [shuffleDiscardToDraw](../../rules/terms/card-op-terms/shuffleDiscardToDraw.md) | ` async shuffleDiscardToDraw(): Promise<void>` | [shuffleDiscardToDraw](../../rules/terms/card-op-terms/shuffleDiscardToDraw.md) | 洗牌：系统将弃牌堆里的所有牌洗混后置入牌堆 |
| [putTo](../../rules/terms/card-op-terms/putTo.md) | ` async putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putTo](../../rules/terms/card-op-terms/putTo.md) | 置于/入：将牌按目标区域默认放置方式移至目标区域 |
| [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | ` async putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | 扣置于/入：将牌移至目标区域且背面朝上放置 |
| [draw](../../rules/terms/card-op-terms/draw.md) | ` async draw(player: Player, count: number = 1, pos: 'top' \| 'bottom' = 'top', opts?: MoveCardOpts): Promise…` | [draw](../../rules/terms/card-op-terms/draw.md) | 摸牌：从牌堆摸 count 张到玩家手牌 |
| [drawTo](../../rules/terms/card-op-terms/drawTo.md) | ` async drawTo(player: Player, count: number): Promise<void>` | [drawTo](../../rules/terms/card-op-terms/drawTo.md) | 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌 |
| [discard](../../rules/terms/card-op-terms/discard.md) | ` async discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent>` | [discard](../../rules/terms/card-op-terms/discard.md) | 弃牌：将牌移动到弃牌堆 |
| [abolishArea](../../rules/terms/zone-terms/area.md) | ` async abolishArea(player: Player, target: EquipSubType \| AreaType.Judge): Promise<void>` | [area](../../rules/terms/zone-terms/area.md) | 废除区域：将对应区域（或对应已有装备）里的所有牌置入弃牌堆，并记录废除状态 |
| [restoreArea](../../rules/terms/zone-terms/area.md) | ` restoreArea(player: Player, target: EquipSubType \| AreaType.Judge): void` | [area](../../rules/terms/zone-terms/area.md) | 恢复区域：删除废除记录 |
| [discardTo](../../rules/terms/card-op-terms/discardTo.md) | ` async discardTo(player: Player, cards: GameCard[], count: number): Promise<void>` | [discardTo](../../rules/terms/card-op-terms/discardTo.md) | 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌 |
| [obtain](../../rules/terms/card-op-terms/obtain.md) | ` async obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` | [obtain](../../rules/terms/card-op-terms/obtain.md) | 获得牌：将牌移动到操作者手牌区 |
| [give](../../rules/terms/card-op-terms/give.md) | ` async give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCard…` | [give](../../rules/terms/card-op-terms/give.md) | 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 |
| [swap](../../rules/terms/card-op-terms/swap.md) | ` async swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts):…` | [swap](../../rules/terms/card-op-terms/swap.md) | 交换牌：两批牌同时置入处理区后分别移动到对方区域 |
| [recast](../../rules/terms/card-op-terms/recast.md) | ` async recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Prom…` | [recast](../../rules/terms/card-op-terms/recast.md) | 重铸：将牌置入弃牌堆后摸等量牌 |
| [watch](../../rules/terms/card-op-terms/watch.md) | ` async watch(player: Player, cards: (GameCard \| General): Promise<void>` | [watch](../../rules/terms/card-op-terms/watch.md) | 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作 |
| [showCards](../../rules/terms/card-op-terms/showCards.md) | ` async showCards(_player: Player \| undefined, _cards: GameCard[]): Promise<void>` | [showCards](../../rules/terms/card-op-terms/showCards.md) | 展示牌：将牌翻转至正面朝上展示（无实际区域移动） |
| [flashCards](../../rules/terms/card-op-terms/flashCards.md) | ` async flashCards(player: Player \| undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<void>` | [flashCards](../../rules/terms/card-op-terms/flashCards.md) | 亮出牌：牌堆牌置入处理区，其他牌等同展示 |
| removeToReserve | ` async removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` |  | 移存牌：将牌移动到后备区 |
| initCardUses | ` initCardUses(): void` |  | 注册牌的使用方式定义（从 sgs.carduses 拷贝到房间索引）。 |
| [useCard](../../rules/terms/card-op-terms/useCard.md) | ` async useCard(player: Player, card: VirtualCard, targets: Player[] = []): Promise<UseCardEvent>` | [useCard](../../rules/terms/card-op-terms/useCard.md) | 使用牌：触发牌的使用事件 |
| [dropCard](../../rules/terms/card-op-terms/dropCard.md) | ` async dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent>` | [dropCard](../../rules/terms/card-op-terms/dropCard.md) | 打出牌：触发牌的打出事件 |
| createVirtualCard | ` createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(data: VirtualCardData): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard( nameOrCardOrData: string \| GameCard \| VirtualCardData, subcardsOrOverrides?: GameCard[]…` |  |  |
| destroyVirtualCard | ` destroyVirtualCard(vc: VirtualCard): void` |  |  |
