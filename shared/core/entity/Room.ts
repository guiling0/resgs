import type { RoomOptions } from '../types/RoomOptions';
import { Mark } from './Mark';
import { sync, syncMap, syncArray } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateArray } from '../state/StateArray';
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
import type { CardSubType, CardType, EquipSubType, GameCardId, VirtualCardData } from '../types/CardTypes';
import { DamageType } from '../types/EventTypes';
import type { CardUseData, DamageEventData, DeathEventData, DyingEventData, JudgeEventData, LoseHpEventData, MoveCardData, MoveCardOpts, PindianEventData, RecoverHpEventData, ReduceHpEventData, TimingName, ChangeStateData, ChangeMaxHpEventData, OpenEventData, EventType, EventOpts } from '../types/EventTypes';
import type { RichString } from '../types/RichText';
import type { PriorityType, StateEffectType } from '../types/SkillTypes';
import { Phase } from '../types/PlayerTypes';
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
import type { PindianEvent } from '../logic/event/PindianEvent';

/** Player 的 number 类型字段名（含 getter）；-? 去除可选属性以避免索引访问产生 undefined */
type NumberField = { [K in keyof Player]-?: Player[K] extends number ? K : never }[keyof Player];

/**
 * 围攻关系：围攻角色（上家、下家）+ 被围攻角色
 * @rules terms/description-terms/siege
 * @description 围攻角色和被围攻角色处于同一围攻关系
 */
export interface SiegeRelation {
    /** 围攻角色（上家与下家，势力相同） */
    siegers: Player[];
    /** 被围攻角色 */
    target: Player;
}

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

    /** 当前轮数 */
    @sync() roundCount: number = 0;

    /** 额外回合队列（权威端运行时维护，不同步） */
    extraTurns: TurnEvent[] = [];

    /** 本轮起始回合（权威端运行时维护，不同步） */
    roundStartTurn?: TurnEvent;

    /** 当前回合玩家 id */
    @sync() currentPlayerId: string = '';
    // TODO(R1): 回合流程落地后维护该字段

    /** 玩家集合（实体段名 player，条目值 Player 实体） */
    @syncMap('player') players: StateMap<string, Player> = new StateMap();

    /** 军令牌堆（可同步，游戏开始时置为 1~6） */
    @syncArray() commands: StateArray<number> = new StateArray();

    /** 妙计牌堆（可同步，游戏开始时置为 80~91） */
    @syncArray() miaojis: StateArray<number> = new StateArray();

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

    /** 设置游戏状态（host 运行时使用） */
    setGameState(state: 'waiting' | 'gaming' | 'ending'): void {
        this._gameState = state;
    }

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

    /** 无视记录：source 无视 target 的满足 filter 的技能（filter 缺省无视全部技能） */
    ignoreRecords: Array<{ source: Player; target: Player; filter?: (skill: Skill) => boolean }> = [];

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

    /**
     * 玩家数
     * @rules terms/value-terms/playerCount
     * @description 参与一局游戏的玩家数，角色离场不改变玩家数
     */
    get playerCount(): number {
        return this.players.size;
    }

    /** 按条件筛选玩家（includeDead 为 true 时含死亡玩家） */
    filterPlayer(fn: (player: Player) => boolean, includeDead: boolean = false): Player[] {
        return (includeDead ? [...this.players.values()] : this.alives).filter(fn);
    }

    /**
     * 按条件统计角色数
     * @rules terms/value-terms/kingdomCount
     * @description 按条件统计玩家数，已死亡的角色默认不参与
     * @param fn 筛选条件
     * @param includeDead 是否包含死亡玩家（默认 false）
     * @returns 符合条件的角色数
     */
    getPlayerCount(fn: (player: Player) => boolean, includeDead: boolean = false): number {
        return this.filterPlayer(fn, includeDead).length;
    }

    /**
     * 指定势力的角色数
     * @rules terms/value-terms/kingdomCount
     * @description 统计指定势力的角色数，已死亡的角色默认不参与
     * @param kingdom 势力
     * @param includeWild 是否包含野心家（默认 false，野心家势力独立）
     * @param includeDead 是否包含死亡角色（默认 false）
     * @returns 指定势力的角色数
     */
    getKingdomCount(kingdom: string, includeWild: boolean = false, includeDead: boolean = false): number {
        return this.filterPlayer((p) => {
            if (p.kingdom !== kingdom) return false;
            // 野心家的势力独立，仅显式要求时计入
            return includeWild || p.kingdom !== 'wild';
        }, includeDead).length;
    }

    /**
     * 获取当前大势力
     * @rules terms/description-terms/dashili
     * @description 大势力是角色数最大且大于1的势力，可能多股并列
     * @returns 当前大势力数组（无大势力时为空数组）
     */
    getBigKingdoms(): string[] {
        const counts = new Map<string, number>();
        for (const p of this.alives) {
            if (!p.kingdom) continue;
            counts.set(p.kingdom, (counts.get(p.kingdom) ?? 0) + 1);
        }
        const max = Math.max(...counts.values(), 0);
        if (max <= 1) return [];
        return [...counts.entries()].filter(([, c]) => c === max).map(([k]) => k);
    }

    /**
     * 判断一名玩家是否为大势力角色
     * @rules terms/description-terms/dashili
     * @description 大势力角色即所属势力为当前大势力的角色
     * @param player 被判断的角色
     * @returns 是否为大势力角色
     */
    isBigKingdom(player: Player): boolean {
        return this.getBigKingdoms().includes(player.kingdom);
    }

    /**
     * 判断一名玩家是否为小势力角色
     * @rules terms/description-terms/xiaoshili
     * @description 小势力角色即有大势力存在时，所属势力不为大势力的角色；无大势力时任何角色均非小势力角色
     * @param player 被判断的角色
     * @returns 是否为小势力角色
     */
    isSmallKingdom(player: Player): boolean {
        const bigs = this.getBigKingdoms();
        return bigs.length > 0 && !bigs.includes(player.kingdom);
    }

    /**
     * 判断两名玩家是否相邻
     * @rules terms/description-terms/xianglin
     * @description 两名角色间没有其他角色，则称这两名角色相邻
     * @param a 角色一
     * @param b 角色二
     * @returns 是否相邻
     */
    isAdjacent(a: Player, b: Player): boolean {
        return a.next === b || a.prev === b;
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

    // ===== 座次关系（队列/围攻） =====

    /**
     * 队列：获取与玩家处于同一队列的所有角色
     * @rules terms/description-terms/queue
     * @description 两名或两名以上连续相邻且势力相同的角色处于同一队列
     * @param player 查询角色
     * @returns 同一队列的所有角色（含 player），仅自身时返回空数组
     */
    getSameQueue(player: Player): Player[] {
        const queue: Player[] = [player];
        for (let p = player.left; p !== player; p = p.left) {
            if (p.death) continue;
            if (p.kingdom && p.kingdom === player.kingdom) queue.push(p);
            else break;
        }
        for (let p = player.right; p !== player; p = p.right) {
            if (p.death) continue;
            if (p.kingdom && p.kingdom === player.kingdom) queue.push(p);
            else break;
        }
        return queue.length > 1 ? queue : [];
    }

    /** 获取全场所有围攻关系 */
    private _allSiegeRelations(): SiegeRelation[] {
        const relations: SiegeRelation[] = [];
        for (const p of this.alives) {
            const u = p.prev;
            const d = p.next;
            if (!u || !d || u.death || d.death) continue;
            if (!u.kingdom || u.kingdom === p.kingdom) continue;
            if (d.kingdom === u.kingdom) {
                relations.push({ siegers: [u, d], target: p });
            }
        }
        return relations;
    }

    /**
     * 获取玩家为围攻方的所有围攻关系
     * @rules terms/description-terms/siege
     * @description 上家和下家势力相同且与该角色势力不同时，其上家和下家对其围攻，称为围攻角色
     * @param player 查询角色
     * @returns 该角色为围攻方的围攻关系列表
     */
    getSiegeRelationsBySieger(player: Player): SiegeRelation[] {
        return this._allSiegeRelations().filter((r) => r.siegers.includes(player));
    }

    /**
     * 获取玩家为被围攻方的所有围攻关系
     * @rules terms/description-terms/siege
     * @description 上家和下家势力相同且与该角色势力不同时，其被围攻，称为被围攻角色
     * @param player 查询角色
     * @returns 该角色为被围攻方的围攻关系列表
     */
    getSiegeRelationsByTarget(player: Player): SiegeRelation[] {
        return this._allSiegeRelations().filter((r) => r.target === player);
    }

    /**
     * 获取玩家的所有围攻关系
     * @rules terms/description-terms/siege
     * @description 围攻角色和被围攻角色处于同一围攻关系
     * @param player 查询角色
     * @returns 该角色参与的全部围攻关系列表
     */
    getSiegeRelations(player: Player): SiegeRelation[] {
        return this._allSiegeRelations().filter(
            (r) => r.target === player || r.siegers.includes(player),
        );
    }

    /**
     * 判断两名玩家是否处于同一围攻关系且均为围攻方
     * @rules terms/description-terms/siege
     * @description 两名围攻角色处于同一围攻关系中
     * @param player1 玩家一
     * @param player2 玩家二
     * @returns 是否在同一围攻关系且均为围攻方
     */
    isSameSiegeBothSiegers(player1: Player, player2: Player): boolean {
        return this._allSiegeRelations().some(
            (r) => r.siegers.includes(player1) && r.siegers.includes(player2),
        );
    }

    /**
     * 判断两名玩家是否处于同一围攻关系，且第一个为围攻方、第二个为被围攻方
     * @rules terms/description-terms/siege
     * @description 围攻角色与被围攻角色处于同一围攻关系中
     * @param sieger 围攻方
     * @param target 被围攻方
     * @returns 是否在同一围攻关系且分别为围攻方与被围攻方
     */
    isSameSiegeSiegerTarget(sieger: Player, target: Player): boolean {
        return this._allSiegeRelations().some(
            (r) => r.siegers.includes(sieger) && r.target === target,
        );
    }

    // ===== 数值计算 =====

    /**
     * 取某数值最大的玩家
     * @rules terms/value-terms/maxMin
     * @description 返回所有玩家中该数值最大的玩家数组，允许并列
     * @param field 玩家的 number 字段名（含 getter）
     * @param includeDead 是否包含死亡玩家（默认 false）
     * @returns 数值最大的玩家数组
     */
    getMaxValue(field: NumberField, includeDead: boolean = false): Player[] {
        const players = includeDead ? [...this.players.values()] : this.alives;
        if (players.length === 0) return players;
        const max = Math.max(...players.map((p) => p[field]));
        return players.filter((p) => p[field] === max);
    }

    /**
     * 取某数值最小的玩家
     * @rules terms/value-terms/maxMin
     * @description 返回所有玩家中该数值最小的玩家数组，允许并列
     * @param field 玩家的 number 字段名（含 getter）
     * @param includeDead 是否包含死亡玩家（默认 false）
     * @returns 数值最小的玩家数组
     */
    getMinValue(field: NumberField, includeDead: boolean = false): Player[] {
        const players = includeDead ? [...this.players.values()] : this.alives;
        if (players.length === 0) return players;
        const min = Math.min(...players.map((p) => p[field]));
        return players.filter((p) => p[field] === min);
    }

    /**
     * 指定玩家是否为该数值最大的玩家
     * @rules terms/value-terms/maxMin
     * @description 判断指定玩家是否在数值最大的玩家数组中
     * @param player 指定玩家
     * @param field 玩家的 number 字段名（含 getter）
     * @param includeDead 是否包含死亡玩家（默认 false）
     * @returns 是否包含指定玩家
     */
    hasMaxValue(player: Player, field: NumberField, includeDead: boolean = false): boolean {
        return this.getMaxValue(field, includeDead).includes(player);
    }

    /**
     * 指定玩家是否为该数值最小的玩家
     * @rules terms/value-terms/maxMin
     * @description 判断指定玩家是否在数值最小的玩家数组中
     * @param player 指定玩家
     * @param field 玩家的 number 字段名（含 getter）
     * @param includeDead 是否包含死亡玩家（默认 false）
     * @returns 是否包含指定玩家
     */
    hasMinValue(player: Player, field: NumberField, includeDead: boolean = false): boolean {
        return this.getMinValue(field, includeDead).includes(player);
    }

    /**
     * 取一半
     * @rules terms/value-terms/half
     * @description X 的一半 = [X/2]，默认向下取整
     * @param value 数值 X
     * @param ceil 是否向上取整（默认 false）
     * @returns X 的一半
     */
    half(value: number, ceil: boolean = false): number {
        return ceil ? Math.ceil(value / 2) : Math.floor(value / 2);
    }

    /**
     * 数值之差
     * @rules terms/value-terms/difference
     * @description 即 |X-Y|
     * @param x 数值 X
     * @param y 数值 Y
     * @returns |X-Y|
     */
    diff(x: number, y: number): number {
        return Math.abs(x - y);
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
    get deferredOpens(): EventProcess<EventType.Open>[] {
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

    // ===== 事件快捷方法（薄转发 host） =====

    /**
     * 造成伤害
     * @rules terms/description-terms/damage
     * @description 造成伤害是令目标角色扣减体力的操作；若来源已死亡或未指定来源，则目标受到无来源的伤害
     * @param player 伤害来源（无来源伤害传 undefined）
     * @param target 受伤角色
     * @param number 伤害点数
     * @param damageType 伤害类型
     * @param opts 附加选项（渠道/连环/事件元数据/自由扩展字段）
     * @returns 伤害事件
     */
    damage(
        player: Player | undefined,
        target: Player,
        number: number,
        damageType: DamageType,
        opts?: EventOpts & Partial<Omit<DamageEventData, 'player' | 'target' | 'number' | 'damageType'>>,
    ): Promise<DamageEvent> {
        if (!this.host) return this.failHost();
        return this.host.damage(player, target, number, damageType, opts);
    }

    /** 失去体力 */
    loseHp(player: Player, number: number, opts?: EventOpts): Promise<LoseHpEvent> {
        if (!this.host) return this.failHost();
        return this.host.loseHp(player, number, opts);
    }

    /**
     * 扣减体力
     * @rules terms/description-terms/reduce_hp
     * @description 扣减体力是角色的体力被扣除的操作，失去体力和受到伤害均会导致扣减体力
     * @param player 扣减体力的角色
     * @param number 扣减点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 扣减体力事件
     */
    reduceHp(player: Player, number: number, opts?: EventOpts): Promise<ReduceHpEvent> {
        if (!this.host) return this.failHost();
        return this.host.reduceHp(player, number, opts);
    }

    /**
     * 回复体力
     * @rules terms/description-terms/recover
     * @description 回复体力是角色回复X点体力的操作，回复量不会超过已损失体力
     * @param player 回复体力的角色
     * @param number 回复点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件
     */
    recover(player: Player, number: number, opts?: EventOpts): Promise<RecoverHpEvent> {
        if (!this.host) return this.failHost();
        return this.host.recover(player, number, opts);
    }

    /**
     * 将体力回复至X点
     * @rules terms/description-terms/recover_to
     * @description 将体力回复至X点是回复(min{X,体力上限}-体力)点体力的操作；体力不小于X或已达体力上限时不能执行
     * @param player 回复体力的角色
     * @param toHp 回复至的体力值 X
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件（不能执行时为 undefined）
     */
    recoverTo(player: Player, toHp: number, opts?: EventOpts): Promise<RecoverHpEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.recoverTo(player, toHp, opts);
    }

    /** 改变体力上限 */
    changeMaxHp(player: Player, number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent> {
        if (!this.host) return this.failHost();
        return this.host.changeMaxHp(player, number, opts);
    }

    /** 进入濒死 */
    dying(player: Player, opts?: EventOpts): Promise<DyingEvent> {
        if (!this.host) return this.failHost();
        return this.host.dying(player, opts);
    }

    /** 死亡 */
    die(player: Player, opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent> {
        if (!this.host) return this.failHost();
        return this.host.die(player, opts);
    }

    /**
     * 判定：触发一个判定事件
     * @rules terms/card-op-terms/judge
     * @description 判定是「触发一个判定事件」的操作，薄转发至房间主机实现
     * @param player 判定角色
     * @param opts 判定事件数据（自由扩展字段）
     * @returns 判定事件
     */
    judge(player: Player, opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent> {
        if (!this.host) return this.failHost();
        return this.host.judge(player, opts);
    }

    /**
     * 拼点：触发一个拼点事件
     * @rules terms/card-op-terms/pindian
     * @description 拼点是「触发一个拼点事件」的操作，薄转发至房间主机实现
     * @param player 拼点发起者
     * @param targets 拼点目标
     * @param opts 拼点事件数据（自由扩展字段）
     * @returns 拼点事件
     */
    pindian(
        player: Player,
        targets: Player[],
        opts?: EventOpts & Partial<Omit<PindianEventData, 'player' | 'targets'>>,
    ): Promise<PindianEvent> {
        if (!this.host) return this.failHost();
        return this.host.pindian(player, targets, opts);
    }

    /** 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.changeState(opts);
    }

    /**
     * 明置武将
     * @rules terms/general-op-terms/open
     * @description 明置武将，薄转发至房间主机实现
     * @param player 明置角色
     * @param generals 被明置的武将牌
     * @returns 状态改变事件
     */
    open(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.open(player, generals);
    }

    /**
     * 暗置武将
     * @rules terms/general-op-terms/close
     * @description 暗置武将，薄转发至房间主机实现
     * @param player 暗置角色
     * @param generals 被暗置的武将牌
     * @returns 状态改变事件
     */
    close(player: Player, generals: General[]): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.close(player, generals);
    }

    /**
     * 横置：武将牌竖放的角色将其武将牌横放（进入连环状态）
     * @rules terms/general-op-terms/chain
     * @description 横置武将，薄转发至房间主机实现
     * @param player 横置角色
     * @returns 状态改变事件
     */
    chain(player: Player): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.chain(player);
    }

    /**
     * 重置：武将牌横放的角色将其武将牌竖放（脱离连环状态）
     * @rules terms/general-op-terms/reset
     * @description 重置武将，薄转发至房间主机实现
     * @param player 重置角色
     * @param damageType 连环伤害类型（默认 None）
     * @returns 状态改变事件
     */
    reset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.reset(player, damageType);
    }

    /** 横置/重置：按当前连环状态取反（便捷方法） */
    chainOrReset(player: Player, damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.chainOrReset(player, damageType);
    }

    /**
     * 翻面
     * @rules terms/general-op-terms/skip
     * @description 翻面，薄转发至房间主机实现
     * @param player 翻面角色
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    skip(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.skip(player, toState);
    }

    /**
     * 叠置：与翻面同一逻辑
     * @rules terms/general-op-terms/stack
     * @description 叠置，薄转发至房间主机实现
     * @param player 叠置角色
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    stack(player: Player, toState?: boolean): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.stack(player, toState);
    }

    /**
     * 复原
     * @rules terms/general-op-terms/restore
     * @description 复原武将，薄转发至房间主机实现
     * @param player 复原角色
     */
    restore(player: Player): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.restore(player);
    }

    /**
     * 变更武将
     * @rules terms/general-op-terms/change
     * @description 变更武将，薄转发至房间主机实现——TODO(R8): 主副将数据就绪后生效
     * @param player 变更角色
     * @param general 被变更的武将牌（'head'/'deputy' 表示主/副将）
     * @param toGeneral 变更后的武将牌
     * @returns 状态改变事件
     */
    change(player: Player, general: General | 'head' | 'deputy', toGeneral: General): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.change(player, general, toGeneral);
    }

    /**
     * 移除武将
     * @rules terms/general-op-terms/remove
     * @description 移除武将，薄转发至房间主机实现——TODO(R8): 主副将数据就绪后生效
     * @param player 移除角色
     * @param general 被移除的武将牌
     * @returns 状态改变事件
     */
    remove(player: Player, general: General): Promise<ChangeStateEvent> {
        if (!this.host) return this.failHost();
        return this.host.remove(player, general);
    }

    /**
     * 无视：source 无视 target 的满足 filter 的技能
     * @rules terms/resolution-terms/ignore
     * @description 无视是「在 source 对 target 的结算过程中 target 的相关技能无效」的操作，薄转发至房间主机实现
     * @param source 无视者
     * @param target 被无视技能的角色
     * @param filter 技能筛选（缺省无视全部技能）
     */
    addIgnore(source: Player, target: Player, filter?: (skill: Skill) => boolean): void {
        if (!this.host) return this.failHost();
        this.host.addIgnore(source, target, filter);
    }

    /**
     * 移除无视
     * @rules terms/resolution-terms/ignore
     * @description 移除 source 对 target 的无视记录，薄转发至房间主机实现
     * @param source 无视者
     * @param target 被无视技能的角色
     * @param filter 匹配的筛选（缺省移除全部）
     */
    removeIgnore(source: Player, target: Player, filter?: (skill: Skill) => boolean): void {
        if (!this.host) return this.failHost();
        this.host.removeIgnore(source, target, filter);
    }

    /**
     * 移至：将牌从另一区域移动到此区域
     * @rules terms/card-op-terms/moveCards
     * @description 移至是「将牌从另一个区域移动到此区域」的操作，薄转发至房间主机实现（主机负责预检过滤已在目标区域的牌）
     * @param cards 被移动的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项
     * @returns 移动事件
     */
    moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.moveCards(cards, toArea, opts);
    }

    /**
     * 移至：将牌从另一区域移动到此区域（完整数据数组）
     * @rules terms/card-op-terms/moveCards
     * @description 移至是「将牌从另一个区域移动到此区域」的操作，薄转发至房间主机实现（主机负责预检过滤已在目标区域的牌）
     * @param datas 移动数据数组（每条含目标区域）
     * @param opts 移动标签/战报生成选项
     * @returns 移动事件
     */
    moveCardsRaw(datas: MoveCardData[], opts?: { getMoveLabel?: (data: MoveCardData) => RichString; log?: (data: MoveCardData) => RichString }): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.moveCardsRaw(datas, opts);
    }

    /**
     * 使用牌：触发牌的使用事件
     * @rules terms/card-op-terms/useCard
     * @description 使用是「触发预使用牌事件，然后触发使用事件」的操作，薄转发至房间主机实现
     * @param player 使用者
     * @param card 使用的虚拟牌
     * @param targets 使用目标（缺省为空）
     * @returns 使用事件（未成功触发时为 null）
     */
    useCard(player: Player, card: VirtualCard, targets?: Player[]): Promise<UseCardEvent | null> {
        if (!this.host) return this.failHost();
        return this.host.useCard(player, card, targets ?? []);
    }

    /**
     * 打出牌：触发牌的打出事件
     * @rules terms/card-op-terms/dropCard
     * @description 打出是「触发一个打出事件」的操作，薄转发至房间主机实现
     * @param player 打出者
     * @param card 打出的虚拟牌
     * @returns 打出事件
     */
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

    /**
     * 洗牌：系统将弃牌堆里的所有牌洗混后置入牌堆
     * @rules terms/card-op-terms/shuffleDiscardToDraw
     * @description 洗牌是「系统将弃牌堆里的所有牌洗混，然后置入牌堆」的操作，薄转发至房间主机实现
     */
    shuffleDiscardToDraw(): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.shuffleDiscardToDraw();
    }

    /**
     * 置于/入：将牌按目标区域默认放置方式移至目标区域
     * @rules terms/card-op-terms/putTo
     * @description 置于/入是「将牌按目标区域里牌的放置方式移至目标区域并按该区域默认放置方式放置」的操作，薄转发至房间主机实现
     * @param cards 被置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项
     * @returns 置于移动事件
     */
    putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.putTo(cards, toArea, opts);
    }

    /**
     * 扣置于/入：将牌移至目标区域且背面朝上放置
     * @rules terms/card-op-terms/putFaceDown
     * @description 扣置于/入是「将牌移至目标区域且背面朝上放置」的操作，薄转发至房间主机实现（强制背面朝上放置）
     * @param cards 被扣置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项（putType 不可提供，强制为 false）
     * @returns 扣置于移动事件
     */
    putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.putFaceDown(cards, toArea, opts);
    }

    /**
     * 摸牌：从牌堆摸 count 张到玩家手牌
     * @rules terms/card-op-terms/draw
     * @description 摸牌是获得牌堆顶的牌的操作，薄转发至房间主机实现
     * @param player 摸牌角色
     * @param count 摸牌数量（默认 1）
     * @param pos 从牌堆顶部/底部摸取（默认顶部）
     * @param opts 移动附加选项
     * @returns 摸牌结果（移动事件或空）
     */
    draw(player: Player, count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts): Promise<unknown> {
        if (!this.host) return this.failHost();
        return this.host.draw(player, count, pos, opts);
    }

    /**
     * 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌
     * @rules terms/card-op-terms/drawTo
     * @description 将牌补至X张是「若这些牌数小于X，摸（X－这些牌数）张牌；不小于X，没有事发生」的操作，薄转发至房间主机实现
     * @param player 补牌角色
     * @param count 补至的牌数 X
     */
    drawTo(player: Player, count: number): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.drawTo(player, count);
    }

    /**
     * 弃牌：将牌移动到弃牌堆
     * @rules terms/card-op-terms/discard
     * @description 弃置是「将牌移至弃牌堆」的操作，薄转发至房间主机实现
     * @param player 弃牌角色
     * @param cards 被弃置的牌
     * @param opts 移动附加选项
     * @returns 弃牌移动事件
     */
    discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent> {
        if (!this.host) return this.failHost();
        return this.host.discard(player, cards, opts);
    }

    /**
     * 废除区域：将对应区域（或对应已有装备）里的所有牌置入弃牌堆，并记录废除状态
     * @rules terms/zone-terms/area
     * @description 废除装备栏或判定区，薄转发至房间主机实现
     * @param player 被废除区域的角色
     * @param target 被废除的装备栏（EquipSubType）或判定区（AreaType.Judge）
     */
    abolishArea(player: Player, target: EquipSubType | AreaType.Judge): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.abolishArea(player, target);
    }

    /**
     * 恢复区域：删除废除记录
     * @rules terms/zone-terms/area
     * @description 恢复装备栏或判定区，薄转发至房间主机实现
     * @param player 恢复区域的角色
     * @param target 恢复的装备栏（EquipSubType）或判定区（AreaType.Judge）
     */
    restoreArea(player: Player, target: EquipSubType | AreaType.Judge): void {
        if (!this.host) return this.failHost();
        this.host.restoreArea(player, target);
    }

    /**
     * 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌
     * @rules terms/card-op-terms/discardTo
     * @description 将牌弃置至X张是「若这些牌数大于X，弃置（这些牌数－X）张牌；不大于X，没有事发生」的操作，薄转发至房间主机实现（选择询问待实现）
     * @param player 弃牌角色
     * @param cards 需要操作的牌数组
     * @param count 弃置至的牌数 X
     */
    discardTo(player: Player, cards: GameCard[], count: number): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.discardTo(player, cards, count);
    }

    /**
     * 获得牌：将牌移动到操作者手牌区
     * @rules terms/card-op-terms/obtain
     * @description 获得是「一名角色将牌移至其手牌区」的操作，薄转发至房间主机实现
     * @param player 获得牌的角色
     * @param cards 被获得的牌
     * @param opts 移动附加选项
     * @returns 获得移动事件（无可获得牌时为 undefined）
     */
    obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.obtain(player, cards, opts);
    }

    /**
     * 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区
     * @rules terms/card-op-terms/give
     * @description 交给是「A将牌交给B」的操作（B获得这些牌）；排除接收者手牌区/装备区已拥有的牌，薄转发至房间主机实现
     * @param fromPlayer 交出的角色
     * @param toPlayer 接收的角色
     * @param cards 被交给的牌
     * @param opts 移动附加选项
     * @returns 交给移动事件（无可交给牌时为 undefined）
     */
    give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.give(fromPlayer, toPlayer, cards, opts);
    }

    /**
     * 交换牌：两批牌同时经处理区互换区域
     * @rules terms/card-op-terms/swap
     * @description 交换是「两名角色同时将各自的牌经处理区移至对方区域」的操作，薄转发至房间主机实现
     * @param cards1 第一批牌
     * @param toArea1 第一批牌的目标区域
     * @param cards2 第二批牌
     * @param toArea2 第二批牌的目标区域
     * @param opts 移动附加选项
     * @returns 交换移动事件（无有效牌时为 undefined）
     */
    swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!this.host) return this.failHost();
        return this.host.swap(cards1, toArea1, cards2, toArea2, opts);
    }

    /**
     * 重铸：将牌置入弃牌堆后摸等量牌
     * @rules terms/card-op-terms/recast
     * @description 重铸是「角色将此牌置入弃牌堆，然后摸一张牌」的操作，薄转发至房间主机实现
     * @param player 重铸角色
     * @param cards 被重铸的牌
     * @param drawOneAlways 是否无论张数始终摸一张（默认 false）
     * @param opts 移动附加选项
     * @returns 重铸结果（移动与摸牌）
     */
    recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<unknown> {
        if (!this.host) return this.failHost();
        return this.host.recast(player, cards, drawOneAlways, opts);
    }

    /**
     * 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作
     * @rules terms/card-op-terms/watch
     * @description 观看是「查看相应牌的牌面信息」的操作，薄转发至房间主机实现（发送询问与可见性流程待实现）
     * @param player 观看角色
     * @param cards 被观看的牌（卡牌或武将牌）
     */
    watch(player: Player, cards: (GameCard | General)[]): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.watch(player, cards);
    }

    /**
     * 展示牌：将牌翻转至正面朝上展示（无实际区域移动）
     * @rules terms/card-op-terms/showCards
     * @description 展示是「将背面朝上的牌翻转至正面朝上」的过程（牌不移动），薄转发至房间主机实现
     * @param player 展示者（公共展示为 undefined）
     * @param cards 被展示的牌
     */
    showCards(player: Player | undefined, cards: GameCard[]): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.showCards(player, cards);
    }

    /**
     * 亮出牌：牌堆牌置入处理区，其他牌等同展示
     * @rules terms/card-op-terms/flashCards
     * @description 亮出牌堆顶的牌即置入处理区；亮出牌堆里的一张牌即随机移入处理区；亮出其他背面牌即翻面展示
     * @param player 亮出者（公共亮出为 undefined）
     * @param cards 被亮出的牌
     * @param opts 移动附加选项
     */
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

    /**
     * 开始游戏
     * @rules terms/game-flow-terms/turn
     * @description 开始游戏是「获取游戏模式并执行主流程」的操作，薄转发至房间主机实现
     */
    startGame(): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.startGame();
    }

    /**
     * 游戏主流程
     * @rules terms/game-flow-terms/turn
     * @description 游戏主流程按额定回合与额外回合交替创建并执行回合事件，薄转发至房间主机实现
     */
    mainProcess(): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.mainProcess();
    }

    /**
     * 依次操作：重复执行操作 X 次（薄转发至房间主机）
     * @rules terms/description-terms/repeat
     * @description 依次操作是操作一次后重复（X-1）次此流程
     * @param times 重复次数 X
     * @param fn 每次执行的操作
     */
    repeat(times: number, fn: () => Promise<unknown>): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.repeat(times, fn);
    }

    /**
     * 各执行操作：玩家数组按响应顺序依次执行操作（薄转发至房间主机）
     * @rules terms/description-terms/for_each
     * @description 各执行操作是先选择所有符合条件的角色，然后这些角色依次执行此操作
     * @param players 参与执行的角色数组
     * @param fn 每个角色执行的操作（参数为当前执行角色）
     * @param clockwise 是否按顺时针排序（默认 false 逆时针）
     */
    forEachPlayer(
        players: Player[],
        fn: (player: Player) => Promise<unknown>,
        clockwise: boolean = false,
    ): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.forEachPlayer(players, fn, clockwise);
    }

    /**
     * 失去所有武将技能（薄转发至房间主机）
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有武将技能即移除该角色除规则技能与装备技能外的所有技能
     * @param player 失去技能的角色
     */
    loseGeneralSkills(player: Player): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.loseGeneralSkills(player);
    }

    /**
     * 失去所有技能（薄转发至房间主机）
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有技能即移除该角色拥有的全部技能（含规则技能与装备技能）
     * @param player 失去技能的角色
     */
    loseAllSkills(player: Player): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.loseAllSkills(player);
    }

    /**
     * 失去所有武将牌上的技能（薄转发至房间主机）
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有武将牌上的技能即移除该角色由指定武将牌获得的全部技能
     * @param player 失去技能的角色
     * @param general 来源武将牌
     */
    loseSkillsOfGeneral(player: Player, general: General): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.loseSkillsOfGeneral(player, general);
    }

    /**
     * 阵法召唤（薄转发至房间主机）
     * @rules terms/description-terms/arraycall
     * @description 阵法召唤是满足五个条件的角色发动的获得同伴明置响应的操作，依据阵法技类型执行对应流程
     * @param player 发动阵法召唤的角色
     * @param type 阵法技类型（'queue' 队列 / 'siege' 围攻）
     */
    arraycall(player: Player, type: 'queue' | 'siege'): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.arraycall(player, type);
    }

    /**
     * 选择：从多个选项中任选其一执行（薄转发至房间主机）
     * @rules terms/description-terms/choose
     * @description 选择是拥有选择权的角色从多个选项中选择其中任意一项执行
     * @param player 拥有选择权的角色
     * @param options 询问选项（提示/能否取消等）
     * @param handles 选项列表或选项键映射（值含是否可选与执行回调）
     * @returns 选中的选项（键名或文本），取消/无可选时返回 false
     */
    choose(
        player: Player,
        options: {
            canCancle?: boolean;
            prompt?: RichString;
            thinkPrompt?: RichString;
            toast?: boolean;
        },
        handles:
            | RichString[]
            | {
                  [key: string]: {
                      chooseable?: boolean;
                      handle?: () => Promise<void>;
                  };
              },
    ): Promise<false | string> {
        if (!this.host) return this.failHost();
        return this.host.choose(player, options, handles);
    }

    /**
     * 军令：发起者确定军令，执行者选择是否执行并结算（薄转发至房间主机）
     * @rules terms/description-terms/junling
     * @description 军令是角色 A 从两项随机操作中选择一项作为军令，令角色 B 选择是否执行
     * @param from 发起者（A）
     * @param to 执行者（B）
     * @param command 指定的军令（不传则随机抽取两张由 A 二选一）
     */
    command(from: Player, to: Player, command?: number): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.command(from, to, command);
    }

    /**
     * 随机获取军令（薄转发至房间主机）
     * @param count 获取数量（默认 2）
     * @returns 获取的军令数组
     */
    getCommands(count: number = 2): number[] {
        if (!this.host) return this.failHost();
        return this.host.getCommands(count);
    }

    /** 将军令放回军令牌堆（含去重，薄转发至房间主机） */
    returnCommand(command: number): void {
        if (!this.host) return this.failHost();
        this.host.returnCommand(command);
    }

    /**
     * 献策：发起者给执行者献计，执行者选择是否执行并结算（薄转发至房间主机）
     * @description 献策分为两步：将妙计加入执行者的持有妙计牌堆；执行者选择是否执行，执行完毕将妙计放回妙计牌堆
     * @param from 发起者
     * @param to 执行者
     * @param miaoji 指定的妙计（不传则随机抽取一张）
     */
    xiance(from: Player, to: Player, miaoji?: number): Promise<void> {
        if (!this.host) return this.failHost();
        return this.host.xiance(from, to, miaoji);
    }

    /**
     * 随机获取妙计（薄转发至房间主机）
     * @param count 获取数量（默认 1）
     * @returns 获取的妙计数组
     */
    getMiaoji(count: number = 1): number[] {
        if (!this.host) return this.failHost();
        return this.host.getMiaoji(count);
    }

    /** 将妙计放回妙计牌堆（含去重，薄转发至房间主机） */
    returnMiaoji(miaoji: number): void {
        if (!this.host) return this.failHost();
        this.host.returnMiaoji(miaoji);
    }

    /** 标准阶段序列 */
    static getRatedPhases(): Phase[] {
        return [Phase.Ready, Phase.Judge, Phase.Draw, Phase.Play, Phase.Drop, Phase.End];
    }

    /**
     * 结束游戏：游戏状态置为结束（胜负已定或牌堆耗尽平局）
     * @rules events/turn/#游戏结束时
     * @description 将游戏状态从进行中切换为结束；牌堆耗尽且无法洗牌时以平局结束
     * @param winner 获胜角色列表（未指定时为平局）
     */
    async gameOver(winner?: Player[]): Promise<void> {
        if (this._gameState === 'ending') return;
        this._gameState = 'ending';
        this.logger.info('游戏结束', { roomId: this.roomId, event: 'gameOver', winner: winner?.map((p) => p.playerId) ?? [] });
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
