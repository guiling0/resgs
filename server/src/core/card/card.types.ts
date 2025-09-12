/** 实体牌ID */
export type GameCardId = string;
/** 虚拟牌ID */
export type VirtualCardId = string;

export interface SourceData {
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
}

export interface VirtualCardData extends SourceData {
    id?: string;
    subcards: GameCardId[];
    custom: { [key: string]: any };
}

/** 卡牌属性 */
export const enum CardAttr {
    /** 火属性 杀专属*/
    Fire = 1,
    /** 雷属性 杀专属*/
    Thunder,
    /** 国属性 国战无懈可击专属 */
    Country,
    /** 可重铸 */
    Recastable,
    /** 可合纵 */
    Transferable,

    /** 鏖战 */
    Aozhan,
}

/** 卡牌花色 */
export const enum CardSuit {
    None = 0,
    /** 黑桃 */
    Spade,
    /** 红桃 */
    Heart,
    /** 梅花 */
    Club,
    /** 方片 */
    Diamond,
}

/** 卡牌点数 其中0为无点数 11/12/13/14/15分别为J/Q/K/小王/大王 */
export const enum CardNumber {
    None = -1,
    JOKER_BLACK = 0,
    A = 1,
    Number2 = 2,
    Number3 = 3,
    Number4 = 4,
    Number5 = 5,
    Number6 = 6,
    Number7 = 7,
    Number8 = 8,
    Number9 = 9,
    Number10 = 10,
    J = 11,
    Q = 12,
    K = 13,
    JOKER_RED = 14,
}

/** 卡牌颜色 */
export const enum CardColor {
    None = 0,
    /** 红色 */
    Red,
    /** 黑色 */
    Black,
}

/** 卡牌类别 */
export const enum CardType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 锦囊牌 */
    Scroll = 2,
    /** 装备牌 */
    Equip = 3,
}

/** 装备牌副类别 */
export const enum EquipSubType {
    None = 0,
    /** 武器 */
    Weapon = 31,
    /** 防具 */
    Armor = 32,
    /** 防御坐骑 */
    DefensiveMount = 33,
    /** 进攻坐骑 */
    OffensiveMount = 34,
    /** 特殊坐骑 */
    SpecialMount = 35,
    /** 宝物 */
    Treasure = 36,
}

/** 卡牌副类别 */
export const enum CardSubType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 非延时锦囊牌 */
    InstantScroll = 21,
    /** 延时锦囊牌 */
    DelayedScroll = 22,
    /** 武器 */
    Weapon = 31,
    /** 防具 */
    Armor = 32,
    /** 防御坐骑 */
    DefensiveMount = 33,
    /** 进攻坐骑 */
    OffensiveMount = 34,
    /** 特殊坐骑 */
    SpecialMount = 35,
    /** 宝物 */
    Treasure = 36,
}

/** 卡牌放置方式 */
export const enum CardPut {
    Up = 1,
    Down = 2,
}

/** 实体牌数据 */
export interface GameCardData {
    id: GameCardId;
    /** 卡牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色 */
    color?: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性 */
    attr: CardAttr[];
    /** 是否为衍生牌 */
    derived: boolean;
    /** 所属扩展包 */
    package: string;
}

/** 创建一张游戏牌 */
export type CreateGameCard = Partial<
    Omit<GameCardData, 'name' | 'id' | 'package'>
> & {
    name: string;
};
