/**
 * 资源 URL 映射。
 * 所有资源路径统一走此文件，禁止硬编码 URL。
 */

import { CDN_BASE } from '../config';

// ===== 卡牌 =====

/** 花色图标 */
export const CARD_SUIT_IMAGE = (suit: string): string =>
    `resources/card/suit/${suit}.png`;

/** 花色图标（日志/聊天用） */
export const CARD_LOGSUIT_IMAGE = (suit: string): string =>
    `resources/card/logsuit/${suit}.png`;

/** 颜色色条（黑/红/无色） */
export const CARD_COLOR_IMAGE = (color: string): string =>
    `resources/card/suit/${color}.png`;

/** 点数图标 */
export const CARD_NUMBER_IMAGE = (color: 'black' | 'red', num: number): string =>
    `resources/card/number/${color}/${num}.png`;

/** 牌背 */
export const CARD_BACK_IMAGE = (suffix: string = ''): string =>
    `resources/card/card-back${suffix}.png`;

/** 卡面插画（CDN）。生产环境/PC 客户端会替换 CDN_BASE 为本地地址 */
export const CARD_FACE_IMAGE = (imageName: string): string =>
    `${CDN_BASE}/image/cards/${imageName}.png`;

/** 空牌占位图 */
export const CARD_NONE_IMAGE = 'resources/card/none.png';

/** 装备槽（31=武器 32=防具 horse=坐骑 36=宝物） */
export const EQUIP_SLOT_IMAGE = (type: string): string =>
    `resources/card/equip${type}.png`;

// ===== 武将 =====

/** 武将牌边框 */
export const GENERAL_BORDER_IMAGE = (isLord = false): string =>
    `resources/general/general_border${isLord ? '_0' : ''}.png`;

/** 势力图标 */
export const KINGDOM_IMAGE = (kingdom: string, isLord = false): string =>
    `resources/general/kingdom/${kingdom}${isLord ? '2' : ''}.png`;

/** 体力勾玉（type: 0=普通满 1=国战满 2=国战半血） */
export const GENERAL_HP_IMAGE = (kingdom: string, type: 0 | 1 | 2): string =>
    `resources/general/hp/${kingdom}/hp${type}.png`;

/** 体力空槽 */
export const GENERAL_HP_HOLLOW = 'resources/general/hp/hollow.png';

/** 武将牌背 */
export const GENERAL_BACK_IMAGE = (suffix: string = ''): string =>
    `resources/general/general-back${suffix}.png`;

/** 武将占位图（1=自己座位 2=卡牌用） */
export const GENERAL_PLACEHOLDER = (isSelf = false): string =>
    `resources/general/sb${isSelf ? '1' : '2'}.png`;

/** 珠联璧合图标 */
export const ZHULIAN_ICON = (kingdom: string): string =>
    `resources/general/zhulian/icon/${kingdom}.png`;

/** 珠联璧合文字 */
export const ZHULIAN_ZI = (kingdom: string): string =>
    `resources/general/zhulian/zi/${kingdom}.png`;
