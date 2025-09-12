import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { TriggerEffect } from '../skill/effect';
import { Skill } from '../skill/skill';
import { EventId } from './event.types';
import { Triggers } from './triggers';

export abstract class EventData {
    /** 事件ID */
    public readonly dataId: EventId;
    /** 所属房间 */
    public readonly room: GameRoom;
    /** 当前触发时机 */
    public trigger: Triggers;
    /** 是否触发当前时机 */
    public triggerable: boolean;
    /** 当前触发玩家 */
    public triggerCurrent: GamePlayer;
    /** 是否结束 */
    public isEnd: boolean = false;
    /** 是否完成 */
    public isComplete: boolean = false;

    //某一个数据作为桥梁来引用其他事件时，以下内容需要全部复制过去

    /** 不触发时机 */
    public triggerNot: boolean = false;
    /** 不触发默认的将处理区的牌移动至弃牌堆 */
    public notMoveHandle: boolean | ((data: EventData) => boolean) = false;
    /** 发起指令的玩家 */
    public c: GamePlayer;
    /** 通过技能触发 */
    public skill: TriggerEffect;
    /** 通过操作执行 */
    public source: EventData;
    /** 触发原因 */
    public reason: string;
    /** 自定义数据 */
    public data: { [key: string]: any } = {};

    constructor(id: EventId, room: GameRoom) {
        this.dataId = id;
        this.room = room;
    }

    /** 将此数据转化为指定类型的数据 */
    public cast<T extends EventData>(
        cotr: new (id: EventId, room: GameRoom) => T
    ): T {
        return this instanceof cotr ? this : undefined;
    }

    public is<T extends EventData>(
        cotr: new (id: EventId, room: GameRoom) => T
    ): this is T {
        return !!this.cast(cotr);
    }

    /** 检测该数据能否被执行 */
    public check() {
        return true;
    }

    /** 作为桥梁来引用其他事件时，需要将该函数的返回值附加给目标事件 */
    public copy() {
        return {
            triggerNot: this.triggerNot,
            notMoveHandle: this.notMoveHandle,
            c: this.c,
            skill: this.skill,
            source: this.source,
            reason: this.reason,
            data: this.data,
        };
    }
}
