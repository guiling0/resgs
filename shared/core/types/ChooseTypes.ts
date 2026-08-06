import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';
import type { VirtualCardData } from './CardTypes';
import type { RichString } from './RichText';

/** 选择数量约束：精确数量 或 [最小, 最大]（负数 max = 无上限） */
export type ChooseCount = number | [number, number];

/** 选择器类型 */
export enum SelectorType {
    /** 选择卡牌 */
    Card = 'Card',
    /** 选择玩家 */
    Player = 'Player',
    /** 选择武将牌 */
    General = 'General',
    /** 选择选项 */
    Option = 'Option',
    /** 选择指令 */
    Command = 'Command',
    /** 确认 */
    Confirm = 'Confirm',
}

/** 选择器配置（UI 层概念） */
export interface SelectorConfig<T = any> {
    /** 选择器名称 */
    name: string;
    /** 选择器类型 */
    type: SelectorType;
    /** 选择数量约束 */
    count: ChooseCount;
    /** 是否自动选择 */
    auto?: boolean;
    /** 可选项列表 */
    selectable: (ctx: SelectorContext) => T[];
    /** 过滤已选项 */
    filter?: (item: T, selected: T[], ctx: SelectorContext) => boolean;
    /** 生命周期回调 */
    life?: SelectorLifecycle<T>;
    /** 窗口配置 */
    window?: SelectorWindow;
}

/** 选择器生命周期回调 */
export interface SelectorLifecycle<T = any> {
    /** 初始化（传入合法候选项，返回覆盖配置） */
    onInit?: (ctx: SelectorContext, validCandidates: T[]) => Partial<SelectorConfig>;
    /** 选中选项时（返回覆盖配置） */
    onSelect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    /** 取消选项时（返回覆盖配置） */
    onDeselect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    /** 完成选择时（返回校验结果） */
    onComplete?: (selected: T[], ctx: SelectorContext) => boolean;
}

/** 选择器窗口配置 */
export interface SelectorWindow {
    /** 窗口类型 */
    type: string;
    /** 窗口选项 */
    options?: any;
    /** 过滤选项 */
    filter?: (item: string, selected: string[], ctx: SelectorContext) => boolean;
    /** 是否全部显示 */
    isAllShow?: boolean;
}

/** 选择器上下文 */
export interface SelectorContext {
    /** 进行选择的玩家 */
    player: Player;
    /** 所属房间 */
    room: Room;
    /** 已完成步骤的选择结果 */
    results?: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResults?: Record<string, string[]>;
    /** 触发选择的事件数据 */
    eventData?: any;
    /** 技能名 */
    skillName?: string;
    [key: string]: any;
}

/** 一次选择步骤的数据（多类型选择器可并存） */
export interface ChooseData {
    /** 选择器列表 */
    selectors: SelectorConfig[];
}

/** 选择会话 */
export interface ChooseSession {
    /** 会话 id */
    id: string;
    /** 目标玩家 id */
    player: string;
    /** 有序选择步骤 */
    data: ChooseData[];
    /** 上下文（含 player/room 引用，toWire 时剥离） */
    context: SelectorContext;
    /** 提示文本 */
    prompt?: {
        main?: RichString;
        side?: RichString;
    };
    /** 是否可取消 */
    canCancel?: boolean;
    /** 是否显示确认/取消按钮 */
    showConfirmButton?: boolean;
    /** 是否显示倒计时 UI */
    showTimer?: boolean;
    /** 超时时间（秒）。未设置时使用 room.options.responseTime，仍未设置则默认 15 秒 */
    timeout?: number;
    /** 多段选择时当前会话的剩余时间（秒），由 ChooseManager 自动计算 */
    remaining?: number;
    /** 是否自动选择第一个可选项 */
    autoSelectFirst?: boolean;
    /** 是否为出牌阶段询问 */
    isPlayPhase?: boolean;
    /** 是否为使用牌询问 */
    isUseCard?: boolean;
    /** 是否为打出牌询问 */
    isPlayCard?: boolean;
    /** 是否为技能选择询问 */
    isSkillSelect?: boolean;
}

/** 选择结果 */
export interface ChooseResult {
    /** 会话 id */
    id: string;
    /** 是否取消 */
    cancelled: boolean;
    /** 是否超时 */
    timeout?: boolean;
    /** 各选择器的结果（key = SelectorConfig.name） */
    results: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResult?: Record<string, string[]>;
    /** 出牌阶段操作类型 */
    playPhaseResult?: PlayPhaseResult;
    /** 使用的牌 */
    useCard?: VirtualCardData;
    /** 打出的牌 */
    playCard?: VirtualCardData;
    /** 选中的技能名 */
    skillName?: string;
}

/** 出牌阶段操作类型 */
export enum PlayPhaseResult {
    None,
    /** 使用牌 */
    UseCard,
    /** 使用技能 */
    UseSkill,
    /** 重铸牌 */
    Recast,
    /** 明置主将 */
    OpenHead,
    /** 明置副将 */
    OpenDeputy,
    /** 结束 */
    End,
}
