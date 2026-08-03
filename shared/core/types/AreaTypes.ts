/** 区域 ID——格式：'{playerId}.{type}'（玩家私有）或 '{type}'（公共） */
export type AreaId = string;

/** 牌放置方式（面朝方向）：true 正面朝上（Up），false 背面朝上（Down） */
export type CardPut = boolean;

/** 区域类型 */
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
