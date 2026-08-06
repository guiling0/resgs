import type { RoomOptions } from '../types/RoomOptions';
import { Mark } from './Mark';
import { sync, syncMap } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateStore } from '../state/StateStore';
import type { ITransport } from '../transport/ITransport';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';
import { Player } from './Player';
import { randomInt as randomIntUtil, shuffle as shuffleUtil } from '../utils/Random';
import type { Area } from './Area';
import type { GameCard } from './GameCard';
import type { General } from './General';
import type { Skill } from './Skill';
import type { Effect } from './Effect';
import type { TriggerEffect } from './TriggerEffect';
import type { StateEffect } from './StateEffect';
import type { VirtualCard, VirtualCardOverrides } from './VirtualCard';
import type { AreaId } from '../types/AreaTypes';
import { AreaType } from '../types/AreaTypes';
import type { CardSubType, CardType, GameCardId, VirtualCardData } from '../types/CardTypes';
import type { CardUseData, DamageEventData, DeathEventData, DyingEventData, JudgeEventData, LoseHpEventData, MoveCardData, MoveCardOpts, RecoverHpEventData, ReduceHpEventData, TimingName, ChangeStateData, ChangeMaxHpEventData } from '../types/EventTypes';
import type { RichString } from '../types/RichText';
import type { PriorityType, StateEffectType } from '../types/SkillTypes';
import type { VirtualCardAbility } from '../logic/room/VirtualCardHost';
import type { RoomHost } from '../logic/room/RoomHost';
import type { EventManager } from '../logic/event/EventManager';
import type { EventProcess } from '../logic/event/EventProcess';
import type { TurnEvent, PhaseEvent } from '../logic/event/TurnEvent';
import type { UseCardEvent } from '../logic/event/UseCardEvent';
import type { DropCardEvent } from '../logic/event/DropCardEvent';
import type { MoveCardEvent } from '../logic/event/MoveCardEvent';
import type { DamageEvent, LoseHpEvent, ReduceHpEvent } from '../logic/event/DamageEvent';
import type { DyingEvent, DeathEvent } from '../logic/event/DyingEvent';
import type { RecoverHpEvent, ChangeMaxHpEvent } from '../logic/event/HpEvent';
import type { JudgeEvent } from '../logic/event/JudgeEvent';
import type { ChangeStateEvent } from '../logic/event/ChangeStateEvent';

/**
 * 房间——状态宿主（StateStore）与传输层（ITransport）的组合根。
 * path 以 Room 为根，如 `turnCount`、`player/p1/hp`。
 */
export class Room extends Mark implements VirtualCardAbility {
    /** 实体段 → 集合字段与实体构造器（镜像端 path 解析与实体创建用） */
    static entitySegments: Record<string, { field: string; ctor?: new (...args: any[]) => object }> = {
        player: { field: 'players', ctor: Player },
    };

    roomId: string;
    options: RoomOptions;
    mode: string = 'default';

    /** 状态存储（补丁收集） */
    readonly store: StateStore;
    /** 传输层（发送控制 + 通道） */
    readonly transport: ITransport;
    /** 日志接口（Room 级日志统一经此输出） */
    readonly logger: ILogger;

    // ===== 根节点字段（供装饰器 setter 定位 path）=====

    /** 宿主引用（构造体指向 store） */
    _store?: StateStore;
    /** 根节点 path（空串） */
    _path: string | undefined;

    /** 总回合数 */
    @sync() turnCount: number = 0;

    /** 当前回合玩家 id */
    @sync() currentPlayerId: string = '';
    // TODO(R1): 回合流程落地后维护该字段

    /** 玩家集合（实体段名 player，条目值 Player 实体） */
    @syncMap('player') players: StateMap<string, Player> = new StateMap();

    /** 随机数种子（相同初始种子下，房间内所有随机操作结果一致） */
    randomSeed: number = 1;

    /** 技能自增 id 计数器（仅权威端分配用，不同步） */
    skillIds: number = 0;

    /** 效果自增 id 计数器（仅权威端分配用，不同步） */
    effectIds: number = 0;

    /** 事件自增 id 计数器（仅权威端分配用，不同步） */
    eventIds: number = 0;

    /** 游戏状态（waiting/gaming/ending）——TODO(R1): 由游戏流程维护 */
    private _gameState: 'waiting' | 'gaming' | 'ending' = 'waiting';

    /** 是否正在游戏中 */
    get isGaming(): boolean {
        return this._gameState === 'gaming';
    }

    /** 游戏是否正在结束 */
    get isEnding(): boolean {
        return this._gameState === 'ending';
    }

    /** 牌的默认使用方式索引（牌名 → CardUseData，经 initCardUses 填充） */
    readonly carduses: Map<string, CardUseData> = new Map();

    /** 牌的默认使用方式索引（时机 → CardUseData[]） */
    readonly cardusesByTiming: Map<TimingName, CardUseData[]> = new Map();

    /** 房间主机能力（权威端注入 RoomHost；镜像端未注入，能力调用抛错） */
    host?: RoomHost;

    /** 区域集合（两端镜像一致：权威端变更结算，镜像端按移动消息 add/remove 同步） */
    readonly areas: Map<AreaId, Area> = new Map();

    /** 对局内实体牌索引（创建时登记，两端镜像一致；查询经 getCard/getCards） */
    readonly cards: Map<GameCardId, GameCard> = new Map();

    /** 对局内牌名列表（去重，不含衍生牌；查询经 getCardNames） */
    readonly cardNames: string[] = [];

    /** 卡牌类别 → 牌名集合（对局内出现的非衍生牌） */
    readonly cardNamesToType: Map<CardType, Set<string>> = new Map();

    /** 卡牌副类别 → 牌名集合（对局内出现的非衍生牌） */
    readonly cardNamesToSubType: Map<CardSubType, Set<string>> = new Map();

    /** 对局内武将索引（创建时登记，id = 武将全名；查询经 getGeneral/getGenerals） */
    readonly generals: Map<string, General> = new Map();

    /** 对局内武将真名列表（去重；查询经 getGeneralNames） */
    readonly generalNames: string[] = [];

    /** 对局内技能索引（创建时登记，key = 自增 id；查询经 getSkill/getSkills） */
    readonly skills: Map<number, Skill> = new Map();

    /** 技能名索引（技能全名 → 同名技能集合，如多玩家同技能） */
    readonly skillsByName: Map<string, Set<Skill>> = new Map();

    /** 对局内效果索引（创建时登记，key = 自增 id；查询经 getEffect/getEffects） */
    readonly effects: Map<number, Effect> = new Map();

    /** 效果名索引（效果全名 → 同名效果集合） */
    readonly effectsByName: Map<string, Set<Effect>> = new Map();

    /** 触发效果索引（自增 id → 效果，TriggerEffect 构造登记） */
    readonly triggerEffectsById: Map<number, TriggerEffect> = new Map();

    /** 状态效果索引（自增 id → 效果，StateEffect 构造登记） */
    readonly stateEffectsById: Map<number, StateEffect> = new Map();

    /** 触发效果按时机与优先级索引（时机 → 优先级 → 全局/按玩家分组，TriggerEffect 构造登记） */
    readonly triggerEffectsByTiming: Map<
        TimingName,
        Map<PriorityType, { global: TriggerEffect[]; player: Map<string, TriggerEffect[]> }>
    > = new Map();

    /** 状态效果按状态类型索引 */
    // TODO(R3): 效果数据就绪后填充注册
    readonly stateEffectsByType: Map<StateEffectType, StateEffect[]> = new Map();

    constructor(
        roomId: string,
        options: RoomOptions,
        transport: ITransport,
        logger: ILogger = consoleLogger,
    ) {
        super();
        this.store = new StateStore(logger);
        this.transport = transport;
        this.logger = logger;
        transport.attachLogger(logger);
        transport.attachStore(this.store);
        this._store = this.store;
        this._path = '';
        this.roomId = roomId;
        this.options = options;
        this.logger.info('房间创建', { roomId });
    }

    /** 洗牌（使用房间随机数种子，每次随机操作推进种子） */
    shuffle<T>(arr: T[]): T[] {
        shuffleUtil(arr, this.randomSeed);
        this.randomSeed = (this.randomSeed + 1) >>> 0;
        return arr;
    }

    /** 生成 [min, max] 区间内的随机整数（使用房间随机数种子并推进） */
    randomInt(min: number, max: number): number {
        const value = randomIntUtil(min, max, this.randomSeed);
        this.randomSeed = (this.randomSeed + 1) >>> 0;
        return value;
    }

    // ===== 玩家查询 =====

    /** 按 id 获取玩家（不存在返回 undefined） */
    getPlayer(id: string): Player | undefined {
        return this.players.get(id);
    }

    /** 批量获取玩家（过滤无效 id，保持顺序） */
    getPlayers(ids: string[]): Player[] {
        const result: Player[] = [];
        for (const id of ids) {
            const player = this.players.get(id);
            if (player) result.push(player);
        }
        return result;
    }

    /** 获取玩家 id 数组（默认全部玩家） */
    getPlayerIds(players: Player[] = [...this.players.values()]): string[] {
        return players.map((player) => player.playerId);
    }

    /** 存活玩家列表 */
    get alives(): Player[] {
        return [...this.players.values()].filter((player) => player.alive);
    }

    /** 按条件筛选玩家（includeDead 为 true 时含死亡玩家） */
    filterPlayer(fn: (player: Player) => boolean, includeDead: boolean = false): Player[] {
        return (includeDead ? [...this.players.values()] : this.alives).filter(fn);
    }

    /** 按条件统计玩家数（includeDead 为 true 时含死亡玩家） */
    countPlayer(fn: (player: Player) => boolean, includeDead: boolean = false): number {
        return this.filterPlayer(fn, includeDead).length;
    }

    /**
     * 按座次排序（返回新数组）。
     * clockwise=false（默认）逆时针序（正常回合顺序），clockwise=true 顺时针序；
     * 以 start 为起点，缺省从 seat=1 开始。
     */
    sortPlayer(players: Player[] = [...this.players.values()], start?: Player, clockwise: boolean = false): Player[] {
        if (players.length === 0) return players;
        const startSeat = start?.seat ?? 1;
        const maxSeat = this.players.size;
        return [...players].sort((a, b) => {
            const offsetA = clockwise
                ? (startSeat - a.seat + maxSeat) % maxSeat
                : (a.seat - startSeat + maxSeat) % maxSeat;
            const offsetB = clockwise
                ? (startSeat - b.seat + maxSeat) % maxSeat
                : (b.seat - startSeat + maxSeat) % maxSeat;
            return offsetA - offsetB;
        });
    }

    /** 按响应顺序排序（从当前回合玩家开始逆时针；无当前回合玩家时从 seat=1 开始） */
    sortResponse(players: Player[] = [...this.players.values()]): Player[] {
        const start = this.getPlayer(this.currentPlayerId)
            ?? [...this.players.values()].find((v) => v.seat === 1);
        return this.sortPlayer(players, start);
    }

    /** 按顺时针排序（从当前回合玩家开始；无当前回合玩家时从 seat=1 开始） */
    sortClockwise(players: Player[] = [...this.players.values()]): Player[] {
        const start = this.getPlayer(this.currentPlayerId)
            ?? [...this.players.values()].find((v) => v.seat === 1);
        return this.sortPlayer(players, start, true);
    }

    // ===== 区域快捷访问 =====

    /** 牌堆 */
    get drawArea(): Area | undefined {
        return this.areas.get(AreaType.Draw);
    }

    /** 弃牌堆 */
    get discardArea(): Area | undefined {
        return this.areas.get(AreaType.Discard);
    }

    /** 处理区 */
    get processingArea(): Area | undefined {
        return this.areas.get(AreaType.Processing);
    }

    /** 仓廪 */
    get granaryArea(): Area | undefined {
        return this.areas.get(AreaType.Granary);
    }

    /** 府库 */
    get treasuryArea(): Area | undefined {
        return this.areas.get(AreaType.Treasury);
    }

    /** 后备区 */
    get reserveArea(): Area | undefined {
        return this.areas.get(AreaType.Reserve);
    }

    // ===== 实体牌查询 =====

    /** 按 id 获取实体牌（不存在返回 undefined） */
    getCard(id: GameCardId): GameCard | undefined {
        return this.cards.get(id);
    }

    /** 批量获取实体牌（过滤无效 id，保持顺序） */
    getCards(ids: GameCardId[]): GameCard[] {
        const result: GameCard[] = [];
        for (const id of ids) {
            const card = this.cards.get(id);
            if (card) result.push(card);
        }
        return result;
    }

    /** 获取实体牌 id 数组（保持顺序） */
    getCardIds(cards: GameCard[]): GameCardId[] {
        return cards.map((card) => card.id);
    }

    // ===== 牌名查询 =====

    /** 对局内牌名列表（副本，不含衍生牌） */
    getCardNames(): string[] {
        return [...this.cardNames];
    }

    /** 按卡牌类别取牌名列表（未出现返回空数组） */
    getCardNamesByType(type: CardType): string[] {
        return [...(this.cardNamesToType.get(type) ?? [])];
    }

    /** 按卡牌副类别取牌名列表（未出现返回空数组） */
    getCardNamesBySubType(subtype: CardSubType): string[] {
        return [...(this.cardNamesToSubType.get(subtype) ?? [])];
    }

    // ===== 武将查询 =====

    /** 按 id 获取武将（不存在返回 undefined） */
    getGeneral(id: string): General | undefined {
        return this.generals.get(id);
    }

    /** 批量获取武将（过滤无效 id，保持顺序） */
    getGenerals(ids: string[]): General[] {
        const result: General[] = [];
        for (const id of ids) {
            const general = this.generals.get(id);
            if (general) result.push(general);
        }
        return result;
    }

    /** 获取武将 id 数组（保持顺序） */
    getGeneralIds(generals: General[]): string[] {
        return generals.map((general) => general.id);
    }

    /** 对局内武将真名列表（副本） */
    getGeneralNames(): string[] {
        return [...this.generalNames];
    }

    /** 按真名查找武将（多同名返回首个，不存在返回 undefined） */
    getGeneralByName(trueName: string): General | undefined {
        for (const general of this.generals.values()) {
            if (general.trueName === trueName) return general;
        }
        return undefined;
    }

    // ===== 技能/效果查询 =====

    /** 按 id 获取技能（不存在返回 undefined） */
    getSkill(id: number): Skill | undefined {
        return this.skills.get(id);
    }

    /** 批量获取技能（过滤无效 id，保持顺序） */
    getSkills(ids: number[]): Skill[] {
        const result: Skill[] = [];
        for (const id of ids) {
            const skill = this.skills.get(id);
            if (skill) result.push(skill);
        }
        return result;
    }

    /** 获取技能 id 数组（保持顺序） */
    getSkillIds(skills: Skill[]): number[] {
        return skills.map((skill) => skill.id);
    }

    /** 某玩家的技能列表 */
    getSkillsByPlayer(player: Player): Skill[] {
        return [...this.skills.values()].filter((skill) => skill.player === player);
    }

    /** 按技能名取同名技能列表（同名技能可多份，如多人同技能） */
    getSkillsByName(name: string): Skill[] {
        return [...(this.skillsByName.get(name) ?? [])];
    }

    /** 按 id 获取效果（不存在返回 undefined） */
    getEffect(id: number): Effect | undefined {
        return this.effects.get(id);
    }

    /** 批量获取效果（过滤无效 id，保持顺序） */
    getEffects(ids: number[]): Effect[] {
        const result: Effect[] = [];
        for (const id of ids) {
            const effect = this.effects.get(id);
            if (effect) result.push(effect);
        }
        return result;
    }

    /** 获取效果 id 数组（保持顺序） */
    getEffectIds(effects: Effect[]): number[] {
        return effects.map((effect) => effect.id);
    }

    /** 某玩家的效果列表 */
    getEffectsByPlayer(player: Player): Effect[] {
        return [...this.effects.values()].filter((effect) => effect.player === player);
    }

    /** 按效果名取同名效果列表（同名效果可多份） */
    getEffectsByName(name: string): Effect[] {
        return [...(this.effectsByName.get(name) ?? [])];
    }

    // ===== 效果详细索引查询 =====

    /** 按 id 获取触发效果（不存在返回 undefined） */
    getTriggerEffect(id: number): TriggerEffect | undefined {
        return this.triggerEffectsById.get(id);
    }

    /** 按 id 获取状态效果（不存在返回 undefined） */
    getStateEffect(id: number): StateEffect | undefined {
        return this.stateEffectsById.get(id);
    }

    /** 某时机应触发的效果列表：全局效果 + 指定玩家的私有效果（未指定玩家仅全局；跨优先级合并） */
    getTriggerEffects(timing: TimingName, playerId?: string): TriggerEffect[] {
        const byPriority = this.triggerEffectsByTiming.get(timing);
        if (!byPriority) return [];
        const result: TriggerEffect[] = [];
        for (const entry of byPriority.values()) {
            if (playerId === undefined) {
                result.push(...entry.global);
            } else {
                result.push(...entry.global, ...(entry.player.get(playerId) ?? []));
            }
        }
        return result;
    }

    /** 按状态类型取状态效果列表（未注册返回空数组） */
    getStateEffectsByType(type: StateEffectType): StateEffect[] {
        return [...(this.stateEffectsByType.get(type) ?? [])];
    }

    // ===== 事件系统访问（host 注入后可用；镜像端抛错/空值） =====

    /** 事件管理器（触发调度/事件创建） */
    get event(): EventManager {
        if (!this.host) return this.failHost();
        return this.host.event;
    }

    /** 当前事件栈（host 运行态；镜像端返回空数组） */
    get eventStack(): EventProcess[] {
        return this.host?.eventStack ?? [];
    }

    /** 回合栈（host 运行态） */
    get turnStack(): TurnEvent[] {
        return this.host?.turnStack ?? [];
    }

    /** 阶段栈（host 运行态） */
    get phaseStack(): PhaseEvent[] {
        return this.host?.phaseStack ?? [];
    }

    /** 当前回合（栈顶，host 运行态） */
    get currentTurn(): TurnEvent | undefined {
        return this.host?.currentTurn;
    }

    /** 当前阶段（栈顶，host 运行态） */
    get currentPhase(): PhaseEvent | undefined {
        return this.host?.currentPhase;
    }

    /** 延迟明置队列（host 运行态） */
    get deferredOpens(): EventProcess[] {
        return this.host?.deferredOpens ?? [];
    }

    /** 复活回调队列（host 运行态） */
    get fuhuos(): Array<() => Promise<void>> {
        return this.host?.fuhuos ?? [];
    }

    /** 记录事件到历史（host 运行态） */
    insertHistory(event: EventProcess): void {
        if (!this.host) return this.failHost();
        this.host.insertHistory(event);
    }

    /** 注册牌的使用方式定义（从 sgs.carduses 拷贝到本地索引，host 运行态） */
    initCardUses(): void {
        if (!this.host) return this.failHost();
        this.host.initCardUses();
    }

    /** 查询最后一个指定类型的历史事件（host 运行态） */
    getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T) => boolean): T | undefined {
        if (!this.host) return this.failHost();
        return this.host.getLastOneHistory<T>(type, filter);
    }

    // ===== 事件快捷方法（薄转发 host.event） =====

    /** 造成伤害 */
    damage(opts: DamageEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DamageEvent> {
        return this.event.damage(opts);
    }

    /** 失去体力 */
    loseHp(opts: LoseHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<LoseHpEvent> {
        return this.event.loseHp(opts);
    }

    /** 扣减体力 */
    reduceHp(opts: ReduceHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ReduceHpEvent> {
        return this.event.reduceHp(opts);
    }

    /** 回复体力 */
    recover(opts: RecoverHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<RecoverHpEvent> {
        return this.event.recover(opts);
    }

    /** 改变体力上限 */
    changeMaxHp(opts: ChangeMaxHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeMaxHpEvent> {
        return this.event.changeMaxHp(opts);
    }

    /** 进入濒死 */
    dying(opts: DyingEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DyingEvent> {
        return this.event.dying(opts);
    }

    /** 死亡 */
    die(opts: DeathEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DeathEvent> {
        return this.event.die(opts);
    }

    /** 判定 */
    judge(opts: JudgeEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<JudgeEvent> {
        return this.event.judge(opts);
    }

    /** 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeStateEvent> {
        return this.event.changeState(opts);
    }

    /** 明置武将 */
    open(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, generals, toState: true });
    }

    /** 暗置武将 */
    close(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, generals, toState: false });
    }

    /** 横置/重置武将（toState 缺省取当前状态取反） */
    chain(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: toState ?? !player.chained, damageType: undefined });
    }

    /** 翻面（toState 缺省取当前状态取反） */
    skip(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, toState: toState ?? !player.skip });
    }

    /** 变更武将——TODO(R8): 主副将数据就绪后生效 */
    change(player: Player, general: General | 'head' | 'deputy', toGeneral: General): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, general, toGeneral });
    }

    /** 移除武将——TODO(R8): 主副将数据就绪后生效 */
    remove(player: Player, general: General): Promise<ChangeStateEvent> {
        return this.event.changeState({ player, general });
    }

    /** 移动卡牌（cards 第一参数，toArea 第二参数） */
    moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.event.moveCards([{ cards, toArea, ...opts }]);
    }

    /** 移动卡牌（完整数据数组，复杂移动场景用） */
    moveCardsRaw(datas: MoveCardData[], opts?: { getMoveLabel?: (data: MoveCardData) => RichString; log?: (data: MoveCardData) => RichString }): Promise<MoveCardEvent> {
        return this.event.moveCards(datas, opts);
    }

    /** 使用牌（直接触发 UseCardEvent；询问版签名 TODO(R2) 选择系统） */
    useCard(player: Player, card: VirtualCard, targets?: Player[]): Promise<UseCardEvent | null> {
        if (!this.host) return this.failHost();
        return this.host.useCard(player, card, targets ?? []);
    }

    /** 打出牌（直接触发 DropCardEvent） */
    dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.dropCard(player, card);
    }

    // ===== 牌堆/移动辅助（薄转发 host） =====

    /** 从牌堆获取 N 张牌（不足时自动洗牌，仍不够返回空） */
    getNCards(count: number, pos: 'top' | 'bottom' = 'top'): Promise<GameCard[]> {
        if (!this.host) return this.failHost();
        return this.host.getNCards(count, pos);
    }

    /** 洗牌：弃牌堆洗混后置入牌堆底部 */
    shuffleDiscardToDraw(): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.shuffleDiscardToDraw();
    }

    /** 置于牌：将牌直接移动到目标区域（reason 默认 'put'） */
    putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.moveCards(cards, toArea, opts);
    }

    /** 摸牌：从牌堆摸 count 张到玩家手牌 */
    draw(player: Player, count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts): Promise<unknown> {
        if (!this.host) return this.failHost();
        return this.host.draw(player, count, pos, opts);
    }

    /** 弃牌：将牌移动到弃牌堆 */
    discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.discard(player, cards, opts);
    }

    /** 获得牌：将牌移动到操作者手牌区 */
    obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.obtain(player, cards, opts);
    }

    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 */
    give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.give(fromPlayer, toPlayer, cards, opts);
    }

    /** 交换牌：两批牌同时经处理区互换区域 */
    swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.swap(cards1, toArea1, cards2, toArea2, opts);
    }

    /** 重铸：置入弃牌堆后摸等量牌 */
    recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<unknown> {
        if (!this.host) return this.failHost();
        return this.host.recast(player, cards, drawOneAlways, opts);
    }

    /** 展示牌：通知客户端显示卡牌（无实际区域移动）——TODO(R9): 可见性 */
    showCards(player: Player | undefined, cards: GameCard[]): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.showCards(player, cards);
    }

    /** 亮出牌：牌堆牌移入处理区，其他牌等同展示 */
    flashCards(player: Player | undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<unknown> {
        if (!this.host) return this.failHost();
        return this.host.flashCards(player, cards, opts);
    }

    /** 移存牌：将牌移动到后备区 */
    removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.removeToReserve(cards, opts);
    }

    /** 游戏延迟等待（供玩家观察）——TODO(R9): 客户端延时消息 */
    async delay(_seconds: number, _showProgressBar: boolean = false): Promise<void> {
        // TODO(R9): 发送延时消息到客户端
    }

    // ===== 事件前置检测（纯查询） =====

    /** 检测 loseHp 是否可执行：存活且体力值 ≥ number */
    canLoseHp(player: Player, number: number = 1): boolean {
        return player.alive && player.inthp >= number;
    }

    /** 检测 recover 是否可执行：存活且还有已损失体力可回复 */
    canRecover(player: Player, number: number = 1): boolean {
        if (!player.alive) return false;
        const cap = player.maxhp - player.inthp;
        return number > 0 && cap > 0;
    }

    /** 检测 changeMaxHp 是否可执行（number 为负时减少上限） */
    canChangeMaxHp(player: Player, number: number = 1): boolean {
        if (!player.alive) return false;
        if (number < 0 && player.maxhp + number <= 0) return false;
        return number !== 0;
    }

    /** 使用牌合法性检测：canUse 额外条件 + 合法目标数检测 */
    canUseCard(player: Player, cardName: string, target?: Player): boolean {
        const cardUse = this.carduses.get(cardName);
        if (!cardUse) return false;

        // 1. 额外使用条件（如桃需体力不满）
        if (cardUse.canUse) {
            const vc = this.host?.vcard.createByNone(cardName);
            if (!vc) return false;
            const ok = cardUse.canUse(this, player, vc);
            this.host?.destroyVirtualCard(vc);
            if (!ok) return false;
        }

        // 2. 目标合法性（指定目标时）
        if (target) {
            const vc = this.host?.vcard.createByNone(cardName);
            if (!vc) return false;
            const validTargets = cardUse.target(this, player, vc);
            this.host?.destroyVirtualCard(vc);
            if (validTargets.length === 0) return false;
            if (!validTargets.includes(target)) return false;
        }

        return true;
    }

    // ===== 房间主机能力（host 注入，镜像端调用抛错） =====

    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    createVirtualCard(
        nameOrCardOrData: string | GameCard | VirtualCardData,
        subcardsOrOverrides?: GameCard[] | VirtualCardOverrides,
        overrides?: VirtualCardOverrides,
    ): VirtualCard {
        if (!this.host) return this.failHost();
        // 参数透传 host（host 负责按形态分发）
        return this.host.createVirtualCard(
            nameOrCardOrData as never,
            subcardsOrOverrides as never,
            overrides as never,
        );
    }

    destroyVirtualCard(vc: VirtualCard): void {
        if (!this.host) return this.failHost();
        this.host.destroyVirtualCard(vc);
    }

    /** host 未注入（镜像端）时调用能力方法的兜底 */
    private failHost(): never {
        throw new Error('房间主机能力未注入（镜像端不可调用）');
    }
}
