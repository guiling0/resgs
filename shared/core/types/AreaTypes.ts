/** 区域 ID——格式：'{playerId}.{type}'（玩家私有）或 '{type}'（公共） */
export type AreaId = string;

/** 牌放置方式（面朝方向）：true 正面朝上（Up），false 背面朝上（Down） */
export type CardPut = boolean;

/**
 * 区域类型
 * @rules terms/zone-terms/area
 * @description 放置牌的场所，分为公共区域与独立区域
 */
export enum AreaType {
    Unknown = 'unknown',
    /**
     * 牌堆
     * @rules terms/zone-terms/drawArea
     * @description 游戏牌堆的简称，牌默认背面朝上放置
     */
    Draw = 'draw',
    /**
     * 弃牌堆
     * @rules terms/zone-terms/discardArea
     * @description 弃牌堆里的牌默认正面朝上放置
     */
    Discard = 'discard',
    /**
     * 处理区
     * @rules terms/zone-terms/processingArea
     * @description 处理区里的牌默认正面朝上放置
     */
    Processing = 'processing',
    /**
     * 仓廪
     * @rules terms/zone-terms/granaryArea
     * @description 仓廪里的牌默认背面朝上放置
     */
    Granary = 'granary',
    /**
     * 府库
     * @rules terms/zone-terms/treasuryArea
     * @description 府库里的牌默认正面朝上放置
     */
    Treasury = 'treasury',
    /**
     * 后备区/仁区
     * @rules terms/zone-terms/reserveArea
     * @description 后备区里的牌默认正面朝上放置；仁区设计来源于后备区，二者为相同实现
     */
    Reserve = 'reserve',
    /**
     * 手牌区
     * @rules terms/zone-terms/handArea
     * @description 手牌区里的牌默认背面朝上放置，手牌区里的牌简称手牌
     */
    Hand = 'hand',
    /**
     * 装备区
     * @rules terms/zone-terms/equipArea
     * @description 装备区包括武器区、防具区、进攻坐骑区、防御坐骑区、特殊坐骑区和宝物区
     */
    Equip = 'equip',
    /**
     * 判定区
     * @rules terms/zone-terms/judgeArea
     * @description 判定区里的牌默认正面朝上放置
     */
    Judge = 'judge',
    /**
     * 武将牌上
     * @rules terms/zone-terms/upArea
     * @description 武将牌上的牌默认正面朝上放置
     */
    Up = 'up',
    /**
     * 武将牌旁
     * @rules terms/zone-terms/sideArea
     * @description 武将牌旁的牌默认正面朝上放置
     */
    Side = 'side',
}
