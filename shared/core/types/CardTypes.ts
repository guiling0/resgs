/**
 * 游戏牌ID
 * @rules terms/value-terms/cardId
 * @description 实体牌 ID 格式 {扩展名}.{自增序号}，保证跨扩展不冲突
 */
export type GameCardId = string;
/** 虚拟牌 ID */
export type VirtualCardId = number;

/**
 * 实体牌数据（仅用于 sgs 注册；id 由注册扩展包时分配）
 * @rules terms/card-terms/GameCard
 * @description 游戏牌实体数据，除衍生牌外的所有对局牌均为此类
 */
export interface GameCardData {
    /** 实体牌 id（注册时分配，构建阶段为空串） */
    id: GameCardId;
    /** 卡牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色（由花色派生，可覆盖） */
    color: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性列表 */
    attr: CardAttr[];
    /** 是否为衍生牌（不注册牌名索引） */
    derived: boolean;
}

/**
 * 虚拟牌数据（使用/打出的结算对象数据，subcards 为实体牌 id 列表）
 * @rules terms/card-terms/virtualCard
 * @description 虚拟牌是使用/打出的结算对象，与被使用/打出的牌对应的实体牌有关联关系
 */
export interface VirtualCardData {
    /** 虚拟牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色 */
    color: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性列表 */
    attr: CardAttr[];
    /** 实体牌 id 列表 */
    subcards: GameCardId[];
    /** 自定义数据 */
    data: Record<string, unknown>;
}

/** 卡牌定义数据（按牌名注册到 sgs.carddatas，供类别/副类别派生与 UI 展示） */
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
    /** 卡牌名翻译 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}

/** 卡牌属性 */
export enum CardAttr {
    /** 火属性（杀专属） */
    Fire = 1,
    /** 雷属性（杀专属） */
    Thunder,
    /** 国属性（国战无懈可击专属） */
    Country,
    /** 可重铸 */
    Recastable,
    /** 可合纵 */
    Transferable,
    /** 鏖战 */
    Aozhan,
}

/**
 * 卡牌花色
 * @rules terms/card-face-terms/suit
 * @description 花色标识于游戏牌左上角，分红桃/方片/黑桃/梅花四种
 */
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

/**
 * 卡牌点数初值
 * @rules terms/card-face-terms/numberInit
 * @description 点数初值标识于游戏牌左上角，数字 2-10 代表点数 2-10，A/J/Q/K 分别代表 1/11/12/13
 */
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

/**
 * 卡牌颜色
 * @rules terms/card-face-terms/color
 * @description 游戏牌按颜色分红色、黑色两种：红桃/方片为红，黑桃/梅花为黑
 */
export enum CardColor {
    None = 0,
    /** 红色 */
    Red,
    /** 黑色 */
    Black,
}

/**
 * 卡牌类别
 * @rules terms/card-terms/Basic
 * @rules terms/card-terms/Trick
 * @rules terms/card-terms/Equip
 * @description 牌类别区分基本牌/锦囊牌/装备牌
 */
export enum CardType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 锦囊牌 */
    Scroll = 2,
    /** 装备牌 */
    Equip = 3,
}

/**
 * 卡牌副类别
 * @rules terms/card-terms/Basic
 * @rules terms/card-terms/Trick
 * @rules terms/card-terms/Equip
 * @description 牌副类别细分基本牌/延时与非延时锦囊/各类装备
 */
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

/**
 * 装备牌副类别
 * @rules terms/card-terms/Equip
 * @description 装备副类别细分武器/防具/坐骑/宝物
 */
export enum EquipSubType {
    None = 0,
    /**
     * 武器
     * @rules terms/zone-terms/weaponArea
     * @description 武器区，装备武器牌的区域
     */
    Weapon = 31,
    /**
     * 防具
     * @rules terms/zone-terms/armorArea
     * @description 防具区，装备防具牌的区域
     */
    Armor = 32,
    /**
     * 防御坐骑
     * @rules terms/zone-terms/defenseMountArea
     * @description 防御坐骑区，装备防御坐骑牌的区域
     */
    DefensiveMount = 33,
    /**
     * 进攻坐骑
     * @rules terms/zone-terms/attackMountArea
     * @description 进攻坐骑区，装备进攻坐骑牌的区域
     */
    OffensiveMount = 34,
    /**
     * 特殊坐骑
     * @rules terms/zone-terms/specialMountArea
     * @description 特殊坐骑区，装备特殊坐骑牌的区域
     */
    SpecialMount = 35,
    /**
     * 宝物
     * @rules terms/zone-terms/treasureArea
     * @description 宝物区，装备宝物牌的区域
     */
    Treasure = 36,
}
