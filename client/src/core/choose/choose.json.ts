import { GameCardId } from '../card/card.types';
import { GeneralId } from '../general/general.type';
import { PlayerId } from '../player/player.types';
import { RequestOptionData } from './choose.types';

export interface GameRequestJsonData {
    /** 询问ID */
    id: number;
    /** 被询问的玩家 */
    player?: PlayerId;
    /** 需要从哪个技能中获取选择方法。如果包含有多个name为skill_cost的选择，则会改为选择一个技能来发动 */
    get_selectors?: {
        effectId: number;
        name: string;
        context: ContextJsonData;
    }[];
    /** 只询问确定和取消 */
    cac?: boolean;
    /** 能否取消 */
    canCancle?: boolean;
    /** 提示文本 */
    prompt?: string;
    /** 思考提示文本
     * @description 其他玩家视角中显示选择人正在选择什么
     */
    thinkPrompt?: string;
    /** 是否全部玩家显示倒计时 默认为false*/
    isAllShowTimebar?: boolean;
    /** 是否显示倒计时 默认为true*/
    showTimebar?: boolean;
    /** 是否显示主视角的确定/取消按钮 默认为true*/
    showMainButtons?: boolean;
    /** 响应时间 如果为空的话默认为房间设置中的responseTime属性 */
    ms?: number;
    /** 是否完成 */
    complete?: boolean;
}

export type ContextJsonData = {
    effect?: number;
    /** 发动者 默认为拥有者 */
    from?: PlayerId;
    /** 最大发动次数 默认为1 */
    maxTimes?: number;
    /** 消耗中选择的卡牌 */
    cards?: GameCardId[];
    /** 技能目标 */
    targets?: PlayerId[];
    /** 服务端提供的设置 */
    options?: RequestOptionData;
} & {
    [key: string]: any;
};
