import { VirtualCardData } from '../card/CardTypes';
import { Player } from '../player/Player';
import { RichString } from '../RichText';
import { Room } from '../room/Room';

/**
 * 选择数量约束
 * @type number 只能选择这个数量
 * @type [number,number] 最少选择[0]，最多选择[1] (均包含)
 * 其中[0]若小于0则会改为0，[1]若小于0则会改为其能选择的最大数量
 */
export type SelectCount = number | [number, number];

export const enum SelectorType {
    Card = 'Card',
    Player = 'Player',
    General = 'General',
    Option = 'Option',
    Command = 'Command',
    Confirm = 'Confirm',
}

export interface SelectorLifecycle<T = any> {
    onInit?: (
        ctx: SelectorContext,
        validCandidates: T[],
    ) => Partial<SelectorConfig>;
    onSelect?: (
        item: T,
        selected: T[],
        ctx: SelectorContext,
    ) => Partial<SelectorConfig>;
    onDeselect?: (
        item: T,
        selected: T[],
        ctx: SelectorContext,
    ) => Partial<SelectorConfig>;
    onComplete?: (selected: T[], ctx: SelectorContext) => boolean;
}

export interface SelectorConfig<T = any> {
    type: SelectorType;
    count: SelectCount;
    // 是否自动选择 默认为false
    auto?: boolean;
    selectable: (ctx: SelectorContext) => T[];
    filter?: (item: T, selected: T[], ctx: SelectorContext) => boolean;
    life?: SelectorLifecycle<T>;
    window?: SelectorWindow;
}

export interface SelectorWindow {
    type: string;
    options?: any;
    filter?: (
        item: string,
        selected: string[],
        ctx: SelectorContext,
    ) => boolean;
    isAllShow?: boolean;
}

export interface SelectorContext {
    player: Player;
    room: Room;
    selections: Record<string, any[]>;
    windowSelections?: Record<string, string[]>;
    eventData?: any;
    skillName?: string;
    [key: string]: any;
}

export interface SelectSession {
    id: string;
    player: string;
    steps: SelectorConfig[];
    context: SelectorContext;

    /** 提示文本 */
    prompt?: {
        main?: RichString;
        side?: RichString;
    };
    /** 是否可取消 */
    canCancel?: boolean;
    /** 是否显示主视角的确定/取消按钮 */
    showConfirmButton?: boolean;
    /** 是否显示倒计时 UI */
    showTimer?: boolean;
    /** 超时时间(ms) */
    timeout?: number;
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

export interface SelectResult {
    id: string;
    /** 是否取消 */
    cancelled: boolean;
    /** 是否超时 */
    timeout?: boolean;
    /** 每个的选择器的结果 */
    results: Record<string, any[]>;
    /** 每个的选择器的窗口结果 */
    windowResult?: Record<string, string[]>;
    /** 出牌阶段操作类型 */
    playPhaseResult?: PlayPhaseResult;
    /** 使用的牌（虚拟牌数据，服务端据此创建 VirtualCard） */
    useCard?: VirtualCardData;
    /** 打出的牌 */
    playCard?: VirtualCardData;
    /** 选中的技能名 */
    skillName?: string;
}

export const enum PlayPhaseResult {
    None,
    /** 使用牌 */
    UseCard,
    /** 使用技能 */
    UseSkill,
    /** 重铸牌 */
    Recast,
    /** 明置武将牌 */
    OpenHead,
    OpenDeputy,
    /** 结束 */
    End,
}
