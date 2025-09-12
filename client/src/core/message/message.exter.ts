import {
    CustomString,
    CustomStringValue,
    MarkValue,
} from '../custom/custom.type';
import { PlayerId } from '../player/player.types';
import { EffectId } from '../skill/skill.types';

/**
 * Message.exter 附加消息
 * 通用附加的消息。这些消息类型可以自由附加到其他消息上
 */
export interface MsgExter {
    /** 收到消息后添加战报内容 */
    log?: CustomString;
    /** 收到消息后播放语音 */
    audio?:
        | string
        | {
              type: 'death' | 'skill';
              player?: PlayerId;
              effect?: number;
          };
    /** 期间的属性变化
     * 子数组按顺序分别为
     * @param arr[0] 变化的对象类型。
     * @param arr[1] 变化的对象ID
     * @param arr[2] 变化的对象的属性
     * @param arr[3] 变化的对象的值
     */
    propertyChanges?: [string, string | number | undefined, string, any][];
    markChanges?: {
        objType: 'player' | 'room' | 'card' | 'general' | 'skill' | 'effect';
        objId?: string | number;
        key: string;
        value?: MarkValue;
        options?: {
            visible?: boolean | string[];
            values?: CustomStringValue[];
        };
    }[];
}

export interface MsgDelay {
    type: 'MsgDelay';
    ms: number;
}
