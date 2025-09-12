import { GameCard } from '../card/card';
import { VirtualCardData } from '../card/card.types';
import { CardUseSkillData } from '../card/card.use';
import { VirtualCard } from '../card/vcard';
import { CustomString } from '../custom/custom.type';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { WindowOptions } from '../room/room.types';
import { EffectId, TriggerEffectContext } from '../skill/skill.types';
import { ChooseCardData, ChooseVCardData } from './types/choose.card';
import { ChooseCommandData } from './types/choose.command';
import { ChooseGeneralData } from './types/choose.general';
import { ChooseOptionsData } from './types/choose.options';
import { ChoosePlayerData } from './types/choose.player';

/**
 * 选择数量约束
 * @type number 只能选择这个数量
 * @type [number,number] 最少选择[0]，最多选择[1] (均包含)
 * 其中[0]若小于0则会改为0，[1]若小于0则会改为其能选择的最大数量
 */
export type ChooseResultCount = number | [number, number];

export type ChooseData =
    | ChooseCardData
    | ChoosePlayerData
    | ChooseGeneralData
    | ChooseOptionsData
    | ChooseVCardData
    | ChooseCommandData;

export interface ChooseDataBase<Item extends Object = any> {
    /** 选择步骤 */
    step?: number;
    /** 需要选择的数量 */
    count?: ChooseResultCount;
    /** 是否自动选择 会选择所有可以选择的选项 */
    auto?: boolean;
    /** 记录是否完成 */
    complete?: boolean;
    /** 备选项 */
    selectable?: Item[];
    /** 选择结果 */
    result?: Item[];
    /** 如果提供了窗口，则为窗口点击的按钮 */
    windowResult?: string[];
    /** 针对每一个备选项检测是否可选 */
    filter?: (this: GameRequest, item: Item, selected: Item[]) => boolean;
    /** 选择结果更改时 */
    onChange?: (
        this: GameRequest,
        type: 'add' | 'remove' | 'init' | 'complete' | 'cancle',
        item?: Item,
        selected?: Item[]
    ) => void;
    /** 是否完成
     * @description 如果未提供该函数，则每次选择后自动检测已选择数量是否满足需要选择数量的要求。
     * 否则会按照该函数提供的方法进行检测
     */
    canConfirm?: (this: GameRequest, selected: Item[]) => boolean;

    /** 选择方式 默认值为self*/
    selecte_type?: string;
    /**
     * 创建窗口时提供的窗口选项
     * 如果提供选项中的窗口ID，那么玩家会在这个窗口中选择。一个窗口的创建来源必须是服务端才能被获取到。
     * 如果未提供且选择方式为弹窗选择，客户端会自动创建窗口并将备选项填充到窗口中以供选择
     *
     * 如果一个窗口的创建来源是服务端，那么玩家在选择完毕后不会关闭窗口。
     *
     * 窗口设置中的timebar和prompt将会自动被修改为选择设置中提供的值
     * buttons中可以设置任意的按钮，其中confirm和cancle是被保留的值，分别代表确定和取消按钮。
     * 其他按钮可在filter_buttons中设置是否可点击，该函数与filter函数一致，会在每一次选择后被调用
     *
     */
    windowOptions?: WindowOptions;
    /** 窗口按钮是否可点击
     * @param item 如果为CustomString类型，则值为其的text属性
     */
    filter_buttons?: (
        this: GameRequest,
        item: string,
        selected: Item[]
    ) => boolean;
    /** 客户端自行创建窗口时是否让所有人都看到窗口。默认为false */
    isAllShowWindow?: boolean;

    //普通排列窗口等同于selectable的值

    //按行排列
    data_rows?: {
        title: CustomString;
        cards: Item[];
    }[];

    //分页排列
    data_pages?: {
        title: CustomString;
        cards: Item[];
    }[];

    //item排列
    data_items?: {
        title: CustomString;
        items: {
            title: CustomString;
            card: Item;
        }[];
    }[];

    /** 客户端定义用于自动选择的方法 */
    auto_func?: () => void;
}

export interface RequestOptionData {
    /** 只询问确定和取消 */
    cac?: boolean;
    /** 能否取消 */
    canCancle?: boolean;
    /** 提示文本
     * @description 提示文本
     */
    prompt?: CustomString;
    thinkPrompt?: CustomString;
    /** 是否全部玩家显示倒计时 默认为false*/
    isAllShowTimebar?: boolean;
    /** 是否显示倒计时 默认为true*/
    showTimebar?: boolean;
    /** 是否显示主视角的确定/取消按钮 默认为true*/
    showMainButtons?: boolean;
    /** 响应时间 如果为空的话默认为房间设置中的responseTime属性 */
    ms?: number;
    /** 是否为出牌阶段询问 */
    isPlayPhase?: boolean;
}

/** 出牌询问执行的操作 */
export enum PlayPhaseResule {
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

export interface GameRequest {
    /** 询问ID */
    id: number;
    /** 所属房间 */
    room: GameRoom;
    /** 进行选择的角色 */
    player: GamePlayer;
    /** 需要从哪个技能中获取选择方法。如果包含有多个name为skill_cost的选择，则会改为选择一个技能来发动 */
    get_selectors?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 是否已完成 */
    complete?: boolean;
    /** 是否超时 */
    timeout?: boolean;
    /** 选择结果 */
    result?: {
        /** 是否主动点击了取消 */
        cancle?: boolean;
        /** 使用或打出的卡牌。 */
        use_or_play_card?: VirtualCardData;
        /** 选中的技能 */
        selected_skill?: number;
        /** 出牌阶段返回结果 */
        playphase?: PlayPhaseResule;
        /** 选择器结果 */
        results: ReturnType<typeof GameRoom.prototype.toData_SelectorResult>;
        sort_result: {
            title: CustomString;
            items: GameCard[];
        }[];
    };
    /** 选择器 */
    selectors?: { [key: string]: ChooseData };
    /**选择设置 */
    options?: RequestOptionData;

    //ServerSide
    /** 完成函数 */
    resolve?: (value: unknown) => void;

    //ClientSide
    /** 客户端记录使用或打出的虚拟牌 */
    _use_or_play_vcard?: VirtualCard;
    /** 客户端记录使用的牌的技能 */
    _carduse_skill?: CardUseSkillData;
    /** 重新开始选择 */
    restart?: () => void;
}
