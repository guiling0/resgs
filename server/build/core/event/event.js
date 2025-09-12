"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProcess = void 0;
const data_1 = require("./data");
class EventProcess extends data_1.EventData {
    constructor(id, room) {
        super(id, room);
        /** 事件流程时机 */
        this.eventTriggers = [];
        /** 事件结束时机 */
        this.endTriggers = [];
        this.eventId = id;
    }
    async init() {
        if (!this.data.source) {
            if (this.room.events.length > 0) {
                this.data.source = this.room.events.at(-1);
            }
            else {
                this.data.source = this.room.currentTurn;
            }
        }
        this.room.events.push(this);
    }
    async exec() {
        try {
            if (!this.check() || this.isComplete || this.isEnd)
                return;
            await this.init();
            while (this.room.gameState === 1 /* GameState.Gaming */ &&
                this.check_event() &&
                !this.isEnd &&
                !this.isComplete &&
                this.eventTriggers.length > 0) {
                await this.trigger_func(this.eventTriggers.shift());
            }
            this.isEnd = true;
            while (this.room.gameState === 1 /* GameState.Gaming */ &&
                !this.isComplete &&
                this.endTriggers.length > 0) {
                await this.trigger_func(this.endTriggers.shift());
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            this.isComplete = true;
            await this.processCompleted();
        }
        return this;
    }
    /** 结束自动处理 */
    async processCompleted() {
        if (this.room.gameState !== 1 /* GameState.Gaming */)
            return;
        this.isEnd = this.isComplete = true;
        const history = this.room.historys.findLast((v) => v.data === this);
        if (history) {
            history.endIndex = this.room.historys.length;
        }
        let notMoveHandle = false;
        if (typeof this.notMoveHandle === 'function') {
            notMoveHandle = this.notMoveHandle(this) ?? false;
        }
        if (typeof this.notMoveHandle === 'boolean') {
            notMoveHandle = this.notMoveHandle ?? false;
        }
        if (!notMoveHandle) {
            //1.将此事件过程中移动至处理区的牌移动至弃牌堆
            const cards = this.room.processingArea.cards.filter((v) => {
                const last = this.room.getLastOneHistory(sgs.DataType.MoveCardEvent, (d) => d.move_datas.find((c) => c.cards.includes(v) &&
                    c.toArea === this.room.processingArea) && d.source === this);
                return !!last;
            });
            if (cards.length > 0) {
                await this.room.moveCards({
                    move_datas: [
                        {
                            cards,
                            toArea: this.room.discardArea,
                            reason: 1 /* MoveCardReason.PutTo */,
                            animation: false,
                        },
                    ],
                    source: this,
                    reason: 'process',
                });
            }
        }
        if (this.room.events.includes(this)) {
            lodash.remove(this.room.events, (c) => c === this);
            if (this.room.events.length === 0) {
                //若事件列表中没有事件，进行明置后处理
                while (this.room.opens.length > 0) {
                    const open = this.room.opens.shift();
                    await this.room.trigger("Opened" /* EventTriggers.Opened */, open);
                }
                //若事件列表中没有事件，通知客户端删除UI处理区里的所有牌
                this.room.setProperty('clearUiProcessArea', this.room.clearUiProcessArea + 1);
            }
        }
    }
    /** 触发一个时机 */
    async trigger_func(trigger) {
        this.trigger = trigger;
        this.triggerable = true;
        const before = this[`${trigger}_Before`];
        const after = this[`${trigger}_After`];
        if (before && typeof before === 'function') {
            await before.call(this);
        }
        if (this.triggerable && !this.triggerNot) {
            await this.room.trigger(trigger, this);
        }
        if (after && typeof after === 'function') {
            await after.call(this);
        }
    }
    /** 检测该事件是否结束 */
    check_event() {
        return true;
    }
    /**
     * 插入一个时机
     * @param trigger 插入的时机
     * @param appoint 在指定时机之后插入 如果不包含则插入失败
     */
    insert(trigger, appoint) {
        // this.room.log(`Event:${this.type} Insert Trigger`, trigger, appoint);
        const triggers = this.data.isEnd
            ? this.endTriggers
            : this.eventTriggers;
        if (appoint) {
            const index = triggers.indexOf(appoint);
            if (index !== -1) {
                triggers.splice(index + 1, 0, ...trigger);
            }
        }
        else {
            triggers.unshift(...trigger);
        }
    }
}
exports.EventProcess = EventProcess;
