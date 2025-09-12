"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventData = void 0;
class EventData {
    constructor(id, room) {
        /** 是否结束 */
        this.isEnd = false;
        /** 是否完成 */
        this.isComplete = false;
        //某一个数据作为桥梁来引用其他事件时，以下内容需要全部复制过去
        /** 不触发时机 */
        this.triggerNot = false;
        /** 不触发默认的将处理区的牌移动至弃牌堆 */
        this.notMoveHandle = false;
        /** 自定义数据 */
        this.data = {};
        this.dataId = id;
        this.room = room;
    }
    /** 将此数据转化为指定类型的数据 */
    cast(cotr) {
        return this instanceof cotr ? this : undefined;
    }
    is(cotr) {
        return !!this.cast(cotr);
    }
    /** 检测该数据能否被执行 */
    check() {
        return true;
    }
    /** 作为桥梁来引用其他事件时，需要将该函数的返回值附加给目标事件 */
    copy() {
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
exports.EventData = EventData;
