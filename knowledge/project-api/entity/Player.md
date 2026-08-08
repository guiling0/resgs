---
title: Player
type: api
id: api/entity/Player
rules:
  - terms/card-op-terms/discard
  - terms/card-op-terms/discardTo
  - terms/card-op-terms/draw
  - terms/card-op-terms/drawTo
  - terms/card-op-terms/dropCard
  - terms/card-op-terms/flashCards
  - terms/card-op-terms/give
  - terms/card-op-terms/judge
  - terms/card-op-terms/obtain
  - terms/card-op-terms/pindian
  - terms/card-op-terms/putFaceDown
  - terms/card-op-terms/putTo
  - terms/card-op-terms/recast
  - terms/card-op-terms/showCards
  - terms/card-op-terms/swap
  - terms/card-op-terms/useCard
  - terms/card-op-terms/watch
  - terms/card-terms/Identity
  - terms/description-terms/arraycall
  - terms/description-terms/damage
  - terms/description-terms/dashili
  - terms/description-terms/for_each
  - terms/description-terms/injured
  - terms/description-terms/junling
  - terms/description-terms/recover
  - terms/description-terms/recover_to
  - terms/description-terms/reduce_hp
  - terms/description-terms/repeat
  - terms/description-terms/shiqujineng
  - terms/description-terms/xianglin
  - terms/description-terms/xiaoshili
  - terms/game-flow-terms/neighbor
  - terms/game-flow-terms/player
  - terms/general-op-terms/chain
  - terms/general-op-terms/chained
  - terms/general-op-terms/change
  - terms/general-op-terms/close
  - terms/general-op-terms/open
  - terms/general-op-terms/remove
  - terms/general-op-terms/reset
  - terms/general-op-terms/restore
  - terms/general-op-terms/skip
  - terms/general-op-terms/stack
  - terms/value-terms/attackRange
  - terms/value-terms/distance
  - terms/value-terms/handMax
  - terms/value-terms/hp
  - terms/value-terms/hpValue
  - terms/value-terms/lostHp
  - terms/value-terms/maxHp
  - terms/zone-terms/area
  - terms/zone-terms/equipArea
  - terms/zone-terms/judgeArea
tags: [API, 实体域（entity/）]
---

# Player（类）

- 签名：`export class Player extends Mark`
- 位置：../../shared/core/entity/Player.ts#L34
- 规则：[player](../../rules/terms/game-flow-terms/player.md)

> 玩家实体
> @rules terms/game-flow-terms/player
> @description 角色是玩家在游戏中的操控对象

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| playerId | `playerId: string` |  | 玩家 id（path 段用，不同步） |
| username | `@sync() username: string` |  |  |
| seat | `@sync() seat: number` |  |  |
| [hp](../../rules/terms/value-terms/hp.md) | `@sync() hp: number` | [hp](../../rules/terms/value-terms/hp.md) | 体力 |
| [maxhp](../../rules/terms/value-terms/maxHp.md) | `@sync() maxhp: number` | [maxHp](../../rules/terms/value-terms/maxHp.md) | 体力上限 |
| [role](../../rules/terms/card-terms/Identity.md) | `@sync() role: string` | [Identity](../../rules/terms/card-terms/Identity.md) | 身份 |
| kingdom | `@sync() kingdom: string` |  | 势力 |
| gender | `@sync() gender: Gender` |  | 性别 |
| death | `@sync() death: boolean` |  | 是否死亡 |
| phase | `@sync() phase: Phase` |  | 当前阶段 |
| inturn | `@sync() inturn: boolean` |  | 是否处于自己的回合内 |
| [chained](../../rules/terms/general-op-terms/chained.md) | `@sync() chained: boolean` | [chained](../../rules/terms/general-op-terms/chained.md) | 连环状态 |
| skip | `@sync() skip: boolean` |  | 翻面状态（跳过下个回合） |
| shield | `@sync() shield: number` |  | 护盾值（扣减体力时优先吸收） |
| rest | `@sync() rest: number` |  | 休整回合数（>0 表示正在休整） |
| hand | `@syncArray() hand: StateArray<string>` |  | 手牌（元素仅简单类型：牌 id） |
| judgeCards | `judgeCards: VirtualCardData[]` |  |  |
| equips | `equips: VirtualCardData[]` |  |  |
| [abolishAreas](../../rules/terms/zone-terms/area.md) | `@syncArray() abolishAreas: StateArray<EquipSubType \| AreaType.Judge>` | [area](../../rules/terms/zone-terms/area.md) | 被废除的区域 |
| miaojis | `@syncArray() miaojis: StateArray<number>` |  | 持有的妙计牌堆（去重，献策所得） |
| constructor | ` constructor(room: Room, playerId: string): boolean` |  |  |
| alive | ` get alive(): boolean` |  | 是否存活 |
| right | ` get right(): Player` |  | 右手边玩家（座位 +1 循环，不论死活） |
| left | ` get left(): Player` |  | 左手边玩家（座位 -1 循环，不论死活） |
| [next](../../rules/terms/game-flow-terms/neighbor.md) | ` get next(): Player` | [neighbor](../../rules/terms/game-flow-terms/neighbor.md) | 下家（行动顺序下一位） |
| [prev](../../rules/terms/game-flow-terms/neighbor.md) | ` get prev(): Player` | [neighbor](../../rules/terms/game-flow-terms/neighbor.md) | 上家（行动顺序上一位） |
| [isBigKingdom](../../rules/terms/description-terms/dashili.md) | ` isBigKingdom(): boolean` | [dashili](../../rules/terms/description-terms/dashili.md) | 是否为大势力角色 |
| [isSmallKingdom](../../rules/terms/description-terms/xiaoshili.md) | ` isSmallKingdom(): boolean` | [xiaoshili](../../rules/terms/description-terms/xiaoshili.md) | 是否为小势力角色 |
| [isAdjacent](../../rules/terms/description-terms/xianglin.md) | ` isAdjacent(other: Player): boolean` | [xianglin](../../rules/terms/description-terms/xianglin.md) | 是否与另一名角色相邻 |
| [inthp](../../rules/terms/value-terms/hpValue.md) | ` get inthp(): number` | [hpValue](../../rules/terms/value-terms/hpValue.md) | 体力值 |
| [losshp](../../rules/terms/value-terms/lostHp.md) | ` get losshp(): number` | [lostHp](../../rules/terms/value-terms/lostHp.md) | 已损失体力值 |
| [hurt](../../rules/terms/description-terms/injured.md) | ` get hurt(): boolean` | [injured](../../rules/terms/description-terms/injured.md) | 是否已受伤 |
| [handMax](../../rules/terms/value-terms/handMax.md) | ` get handMax(): number` | [handMax](../../rules/terms/value-terms/handMax.md) | 手牌上限 |
| [attackRange](../../rules/terms/value-terms/attackRange.md) | ` get attackRange(): number` | [attackRange](../../rules/terms/value-terms/attackRange.md) | 攻击范围 |
| [distanceTo](../../rules/terms/value-terms/distance.md) | ` distanceTo(target: Player): number` | [distance](../../rules/terms/value-terms/distance.md) | 至目标的距离 |
| getAreaId | ` getAreaId(type: AreaType): AreaId` |  | 玩家私有区域 id |
| getHandCards | ` getHandCards(): GameCard[]` |  | 手牌 |
| getEquipCards | ` getEquipCards(): GameCard[]` |  | 装备牌 |
| getJudgeCards | ` getJudgeCards(): GameCard[]` |  | 判定区牌 |
| getSelfCards | ` getSelfCards(): GameCard[]` |  | 自己的牌（手牌 + 装备） |
| getAreaCards | ` getAreaCards(): GameCard[]` |  | 区域内所有牌（手牌 + 装备 + 判定） |
| [setJudgeCard](../../rules/terms/zone-terms/judgeArea.md) | ` setJudgeCard(card: VirtualCardData): void` | [judgeArea](../../rules/terms/zone-terms/judgeArea.md) | 设置判定区牌 |
| [removeJudgeCard](../../rules/terms/zone-terms/judgeArea.md) | ` removeJudgeCard(card: VirtualCardData): void` | [judgeArea](../../rules/terms/zone-terms/judgeArea.md) | 移除判定区牌 |
| [setEquip](../../rules/terms/zone-terms/equipArea.md) | ` setEquip(data: VirtualCardData): void` | [equipArea](../../rules/terms/zone-terms/equipArea.md) | 设置装备 |
| [removeEquip](../../rules/terms/zone-terms/equipArea.md) | ` removeEquip(data: VirtualCardData): void` | [equipArea](../../rules/terms/zone-terms/equipArea.md) | 卸载装备 |
| [putTo](../../rules/terms/card-op-terms/putTo.md) | ` putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putTo](../../rules/terms/card-op-terms/putTo.md) | 置于/入：将牌按目标区域默认放置方式移至目标区域 |
| [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | ` putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | 扣置于/入：将牌移至目标区域且背面朝上放置 |
| [repeat](../../rules/terms/description-terms/repeat.md) | ` repeat(times: number, fn: (): Promise<void>` | [repeat](../../rules/terms/description-terms/repeat.md) | 依次操作：重复执行操作 X 次（便捷入口） |
| [forEachPlayer](../../rules/terms/description-terms/for_each.md) | ` forEachPlayer( players: Player[], fn: (player: Player): Promise<void>` | [for_each](../../rules/terms/description-terms/for_each.md) | 各执行操作：玩家数组按响应顺序依次执行操作（便捷入口） |
| [arraycall](../../rules/terms/description-terms/arraycall.md) | ` arraycall(type: 'queue' \| 'siege'): Promise<void>` | [arraycall](../../rules/terms/description-terms/arraycall.md) | 阵法召唤（便捷入口） |
| [command](../../rules/terms/description-terms/junling.md) | ` command(to: Player, command?: number): Promise<void>` | [junling](../../rules/terms/description-terms/junling.md) | 军令：发起者确定军令，执行者选择是否执行并结算（便捷入口） |
| xiance | ` xiance(to: Player, miaoji?: number): Promise<void>` |  | 献策：给执行者献计并结算（便捷入口） |
| hasMiaoji | ` hasMiaoji(): boolean` |  | 是否持有妙计 |
| [loseGeneralSkills](../../rules/terms/description-terms/shiqujineng.md) | ` loseGeneralSkills(): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有武将技能（便捷入口） |
| [loseAllSkills](../../rules/terms/description-terms/shiqujineng.md) | ` loseAllSkills(): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有技能（便捷入口） |
| [loseSkillsOfGeneral](../../rules/terms/description-terms/shiqujineng.md) | ` loseSkillsOfGeneral(general: General): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去指定武将牌上的技能（便捷入口） |
| [draw](../../rules/terms/card-op-terms/draw.md) | ` draw(count: number = 1, pos: 'top' \| 'bottom' = 'top', opts?: MoveCardOpts): Promise<unknown>` | [draw](../../rules/terms/card-op-terms/draw.md) | 摸牌：从牌堆摸 count 张到自身手牌 |
| [drawTo](../../rules/terms/card-op-terms/drawTo.md) | ` drawTo(count: number): Promise<void>` | [drawTo](../../rules/terms/card-op-terms/drawTo.md) | 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌 |
| [discard](../../rules/terms/card-op-terms/discard.md) | ` discard(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent>` | [discard](../../rules/terms/card-op-terms/discard.md) | 弃牌：将指定牌弃置到弃牌堆 |
| [discardTo](../../rules/terms/card-op-terms/discardTo.md) | ` discardTo(cards: GameCard[], count: number): Promise<void>` | [discardTo](../../rules/terms/card-op-terms/discardTo.md) | 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌 |
| [obtain](../../rules/terms/card-op-terms/obtain.md) | ` obtain(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` | [obtain](../../rules/terms/card-op-terms/obtain.md) | 获得牌：将指定牌移至自身手牌区 |
| [give](../../rules/terms/card-op-terms/give.md) | ` give(toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` | [give](../../rules/terms/card-op-terms/give.md) | 交给牌：将自身牌交给 toPlayer |
| [swap](../../rules/terms/card-op-terms/swap.md) | ` swap( cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts, ): Pr…` | [swap](../../rules/terms/card-op-terms/swap.md) | 交换牌：两批牌同时经处理区互换区域 |
| [useCard](../../rules/terms/card-op-terms/useCard.md) | ` useCard(card: VirtualCard, targets?: Player[]): Promise<UseCardEvent \| null>` | [useCard](../../rules/terms/card-op-terms/useCard.md) | 使用牌：触发牌的使用事件 |
| [dropCard](../../rules/terms/card-op-terms/dropCard.md) | ` dropCard(card: VirtualCard): Promise<DropCardEvent>` | [dropCard](../../rules/terms/card-op-terms/dropCard.md) | 打出牌：触发牌的打出事件 |
| [recast](../../rules/terms/card-op-terms/recast.md) | ` recast(cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<unknown>` | [recast](../../rules/terms/card-op-terms/recast.md) | 重铸：将牌置入弃牌堆后摸等量牌 |
| [watch](../../rules/terms/card-op-terms/watch.md) | ` watch(cards: (GameCard \| General): Promise<void>` | [watch](../../rules/terms/card-op-terms/watch.md) | 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作 |
| [showCards](../../rules/terms/card-op-terms/showCards.md) | ` showCards(cards: GameCard[]): Promise<void>` | [showCards](../../rules/terms/card-op-terms/showCards.md) | 展示牌：将指定牌翻转至正面朝上展示（无实际区域移动） |
| [flashCards](../../rules/terms/card-op-terms/flashCards.md) | ` flashCards(cards: GameCard[], opts?: MoveCardOpts): Promise<unknown>` | [flashCards](../../rules/terms/card-op-terms/flashCards.md) | 亮出牌：牌堆牌置入处理区，其他牌等同展示 |
| [open](../../rules/terms/general-op-terms/open.md) | ` open(generals: General[]): Promise<ChangeStateEvent>` | [open](../../rules/terms/general-op-terms/open.md) | 明置武将 |
| [close](../../rules/terms/general-op-terms/close.md) | ` close(generals: General[]): Promise<ChangeStateEvent>` | [close](../../rules/terms/general-op-terms/close.md) | 暗置武将 |
| [chain](../../rules/terms/general-op-terms/chain.md) | ` chain(): Promise<ChangeStateEvent>` | [chain](../../rules/terms/general-op-terms/chain.md) | 横置：进入连环状态 |
| [reset](../../rules/terms/general-op-terms/reset.md) | ` reset(damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` | [reset](../../rules/terms/general-op-terms/reset.md) | 重置：脱离连环状态 |
| chainOrReset | ` chainOrReset(damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` |  | 横置/重置：按当前连环状态取反 |
| [turnOver](../../rules/terms/general-op-terms/skip.md) | ` turnOver(toState?: boolean): Promise<ChangeStateEvent>` | [skip](../../rules/terms/general-op-terms/skip.md) | 翻面 |
| [stack](../../rules/terms/general-op-terms/stack.md) | ` stack(toState?: boolean): Promise<ChangeStateEvent>` | [stack](../../rules/terms/general-op-terms/stack.md) | 叠置：与翻面同一逻辑 |
| [restore](../../rules/terms/general-op-terms/restore.md) | ` restore(): Promise<void>` | [restore](../../rules/terms/general-op-terms/restore.md) | 复原：按武将牌状态组合重置/翻面 |
| [change](../../rules/terms/general-op-terms/change.md) | ` change(general: General \| 'head' \| 'deputy', toGeneral: General): Promise<ChangeStateEvent>` | [change](../../rules/terms/general-op-terms/change.md) | 变更武将 |
| [remove](../../rules/terms/general-op-terms/remove.md) | ` remove(general: General): Promise<ChangeStateEvent>` | [remove](../../rules/terms/general-op-terms/remove.md) | 移除武将 |
| [damage](../../rules/terms/description-terms/damage.md) | ` damage( target: Player, number: number, damageType: DamageType, opts?: EventOpts & Partial<Omit<DamageEven…` | [damage](../../rules/terms/description-terms/damage.md) | 造成伤害（便捷入口） |
| [bedamage](../../rules/terms/description-terms/damage.md) | ` bedamage( sieger: Player \| undefined, number: number, damageType: DamageType, opts?: EventOpts & Partial<O…` | [damage](../../rules/terms/description-terms/damage.md) | 受到伤害（便捷入口） |
| loseHp | ` loseHp(number: number, opts?: EventOpts): Promise<LoseHpEvent>` |  | 失去体力（便捷入口） |
| [reduceHp](../../rules/terms/description-terms/reduce_hp.md) | ` reduceHp(number: number, opts?: EventOpts): Promise<ReduceHpEvent>` | [reduce_hp](../../rules/terms/description-terms/reduce_hp.md) | 扣减体力（便捷入口） |
| [recover](../../rules/terms/description-terms/recover.md) | ` recover(number: number, opts?: EventOpts): Promise<RecoverHpEvent>` | [recover](../../rules/terms/description-terms/recover.md) | 回复体力（便捷入口） |
| [recoverTo](../../rules/terms/description-terms/recover_to.md) | ` recoverTo(toHp: number, opts?: EventOpts): Promise<RecoverHpEvent \| undefined>` | [recover_to](../../rules/terms/description-terms/recover_to.md) | 将体力回复至X点（便捷入口） |
| changeMaxHp | ` changeMaxHp(number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent>` |  | 改变体力上限（便捷入口） |
| dying | ` dying(opts?: EventOpts): Promise<DyingEvent>` |  | 进入濒死（便捷入口） |
| die | ` die(opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent>` |  | 死亡（便捷入口） |
| [judge](../../rules/terms/card-op-terms/judge.md) | ` judge(opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent>` | [judge](../../rules/terms/card-op-terms/judge.md) | 判定：触发一个判定事件 |
| [pindian](../../rules/terms/card-op-terms/pindian.md) | ` pindian(targets: Player[], opts?: EventOpts & Partial<Omit<PindianEventData, 'player' \| 'targets'>>): Prom…` | [pindian](../../rules/terms/card-op-terms/pindian.md) | 拼点：触发一个拼点事件 |
