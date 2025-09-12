/** 区域ID */
export type AreaId = string;

/** 区域类型 */
export const enum AreaType {
    Unknown = 0,
    /** 武将牌堆 */
    General = 99,
    /** 牌堆 */
    Draw = 1,
    /** 弃牌堆 */
    Discard = 2,
    /** 处理区 */
    Processing = 3,
    /** 仓廪 */
    Granary = 4,
    /** 府库 */
    Treasury = 5,
    /** 后备区 */
    Reserve = 6,
    /** 手牌区 */
    Hand = 91,
    /** 装备区 */
    Equip = 92,
    /** 判定区 */
    Judge = 93,
    /** 武将牌上 */
    Up = 94,
    /** 武将牌旁 */
    Side = 95,
}
