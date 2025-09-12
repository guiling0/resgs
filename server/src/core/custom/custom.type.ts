import { AreaId } from '../area/area.type';
import { VirtualCardData } from '../card/card.types';

export type CustomString =
    | string
    | { text: string; values: CustomStringValue[] };

export type CustomStringValue =
    | { type: 'player'; value: string }
    | { type: 'card'; value: string }
    | { type: '[player]'; value: string[] }
    | { type: '[card]'; value: string[] }
    | { type: 'number'; value: number }
    | { type: 'string'; value: CustomString }
    | { type: '[string]'; value: CustomString[] }
    | { type: 'carddata'; value: string }
    | { type: '[carddata]'; value: string[] }
    | { type: 'vcard'; value: VirtualCardData }
    | { type: '[vcard]'; value: VirtualCardData[] }
    | { type: 'area'; value: AreaId }
    | { type: 'area_pro'; value: AreaId };

export type MarkValue = any;

export interface MarkOptions {
    source?: string;
    /** 标记是否可见 默认为false。true-对所有人可见；false-对所有人不可见;[players]-对部分角色可见(空数组的话也是对所有人不可见)
     *
     * 不同的对象显示的逻辑也不同
     * @room 永远不会显示
     * @player 会将所有mark显示在脸上
     * @card 会显示在卡牌下发的提示文本处，且仅会显示最新更新的mark
     * @general 同card
     *
     */
    visible?: boolean | string[];
    /** 仅针对string类型标记，动态显示内容会根据此对象进行解析 */
    values?: CustomStringValue[];
    /** 标记类型 */
    type?:
        | 'img'
        | 'cards'
        | 'generals'
        | 'command'
        | 'prompt'
        | 'suit'
        | '[suit]';
    /** 为cards和generals类型提供检测的区域，注意区域中的牌要与该mark同名 */
    areaId?: string;
    /** 为image类型提供一个地址来显示标记 */
    url?: string;
}
