/** 实体牌ID——格式：{扩展名}.{自增序号}，保证跨扩展不冲突 */
export type GameCardId = string;
/** 虚拟牌ID */
export type VirtualCardId = number;
/** 牌放置方式 */
export type CardPut = boolean;
/** 区域ID */
export type AreaId = string;

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
}

export interface CardData {
    /** 卡牌名 */
    name: string;
    /** 卡牌类别 */
    type: CardType;
    /** 卡牌副类别 */
    subtype: CardSubType;
    /** 是否为伤害卡牌 */
    damage: boolean;
    /** 是否为回复类卡牌 */
    recover: boolean;
    /** 牌名字数 */
    length: number;
    /** 韵脚 */
    rhyme: string;
    /** 卡牌技术分 */
    score: [number, number, number];
    /** 简略牌名 */
    acronym: string;
    /** 装备牌在装备栏最开始显示的内容 */
    equiptip: string;
    /** 卡牌图 */
    image?: string;
    /** 卡牌配音文件名 */
    audio?: string;
    /** 卡牌名翻译 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}

export interface SourceData {
    id: GameCardId;
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
}

export interface VirtualSourceData {
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
}

export interface VirtualCardData {
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
    subcards: GameCardId[];
    data: Record<string, any>;
}

/** 卡牌属性 */
export enum CardAttr {
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
export enum CardSuit {
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

/** 卡牌点数 */
export enum CardNumber {
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
export enum CardColor {
    None = 0,
    /** 红色 */
    Red,
    /** 黑色 */
    Black,
}

/** 卡牌类别 */
export enum CardType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 锦囊牌 */
    Scroll = 2,
    /** 装备牌 */
    Equip = 3,
}

/** 装备牌副类别 */
export enum EquipSubType {
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
export enum CardSubType {
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

export enum AreaType {
    Unknown = 'unknown',
    /** 牌堆 */
    Draw = 'draw',
    /** 弃牌堆 */
    Discard = 'discard',
    /** 处理区 */
    Processing = 'processing',
    /** 仓廪 */
    Granary = 'granary',
    /** 府库 */
    Treasury = 'treasury',
    /** 后备区 */
    Reserve = 'reserve',
    /** 手牌区 */
    Hand = 'hand',
    /** 装备区 */
    Equip = 'equip',
    /** 判定区 */
    Judge = 'judge',
    /** 武将牌上 */
    Up = 'up',
    /** 武将牌旁 */
    Side = 'side',
}

/** 根据花色获取颜色 */
export function getColorBySuit(suit: CardSuit) {
    if (suit === CardSuit.Club || suit === CardSuit.Spade) {
        return CardColor.Black;
    } else if (suit === CardSuit.Diamond || suit === CardSuit.Heart) {
        return CardColor.Red;
    } else {
        return CardColor.None;
    }
}

/** 获取卡牌类别 */
export function getCardType(name: string) {
    return sgs.carddatas.get(name)?.type || CardType.Basic;
}

/** 获取卡牌副类别 */
export function getCardSubType(name: string) {
    return sgs.carddatas.get(name)?.subtype || CardSubType.Basic;
}
