/** 武将ID */
export type GeneralId = string;
/** 武将势力 可以用,分割多个势力 */
export type GeneralKingdom = string;
/** 武将体力 其中数组代表[初始体力值,初始体力上限,初始护盾] */
export type GeneralHp = number | [number, number] | [number, number, number];

/** 性别 */
export const enum Gender {
    /** 无性别 */
    None = 0,
    /** 男 */
    Male = 1,
    /** 女 */
    Female = 2,
    /** 双性 */
    Doublesex = 9,
}

export interface GeneralData {
    /** 武将ID */
    id: GeneralId;
    /** 武将名 */
    name: string;
    /** 势力 */
    kingdom: GeneralKingdom;
    /** 血量 */
    hp: GeneralHp;
    /** 性别 */
    gender: Gender;
    /** 技能 */
    skills: string[];
    /** 是否为主公/君主 */
    lord: boolean;
    /** 是否启用 */
    enable: boolean;
    /** 在武将一览中隐藏 */
    hidden: boolean;
    /** 所属扩展包 */
    package: string[];
    /** 是否启用双头武将特殊插画 */
    isDualImage: boolean;
    /** 是否为国战武将 */
    isWars: boolean;
}

/** 创建一张武将牌 */
export type CreateGeneral = Partial<
    Omit<GeneralData, 'id' | 'name' | 'package'>
> & {
    name: string;
};
