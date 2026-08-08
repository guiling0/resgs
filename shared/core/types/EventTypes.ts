import type { AreaId } from './AreaTypes';
import type { VirtualCardData } from './CardTypes';
import type { RichString } from './RichText';
import type { GameCard } from '../entity/GameCard';
import type { VirtualCard } from '../entity/VirtualCard';
import type { General } from '../entity/General';
import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';
import type { Effect } from '../entity/Effect';
import type { EventProcess } from '../logic/event/EventProcess';
import type { TriggerEffect } from '../entity/TriggerEffect';
import type { EffectContext } from './SkillTypes';
import type { Phase } from './PlayerTypes';

// ==================== 时机 ====================

/**
 * 时机枚举——全部触发时机（技能触发/事件调度共用）
 * @rules terms/resolution-terms/timing
 * @description 时机是一个瞬间，一个事件发生时会产生若干个时机
 */
export enum TimingName {
    // ==================== 游戏流程 ====================
    /** 登场前 */
    GameStageBefore = 'game_stage_before',
    /** 登场时 */
    GameStage = 'game_stage',
    /** 登场后 */
    GameStageAfter = 'game_stage_after',
    /** @rules events/turn/#游戏开始前 */
    GameStartBefore = 'game_start_before',
    /** @rules events/turn/#游戏开始后 */
    GameStart = 'game_start',
    /** @rules events/turn/#游戏结束时 */
    GameEnd = 'game_end',

    // ==================== 轮次 ====================
    /** @rules events/turn/#每轮开始时 */
    RoundStart = 'round_start',
    /** 轮次结束 */
    RoundEnd = 'round_end',

    // ==================== 休整 ====================
    /** 休整开始 */
    RestStart = 'rest_start',
    /** 休整结束 */
    RestEnd = 'rest_end',

    // ==================== 回合 ====================
    /** @rules events/turn/#回合开始前 */
    TurnStartBefore = 'turn_start_before',
    /** @rules events/turn/#回合开始时 */
    TurnStart = 'turn_start',
    /** @rules events/turn/#回合开始后 */
    TurnStartAfter = 'turn_start_after',
    /** @rules events/turn/#回合结束前 */
    TurnEnd = 'turn_end',
    /** @rules events/turn/#回合结束后 */
    TurnEndAfter = 'turn_end_after',

    // ==================== 准备阶段 ====================
    /** @rules events/phase/#准备阶段开始前 */
    ReadyPhaseStartBefore = 'ready_start_before',
    /** @rules events/phase/#准备阶段开始时 */
    ReadyPhaseStart = 'ready_start',
    /** @rules events/phase/#准备阶段 */
    ReadyPhase = 'ready_phase',
    /** @rules events/phase/#准备阶段结束时 */
    ReadyPhaseEnd = 'ready_end',

    // ==================== 判定阶段 ====================
    /** @rules events/phase/#判定阶段开始前 */
    JudgePhaseStartBefore = 'judge_start_before',
    /** @rules events/phase/#判定阶段开始时 */
    JudgePhaseStart = 'judge_start',
    /** @rules events/phase/#判定阶段 */
    JudgePhase = 'judge_phase',
    /** @rules events/phase/#判定阶段结束时 */
    JudgePhaseEnd = 'judge_phase_end',

    // ==================== 摸牌阶段 ====================
    /** @rules events/phase/#摸牌阶段开始前 */
    DrawPhaseStartBefore = 'draw_start_before',
    /** @rules events/phase/#摸牌阶段开始时1 */
    DrawPhaseStart1 = 'draw_start1',
    /** @rules events/phase/#摸牌阶段开始时2 */
    DrawPhaseStart2 = 'draw_start2',
    /** @rules events/phase/#摸牌阶段 */
    DrawPhase = 'draw_phase',
    /** @rules events/phase/#摸牌阶段结束时 */
    DrawPhaseEnd = 'draw_end',

    // ==================== 出牌阶段 ====================
    /** @rules events/phase/#出牌阶段开始前 */
    PlayPhaseStartBefore = 'play_start_before',
    /** @rules events/phase/#出牌阶段开始时 */
    PlayPhaseStart = 'play_start',
    /** @rules events/phase/#出牌阶段 */
    PlayPhase = 'play_phase',
    /** @rules events/phase/#出牌阶段结束时 */
    PlayPhaseEnd = 'play_end',

    // ==================== 弃牌阶段 ====================
    /** @rules events/phase/#弃牌阶段开始前 */
    DiscardPhaseStartBefore = 'discard_start_before',
    /** @rules events/phase/#弃牌阶段开始时 */
    DiscardPhaseStart = 'discard_start',
    /** @rules events/phase/#弃牌阶段 */
    DiscardPhase = 'discard_phase',
    /** @rules events/phase/#弃牌阶段结束时 */
    DiscardPhaseEnd = 'discard_end',

    // ==================== 结束阶段 ====================
    /** @rules events/phase/#结束阶段开始前 */
    EndPhaseStartBefore = 'end_start_before',
    /** @rules events/phase/#结束阶段开始时 */
    EndPhaseStart = 'end_start',
    /** @rules events/phase/#结束阶段 */
    EndPhase = 'end_phase',
    /** @rules events/phase/#结束阶段结束时 */
    EndPhaseEnd = 'end_end',

    // ==================== 移动事件 ====================
    /** @rules events/move-card/#确定移动的牌时 */
    MoveCardFixed = 'movecard_fixed',
    /** @rules events/move-card/#移至目标区域前1 */
    MoveCardBefore1 = 'movecard_before1',
    /** @rules events/move-card/#移至目标区域前2 */
    MoveCardBefore2 = 'movecard_before2',
    /** @rules events/move-card/#移至目标区域后1 */
    MoveCardAfter1 = 'movecard_after1',
    /** @rules events/move-card/#移至目标区域后2 */
    MoveCardAfter2 = 'movecard_after2',
    /** @rules events/move-card/#移动结算结束后 */
    MoveCardEnd = 'movecard_end',

    // ==================== 使用牌事件 ====================
    /** @rules events/use-card/#其需要使用此牌时1 */
    UseCardNeed1 = 'usecard_need1',
    /** @rules events/use-card/#其需要使用此牌时2 */
    UseCardNeed2 = 'usecard_need2',
    /** @rules events/use-card/#声明使用牌 */
    UseCardDeclare = 'usecard_declare',
    /** @rules events/use-card/#声明使用牌后 */
    UseCardDeclareAfter = 'usecard_declare_after',
    /** @rules events/use-card/#选择目标后 */
    UseCardChooseTarget = 'usecard_choose_target',
    /** @rules events/use-card/#牌被使用时 */
    UseCardUsed = 'usecard_used',
    /** @rules events/use-card/#（连续若干个）指定目标时 */
    UseCardAssignTarget = 'usecard_assign_target',
    /** @rules events/use-card/#（连续若干个）成为目标时 */
    UseCardBecomeTarget = 'usecard_become_target',
    /** @rules events/use-card/#（连续若干个）指定目标后 */
    UseCardAssignTargetAfter = 'usecard_assign_target_after',
    /** @rules events/use-card/#（连续若干个）成为目标后 */
    UseCardBecomeTargetAfter = 'usecard_become_target_after',
    /** @rules events/use-card/#使用结算准备工作结束时 */
    UseCardReady = 'usecard_ready',
    /** @rules events/use-card/#对当前目标使用结算开始时 */
    UseCardEffectStart = 'usecard_effect_start',
    /** @rules events/use-card/#对当前目标生效前 */
    UseCardEffectBefore = 'usecard_effect_before',
    /** @rules events/use-card/#被抵消后 */
    UseCardOffset = 'usecard_offset',
    /** @rules events/use-card/#对当前目标生效时 */
    UseCardEffect = 'usecard_effect',
    /** @rules events/use-card/#对当前目标生效后 */
    UseCardEffectAfter = 'usecard_effect_after',
    /** @rules events/use-card/#使用结算结束后1 */
    UseCardEnd1 = 'usecard_end1',
    /** @rules events/use-card/#使用结算结束后2 */
    UseCardEnd2 = 'usecard_end2',
    /** @rules events/use-card/#使用结算结束后3 */
    UseCardEnd3 = 'usecard_end3',

    // ==================== 打出牌事件 ====================
    /** @rules events/drop-card/#其需要打出此牌时1 */
    DropCardNeed1 = 'dropcard_need1',
    /** @rules events/drop-card/#其需要打出此牌时2 */
    DropCardNeed2 = 'dropcard_need2',
    /** @rules events/drop-card/#声明打出牌 */
    DropCardDeclare = 'dropcard_declare',
    /** @rules events/drop-card/#牌被打出时 */
    DropCardDroped = 'dropcard_droped',
    /** @rules events/drop-card/#打出结算结束后 */
    DropCardEnd = 'dropcard_end',

    // ==================== 拼点事件 ====================
    /** @rules events/pindian/#进行拼点时 */
    Pindian = 'pindian',
    /** @rules events/pindian/#拼点牌被亮出时 */
    PindianCardShow = 'pindian_card_show',
    /** @rules events/pindian/#（连续若干个）拼点结果确定后 */
    PindianResult = 'pindian_result',
    /** @rules events/pindian/#拼点结算结束后 */
    PindianEnd = 'pindian_end',

    // ==================== 牌状态改变事件 ====================
    /** @rules events/change-state/#牌状态改变前 */
    ChangeState = 'change_state',
    /** @rules events/change-state/#牌状态改变后 */
    ChangeStateAfter = 'change_state_after',
    /** @rules events/change-state/#明置后时机 */
    Open = 'open',

    // ==================== 判定事件 ====================
    /** @rules events/judge/#判定时 */
    Judge = 'judge',
    /** @rules events/judge/#成为判定牌后 */
    JudgeCard = 'judge_card',
    /** @rules events/judge/#判定结果确定前1 */
    JudgeResult1 = 'judge_result1',
    /** @rules events/judge/#判定结果确定前2 */
    JudgeResult2 = 'judge_result2',
    /** @rules events/judge/#判定结果确定后1 */
    JudgeResultAfter1 = 'judge_result_after1',
    /** @rules events/judge/#判定结果确定后2 */
    JudgeResultAfter2 = 'judge_result_after2',
    /** @rules events/judge/#判定结算结束后 */
    JudgeEnd = 'judge_end',

    // ==================== 伤害事件 ====================
    /** @rules events/damage/#伤害结算开始时 */
    DamageStart = 'damage_start',
    /** @rules events/damage/#造成伤害时1 */
    DamageCause1 = 'damage_cause1',
    /** @rules events/damage/#造成伤害时2 */
    DamageCause2 = 'damage_cause2',
    /** @rules events/damage/#受到伤害时1 */
    DamageInflict1 = 'damage_inflict1',
    /** @rules events/damage/#受到伤害时2 */
    DamageInflict2 = 'damage_inflict2',
    /** @rules events/damage/#受到伤害时3 */
    DamageInflict3 = 'damage_inflict3',
    /** @rules events/damage/#造成伤害后 */
    DamageCauseAfter = 'damage_cause_after',
    /** @rules events/damage/#受到伤害后 */
    DamageInflictAfter = 'damage_inflict_after',
    /** @rules events/damage/#伤害结算结束后 */
    DamageEnd = 'damage_end',

    // ==================== 失去体力事件 ====================
    /** @rules events/lose-hp/#失去体力开始 */
    LoseHpStart = 'losehp_start',
    /** @rules events/lose-hp/#失去体力时 */
    LoseHp = 'losehp',
    /** @rules events/lose-hp */
    LoseHpAfter = 'losehp_after',
    /** @rules events/lose-hp/#失去体力结算结束后 */
    LoseHpEnd = 'losehp_end',

    // ==================== 扣减事件 ====================
    /** @rules events/reduce-hp/#扣减体力开始 */
    ReduceHpStart = 'reducehp_start',
    /** @rules events/reduce-hp/#扣减体力时 */
    ReduceHp = 'reducehp',
    /** @rules events/reduce-hp/#扣减体力后 */
    ReduceHpAfter = 'reducehp_after',
    /** @rules events/reduce-hp/#扣减体力结算结束后 */
    ReduceHpEnd = 'reducehp_end',

    // ==================== 回复体力事件 ====================
    /** @rules events/recover-hp/#回复体力开始 */
    RecoverHpStart = 'recoverhp_start',
    /** @rules events/recover-hp */
    RecoverHp = 'recoverhp',
    /** @rules events/recover-hp/#回复体力后 */
    RecoverHpAfter = 'recoverhp_after',
    /** @rules events/recover-hp/#回复体力结算结束后 */
    RecoverHpEnd = 'recoverhp_end',

    // ==================== 体力上限改变事件 ====================
    /** @rules events/change-max-hp/#体力上限改变开始时 */
    ChangeMaxHpStart = 'change_maxhp_start',
    /** @rules events/change-max-hp/#体力上限改变前 */
    ChangeMaxHp = 'change_maxhp',
    /** @rules events/change-max-hp/#体力上限改变后 */
    ChangeMaxHpAfter = 'change_maxhp_after',
    /** @rules events/change-max-hp/#改变体力上限结算结束后 */
    ChangeMaxHpEnd = 'change_maxhp_end',

    // ==================== 濒死事件 ====================
    /** @rules events/dying/#进入濒死状态时 */
    DyingEntry = 'dying_entry',
    /** @rules events/dying/#进入濒死状态后 */
    DyingEntryAfter = 'dying_entry_after',
    /** @rules events/dying/#（连续若干个）处于濒死状态时 */
    Dying = 'dying',
    /** @rules events/dying/#濒死结算结束后 */
    DyingEnd = 'dying_end',

    // ==================== 死亡事件 ====================
    /** @rules events/death/#死亡前 */
    DeathBefore = 'death_before',
    /** @rules events/death/#确认死亡角色 */
    DeathConfirmRole = 'death_confirm_role',
    /** @rules events/death/#死亡时 */
    Death = 'death',
    /** @rules events/death/#死亡后 */
    DeathAfter = 'death_after',
    /** @rules events/death/#死亡结算结束后 */
    DeathEnd = 'death_end',

    // ==================== 技能相关 ====================
    /** 获得技能时 */
    SkillObtain = 'skill_obtain',
    /** 失去技能时 */
    SkillLose = 'skill_lose',
    /** 获得效果时 */
    EffectObtain = 'effect_obtain',
    /** 失去效果时 */
    EffectLose = 'effect_lose',
    /** @rules events/use-skill/#执行消耗后 */
    Cost = 'cost',
    /** @rules events/use-skill/#发动技能后 */
    Effect = 'effect',

    // ==================== 特殊 ====================
    /** 事件结束 */
    EventEnd = 'event_end',
    /** 所有事件结束 */
    AllEventEnd = 'all_event_end',
}

/** 触发时机（内置时机名或自定义时机名） */
export type TimingTrigger = TimingName | string;

// ==================== 事件类型 ====================

/** 事件类型 */
export enum EventType {
    /** 回合 */
    Turn = 'Turn',
    /** 阶段 */
    Phase = 'Phase',
    /** 移动 */
    Move = 'Move',
    /** 使用牌 */
    UseCard = 'UseCard',
    /** 打出牌 */
    DropCard = 'DropCard',
    /** 拼点 */
    Pindian = 'Pindian',
    /** 明置 */
    Open = 'Open',
    /** 暗置 */
    Close = 'Close',
    /** 连环 */
    Chain = 'Chain',
    /** 跳过 */
    Skip = 'Skip',
    /** 更换 */
    Change = 'Change',
    /** 移除 */
    Remove = 'Remove',
    /** 判定 */
    Judge = 'Judge',
    /** 伤害 */
    Damage = 'Damage',
    /** 失去体力 */
    LoseHp = 'LoseHp',
    /** 扣减体力 */
    ReduceHp = 'ReduceHp',
    /** 回复体力 */
    RecoverHp = 'RecoverHp',
    /** 体力上限改变 */
    ChangeMaxHp = 'ChangeMaxHp',
    /** 濒死 */
    Dying = 'Dying',
    /** 死亡 */
    Death = 'Death',
    /** 使用技能 */
    UseSkill = 'UseSkill',
}

// ==================== 事件数据 ====================

/** 回合事件数据 */
export interface TurnEventData {
    /** 回合 id */
    turnId: number;
    /** 回合玩家 */
    player: Player;
    /** 是否为额外回合 */
    isExtraTurn: boolean;
    /** 该回合是否因翻面而被跳过 */
    isSkipped: boolean;
    /** 将要执行的阶段 */
    phases: { player?: Player; phase: Phase; isExtraPhase: boolean }[];
    /** 已被跳过的阶段 */
    skippedPhases: Phase[];
    /** 是否为新的一轮开始 */
    isRoundStart: boolean;
    /** 是否为一轮结束 */
    isRoundEnd: boolean;
}

/** 阶段事件数据 */
export interface PhaseEventData {
    /** 阶段 id */
    phaseId: number;
    /** 阶段玩家 */
    player: Player;
    /** 阶段 */
    phase: Phase;
    /** 是否为额外阶段 */
    isExtraPhase: boolean;
    /**
     * 额定摸牌数
     * @rules terms/value-terms/drawCount
     * @description 摸牌阶段额定获得的手牌数（初值 2）
     */
    drawCount: number;
}

/** 单条移动数据——描述一批卡牌的移动方式 */
export interface MoveCardData {
    /** 移动主体 */
    player?: Player;
    /** 移动的卡牌 */
    cards: GameCard[];
    /** 原区域（自动赋值为卡牌所在区域，提供后仅移动该区域的牌） */
    fromArea?: AreaId;
    /** 目标区域 */
    toArea: AreaId;
    /** 目标区域存放位置 */
    pos?: 'top' | 'bottom' | 'random' | number;
    /** 移动原因（draw/discard/obtain...，默认 'put'） */
    reason?: string;
    /** 移动方式（true=正面朝上，false=背面朝上，默认卡牌当前放置方式） */
    moveType?: boolean;
    /** 放置方式（到目标区域后的放置方式，默认手牌区=false 其他=true） */
    putType?: boolean;
    /** 是否播放动画（默认 true，仅客户端用） */
    animation?: boolean;
    /** 动画可见角色（默认 [] = 全部可见，仅客户端用） */
    visiblePlayers?: Player[];
    /** 移动后牌的可见角色（暂未实现） */
    cardVisiblePlayers?: Player[];
    /** 移动后为每张牌执行的操作 */
    handler?: (card: GameCard) => Promise<void>;
    /** 标签文本（仅客户端用） */
    label?: RichString;
    /** 战报文本（仅客户端用） */
    log?: RichString;
    /** 是否同时将 log 进行提示（仅客户端用） */
    toast?: boolean;
    /** 视为信息（仅客户端用） */
    viewas?: VirtualCardData;
    /** 自定义数据 */
    _data?: Record<string, unknown>;
}

/** moveCards 快捷方法的可选参数（MoveCardData 除去 cards/toArea/player/fromArea） */
export interface MoveCardOpts {
    player?: Player;
    reason?: string;
    pos?: 'top' | 'bottom' | 'random' | number;
    moveType?: boolean;
    putType?: boolean;
    animation?: boolean;
    visiblePlayers?: Player[];
    cardVisiblePlayers?: Player[];
    handler?: (card: GameCard) => Promise<void>;
    label?: RichString;
    log?: RichString;
    toast?: boolean;
    viewas?: VirtualCardData;
    _data?: Record<string, unknown>;
}

/** 移动事件数据——可包含多条移动，每条描述一批卡牌的移动方式 */
export interface MoveEventData {
    /** 移动数据列表 */
    datas: MoveCardData[];
    /** 获取移动标签（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString;
    /** 获取战报文本（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString;
}

// ==================== 使用牌事件：目标条目 ====================

/** 使用牌目标条目 */
export interface TargetEntry {
    /** 自增 id——仅用于同玩家时稳定排序，不回写 */
    index: number;
    /** 目标角色 */
    target: Player;
    /** 借刀子目标（不进目标列表、不触发 assign/become 时机） */
    subTargets?: Player[];
    /** 此牌对此目标无效（跳过生效时机） */
    invalid?: boolean;
    /** 抵消此牌的事件（闪/无懈 → 使用流程结束） */
    offset?: unknown;
    /** 生效次数（默认取事件的 effectTimes，可单独修改） */
    effectTimes?: number;
    /** 已结算次数 */
    settleCount?: number;
}

// ==================== 使用牌事件数据 ====================

/** 统一的使用牌事件数据 */
export interface UseCardEventData {
    /** 使用者（无使用者直接结算延时锦囊效果时缺省） */
    player?: Player;
    /** 目标角色列表 */
    targets: Player[];
    /** 使用的虚拟牌 */
    card: VirtualCard;
    /** 不播放指向线 */
    noPlayDirectLine?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
    /** 是否自动排序目标角色（默认 true） */
    autoSort?: boolean;
    /** 采用顺时针结算（默认 false，逆时针） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 */
    effectCorrection?: unknown;

    /** 每个目标的默认生效次数（默认 1） */
    effectTimes?: number;
    /** 结算次数 */
    settleCount?: number;
    /** 伤害值基数 */
    damageBase?: number;
    /** 回复值基数 */
    recoverBase?: number;

    /** 是否为第一个目标 */
    isFirstTarget?: boolean;
    /** 目标角色对应关系 */
    targetList?: TargetEntry[];
    /** 被响应的牌（闪响应杀、无懈响应锦囊时设置） */
    responseTo?: VirtualCard;
    /** 当前结算目标索引 */
    settleTarget?: number;
    /** 无使用者直接结算延时锦囊效果：跳过前置时机，仅结算段 */
    directSettle?: boolean;
}

// ==================== 使用牌：CardUse 定义 ====================

/** 牌的默认使用方式定义 */
export interface CardUseData {
    /** 牌名（如 'sha', 'tao'） */
    name: string;
    /** 默认使用时机（每种使用方法只在一个默认时机） */
    timing: TimingName;
    /** 合法目标选择器 */
    target: (room: Room, player: Player, card: VirtualCard) => Player[];
    /** 距离条件 */
    distanceCondition?: (
        room: Room,
        player: Player,
        target: Player,
        card: VirtualCard,
    ) => boolean;
    /** 牌面效果 */
    effect: (
        room: Room,
        target: Player,
        event: UseCardEventData,
    ) => Promise<void>;
    /** 额外使用条件（如桃需体力不满） */
    canUse?: (room: Room, player: Player, card: VirtualCard) => boolean;
    /** 使用次数条件（默认无限制） */
    timesCondition?: (room: Room, player: Player) => number;
}

/** 使用牌时的修正器（临时优先于状态效果） */
export interface UseModifiers {
    /** 无次数限制 */
    unlimitedTimes?: boolean;
    /** 无距离限制 */
    unlimitedDistance?: boolean;
    /** 不计入次数 */
    noCount?: boolean;
    /** 是否可使用技能 */
    canUseSkill?: boolean;
    /** 借刀子目标（不进 targetList） */
    subTarget?: Player;
}

// ==================== 打出牌事件数据 ====================

/** 打出牌事件数据 */
export interface DropCardEventData {
    /** 打出者 */
    player: Player;
    /** 打出的虚拟牌 */
    card: VirtualCard;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
}

// ==================== 拼点事件数据 ====================

/** 拼点事件数据 */
export interface PindianEventData {
    /** 拼点发起者 */
    player: Player;
    /** 拼点目标 */
    targets: Player[];
    /** 各角色的拼点牌 */
    cards: Map<Player, GameCard>;
    /** 选择卡牌时的限制 */
    card_limits?: Map<Player, string[]>;
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 当前结算角色 */
    settleTarget?: Player;
    /** 当前结算赢的角色 */
    settleWinner?: Player;
    /** 当前结算没赢的角色 */
    settleLoser?: Player[];
    /** 发起者与每名目标的结果 */
    settleResults?: Map<
        Player,
        {
            winner?: Player;
            loser?: Player[];
        }
    >;
}

// ==================== 状态改变事件数据 ====================

/** 明置事件数据 */
export interface OpenEventData {
    /** 明置角色 */
    player: Player;
    /** 将要明置的武将牌 */
    generals: General[];
    /** true=明置 */
    toState: true;
}

/** 暗置事件数据 */
export interface CloseEventData {
    /** 暗置角色 */
    player: Player;
    /** 将要暗置的武将牌 */
    generals: General[];
    /** false=暗置 */
    toState: false;
}

/** 连环事件数据 */
export interface ChainEventData {
    /** 进入/脱离连环的角色 */
    player: Player;
    /** true=进入连环，false=脱离连环 */
    toState: boolean;
    /** 连环伤害类型 */
    damageType: DamageType;
}

/** 跳过事件数据 */
export interface SkipEventData {
    /** 被跳过的角色 */
    player: Player;
    /** true=跳过，false=不跳过 */
    toState: boolean;
}

/** 更换武将牌事件数据 */
export interface ChangeEventData {
    /** 更换角色 */
    player: Player;
    /** 被更换的武将牌（'head'/'deputy' 表示主/副将） */
    general: General | 'head' | 'deputy';
    /** 更换后的武将牌 */
    toGeneral: General;
}

/** 移除武将牌事件数据 */
export interface RemoveEventData {
    /** 移除角色 */
    player: Player;
    /** 被移除的武将牌 */
    general: General;
}

/** ChangeState 六种子类型 */
export type ChangeStateType =
    | EventType.Open
    | EventType.Close
    | EventType.Chain
    | EventType.Skip
    | EventType.Change
    | EventType.Remove;

/** ChangeState 联合数据类型 */
export type ChangeStateData =
    | OpenEventData
    | CloseEventData
    | ChainEventData
    | SkipEventData
    | ChangeEventData
    | RemoveEventData;

// ==================== 判定事件数据 ====================

/** 判定事件数据 */
export interface JudgeEventData {
    /** 判定角色 */
    player: Player;
    /** 判定牌 */
    card?: GameCard;
    /** 判定结果（虚拟牌数据） */
    result?: VirtualCardData;
    /** 判定结果是否成功 */
    isSuccess?: (result: VirtualCardData) => boolean;
}

// ==================== 伤害/体力事件数据 ====================

/** 伤害事件数据 */
export interface DamageEventData {
    /** 伤害来源 */
    player?: Player;
    /** 受伤角色 */
    target: Player;
    /** 伤害类型 */
    damageType: DamageType;
    /** 伤害点数 */
    number: number;
    /** 伤害渠道（卡牌或效果） */
    channel?: VirtualCard | string;
    /** 是否为连环伤害（默认 false） */
    isChain?: boolean;
}

/** 失去体力事件数据 */
export interface LoseHpEventData {
    /** 角色 */
    player: Player;
    /** 失去点数 */
    number: number;
}

/** 扣减体力事件数据 */
export interface ReduceHpEventData {
    /** 角色 */
    player: Player;
    /** 扣减点数 */
    number: number;
}

/** 回复体力事件数据 */
export interface RecoverHpEventData {
    /** 角色 */
    player: Player;
    /** 回复点数 */
    number: number;
}

/** 体力上限改变事件数据 */
export interface ChangeMaxHpEventData {
    /** 角色 */
    player: Player;
    /** 改变点数 */
    number: number;
}

// ==================== 濒死/死亡事件数据 ====================

/** 濒死事件数据 */
export interface DyingEventData {
    /** 濒死角色 */
    player: Player;
    /** 造成濒死的角色 */
    killer?: Player;
}

/** 死亡事件数据 */
export interface DeathEventData {
    /** 死亡角色 */
    player: Player;
    /** 击杀者 */
    killer?: Player;
}

// ==================== 技能使用事件数据 ====================

/** 技能使用事件数据 */
export interface UseSkillEventData {
    /** 发动的效果 */
    effect?: TriggerEffect;
    /** 技能上下文 */
    context?: EffectContext;
    /** 是否发动成功 */
    used?: boolean;
}

// ==================== 非事件数据 ====================

/** 登场数据 */
export interface StageData {
    /** 登场角色 */
    player: Player;
    /** 登场武将牌 */
    generals: General[];
}

/** 需要使用牌数据 */
export interface NeedUseCardData {
    /** 需要出牌的角色 */
    player: Player;
    /** 可使用的牌名与方法 */
    cards: { name: string; method: number }[];
    /** 被响应的牌 */
    response?: VirtualCard;
    /** 选择卡牌时的限制 */
    card_limits?: string[];
    /** 选择目标时的限制 */
    target_limits?: string[];
    /** 是否可以发动技能（默认 true） */
    canUseSkill?: boolean;
    /** 可以使用的技能 */
    skills?: string[];
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 生成的使用牌事件数据 */
    useCardEventData?: UseCardEventData;
    /** 是否立即进行使用结算 */
    immediateSettle?: boolean;

    /** 不播放指向线 */
    noPlayDirectLine?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
    /** 是否自动排序目标角色（默认 true） */
    autoSort?: boolean;
    /** 采用顺时针结算（默认 true） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 */
    effectCorrection?: unknown;

    /** 结算次数 */
    settleCount?: number;
    /** 伤害值基数 */
    damageBase?: number;
    /** 回复值基数 */
    recoverBase?: number;
}

/** 需要打出牌数据 */
export interface NeedDropCardData {
    /** 需要打出牌的角色 */
    player: Player;
    /** 可打出的牌名 */
    cards: string[];
    /** 被响应的牌 */
    response?: VirtualCard;
    /** 选择卡牌时的限制 */
    card_limits?: string[];
    /** 是否可以发动技能（默认 true） */
    canUseSkill?: boolean;
    /** 可以使用的技能 */
    skills?: string[];
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 生成的打出牌事件数据 */
    dropCardEventData?: DropCardEventData;
    /** 是否立即进行打出结算 */
    immediateSettle?: boolean;

    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
}

// ==================== 事件类型 → 数据类型 ====================

/**
 * 事件类型到事件数据的映射
 * @rules terms/resolution-terms/event
 * @description 事件是若干个相关流程的总和，可能被其他事件响应
 */
export interface EventDataMap {
    [EventType.Turn]: TurnEventData;
    [EventType.Phase]: PhaseEventData;
    [EventType.Move]: MoveEventData;
    [EventType.UseCard]: UseCardEventData;
    [EventType.DropCard]: DropCardEventData;
    [EventType.Pindian]: PindianEventData;
    [EventType.Open]: OpenEventData;
    [EventType.Close]: CloseEventData;
    [EventType.Chain]: ChainEventData;
    [EventType.Skip]: SkipEventData;
    [EventType.Change]: ChangeEventData;
    [EventType.Remove]: RemoveEventData;
    [EventType.Judge]: JudgeEventData;
    [EventType.Damage]: DamageEventData;
    [EventType.LoseHp]: LoseHpEventData;
    [EventType.ReduceHp]: ReduceHpEventData;
    [EventType.RecoverHp]: RecoverHpEventData;
    [EventType.ChangeMaxHp]: ChangeMaxHpEventData;
    [EventType.Dying]: DyingEventData;
    [EventType.Death]: DeathEventData;
    [EventType.UseSkill]: UseSkillEventData;
}

/** 事件元数据：所有事件数据均携带（全部可选） */
export interface EventMeta {
    /** 源事件（事件栈上层） */
    source?: EventProcess;
    /** 触发事件的技能效果 */
    effect?: Effect;
    /** 触发原因 */
    reason?: string;
    /** 指令角色（A令B中的A，大部分时间不传递） */
    cmd?: Player;
}

/** 事件自由扩展字段（快捷方法最后一个参数；_data 写入事件自定义数据） */
export interface EventOpts {
    /** 源事件（事件栈上层） */
    source?: EventProcess;
    /** 触发事件的技能效果 */
    effect?: Effect;
    /** 触发原因 */
    reason?: string;
    /** 自由扩展字段（写入事件自定义数据） */
    _data?: Record<string, unknown>;
}

/** 事件数据（按事件类型取值，均携带事件元数据） */
export type EventData<T extends EventType> = EventDataMap[T] & EventMeta;

// ==================== 时机 → 所属事件类型 ====================

/** 时机到所属事件类型的映射 */
export interface TimingEventMap {
    [TimingName.GameStartBefore]: EventType.Turn;
    [TimingName.GameStart]: EventType.Turn;

    [TimingName.TurnStartBefore]: EventType.Turn;
    [TimingName.TurnStart]: EventType.Turn;
    [TimingName.TurnStartAfter]: EventType.Turn;
    [TimingName.TurnEnd]: EventType.Turn;
    [TimingName.TurnEndAfter]: EventType.Turn;

    [TimingName.ReadyPhaseStartBefore]: EventType.Phase;
    [TimingName.ReadyPhaseStart]: EventType.Phase;
    [TimingName.ReadyPhase]: EventType.Phase;
    [TimingName.ReadyPhaseEnd]: EventType.Phase;
    [TimingName.JudgePhaseStartBefore]: EventType.Phase;
    [TimingName.JudgePhaseStart]: EventType.Phase;
    [TimingName.JudgePhase]: EventType.Phase;
    [TimingName.JudgePhaseEnd]: EventType.Phase;
    [TimingName.DrawPhaseStartBefore]: EventType.Phase;
    [TimingName.DrawPhaseStart1]: EventType.Phase;
    [TimingName.DrawPhaseStart2]: EventType.Phase;
    [TimingName.DrawPhase]: EventType.Phase;
    [TimingName.DrawPhaseEnd]: EventType.Phase;
    [TimingName.PlayPhaseStartBefore]: EventType.Phase;
    [TimingName.PlayPhaseStart]: EventType.Phase;
    [TimingName.PlayPhase]: EventType.Phase;
    [TimingName.PlayPhaseEnd]: EventType.Phase;
    [TimingName.DiscardPhaseStartBefore]: EventType.Phase;
    [TimingName.DiscardPhaseStart]: EventType.Phase;
    [TimingName.DiscardPhase]: EventType.Phase;
    [TimingName.DiscardPhaseEnd]: EventType.Phase;
    [TimingName.EndPhaseStartBefore]: EventType.Phase;
    [TimingName.EndPhaseStart]: EventType.Phase;
    [TimingName.EndPhase]: EventType.Phase;
    [TimingName.EndPhaseEnd]: EventType.Phase;

    [TimingName.MoveCardFixed]: EventType.Move;
    [TimingName.MoveCardBefore1]: EventType.Move;
    [TimingName.MoveCardBefore2]: EventType.Move;
    [TimingName.MoveCardAfter1]: EventType.Move;
    [TimingName.MoveCardAfter2]: EventType.Move;
    [TimingName.MoveCardEnd]: EventType.Move;

    [TimingName.UseCardDeclare]: EventType.UseCard;
    [TimingName.UseCardDeclareAfter]: EventType.UseCard;
    [TimingName.UseCardChooseTarget]: EventType.UseCard;
    [TimingName.UseCardUsed]: EventType.UseCard;
    [TimingName.UseCardAssignTarget]: EventType.UseCard;
    [TimingName.UseCardBecomeTarget]: EventType.UseCard;
    [TimingName.UseCardAssignTargetAfter]: EventType.UseCard;
    [TimingName.UseCardBecomeTargetAfter]: EventType.UseCard;
    [TimingName.UseCardReady]: EventType.UseCard;
    [TimingName.UseCardEffectStart]: EventType.UseCard;
    [TimingName.UseCardEffectBefore]: EventType.UseCard;
    [TimingName.UseCardOffset]: EventType.UseCard;
    [TimingName.UseCardEffect]: EventType.UseCard;
    [TimingName.UseCardEffectAfter]: EventType.UseCard;
    [TimingName.UseCardEnd1]: EventType.UseCard;
    [TimingName.UseCardEnd2]: EventType.UseCard;
    [TimingName.UseCardEnd3]: EventType.UseCard;

    [TimingName.DropCardDeclare]: EventType.DropCard;
    [TimingName.DropCardDroped]: EventType.DropCard;
    [TimingName.DropCardEnd]: EventType.DropCard;

    [TimingName.Pindian]: EventType.Pindian;
    [TimingName.PindianCardShow]: EventType.Pindian;
    [TimingName.PindianResult]: EventType.Pindian;
    [TimingName.PindianEnd]: EventType.Pindian;

    [TimingName.ChangeState]:
        | EventType.Open
        | EventType.Close
        | EventType.Chain
        | EventType.Skip
        | EventType.Change
        | EventType.Remove;
    [TimingName.ChangeStateAfter]:
        | EventType.Open
        | EventType.Close
        | EventType.Chain
        | EventType.Skip
        | EventType.Change
        | EventType.Remove;
    [TimingName.Open]: EventType.Open;

    [TimingName.Judge]: EventType.Judge;
    [TimingName.JudgeCard]: EventType.Judge;
    [TimingName.JudgeResult1]: EventType.Judge;
    [TimingName.JudgeResult2]: EventType.Judge;
    [TimingName.JudgeResultAfter1]: EventType.Judge;
    [TimingName.JudgeResultAfter2]: EventType.Judge;
    [TimingName.JudgeEnd]: EventType.Judge;

    [TimingName.DamageStart]: EventType.Damage;
    [TimingName.DamageCause1]: EventType.Damage;
    [TimingName.DamageCause2]: EventType.Damage;
    [TimingName.DamageInflict1]: EventType.Damage;
    [TimingName.DamageInflict2]: EventType.Damage;
    [TimingName.DamageInflict3]: EventType.Damage;
    [TimingName.DamageCauseAfter]: EventType.Damage;
    [TimingName.DamageInflictAfter]: EventType.Damage;
    [TimingName.DamageEnd]: EventType.Damage;

    [TimingName.LoseHpStart]: EventType.LoseHp;
    [TimingName.LoseHp]: EventType.LoseHp;
    [TimingName.LoseHpAfter]: EventType.LoseHp;
    [TimingName.LoseHpEnd]: EventType.LoseHp;

    [TimingName.ReduceHpStart]: EventType.ReduceHp;
    [TimingName.ReduceHp]: EventType.ReduceHp;
    [TimingName.ReduceHpAfter]: EventType.ReduceHp;
    [TimingName.ReduceHpEnd]: EventType.ReduceHp;

    [TimingName.RecoverHpStart]: EventType.RecoverHp;
    [TimingName.RecoverHp]: EventType.RecoverHp;
    [TimingName.RecoverHpAfter]: EventType.RecoverHp;
    [TimingName.RecoverHpEnd]: EventType.RecoverHp;

    [TimingName.ChangeMaxHpStart]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHp]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHpAfter]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHpEnd]: EventType.ChangeMaxHp;

    [TimingName.DyingEntry]: EventType.Dying;
    [TimingName.DyingEntryAfter]: EventType.Dying;
    [TimingName.Dying]: EventType.Dying;
    [TimingName.DyingEnd]: EventType.Dying;

    [TimingName.DeathBefore]: EventType.Death;
    [TimingName.DeathConfirmRole]: EventType.Death;
    [TimingName.Death]: EventType.Death;
    [TimingName.DeathAfter]: EventType.Death;
    [TimingName.DeathEnd]: EventType.Death;

    [TimingName.Cost]: EventType.UseSkill;
    [TimingName.Effect]: EventType.UseSkill;
}

/** 时机到事件数据的直接映射（未接入事件系统的特殊时机） */
export interface TimingDataMap {
    [TimingName.GameStageBefore]: StageData;
    [TimingName.GameStage]: StageData;
    [TimingName.GameStageAfter]: StageData;
    [TimingName.GameStartBefore]: {};
    [TimingName.GameStart]: {};
    [TimingName.GameEnd]: {};
    [TimingName.RoundStart]: { round: number; turn: unknown };
    [TimingName.RoundEnd]: { round: number; turn: unknown };
    [TimingName.RestStart]: { player: Player };
    [TimingName.RestEnd]: { player: Player };
    [TimingName.UseCardNeed1]: NeedUseCardData;
    [TimingName.UseCardNeed2]: NeedUseCardData;
    [TimingName.DropCardNeed1]: NeedDropCardData;
    [TimingName.DropCardNeed2]: NeedDropCardData;
    [TimingName.SkillObtain]: {};
    [TimingName.SkillLose]: {};
    [TimingName.EffectObtain]: {};
    [TimingName.EffectLose]: {};
    [TimingName.EventEnd]: {};
    [TimingName.AllEventEnd]: {};
}

/** 时机对应的事件数据（时机 → 事件类型 → 事件数据 的两级推断） */
export type TimingData<T extends TimingTrigger> = T extends keyof TimingEventMap
    ? EventDataMap[TimingEventMap[T]]
    : T extends keyof TimingDataMap
      ? TimingDataMap[T]
      : Record<string, unknown>;

// ==================== 时机 ====================

/** 时机定义：名称 + before/after 回调 */
export interface Timing<T extends TimingTrigger = 'none'> {
    /** 时机名称 */
    name: TimingTrigger;
    /** 在事件触发之前执行 */
    before?: Array<(room: Room, data: TimingData<T>) => Promise<unknown>>;
    /** 在事件触发之后执行 */
    after?: Array<(room: Room, data: TimingData<T>) => Promise<unknown>>;
}

// ==================== 其他类型定义 ====================

/** 伤害类型 */
export enum DamageType {
    None = 0,
    /** 火焰伤害 */
    Fire,
    /** 雷电伤害 */
    Thunder,
}
