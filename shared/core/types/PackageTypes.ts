import type { GameCardData } from './CardTypes';
import type { GeneralData } from './GeneralTypes';

/** 卡牌扩展包数据（注册到 sgs.cardpacks） */
export interface CardPackageData {
    /** 扩展包名（实体牌 ID 前缀，如 standard） */
    name: string;
    /** 扩展包内全部实体牌数据（id 已分配） */
    cards: GameCardData[];
}

/** 武将扩展包数据（注册到 sgs.generalpacks） */
export interface GeneralPackData {
    /** 扩展包名（如 standard） */
    name: string;
    /** 扩展包内全部武将数据 */
    generals: GeneralData[];
}
