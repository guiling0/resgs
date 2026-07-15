import { MapSchema } from '@colyseus/schema';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { Player } from '../player/Player';
import { RoomState } from '../schema/RoomState';
import { MarkState } from '../schema/MarkState';
import { GameCard } from '../card/GameCard';
import { VirtualCard } from '../card/VirtualCard';
import { CardSubType, CardType } from '../card/CardTypes';
import { CardManager } from './manager/CardManager';
import { AreaManager } from './manager/AreaManager';
import { VirtualCardManager } from './manager/VirtualCardManager';
import { PlayerManager } from './manager/PlayerManager';
import { GeneralManager } from './manager/GeneralManager';
import { SkillManager } from './manager/SkillManager';
import { EventManager } from './manager/EventManager';
import { BroadcastManager } from './manager/BroadcastManager';
import { General } from '../general/General';
import { GeneralId } from '../general/GeneralType';
import { EventProcess } from '../event/EventProcess';
import { TimingName } from '../event/EventTypes';
import { Skill } from '../skill/Skill';
import { Effect } from '../skill/Effect';
import { PriorityType, StateEffectType } from '../skill/SkillTypes';
import type { TurnEvent } from '../event/TurnEvent';

/** refreshs 回调条目（fn 已 bind，this 指向 source） */
export interface RefreshEntry {
    source: Skill | Effect;
    fn: (room: Room, data: any) => Promise<any>;
}

export class Room implements Omit<MarkHost, 'room'> {
    // ===== MarkHost 实现 =====
    /** 房间自身状态（Colyseus Schema 根节点） */
    readonly state: RoomState;
    /** 运行时自定义数据 */
    readonly data: Record<string, any> = {};
    /** 标记状态 Map */
    readonly marksMap: MapSchema<MarkState>;
    /** 标记 key→内容集合 索引 */
    readonly _markKeyMap = new Map<string, Set<string>>();

    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    // ===== Manager 实例 =====
    /** 区域操作 */
    area: AreaManager = new AreaManager(this);
    /** 卡牌创建/索引 */
    card: CardManager = new CardManager(this);
    /** 虚拟牌生命周期 */
    vcard: VirtualCardManager = new VirtualCardManager(this);
    /** 玩家查询/排序 */
    player: PlayerManager = new PlayerManager(this);
    /** 武将查询/选将 */
    general: GeneralManager = new GeneralManager(this);
    /** 技能/效果生命周期 */
    skill: SkillManager = new SkillManager(this);
    /** 事件触发调度 */
    event: EventManager = new EventManager(this);
    /** 客户端通讯 */
    broadcast: BroadcastManager = new BroadcastManager(this);

    // ===== 运行时容器 =====
    /** 所有玩家实体列表 */
    players: Player[] = [];
    /** playerId → Player 快速索引 */
    playerMaps: Map<string, Player> = new Map();
    /** 所有卡牌实例（ID → 实体） */
    cards: Map<number, GameCard> = new Map();
    /** 非衍生牌名列表 */
    cardNames: string[] = [];
    /** 牌名 → 卡牌类型 索引 */
    cardNamesToType: Map<CardType, Set<string>> = new Map();
    /** 牌名 → 卡牌副类型 索引 */
    cardNamesToSubType: Map<CardSubType, Set<string>> = new Map();
    /** 所有虚拟牌 */
    vcards: VirtualCard[] = [];
    /** 所有武将实例（ID → 实体） */
    generals: Map<GeneralId, General> = new Map();
    /** 所有武将真名列表 */
    generalNames: string[] = [];
    /** 本局已被选走的武将真名集合（防止选将/补将重复） */
    pickedGeneralNames: Set<string> = new Set();
    /** 本次变更已用过的武将（防止变更时重复出同一张） */
    changeGenerals: Set<General> = new Set();

    // ===== 事件系统 =====
    /** 事件自增 ID */
    eventIds: number = 0;
    /** 技能自增 ID */
    skillIds: number = 0;
    /** 效果自增 ID */
    effectIds: number = 0;
    /** 所有运行时技能实例 */
    skills: Skill[] = [];
    /** 所有运行时效果实例 */
    effects: Effect[] = [];
    /** 当前事件栈（正在执行的事件链） */
    eventStack: EventProcess[] = [];
    /** 当前正在执行的回合事件 */
    currentTurn?: TurnEvent;
    /** 延迟明置队列 */
    deferredOpens: EventProcess[] = [];
    /** 复活回调队列 */
    fuhuos: Array<() => Promise<void>> = [];

    // ===== 技能/效果索引 =====
    /**
     * 触发效果索引：TimingName → PriorityType → { global, byPlayer }
     */
    triggerEffects: Map<
        TimingName,
        Map<
            PriorityType,
            {
                global: Effect[];
                byPlayer: Map<string, Effect[]>;
            }
        >
    > = new Map();
    /**
     * 状态效果索引：StateEffectType → 拥有该状态回调的效果列表
     */
    stateEffects: Map<StateEffectType, Effect[]> = new Map();
    /**
     * refreshs 回调索引：TimingName → before/after 回调列表
     */
    refreshsByTiming: Map<
        TimingName,
        {
            before: Array<RefreshEntry>;
            after: Array<RefreshEntry>;
        }
    > = new Map();

    // ===== 计算属性 =====
    /** 存活玩家列表 */
    get alives() {
        return this.players.filter((p) => p.alive);
    }

    // ===== 工具方法 =====

    /**
     * 游戏延迟等待。
     * 让玩家有时间观察游戏情况，暂停游戏流程。
     * @param seconds 延迟秒数
     * @param showProgressBar 是否让所有玩家显示等待进度条
     */
    async delay(seconds: number, showProgressBar: boolean = false): Promise<void> {
        // TODO Phase 9: 通过 BroadcastManager 发送延迟消息到客户端
    }

    constructor(roomId: string, gameId: string, state: RoomState) {
        this.state = state;
        this.state.roomId = roomId;
        this.state.gameId = gameId;
        this.marksMap = state.markStates;
    }
}
