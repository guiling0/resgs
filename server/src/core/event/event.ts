import { GameCard } from '../card/card';
import { GameState } from '../enums';
import { GameRoom } from '../room/room';
import { MoveCardReason } from '../room/room.types';
import { EventData } from './data';
import { EventId } from './event.types';
import { EventTriggers, Triggers } from './triggers';

export abstract class EventProcess extends EventData {
    /** 事件ID */
    public readonly eventId: EventId;

    constructor(id: EventId, room: GameRoom) {
        super(id, room);
        this.eventId = id;
    }

    /** 事件流程时机 */
    public eventTriggers: Triggers[] = [];
    /** 事件结束时机 */
    public endTriggers: Triggers[] = [];

    protected async init() {
        if (!this.data.source) {
            if (this.room.events.length > 0) {
                this.data.source = this.room.events.at(-1);
            } else {
                this.data.source = this.room.currentTurn;
            }
        }
        this.room.events.push(this);
    }

    public async exec(): Promise<typeof this> {
        try {
            if (!this.check() || this.isComplete || this.isEnd) return;
            await this.init();
            while (
                this.room.gameState === GameState.Gaming &&
                this.check_event() &&
                !this.isEnd &&
                !this.isComplete &&
                this.eventTriggers.length > 0
            ) {
                await this.trigger_func(this.eventTriggers.shift());
            }
            this.isEnd = true;
            while (
                this.room.gameState === GameState.Gaming &&
                !this.isComplete &&
                this.endTriggers.length > 0
            ) {
                await this.trigger_func(this.endTriggers.shift());
            }
        } catch (e) {
            console.log(e);
        } finally {
            this.isComplete = true;
            await this.processCompleted();
        }
        return this;
    }

    /** 结束自动处理 */
    public async processCompleted() {
        if (this.room.gameState !== GameState.Gaming) return;
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
            const cards: GameCard[] = this.room.processingArea.cards.filter(
                (v) => {
                    const last = this.room.getLastOneHistory(
                        sgs.DataType.MoveCardEvent,
                        (d) =>
                            d.move_datas.find(
                                (c) =>
                                    c.cards.includes(v) &&
                                    c.toArea === this.room.processingArea
                            ) && d.source === this
                    );
                    return !!last;
                }
            );
            if (cards.length > 0) {
                await this.room.moveCards({
                    move_datas: [
                        {
                            cards,
                            toArea: this.room.discardArea,
                            reason: MoveCardReason.PutTo,
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
                    await this.room.trigger(EventTriggers.Opened, open);
                }
                //若事件列表中没有事件，通知客户端删除UI处理区里的所有牌
                this.room.setProperty(
                    'clearUiProcessArea',
                    this.room.clearUiProcessArea + 1
                );
            }
        }
    }

    /** 触发一个时机 */
    public async trigger_func(trigger: Triggers) {
        this.trigger = trigger;
        this.triggerable = true;
        const before = (this as any)[`${trigger}_Before`];
        const after = (this as any)[`${trigger}_After`];
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
    public check_event() {
        return true;
    }

    /**
     * 插入一个时机
     * @param trigger 插入的时机
     * @param appoint 在指定时机之后插入 如果不包含则插入失败
     */
    public insert(trigger: Triggers[], appoint?: Triggers) {
        // this.room.log(`Event:${this.type} Insert Trigger`, trigger, appoint);
        const triggers = this.data.isEnd
            ? this.endTriggers
            : this.eventTriggers;
        if (appoint) {
            const index = triggers.indexOf(appoint);
            if (index !== -1) {
                triggers.splice(index + 1, 0, ...trigger);
            }
        } else {
            triggers.unshift(...trigger);
        }
    }
}
