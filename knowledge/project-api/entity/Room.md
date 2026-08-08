---
title: Room
type: api
id: api/entity/Room
rules:
  - events/turn
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
  - terms/description-terms/dashili
  - terms/description-terms/for_each
  - terms/description-terms/junling
  - terms/description-terms/queue
  - terms/description-terms/recover
  - terms/description-terms/recover_to
  - terms/description-terms/reduce_hp
  - terms/description-terms/repeat
  - terms/description-terms/shiqujineng
  - terms/description-terms/siege
  - terms/description-terms/xianglin
  - terms/description-terms/xiaoshili
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
  - terms/value-terms/difference
  - terms/value-terms/half
  - terms/value-terms/kingdomCount
  - terms/value-terms/maxMin
  - terms/value-terms/playerCount
  - terms/zone-terms/area
tags: [API, 实体域（entity/）]
---

# Room（类）

- 签名：`export class Room extends Mark implements VirtualCardAbility`
- 位置：../../shared/core/entity/Room.ts#L62

> 房间——状态宿主（StateStore）与传输层（ITransport）的组合根。
> path 以 Room 为根，如 `turnCount`、`player/p1/hp`。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| entitySegments | `static entitySegments: Record<string, { field: string` |  | 实体段 → 集合字段与实体构造器（镜像端 path 解析与实体创建用） |
| roomId | `roomId: string` |  |  |
| options | `options: RoomOptions` |  |  |
| mode | `mode: string` |  |  |
| store | `readonly store: StateStore` |  | 状态存储（补丁收集） |
| transport | `readonly transport: ITransport` |  | 传输层（发送控制 + 通道） |
| logger | `readonly logger: ILogger` |  | 日志接口（Room 级日志统一经此输出） |
| _store | `_store?: StateStore` |  | 宿主引用（构造体指向 store） |
| _path | `_path: string \| undefined` |  | 根节点 path（空串） |
| turnCount | `@sync() turnCount: number` |  | 总回合数 |
| roundCount | `@sync() roundCount: number` |  | 当前轮数 |
| extraTurns | `extraTurns: TurnEvent[]` |  | 额外回合队列（权威端运行时维护，不同步） |
| roundStartTurn | `roundStartTurn?: TurnEvent` |  | 本轮起始回合（权威端运行时维护，不同步） |
| currentPlayerId | `@sync() currentPlayerId: string` |  | 当前回合玩家 id |
| players | `@syncMap('player') players: StateMap<string, Player>` |  | 玩家集合（实体段名 player，条目值 Player 实体） |
| commands | `@syncArray() commands: StateArray<number>` |  | 军令牌堆（可同步，游戏开始时置为 1~6） |
| miaojis | `@syncArray() miaojis: StateArray<number>` |  | 妙计牌堆（可同步，游戏开始时置为 80~91） |
| randomSeed | `randomSeed: number` |  | 随机数种子（相同初始种子下，房间内所有随机操作结果一致） |
| skillIds | `skillIds: number` |  | 技能自增 id 计数器（仅权威端分配用，不同步） |
| effectIds | `effectIds: number` |  | 效果自增 id 计数器（仅权威端分配用，不同步） |
| eventIds | `eventIds: number` |  | 事件自增 id 计数器（仅权威端分配用，不同步） |
| _gameState | `private _gameState: 'waiting' \| 'gaming' \| 'ending'` |  | 游戏状态（waiting/gaming/ending）——TODO(R1): 由游戏流程维护 |
| setGameState | ` setGameState(state: 'waiting' \| 'gaming' \| 'ending'): void` |  | 设置游戏状态（host 运行时使用） |
| isGaming | ` get isGaming(): boolean` |  | 是否正在游戏中 |
| isEnding | ` get isEnding(): boolean` |  | 游戏是否正在结束 |
| carduses | `readonly carduses: Map<string, CardUseData>` |  | 牌的默认使用方式索引（牌名 → CardUseData，经 initCardUses 填充） |
| cardusesByTiming | `readonly cardusesByTiming: Map<TimingName, CardUseData[]>` |  | 牌的默认使用方式索引（时机 → CardUseData[]） |
| ignoreRecords | `ignoreRecords: Array<{ source: Player` |  | 无视记录：source 无视 target 的满足 filter 的技能（filter 缺省无视全部技能） |
| host | `host?: RoomHost` |  | 房间主机能力（权威端注入 RoomHost；镜像端未注入，能力调用抛错） |
| areas | `readonly areas: Map<AreaId, Area>` |  | 区域集合（两端镜像一致：权威端变更结算，镜像端按移动消息 add/remove 同步） |
| cards | `readonly cards: Map<GameCardId, GameCard>` |  | 对局内实体牌索引（创建时登记，两端镜像一致；查询经 getCard/getCards） |
| cardNames | `readonly cardNames: string[]` |  | 对局内牌名列表（去重，不含衍生牌；查询经 getCardNames） |
| cardNamesToType | `readonly cardNamesToType: Map<CardType, Set<string>>` |  | 卡牌类别 → 牌名集合（对局内出现的非衍生牌） |
| cardNamesToSubType | `readonly cardNamesToSubType: Map<CardSubType, Set<string>>` |  | 卡牌副类别 → 牌名集合（对局内出现的非衍生牌） |
| generals | `readonly generals: Map<string, General>` |  | 对局内武将索引（创建时登记，id = 武将全名；查询经 getGeneral/getGenerals） |
| generalNames | `readonly generalNames: string[]` |  | 对局内武将真名列表（去重；查询经 getGeneralNames） |
| skills | `readonly skills: Map<number, Skill>` |  | 对局内技能索引（创建时登记，key = 自增 id；查询经 getSkill/getSkills） |
| skillsByName | `readonly skillsByName: Map<string, Set<Skill>>` |  | 技能名索引（技能全名 → 同名技能集合，如多玩家同技能） |
| effects | `readonly effects: Map<number, Effect>` |  | 对局内效果索引（创建时登记，key = 自增 id；查询经 getEffect/getEffects） |
| effectsByName | `readonly effectsByName: Map<string, Set<Effect>>` |  | 效果名索引（效果全名 → 同名效果集合） |
| triggerEffectsById | `readonly triggerEffectsById: Map<number, TriggerEffect>` |  | 触发效果索引（自增 id → 效果，TriggerEffect 构造登记） |
| stateEffectsById | `readonly stateEffectsById: Map<number, StateEffect>` |  | 状态效果索引（自增 id → 效果，StateEffect 构造登记） |
| triggerEffectsByTiming | `readonly triggerEffectsByTiming: Map<` |  | 触发效果按时机与优先级索引（时机 → 优先级 → 全局/按玩家分组，TriggerEffect 构造登记） |
| stateEffectsByType | `readonly stateEffectsByType: Map<StateEffectType, StateEffect[]>` |  |  |
| constructor | ` constructor( roomId: string, options: RoomOptions, transport: ITransport, logger: ILogger = consoleLogger, )` |  |  |
| shuffle | ` shuffle<T>(arr: T[]): T[]` |  | 洗牌（使用房间随机数种子，每次随机操作推进种子） |
| randomInt | ` randomInt(min: number, max: number): number` |  | 生成 [min, max] 区间内的随机整数（使用房间随机数种子并推进） |
| getPlayer | ` getPlayer(id: string): Player \| undefined` |  | 按 id 获取玩家（不存在返回 undefined） |
| getPlayers | ` getPlayers(ids: string[]): Player[]` |  | 批量获取玩家（过滤无效 id，保持顺序） |
| getPlayerIds | ` getPlayerIds(players: Player[] = [...this.players.values(): string[]` |  | 获取玩家 id 数组（默认全部玩家） |
| alives | ` get alives(): Player[]` |  | 存活玩家列表 |
| [playerCount](../../rules/terms/value-terms/playerCount.md) | ` get playerCount(): number` | [playerCount](../../rules/terms/value-terms/playerCount.md) | 玩家数 |
| filterPlayer | ` filterPlayer(fn: (player: Player): Player[]` |  | 按条件筛选玩家（includeDead 为 true 时含死亡玩家） |
| [getPlayerCount](../../rules/terms/value-terms/kingdomCount.md) | ` getPlayerCount(fn: (player: Player): number` | [kingdomCount](../../rules/terms/value-terms/kingdomCount.md) | 按条件统计角色数 |
| [getKingdomCount](../../rules/terms/value-terms/kingdomCount.md) | ` getKingdomCount(kingdom: string, includeWild: boolean = false, includeDead: boolean = false): number` | [kingdomCount](../../rules/terms/value-terms/kingdomCount.md) | 指定势力的角色数 |
| [getBigKingdoms](../../rules/terms/description-terms/dashili.md) | ` getBigKingdoms(): string[]` | [dashili](../../rules/terms/description-terms/dashili.md) | 获取当前大势力 |
| [isBigKingdom](../../rules/terms/description-terms/dashili.md) | ` isBigKingdom(player: Player): boolean` | [dashili](../../rules/terms/description-terms/dashili.md) | 判断一名玩家是否为大势力角色 |
| [isSmallKingdom](../../rules/terms/description-terms/xiaoshili.md) | ` isSmallKingdom(player: Player): boolean` | [xiaoshili](../../rules/terms/description-terms/xiaoshili.md) | 判断一名玩家是否为小势力角色 |
| [isAdjacent](../../rules/terms/description-terms/xianglin.md) | ` isAdjacent(a: Player, b: Player): boolean` | [xianglin](../../rules/terms/description-terms/xianglin.md) | 判断两名玩家是否相邻 |
| sortPlayer | ` sortPlayer(players: Player[] = [...this.players.values(): Player[]` |  | 按座次排序（返回新数组）。 |
| sortResponse | ` sortResponse(players: Player[] = [...this.players.values(): Player[]` |  | 按响应顺序排序（从当前回合玩家开始逆时针；无当前回合玩家时从 seat=1 开始） |
| sortClockwise | ` sortClockwise(players: Player[] = [...this.players.values(): Player[]` |  | 按顺时针排序（从当前回合玩家开始；无当前回合玩家时从 seat=1 开始） |
| [getSameQueue](../../rules/terms/description-terms/queue.md) | ` getSameQueue(player: Player): Player[]` | [queue](../../rules/terms/description-terms/queue.md) | 队列：获取与玩家处于同一队列的所有角色 |
| _allSiegeRelations | ` private _allSiegeRelations(): SiegeRelation[]` |  | 获取全场所有围攻关系 |
| [getSiegeRelationsBySieger](../../rules/terms/description-terms/siege.md) | ` getSiegeRelationsBySieger(player: Player): SiegeRelation[]` | [siege](../../rules/terms/description-terms/siege.md) | 获取玩家为围攻方的所有围攻关系 |
| [getSiegeRelationsByTarget](../../rules/terms/description-terms/siege.md) | ` getSiegeRelationsByTarget(player: Player): SiegeRelation[]` | [siege](../../rules/terms/description-terms/siege.md) | 获取玩家为被围攻方的所有围攻关系 |
| [getSiegeRelations](../../rules/terms/description-terms/siege.md) | ` getSiegeRelations(player: Player): SiegeRelation[]` | [siege](../../rules/terms/description-terms/siege.md) | 获取玩家的所有围攻关系 |
| [isSameSiegeBothSiegers](../../rules/terms/description-terms/siege.md) | ` isSameSiegeBothSiegers(player1: Player, player2: Player): boolean` | [siege](../../rules/terms/description-terms/siege.md) | 判断两名玩家是否处于同一围攻关系且均为围攻方 |
| [isSameSiegeSiegerTarget](../../rules/terms/description-terms/siege.md) | ` isSameSiegeSiegerTarget(sieger: Player, target: Player): boolean` | [siege](../../rules/terms/description-terms/siege.md) | 判断两名玩家是否处于同一围攻关系，且第一个为围攻方、第二个为被围攻方 |
| [getMaxValue](../../rules/terms/value-terms/maxMin.md) | ` getMaxValue(field: NumberField, includeDead: boolean = false): Player[]` | [maxMin](../../rules/terms/value-terms/maxMin.md) | 取某数值最大的玩家 |
| [getMinValue](../../rules/terms/value-terms/maxMin.md) | ` getMinValue(field: NumberField, includeDead: boolean = false): Player[]` | [maxMin](../../rules/terms/value-terms/maxMin.md) | 取某数值最小的玩家 |
| [hasMaxValue](../../rules/terms/value-terms/maxMin.md) | ` hasMaxValue(player: Player, field: NumberField, includeDead: boolean = false): boolean` | [maxMin](../../rules/terms/value-terms/maxMin.md) | 指定玩家是否为该数值最大的玩家 |
| [hasMinValue](../../rules/terms/value-terms/maxMin.md) | ` hasMinValue(player: Player, field: NumberField, includeDead: boolean = false): boolean` | [maxMin](../../rules/terms/value-terms/maxMin.md) | 指定玩家是否为该数值最小的玩家 |
| [half](../../rules/terms/value-terms/half.md) | ` half(value: number, ceil: boolean = false): number` | [half](../../rules/terms/value-terms/half.md) | 取一半 |
| [diff](../../rules/terms/value-terms/difference.md) | ` diff(x: number, y: number): number` | [difference](../../rules/terms/value-terms/difference.md) | 数值之差 |
| drawArea | ` get drawArea(): Area \| undefined` |  | 牌堆 |
| discardArea | ` get discardArea(): Area \| undefined` |  | 弃牌堆 |
| processingArea | ` get processingArea(): Area \| undefined` |  | 处理区 |
| granaryArea | ` get granaryArea(): Area \| undefined` |  | 仓廪 |
| treasuryArea | ` get treasuryArea(): Area \| undefined` |  | 府库 |
| reserveArea | ` get reserveArea(): Area \| undefined` |  | 后备区 |
| getCard | ` getCard(id: GameCardId): GameCard \| undefined` |  | 按 id 获取实体牌（不存在返回 undefined） |
| getCards | ` getCards(ids: GameCardId[]): GameCard[]` |  | 批量获取实体牌（过滤无效 id，保持顺序） |
| getCardIds | ` getCardIds(cards: GameCard[]): GameCardId[]` |  | 获取实体牌 id 数组（保持顺序） |
| getCardNames | ` getCardNames(): string[]` |  | 对局内牌名列表（副本，不含衍生牌） |
| getCardNamesByType | ` getCardNamesByType(type: CardType): string[]` |  | 按卡牌类别取牌名列表（未出现返回空数组） |
| getCardNamesBySubType | ` getCardNamesBySubType(subtype: CardSubType): string[]` |  | 按卡牌副类别取牌名列表（未出现返回空数组） |
| getGeneral | ` getGeneral(id: string): General \| undefined` |  | 按 id 获取武将（不存在返回 undefined） |
| getGenerals | ` getGenerals(ids: string[]): General[]` |  | 批量获取武将（过滤无效 id，保持顺序） |
| getGeneralIds | ` getGeneralIds(generals: General[]): string[]` |  | 获取武将 id 数组（保持顺序） |
| getGeneralNames | ` getGeneralNames(): string[]` |  | 对局内武将真名列表（副本） |
| getGeneralByName | ` getGeneralByName(trueName: string): General \| undefined` |  | 按真名查找武将（多同名返回首个，不存在返回 undefined） |
| getSkill | ` getSkill(id: number): Skill \| undefined` |  | 按 id 获取技能（不存在返回 undefined） |
| getSkills | ` getSkills(ids: number[]): Skill[]` |  | 批量获取技能（过滤无效 id，保持顺序） |
| getSkillIds | ` getSkillIds(skills: Skill[]): number[]` |  | 获取技能 id 数组（保持顺序） |
| getSkillsByPlayer | ` getSkillsByPlayer(player: Player): Skill[]` |  | 某玩家的技能列表 |
| getSkillsByName | ` getSkillsByName(name: string): Skill[]` |  | 按技能名取同名技能列表（同名技能可多份，如多人同技能） |
| getEffect | ` getEffect(id: number): Effect \| undefined` |  | 按 id 获取效果（不存在返回 undefined） |
| getEffects | ` getEffects(ids: number[]): Effect[]` |  | 批量获取效果（过滤无效 id，保持顺序） |
| getEffectIds | ` getEffectIds(effects: Effect[]): number[]` |  | 获取效果 id 数组（保持顺序） |
| getEffectsByPlayer | ` getEffectsByPlayer(player: Player): Effect[]` |  | 某玩家的效果列表 |
| getEffectsByName | ` getEffectsByName(name: string): Effect[]` |  | 按效果名取同名效果列表（同名效果可多份） |
| getTriggerEffect | ` getTriggerEffect(id: number): TriggerEffect \| undefined` |  | 按 id 获取触发效果（不存在返回 undefined） |
| getStateEffect | ` getStateEffect(id: number): StateEffect \| undefined` |  | 按 id 获取状态效果（不存在返回 undefined） |
| getTriggerEffects | ` getTriggerEffects(timing: TimingName, playerId?: string): TriggerEffect[]` |  | 某时机应触发的效果列表：全局效果 + 指定玩家的私有效果（未指定玩家仅全局；跨优先级合并） |
| getStateEffectsByType | ` getStateEffectsByType(type: StateEffectType): StateEffect[]` |  | 按状态类型取状态效果列表（未注册返回空数组） |
| event | ` get event(): EventManager` |  | 事件管理器（触发调度/事件创建） |
| eventStack | ` get eventStack(): EventProcess[]` |  | 当前事件栈（host 运行态；镜像端返回空数组） |
| turnStack | ` get turnStack(): TurnEvent[]` |  | 回合栈（host 运行态） |
| phaseStack | ` get phaseStack(): PhaseEvent[]` |  | 阶段栈（host 运行态） |
| currentTurn | ` get currentTurn(): TurnEvent \| undefined` |  | 当前回合（栈顶，host 运行态） |
| currentPhase | ` get currentPhase(): PhaseEvent \| undefined` |  | 当前阶段（栈顶，host 运行态） |
| deferredOpens | ` get deferredOpens(): EventProcess<EventType.Open>[]` |  | 延迟明置队列（host 运行态） |
| fuhuos | ` get fuhuos(): Array<() => Promise<void>>` |  | 复活回调队列（host 运行态） |
| insertHistory | ` insertHistory(event: EventProcess): void` |  | 记录事件到历史（host 运行态） |
| initCardUses | ` initCardUses(): void` |  | 注册牌的使用方式定义（从 sgs.carduses 拷贝到本地索引，host 运行态） |
| getLastOneHistory | ` getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T): T \| undefined` |  | 查询最后一个指定类型的历史事件（host 运行态） |
| [damage](../../rules/terms/description-terms/damage.md) | ` damage( player: Player \| undefined, target: Player, number: number, damageType: DamageType, opts?: EventOp…` | [damage](../../rules/terms/description-terms/damage.md) | 造成伤害 |
| loseHp | ` loseHp(player: Player, number: number, opts?: EventOpts): Promise<LoseHpEvent>` |  | 失去体力 |
| [reduceHp](../../rules/terms/description-terms/reduce_hp.md) | ` reduceHp(player: Player, number: number, opts?: EventOpts): Promise<ReduceHpEvent>` | [reduce_hp](../../rules/terms/description-terms/reduce_hp.md) | 扣减体力 |
| [recover](../../rules/terms/description-terms/recover.md) | ` recover(player: Player, number: number, opts?: EventOpts): Promise<RecoverHpEvent>` | [recover](../../rules/terms/description-terms/recover.md) | 回复体力 |
| [recoverTo](../../rules/terms/description-terms/recover_to.md) | ` recoverTo(player: Player, toHp: number, opts?: EventOpts): Promise<RecoverHpEvent \| undefined>` | [recover_to](../../rules/terms/description-terms/recover_to.md) | 将体力回复至X点 |
| changeMaxHp | ` changeMaxHp(player: Player, number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent>` |  | 改变体力上限 |
| dying | ` dying(player: Player, opts?: EventOpts): Promise<DyingEvent>` |  | 进入濒死 |
| die | ` die(player: Player, opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent>` |  | 死亡 |
| [judge](../../rules/terms/card-op-terms/judge.md) | ` judge(player: Player, opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent>` | [judge](../../rules/terms/card-op-terms/judge.md) | 判定：触发一个判定事件 |
| [pindian](../../rules/terms/card-op-terms/pindian.md) | ` pindian( player: Player, targets: Player[], opts?: EventOpts & Partial<Omit<PindianEventData, 'player' \| '…` | [pindian](../../rules/terms/card-op-terms/pindian.md) | 拼点：触发一个拼点事件 |
| changeState | ` changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<…` |  | 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） |
| [open](../../rules/terms/general-op-terms/open.md) | ` open(player: Player, generals: General[]): Promise<ChangeStateEvent>` | [open](../../rules/terms/general-op-terms/open.md) | 明置武将 |
| [close](../../rules/terms/general-op-terms/close.md) | ` close(player: Player, generals: General[]): Promise<ChangeStateEvent>` | [close](../../rules/terms/general-op-terms/close.md) | 暗置武将 |
| [chain](../../rules/terms/general-op-terms/chain.md) | ` chain(player: Player): Promise<ChangeStateEvent>` | [chain](../../rules/terms/general-op-terms/chain.md) | 横置：武将牌竖放的角色将其武将牌横放（进入连环状态） |
| [reset](../../rules/terms/general-op-terms/reset.md) | ` reset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` | [reset](../../rules/terms/general-op-terms/reset.md) | 重置：武将牌横放的角色将其武将牌竖放（脱离连环状态） |
| chainOrReset | ` chainOrReset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent>` |  | 横置/重置：按当前连环状态取反（便捷方法） |
| [skip](../../rules/terms/general-op-terms/skip.md) | ` skip(player: Player, toState?: boolean): Promise<ChangeStateEvent>` | [skip](../../rules/terms/general-op-terms/skip.md) | 翻面 |
| [stack](../../rules/terms/general-op-terms/stack.md) | ` stack(player: Player, toState?: boolean): Promise<ChangeStateEvent>` | [stack](../../rules/terms/general-op-terms/stack.md) | 叠置：与翻面同一逻辑 |
| [restore](../../rules/terms/general-op-terms/restore.md) | ` restore(player: Player): Promise<void>` | [restore](../../rules/terms/general-op-terms/restore.md) | 复原 |
| [change](../../rules/terms/general-op-terms/change.md) | ` change(player: Player, general: General \| 'head' \| 'deputy', toGeneral: General): Promise<ChangeStateEvent>` | [change](../../rules/terms/general-op-terms/change.md) | 变更武将 |
| [remove](../../rules/terms/general-op-terms/remove.md) | ` remove(player: Player, general: General): Promise<ChangeStateEvent>` | [remove](../../rules/terms/general-op-terms/remove.md) | 移除武将 |
| [addIgnore](../../rules/terms/resolution-terms/ignore.md) | ` addIgnore(source: Player, target: Player, filter?: (skill: Skill): void` | [ignore](../../rules/terms/resolution-terms/ignore.md) | 无视：source 无视 target 的满足 filter 的技能 |
| [removeIgnore](../../rules/terms/resolution-terms/ignore.md) | ` removeIgnore(source: Player, target: Player, filter?: (skill: Skill): void` | [ignore](../../rules/terms/resolution-terms/ignore.md) | 移除无视 |
| [moveCards](../../rules/terms/card-op-terms/moveCards.md) | ` moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [moveCards](../../rules/terms/card-op-terms/moveCards.md) | 移至：将牌从另一区域移动到此区域 |
| [moveCardsRaw](../../rules/terms/card-op-terms/moveCards.md) | ` moveCardsRaw(datas: MoveCardData[], opts?: { getMoveLabel?: (data: MoveCardData): Promise<MoveCardEvent>` | [moveCards](../../rules/terms/card-op-terms/moveCards.md) | 移至：将牌从另一区域移动到此区域（完整数据数组） |
| [useCard](../../rules/terms/card-op-terms/useCard.md) | ` useCard(player: Player, card: VirtualCard, targets?: Player[]): Promise<UseCardEvent \| null>` | [useCard](../../rules/terms/card-op-terms/useCard.md) | 使用牌：触发牌的使用事件 |
| [dropCard](../../rules/terms/card-op-terms/dropCard.md) | ` dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent>` | [dropCard](../../rules/terms/card-op-terms/dropCard.md) | 打出牌：触发牌的打出事件 |
| getNCards | ` getNCards(count: number, pos: 'top' \| 'bottom' = 'top'): Promise<GameCard[]>` |  | 从牌堆获取 N 张牌（不足时自动洗牌，仍不够返回空） |
| [shuffleDiscardToDraw](../../rules/terms/card-op-terms/shuffleDiscardToDraw.md) | ` shuffleDiscardToDraw(): Promise<void>` | [shuffleDiscardToDraw](../../rules/terms/card-op-terms/shuffleDiscardToDraw.md) | 洗牌：系统将弃牌堆里的所有牌洗混后置入牌堆 |
| [putTo](../../rules/terms/card-op-terms/putTo.md) | ` putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putTo](../../rules/terms/card-op-terms/putTo.md) | 置于/入：将牌按目标区域默认放置方式移至目标区域 |
| [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | ` putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>` | [putFaceDown](../../rules/terms/card-op-terms/putFaceDown.md) | 扣置于/入：将牌移至目标区域且背面朝上放置 |
| [draw](../../rules/terms/card-op-terms/draw.md) | ` draw(player: Player, count: number = 1, pos: 'top' \| 'bottom' = 'top', opts?: MoveCardOpts): Promise<unknown>` | [draw](../../rules/terms/card-op-terms/draw.md) | 摸牌：从牌堆摸 count 张到玩家手牌 |
| [drawTo](../../rules/terms/card-op-terms/drawTo.md) | ` drawTo(player: Player, count: number): Promise<void>` | [drawTo](../../rules/terms/card-op-terms/drawTo.md) | 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌 |
| [discard](../../rules/terms/card-op-terms/discard.md) | ` discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent>` | [discard](../../rules/terms/card-op-terms/discard.md) | 弃牌：将牌移动到弃牌堆 |
| [abolishArea](../../rules/terms/zone-terms/area.md) | ` abolishArea(player: Player, target: EquipSubType \| AreaType.Judge): Promise<void>` | [area](../../rules/terms/zone-terms/area.md) | 废除区域：将对应区域（或对应已有装备）里的所有牌置入弃牌堆，并记录废除状态 |
| [restoreArea](../../rules/terms/zone-terms/area.md) | ` restoreArea(player: Player, target: EquipSubType \| AreaType.Judge): void` | [area](../../rules/terms/zone-terms/area.md) | 恢复区域：删除废除记录 |
| [discardTo](../../rules/terms/card-op-terms/discardTo.md) | ` discardTo(player: Player, cards: GameCard[], count: number): Promise<void>` | [discardTo](../../rules/terms/card-op-terms/discardTo.md) | 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌 |
| [obtain](../../rules/terms/card-op-terms/obtain.md) | ` obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` | [obtain](../../rules/terms/card-op-terms/obtain.md) | 获得牌：将牌移动到操作者手牌区 |
| [give](../../rules/terms/card-op-terms/give.md) | ` give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent …` | [give](../../rules/terms/card-op-terms/give.md) | 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 |
| [swap](../../rules/terms/card-op-terms/swap.md) | ` swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promi…` | [swap](../../rules/terms/card-op-terms/swap.md) | 交换牌：两批牌同时经处理区互换区域 |
| [recast](../../rules/terms/card-op-terms/recast.md) | ` recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<un…` | [recast](../../rules/terms/card-op-terms/recast.md) | 重铸：将牌置入弃牌堆后摸等量牌 |
| [watch](../../rules/terms/card-op-terms/watch.md) | ` watch(player: Player, cards: (GameCard \| General): Promise<void>` | [watch](../../rules/terms/card-op-terms/watch.md) | 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作 |
| [showCards](../../rules/terms/card-op-terms/showCards.md) | ` showCards(player: Player \| undefined, cards: GameCard[]): Promise<void>` | [showCards](../../rules/terms/card-op-terms/showCards.md) | 展示牌：将牌翻转至正面朝上展示（无实际区域移动） |
| [flashCards](../../rules/terms/card-op-terms/flashCards.md) | ` flashCards(player: Player \| undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<unknown>` | [flashCards](../../rules/terms/card-op-terms/flashCards.md) | 亮出牌：牌堆牌置入处理区，其他牌等同展示 |
| removeToReserve | ` removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent \| undefined>` |  | 移存牌：将牌移动到后备区 |
| delay | ` async delay(_seconds: number, _showProgressBar: boolean = false): Promise<void>` |  | 游戏延迟等待（供玩家观察）——TODO(R9): 客户端延时消息 |
| [startGame](../../rules/terms/game-flow-terms/turn.md) | ` startGame(): Promise<void>` | [turn](../../rules/terms/game-flow-terms/turn.md) | 开始游戏 |
| [mainProcess](../../rules/terms/game-flow-terms/turn.md) | ` mainProcess(): Promise<void>` | [turn](../../rules/terms/game-flow-terms/turn.md) | 游戏主流程 |
| [repeat](../../rules/terms/description-terms/repeat.md) | ` repeat(times: number, fn: (): Promise<void>` | [repeat](../../rules/terms/description-terms/repeat.md) | 依次操作：重复执行操作 X 次（薄转发至房间主机） |
| [forEachPlayer](../../rules/terms/description-terms/for_each.md) | ` forEachPlayer( players: Player[], fn: (player: Player): Promise<void>` | [for_each](../../rules/terms/description-terms/for_each.md) | 各执行操作：玩家数组按响应顺序依次执行操作（薄转发至房间主机） |
| [loseGeneralSkills](../../rules/terms/description-terms/shiqujineng.md) | ` loseGeneralSkills(player: Player): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有武将技能（薄转发至房间主机） |
| [loseAllSkills](../../rules/terms/description-terms/shiqujineng.md) | ` loseAllSkills(player: Player): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有技能（薄转发至房间主机） |
| [loseSkillsOfGeneral](../../rules/terms/description-terms/shiqujineng.md) | ` loseSkillsOfGeneral(player: Player, general: General): Promise<void>` | [shiqujineng](../../rules/terms/description-terms/shiqujineng.md) | 失去所有武将牌上的技能（薄转发至房间主机） |
| [arraycall](../../rules/terms/description-terms/arraycall.md) | ` arraycall(player: Player, type: 'queue' \| 'siege'): Promise<void>` | [arraycall](../../rules/terms/description-terms/arraycall.md) | 阵法召唤（薄转发至房间主机） |
| [command](../../rules/terms/description-terms/junling.md) | ` command(from: Player, to: Player, command?: number): Promise<void>` | [junling](../../rules/terms/description-terms/junling.md) | 军令：发起者确定军令，执行者选择是否执行并结算（薄转发至房间主机） |
| getCommands | ` getCommands(count: number = 2): number[]` |  | 随机获取军令（薄转发至房间主机） |
| returnCommand | ` returnCommand(command: number): void` |  | 将军令放回军令牌堆（含去重，薄转发至房间主机） |
| xiance | ` xiance(from: Player, to: Player, miaoji?: number): Promise<void>` |  | 献策：发起者给执行者献计，执行者选择是否执行并结算（薄转发至房间主机） |
| getMiaoji | ` getMiaoji(count: number = 1): number[]` |  | 随机获取妙计（薄转发至房间主机） |
| returnMiaoji | ` returnMiaoji(miaoji: number): void` |  | 将妙计放回妙计牌堆（含去重，薄转发至房间主机） |
| getRatedPhases | ` static getRatedPhases(): Phase[]` |  | 标准阶段序列 |
| [gameOver](../../rules/events/turn.md#游戏结束时) | ` async gameOver(winner?: Player[]): Promise<void>` | [游戏结束时](../../rules/events/turn.md#游戏结束时) | 结束游戏：游戏状态置为结束（胜负已定或牌堆耗尽平局） |
| canLoseHp | ` canLoseHp(player: Player, number: number = 1): boolean` |  | 检测 loseHp 是否可执行：存活且体力值 ≥ number |
| canRecover | ` canRecover(player: Player, number: number = 1): boolean` |  | 检测 recover 是否可执行：存活且还有已损失体力可回复 |
| canChangeMaxHp | ` canChangeMaxHp(player: Player, number: number = 1): boolean` |  | 检测 changeMaxHp 是否可执行（number 为负时减少上限） |
| canUseCard | ` canUseCard(player: Player, cardName: string, target?: Player): boolean` |  | 使用牌合法性检测：canUse 额外条件 + 合法目标数检测 |
| createVirtualCard | ` createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard(data: VirtualCardData): VirtualCard;` |  |  |
| createVirtualCard | ` createVirtualCard( nameOrCardOrData: string \| GameCard \| VirtualCardData, subcardsOrOverrides?: GameCard[]…` |  |  |
| destroyVirtualCard | ` destroyVirtualCard(vc: VirtualCard): void` |  |  |
| failHost | ` private failHost(): never` |  | host 未注入（镜像端）时调用能力方法的兜底 |

### SiegeRelation（接口）

- 签名：`export interface SiegeRelation`
- 位置：../../shared/core/entity/Room.ts#L51
- 规则：[siege](../../rules/terms/description-terms/siege.md)

> 围攻关系：围攻角色（上家、下家）+ 被围攻角色
> @rules terms/description-terms/siege
> @description 围攻角色和被围攻角色处于同一围攻关系
