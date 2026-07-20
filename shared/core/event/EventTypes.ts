import { AreaId, VirtualCardData } from '../card/CardTypes';
import { GameCard } from '../card/GameCard';
import { VirtualCard } from '../card/VirtualCard';
import { General } from '../general/General';
import { Player } from '../player/Player';
import { Phase } from '../player/PlayerTypes';
import { RichString } from '../RichText';
import { Room } from '../room/Room';
import type { EffectContext } from '../skill/SkillTypes';
import type { Effect } from '../skill/Effect';
import { TurnEvent } from './TurnEvent';

// ==================== 时机 ====================

export enum TimingName {
    // ==================== 游戏流程 ====================
    GameStageBefore = 'game_stage_before', // 登场前
    GameStage = 'game_stage', // 登场时
    GameStageAfter = 'game_stage_after', // 登场后
    GameStartBefore = 'game_start_before', // 游戏开始前
    GameStart = 'game_start', // 游戏开始
    GameEnd = 'game_end', // 游戏结束

    // ==================== 轮次 ====================
    RoundStart = 'round_start', // 轮次开始
    RoundEnd = 'round_end', // 轮次结束

    // ==================== 休整 ====================
    RestStart = 'rest_start', // 休整开始
    RestEnd = 'rest_end', // 休整结束

    // ==================== 回合 ====================
    TurnStartBefore = 'turn_start_before', // 回合开始前
    TurnStart = 'turn_start', // 回合开始
    TurnStartAfter = 'turn_start_after', // 回合开始后
    TurnEnd = 'turn_end', // 回合结束
    TurnEndAfter = 'turn_end_after', // 回合结束后

    // ==================== 准备阶段 ====================
    ReadyPhaseStartBefore = 'ready_start_before', // 准备阶段开始前
    ReadyPhaseStart = 'ready_start', // 准备阶段开始
    ReadyPhase = 'ready_phase', // 准备阶段
    ReadyPhaseEnd = 'ready_end', // 准备阶段结束
    // ==================== 判定阶段 ====================
    JudgePhaseStartBefore = 'judge_start_before', // 判定阶段开始前
    JudgePhaseStart = 'judge_start', // 判定阶段开始
    JudgePhase = 'judge_phase', // 判定阶段
    JudgePhaseEnd = 'judge_phase_end', // 判定阶段结束
    // ==================== 摸牌阶段 ====================
    DrawPhaseStartBefore = 'draw_start_before', // 摸牌阶段开始前
    DrawPhaseStart1 = 'draw_start1', // 摸牌阶段开始1
    DrawPhaseStart2 = 'draw_start2', // 摸牌阶段开始2
    DrawPhase = 'draw_phase', // 摸牌阶段
    DrawPhaseEnd = 'draw_end', // 摸牌阶段结束
    // ==================== 出牌阶段 ====================
    PlayPhaseStartBefore = 'play_start_before', // 出牌阶段开始前
    PlayPhaseStart = 'play_start', // 出牌阶段开始
    PlayPhase = 'play_phase', // 出牌阶段
    PlayPhaseEnd = 'play_end', // 出牌阶段结束
    // ==================== 弃牌阶段 ====================
    DiscardPhaseStartBefore = 'discard_start_before', // 弃牌阶段开始前
    DiscardPhaseStart = 'discard_start', // 弃牌阶段开始
    DiscardPhase = 'discard_phase', // 弃牌阶段
    DiscardPhaseEnd = 'discard_end', // 弃牌阶段结束
    // ==================== 结束阶段 ====================
    EndPhaseStartBefore = 'end_start_before', // 结束阶段开始前
    EndPhaseStart = 'end_start', // 结束阶段开始
    EndPhase = 'end_phase', // 结束阶段
    EndPhaseEnd = 'end_end', // 结束阶段结束

    // ==================== 移动事件 ====================
    MoveCardFixed = 'movecard_fixed', // 固定移动牌
    MoveCardBefore1 = 'movecard_before1', // 移动牌前1
    MoveCardBefore2 = 'movecard_before2', // 移动牌前2
    MoveCardAfter1 = 'movecard_after1', // 移动牌后1
    MoveCardAfter2 = 'movecard_after2', // 移动牌后2
    MoveCardEnd = 'movecard_end', // 移动牌结束

    // ==================== 使用牌事件 ====================
    UseCardNeed1 = 'usecard_need1', // 需要使用牌1
    UseCardNeed2 = 'usecard_need2', // 需要使用牌2
    UseCardDeclare = 'usecard_declare', // 声明使用牌
    UseCardDeclareAfter = 'usecard_declare_after', // 声明使用牌后
    UseCardChooseTarget = 'usecard_choose_target', // 选择使用牌目标
    UseCardUsed = 'usecard_used', // 牌被使用时
    UseCardAssignTarget = 'usecard_assign_target', // 指定目标时
    UseCardBecomeTarget = 'usecard_become_target', // 成为目标时
    UseCardAssignTargetAfter = 'usecard_assign_target_after', // 指定目标后
    UseCardBecomeTargetAfter = 'usecard_become_target_after', // 成为目标后
    UseCardReady = 'usecard_ready', // 使用结算准备工作结束时
    UseCardEffectStart = 'usecard_effect_start', // 对当前目标结算开始时
    UseCardEffectBefore = 'usecard_effect_before', // 对当前目标生效前
    UseCardOffset = 'usecard_offset', // 被抵消后
    UseCardEffect = 'usecard_effect', // 对当前目标生效时
    UseCardEffectAfter = 'usecard_effect_after', // 对当前目标生效后
    UseCardEnd1 = 'usecard_end1', // 使用结算结束后1
    UseCardEnd2 = 'usecard_end2', // 使用结算结束后2
    UseCardEnd3 = 'usecard_end3', // 使用结算结束后3

    // ==================== 打出牌事件 ====================
    DropCardNeed1 = 'dropcard_need1', // 需要打出牌时1
    DropCardNeed2 = 'dropcard_need2', // 需要打出牌时2
    DropCardDeclare = 'dropcard_declare', // 声明打出牌
    DropCardDroped = 'dropcard_droped', // 打出牌后
    DropCardEnd = 'dropcard_end', // 打出牌结束

    // ==================== 拼点事件 ====================
    Pindian = 'pindian', // 拼点时
    PindianCardShow = 'pindian_card_show', //拼点牌被亮出时
    PindianResult = 'pindian_result', //拼点结果确定后
    PindianEnd = 'pindian_end', //拼点结算结束后

    // ==================== 牌状态改变事件 ====================
    ChangeState = 'change_state', // 牌状态改变时
    ChangeStateAfter = 'change_state_after', // 牌状态改变后
    //特殊：明置后，明置后统一在返回回合流程或阶段流程时按照明置顺序依次执行。
    Open = 'open', // 明置后

    // ==================== 判定事件 ====================
    Judge = 'judge', // 判定时
    JudgeCard = 'judge_card', // 成为判定牌后
    JudgeResult1 = 'judge_result1', // 判定结果确定前1
    JudgeResult2 = 'judge_result2', // 判定结果确定前2
    JudgeResultAfter1 = 'judge_result_after1', // 判定结果确定后1
    JudgeResultAfter2 = 'judge_result_after2', // 判定结果确定后2
    JudgeEnd = 'judge_end', // 判定结算结束后

    // ==================== 伤害事件 ====================
    DamageStart = 'damage_start', // 伤害开始
    DamageCause1 = 'damage_cause1', // 造成伤害时1
    DamageCause2 = 'damage_cause2', // 造成伤害时2
    DamageInflict1 = 'damage_inflict1', // 受到伤害时1
    DamageInflict2 = 'damage_inflict2', // 受到伤害时2
    DamageInflict3 = 'damage_inflict3', // 受到伤害时3
    DamageCauseAfter = 'damage_cause_after', // 造成伤害后
    DamageInflictAfter = 'damage_inflict_after', // 受到伤害后
    DamageEnd = 'damage_end', // 伤害结算结束后

    // ==================== 失去体力事件 ====================
    LoseHpStart = 'losehp_start', // 失去体力开始
    LoseHp = 'losehp', // 失去体力时
    LoseHpAfter = 'losehp_after', // 失去体力后
    LoseHpEnd = 'losehp_end', // 失去体力结束

    // ==================== 扣减事件 ====================
    ReduceHpStart = 'reducehp_start', // 扣减体力开始
    ReduceHp = 'reducehp', // 扣减体力时
    ReduceHpAfter = 'reducehp_after', // 扣减体力后
    ReduceHpEnd = 'reducehp_end', // 扣减体力结束

    // ==================== 回复体力事件 ====================
    RecoverHpStart = 'recoverhp_start', // 回复体力开始
    RecoverHp = 'recoverhp', // 回复体力时
    RecoverHpAfter = 'recoverhp_after', // 回复体力后
    RecoverHpEnd = 'recoverhp_end', // 回复体力结束

    // ==================== 体力上限改变事件 ====================
    ChangeMaxHpStart = 'change_maxhp_start', // 体力上限改变开始
    ChangeMaxHp = 'change_maxhp', // 体力上限改变时
    ChangeMaxHpAfter = 'change_maxhp_after', // 体力上限改变后
    ChangeMaxHpEnd = 'change_maxhp_end', // 体力上限改变结束

    // ==================== 濒死事件 ====================
    DyingEntry = 'dying_entry', // 进入濒死状态时
    DyingEntryAfter = 'dying_entry_after', // 进入濒死状态后
    Dying = 'dying', // (连续若干个)处于濒死状态时
    DyingEnd = 'dying_end', // 濒死结束

    // ==================== 死亡事件 ====================
    DeathBefore = 'death_before', // 死亡前
    DeathConfirmRole = 'death_confirm_role', // 确认死亡角色
    Death = 'death', // 死亡时
    DeathAfter = 'death_after', // 死亡后
    DeathEnd = 'death_end', // 死亡结束

    //==================== 技能相关 ====================
    SkillObtain = 'skill_obtain', // 获得技能时
    SkillLose = 'skill_lose', // 失去技能时
    EffectObtain = 'effect_obtain', // 获得效果时
    EffectLose = 'effect_lose', // 失去效果时
    Cost = 'cost', // 执行消耗后
    Effect = 'effect', // 发动技能后

    //==================== 特殊 ====================
    EventEnd = 'event_end', // 事件结束
    AllEventEnd = 'all_event_end', // 所有事件结束
}

export type TimingTrigger = TimingName | string;

// ==================== 事件类型 ====================

export enum EventType {
    Ready = 'Ready',
    Turn = 'Turn',
    Phase = 'Phase',
    Move = 'Move',
    UseCard = 'UseCard',
    UseCardToCard = 'UseCardToCard',
    UseCardSpecial = 'UseCardSpecial',
    DropCard = 'DropCard',
    Pindian = 'Pindian',
    Open = 'Open',
    Close = 'Close',
    Chain = 'Chain',
    Skip = 'Skip',
    Change = 'Change',
    Remove = 'Remove',
    Judge = 'Judge',
    Damage = 'Damage',
    LoseHp = 'LoseHp',
    ReduceHp = 'ReduceHp',
    RecoverHp = 'RecoverHp',
    ChangeMaxHp = 'ChangeMaxHp',
    Dying = 'Dying',
    Death = 'Death',
    UseSkill = 'UseSkill',
}

// ==================== 事件数据 ====================
export interface ReadyEventData {}

export interface TurnEventData {
    // 回合ID
    turnId: number;
    // 玩家
    player: Player;
    // 是否为额外回合
    isExtraTurn: boolean;
    // 该回合是否因翻面而被跳过
    isSkipped: boolean;
    // 将要执行的阶段
    phases: { player?: Player; phase: Phase; isExtraPhase: boolean }[];
    // 已被跳过的阶段
    skippedPhases: Phase[];
    // 是否为新的一轮开始
    isRoundStart: boolean;
    // 是否为一轮结束
    isRoundEnd: boolean;
}

export interface PhaseEventData {
    // 阶段ID
    phaseId: number;
    // 玩家
    player: Player;
    // 阶段
    phase: Phase;
    // 是否为额外阶段
    isExtraPhase: boolean;
    // 额定摸牌数
    drawCount: number;
}

/** 单条移动数据 — 描述一批卡牌的移动方式 */
export interface MoveCardData {
    /** 移动主体 */
    player?: Player;
    /** 移动的卡牌 */
    cards: GameCard[];
    /** 原区域（自动赋值为卡牌所在区域，提供后仅移动该区域的牌） */
    fromArea?: AreaId;
    /** 目标区域 */
    toArea: AreaId;
    /** 目标区域存放位置（详见 AreaManager.add 的 pos） */
    pos?: 'top' | 'bottom' | 'random' | number;
    /** 移动原因（draw/discard/obtain...，默认 'put'） */
    reason?: string;
    /** 移动方式（true=正面朝上, false=背面朝上, 默认卡牌当前放置方式） */
    moveType?: boolean;
    /** 放置方式（到目标区域后的放置方式，默认手牌区=false 其他=true） */
    putType?: boolean;
    /** 是否播放动画（默认true，仅客户端用） */
    animation?: boolean;
    /** 动画可见角色（默认[]=全部可见，仅客户端用） */
    visiblePlayers?: Player[];
    /** 移动后牌的可见角色（暂未实现） */
    cardVisiblePlayers?: Player[];
    /** 移动后为每张牌执行的操作 */
    handler?: (card: GameCard) => Promise<void>;
    /** 标签文本（仅客户端用） */
    label?: RichString;
    /** 战报文本（仅客户端用） */
    log?: RichString;
    /** 是否同时将log进行提示（仅客户端用） */
    toast?: boolean;
    /** 视为信息（仅客户端用） */
    viewas?: VirtualCardData;
    /** 自定义数据 */
    _data?: Record<string, any>;
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
    _data?: Record<string, any>;
}

/** 移动事件数据 — 可包含多条移动，每条描述一批卡牌的移动方式 */
export interface MoveEventData {
    /** 移动数据列表 */
    datas: MoveCardData[];
    /** 获取移动标签（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString;
    /** 获取战报文本（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString;
}

// ===== 使用牌事件：目标条目 =====

export interface TargetEntry {
    /** 自增 ID——仅用于同玩家时稳定排序，不回写 */
    index: number;
    /** 目标角色 */
    target: Player;
    /** 借刀子目标（不进目标列表、不触发 assign/become 时机） */
    subTargets?: Player[];
    /** 此牌对此目标无效（跳过生效时机） */
    invalid?: boolean;
    /** 抵消此牌的事件（闪/无懈 → 使用流程结束，M3 接线） */
    offset?: any;
    /** 生效次数（默认取事件的 effectTimes，可单独修改） */
    effectTimes?: number;
    /** 已结算次数 */
    settleCount?: number;
}

// ===== 使用牌事件数据 =====

/** 统一的使用牌事件数据（替代旧三子类） */
export interface UseCardEventData {
    /** 使用者 */
    player: Player;
    /** 目标角色列表 */
    targets: Player[];
    /** 使用的虚拟牌 */
    card: VirtualCard;
    /** 不播放指向线 */
    noPlayDirectLine?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
    /** 是否自动排序目标角色 默认为true */
    autoSort?: boolean;
    /** 采用顺时针结算 默认为false（逆时针） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 未实现 */
    effectCorrection?: any;

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
    /** 当前结算目标索引 */
    settleTarget?: number;
}

/** @deprecated 统一为 UseCardEventData + TargetEntry；M3 实现时删除 */
export interface UseCardToCardEventData {
    player: Player;
    targets: VirtualCard;
    card: VirtualCard;
    forcePlayCardVoice?: boolean;
    effectCorrection?: any;
    targetList?: TargetEntry[];
    settleTarget?: number;
}

/** @deprecated 统一为 UseCardEventData + TargetEntry；M4 实现时删除 */
export interface UseCardSpecialEventData {
    targets: Player;
    card: VirtualCard;
    targetList?: TargetEntry[];
    settleTarget?: number;
}

// ===== 使用牌：CardUse 定义 =====

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

export interface DropCardEventData {
    player: Player;
    card: VirtualCard;
    //强制播放卡牌语音
    forcePlayCardVoice?: boolean;
}

export interface PindianEventData {
    player: Player;
    targets: Player[];
    cards: Map<Player, GameCard>;
    //选择卡牌时的限制，暂时未实现
    card_limits?: Map<Player, string[]>;
    //发起询问时的选项
    reqOptions: any;
    //当前结算角色
    settleTarget?: Player;
    //当前结算赢的角色
    settleWinner?: Player;
    //当前结算没赢的角色
    settleLoser?: Player[];
    //发起者与每名目标的结果
    settleResults?: Map<
        Player,
        {
            winner?: Player;
            loser?: Player[];
        }
    >;
}

export interface OpenEventData {
    player: Player;
    generals: General[];
    /** true=明置 */
    toState: true;
}

export interface CloseEventData {
    player: Player;
    generals: General[];
    /** false=暗置 */
    toState: false;
}

export interface ChainEventData {
    player: Player;
    toState: boolean;
    damageType: DamageType;
}

export interface SkipEventData {
    player: Player;
    toState: boolean;
}

export interface ChangeEventData {
    player: Player;
    general: General | 'head' | 'deputy';
    toGeneral: General;
}

export interface RemoveEventData {
    player: Player;
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

export interface JudgeEventData {
    player: Player;
    card?: GameCard;
    result?: VirtualCardData;
    isSuccess?: (result: VirtualCardData) => boolean;
}

export interface DamageEventData {
    player?: Player;
    target: Player;
    damageType: DamageType;
    number: number;
    //伤害渠道 卡牌或效果
    channel?: VirtualCard | string;
    //是否为连环伤害 默认为false
    isChain?: boolean;
}

export interface LoseHpEventData {
    player: Player;
    number: number;
}

export interface ReduceHpEventData {
    player: Player;
    number: number;
}

export interface RecoverHpEventData {
    player: Player;
    number: number;
}

export interface ChangeMaxHpEventData {
    player: Player;
    number: number;
}

export interface DyingEventData {
    player: Player;
    /** 造成濒死的角色（由 DyingEvent 从伤害链追溯，传递给 DeathEvent） */
    killer?: Player;
}

export interface DeathEventData {
    player: Player;
    /** 击杀者（由 DyingEvent 传入时已有值；未传入时 DeathEvent 自行追溯） */
    killer?: Player;
}

export interface UseSkillEventData {
    /** 发动的效果 */
    effect?: Effect;
    /** 技能上下文 */
    context?: EffectContext;
    /** 是否发动成功 */
    used?: boolean;
}

// ==================== 非事件数据 ====================
export interface StageData {
    player: Player;
    generals: General[];
}

export interface NeedUseCardData {
    player: Player;
    cards: { name: string; method: number }[];
    response?: VirtualCard;
    //选择卡牌时的限制，暂时未实现
    card_limits?: string[];
    //选择目标时的限制，暂时未实现
    target_limits?: string[];
    //是否可以发动技能 默认为true
    canUseSkill?: boolean;
    //可以使用的技能 未实现
    skills?: string[];
    //发起询问时的选项
    reqOptions: any;
    //生成的使用牌事件数据
    useCardEventData?: UseCardEventData | UseCardToCardEventData;
    //是否立即进行使用结算
    immediateSettle?: boolean;

    //不播放指向线
    noPlayDirectLine?: boolean;
    //强制播放卡牌语音
    forcePlayCardVoice?: boolean;
    //是否自动排序目标角色 默认为true
    autoSort?: boolean;
    //采用顺时针结算 默认为true
    clockwise?: boolean;
    //对卡牌效果进行修正 未实现
    effectCorrection?: any;

    //结算次数
    settleCount?: number;
    //伤害值基数
    damageBase?: number;
    //回复值基数
    recoverBase?: number;
}

export interface NeedDropCardData {
    player: Player;
    cards: string[];
    response?: VirtualCard;
    //选择卡牌时的限制，暂时未实现
    card_limits?: string[];
    //是否可以发动技能 默认为true
    canUseSkill?: boolean;
    //可以使用的技能 未实现
    skills?: string[];
    //发起询问时的选项
    reqOptions: any;
    //生成的打出牌事件数据
    dropCardEventData?: DropCardEventData;
    //是否立即进行打出结算
    immediateSettle?: boolean;

    //强制播放卡牌语音
    forcePlayCardVoice?: boolean;
}

// ==================== 事件类型 → 数据类型 ====================

export interface EventDataMap {
    [EventType.Ready]: ReadyEventData;
    [EventType.Turn]: TurnEventData;
    [EventType.Phase]: PhaseEventData;
    [EventType.Move]: MoveEventData;
    [EventType.UseCard]: UseCardEventData;
    /** @deprecated 统一为 EventType.UseCard */
    [EventType.UseCardToCard]: UseCardEventData;
    /** @deprecated 统一为 EventType.UseCard */
    [EventType.UseCardSpecial]: UseCardEventData;
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

export type EventData<T extends EventType> = EventDataMap[T];

// ==================== 时机 → 所属事件类型 ====================

export interface TimingEventMap {
    [TimingName.GameStartBefore]: EventType.Ready;
    [TimingName.GameStart]: EventType.Ready;

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

export interface TimingDataMap {
    [TimingName.GameStageBefore]: StageData;
    [TimingName.GameStage]: StageData;
    [TimingName.GameStageAfter]: StageData;
    [TimingName.GameStartBefore]: {};
    [TimingName.GameStart]: {};
    [TimingName.GameEnd]: {};
    [TimingName.RoundStart]: { round: number; turn: TurnEvent };
    [TimingName.RoundEnd]: { round: number; turn: TurnEvent };
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
    [key: string]: Record<string, any>;
}

export type TimingData<T extends TimingTrigger> = T extends keyof TimingEventMap
    ? EventDataMap[TimingEventMap[T]]
    : T extends keyof TimingDataMap
      ? TimingDataMap[T]
      : Record<string, any>;

// ==================== 时机 ====================

/** 时机定义：名称 + before/after 回调 */
export interface Timing<T extends TimingTrigger = 'none'> {
    name: TimingTrigger;
    /** 在 eventManager.trigger 之前执行 */
    before?: Array<(room: Room, data: TimingData<T>) => Promise<any>>;
    /** 在 eventManager.trigger 之后执行 */
    after?: Array<(room: Room, data: TimingData<T>) => Promise<any>>;
}

// ==================== 其他类型定义 ====================
export enum DamageType {
    None = 0,
    Fire,
    Thunder,
}
