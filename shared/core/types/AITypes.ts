import type { GameCard } from '../entity/GameCard';
import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';

/** 策略类型：对应不同游戏询问 */
export enum StrategyType {
    /** 出牌阶段 */
    PlayPhase = 'PlayPhase',
    /** 使用牌 */
    UseCard = 'UseCard',
    /** 打出牌 */
    PlayCard = 'PlayCard',
    /** 主动技 */
    Active = 'Active',
    /** 响应 */
    Respond = 'Respond',
    /** 选牌 */
    ChooseCards = 'ChooseCards',
    /** 选目标 */
    ChooseTargets = 'ChooseTargets',
    /** 选角色 */
    ChoosePlayers = 'ChoosePlayers',
    /** 询问发动 */
    Invoke = 'Invoke',
}

/** AI 上下文 */
export interface AIContext {
    /** AI 玩家 */
    player: Player;
    /** 所属房间 */
    room: Room;
    /** 技能名 */
    skillName: string;
    /** 触发选择的事件数据 */
    eventData?: any;
}

/** 技能 AI 配置（技能注册时附带） */
export interface SkillAI {
    /** 策略类型 */
    type: StrategyType | StrategyType[];

    // ===== 布尔标签 =====
    /** 濒死时可对自己使用（桃类） */
    save?: boolean;
    /** 可救别人（视为桃类） */
    respondTao?: boolean;
    /** 可响应闪（视为闪类） */
    respondShan?: boolean;
    /** 可响应杀（视为杀类） */
    respondSha?: boolean;
    /** 是卖血技 */
    maixie?: boolean;

    // ===== 数值 =====
    /** 出牌阶段优先级（同类型比较，数值高先评估） */
    order?: number | ((ctx: AIContext) => number);
    /** 卡牌保留价值（弃牌时用，低价值的先弃） */
    keepValue?: number | ((card: GameCard) => number);
    /** 卡牌使用价值（出牌阶段评估用） */
    useValue?: number | ((card: GameCard) => number);

    // ===== 决策函数 =====
    /** 是否该发动这个技能 */
    shouldUse?: (ctx: AIContext) => boolean;
    /** 选择目标时的排序函数 */
    chooseTarget?: (ctx: AIContext, targets: Player[]) => Player[];
    /** 选择牌时的排序函数 */
    chooseCards?: (ctx: AIContext, cards: GameCard[]) => GameCard[];
    /** 视为技能的前置条件 */
    skillTagFilter?: (ctx: AIContext) => boolean;
}
