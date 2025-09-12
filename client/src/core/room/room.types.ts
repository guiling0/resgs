import { AreaId } from '../area/area.type';
import {
    CardPut,
    EquipSubType,
    GameCardData,
    GameCardId,
    VirtualCardData,
} from '../card/card.types';
import { CustomString, MarkOptions, MarkValue } from '../custom/custom.type';
import { EventData } from '../event/data';
import { GeneralId } from '../general/general.type';
import { Phase } from '../player/player.types';
import { SkillId, SkillOptions } from '../skill/skill.types';
import { RoomOption } from '../types';

export interface HistoryData {
    /** 对应的数据 */
    data: EventData;
    /** 该事件开始时的下标 */
    startIndex?: number;
    /** 该事件结束时的下标 */
    endIndex?: number;
}

export const enum MoveCardReason {
    None,
    /** 置入/于 */
    PutTo,
    /** 使用 */
    Use,
    /** 打出 */
    Play,
    /** 重铸 */
    Recast,
    /** 合纵 */
    Transfer,
    /** 弃置 */
    DisCard,
    /** 交给 */
    Give,
    /** 拼点 */
    Pindian,
    /** 交换 */
    Swap,
    /** 获得 */
    Obtain,
    /** 摸牌 */
    Draw,
    /** 亮出 */
    Display,
    /** 判定 */
    Judge,
}

export type WindowOptions = {
    id?: number;
    title?: CustomString;
    timebar?: number;
    showCloseButton?: boolean;
    buttons?: CustomString[];
    prompt?: CustomString;
};

/** 普通排列窗口 */
export type WindowDatas = {
    type: 'datas';
    cards: GameCardId[] | GeneralId[];
};
/** 按行排列窗口 */
export type WindowRowDatas = {
    type: 'rows';
    datas: {
        title: CustomString;
        cards: GameCardId[] | GeneralId[];
    }[];
};
/** 分页排列窗口 */
export type WindowPageDatas = {
    type: 'pages';
    datas: {
        title: CustomString;
        cards: GameCardId[] | GeneralId[];
    }[];
};
export type WindowItemDatas = {
    type: 'items';
    datas: {
        title: CustomString;
        items: {
            title: CustomString;
            card: GameCardId | GeneralId | undefined;
        }[];
    }[];
};

export interface ChatMessage {
    date: number;
    username: string;
    message: string;
    spectate?: boolean;
}

export interface RoomReconnectData {
    roomId: string;
    options: RoomOption;
    selfId: string;
    turnCount: number;
    circleCount: number;
    shuffleCount: number;
    players: {
        playerId: string;
        controlId: string;
        username: string;
        skipWuxie: boolean;
        seat: number;
        phase: Phase;
        kingdom: string;
        chained: boolean;
        skip: boolean;
        death: boolean;
        inturn: boolean;
        inplayphase: boolean;
        inresponse: boolean;
        insubtarget: boolean;
        _indying: number[];
        maxhp: number;
        inthp: number;
        hp: number;
        shield: number;
        camp_mode: string;
        general_mode: string;
        _head: string;
        _deputy: string;
        headOpen: boolean;
        deputyOpen: boolean;
        judgeCards: VirtualCardData[];
        equipCards: GameCardId[];
        disableEquips: EquipSubType[];
        _mark: {
            [key: string]: { value: MarkValue; options: MarkOptions };
        };
    }[];
    cards: {
        id: GameCardId;
        area: AreaId;
        put: CardPut;
        visibles: string[];
        _mark: {
            [key: string]: { value: MarkValue; options: MarkOptions };
        };
        sourceData: GameCardData;
    }[];
    generals: {
        id: GeneralId;
        area: AreaId;
        put: CardPut;
        visibles: string[];
        _mark: {
            [key: string]: { value: MarkValue; options: MarkOptions };
        };
    }[];
    skills: {
        id: number;
        player?: string;
        name: SkillId;
        options: SkillOptions;
        _mark: {
            [key: string]: { value: MarkValue; options: MarkOptions };
        };
    }[];
    effects: {
        id: number;
        player?: string;
        name: string;
        skill?: number;
        _mark: {
            [key: string]: { value: MarkValue; options: MarkOptions };
        };
    }[];
    _mark: {
        [key: string]: { value: MarkValue; options: MarkOptions };
    };
}
