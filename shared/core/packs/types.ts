import type { GameCardData } from '../card/CardTypes';
import type { GeneralData } from '../general/GeneralType';

export interface CardPackData {
    name: string;
    cards: GameCardData[];
}

export interface GeneralPackData {
    name: string;
    subpacks: {
        /** 子包名（通常为大包.子包，如 standard.wei） */
        name: string;
        /** 角标图片名，按 {cdn}/image/icon/{icon}.png 查找 */
        icon?: string;
        /** 包内武将数据 */
        generals: GeneralData[];
    }[];
}
