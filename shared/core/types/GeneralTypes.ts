import type { GeneralConfig } from './AssetsTypes';

/** 武将 ID（武将名即 id） */
export type GeneralId = string;
/**
 * 武将势力（可用逗号分割多势力，如 "wei,shu"）
 * @rules terms/card-face-terms/kingdom
 * @description 势力标识于武将牌左上角，分为魏/蜀/吴/群/西和神六种
 */
export type GeneralKingdom = string;
/** 武将体力（number 或 [初始体力, 上限, 护盾]） */
export type GeneralHp = number | [number, number] | [number, number, number];

/**
 * 性别
 * @rules terms/card-face-terms/gender
 * @description 性别由武将牌的姓名/插画/历史记载获知，分男性、女性两种
 */
export enum Gender {
    /** 无性别 */
    None = 0,
    /** 男 */
    Male = 1,
    /** 女 */
    Female = 2,
    /** 双性 */
    Doublesex = 9,
}

/**
 * 武将数据（注册到 sgs.generals，武将名即 id）
 * @rules terms/card-terms/GeneralCard
 * @description 武将牌数据——角色的武将牌上标识的姓名即其姓名
 */
export interface GeneralData {
    /** 武将名（唯一标识） */
    name: string;
    /** 势力（可用逗号分割多势力） */
    kingdom: GeneralKingdom;
    /** 体力（number 或 [初始体力, 上限, 护盾]） */
    hp: GeneralHp;
    /** 性别 */
    gender: Gender;
    /** 技能名列表 */
    skills: string[];
    /** 是否为主公/君主 */
    lord: boolean;
    /** 是否启用 */
    enable: boolean;
    /** 在武将一览中隐藏 */
    hidden: boolean;
    /** 是否为国战武将 */
    isWars: boolean;
    /** 珠联璧合表 */
    rs?: string[];
    /** 默认皮肤名（同名武将共享皮肤配置，仅默认皮肤不同） */
    defaultSkin?: string;
    /** 武将资源配置（注册武将时一并注册，可选） */
    config?: GeneralConfig;
}
