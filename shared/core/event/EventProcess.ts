import { Room } from '../room/Room';
import type { GameCard } from '../card/GameCard';
import { AreaType } from '../card/CardTypes';
import { parseAreaId } from '../utils';
import { EventData, EventType, Timing, TimingName } from './EventTypes';

/**
 * 创建 Timing 对象的便捷工厂。
 * 供所有 EventProcess 子类使用，避免在每个事件文件中重复定义。
 */
export function createTiming(
    name: TimingName,
    before?: Array<(room: Room, data: any) => Promise<void>>,
    after?: Array<(room: Room, data: any) => Promise<void>>,
): Timing {
    return { name, before, after } as Timing;
}

/**
 * 事件执行基类。
 * 子类在构造函数中填充 eventTriggers / endTriggers（Timing[]），
 * exec() 按顺序执行各时机，before → trigger → after。
 */
export abstract class EventProcess<T extends EventType = EventType> {
    /** 所属房间 */
    readonly room: Room;
    /** 事件类型 */
    readonly type: T;
    /** 事件自增 ID */
    readonly id: number;
    /** 预设事件数据（由 EventDataMap 类型推导） */
    readonly eventData: EventData<T>;

    /** 进行中的时机序列 */
    eventTriggers: Timing[] = [];
    /** 结束时的时机序列 */
    endTriggers: Timing[] = [];
    /** 当前触发时机名 */
    trigger?: TimingName;
    /** 是否已结束（开始执行 endTriggers） */
    isEnd: boolean = false;
    /** 是否完全完成（已 cleanup） */
    isComplete: boolean = false;
    /** 是否允许继续触发（设为 false 跳过后续 trigger） */
    triggerable: boolean = true;
    /** 是否跳过触发（业务逻辑跳过，区别于 triggerable） */
    triggerNot: boolean = false;
    /** 父事件 */
    source?: EventProcess;
    /** 运行时自定义数据 */
    data: Record<string, any> = {};

    /** 子事件（MoveCardEvent）移动到处理区的牌。processCompleted 中自动清理 */
    private _processingCards: GameCard[] = [];

    /** 子事件（MoveCardEvent）将牌移动到处理区时回调。基类自动收集，子类无需覆写 */
    _trackProcessingCard(card: GameCard): void {
        this._processingCards.push(card);
    }

    constructor(room: Room, type: T, eventData: EventData<T>) {
        this.room = room;
        this.type = type;
        this.eventData = eventData;
        this.id = ++room.eventIds;
    }

    // ===== 子类可选覆写 =====

    /** 事件合法性检查（返回 false 则不执行） */
    check(): boolean {
        return true;
    }
    /** 每轮触发前检查是否继续 */
    checkEvent(): boolean {
        return true;
    }

    // ===== 执行流程 =====

    /** 初始化：设置 source → 推入事件栈。Turn/Phase 事件走 turnStack。 */
    protected async init() {
        const isTurnOrPhase =
            this.type === EventType.Turn || this.type === EventType.Phase;
        if (!this.source && !isTurnOrPhase && this.room.eventStack.length > 0) {
            this.source = this.room.eventStack[this.room.eventStack.length - 1];
        }
        if (isTurnOrPhase) {
            this.room.turnStack.push(this as any);
        } else {
            this.room.eventStack.push(this);
        }
        this.room.logger.debug(
            `[init] source=${this.source?.type}:${this.source?.id} stackDepth=${this.room.eventStack.length}`,
            {
                roomId: this.room.state.roomId,
                event: `${this.type}:${this.id}.init`,
            },
        );
    }

    /** 主执行循环 */
    async exec(): Promise<this> {
        if (!this.check() || this.isComplete || this.isEnd) {
            this.room.logger.debug(
                `[exec] skipped check=${this.check()} isComplete=${this.isComplete} isEnd=${this.isEnd}`,
                {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.exec`,
                },
            );
            return this;
        }

        this.room.logger.info(
            `[exec] start eventTriggers=${this.eventTriggers.length} endTriggers=${this.endTriggers.length}`,
            {
                roomId: this.room.state.roomId,
                playerId: (this.eventData as any).player?.playerId,
                event: `${this.type}:${this.id}.exec`,
            },
        );

        await this.init();
        let step = 0;
        while (
            !this.isEnd &&
            !this.isComplete &&
            this.eventTriggers.length > 0
        ) {
            if (!this.checkEvent()) {
                this.room.logger.debug(`[exec] checkEvent=false, breaking`, {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.exec`,
                });
                break;
            }
            step++;
            await this.triggerFunc(this.eventTriggers.shift()!, step);
        }
        this.isEnd = true;
        while (!this.isComplete && this.endTriggers.length > 0) {
            step++;
            await this.triggerFunc(this.endTriggers.shift()!, step);
        }
        this.isComplete = true;

        this.room.logger.info(`[exec] complete totalSteps=${step}`, {
            roomId: this.room.state.roomId,
            event: `${this.type}:${this.id}.exec`,
        });

        await this.processCompleted();
        return this;
    }

    /** 触发单个时机：注入 refreshs → before → trigger → after */
    async triggerFunc(timing: Timing, step?: number) {
        const stepLabel = step !== undefined ? `[step${step}]` : '';
        try {
            this.trigger = timing.name as TimingName;
            this.triggerable = true;

            this.injectRefreshs(timing);

            const beforeCount = timing.before?.length ?? 0;
            const afterCount = timing.after?.length ?? 0;

            this.room.logger.debug(
                `${stepLabel} [trigger] ${timing.name} before=${beforeCount} after=${afterCount} triggerNot=${this.triggerNot}`,
                {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.triggerFunc`,
                },
            );

            if (timing.before) {
                for (const fn of timing.before) {
                    const fnName =
                        (fn as any).__original?.name || fn.name || '<anon>';
                    this.room.logger.debug(
                        `${stepLabel}   [before] ${fnName}`,
                        {
                            roomId: this.room.state.roomId,
                            event: `${this.type}:${this.id}.triggerFunc`,
                        },
                    );
                    await fn(this.room, this.eventData);
                }
            }

            if (!this.triggerNot && this.triggerable) {
                this.room.logger.debug(
                    `${stepLabel}   [fire] → room.event.trigger(${timing.name})`,
                    {
                        roomId: this.room.state.roomId,
                        event: `${this.type}:${this.id}.triggerFunc`,
                    },
                );
                await this.room.event.trigger(
                    timing.name as TimingName,
                    this,
                    true,
                );
            } else {
                this.room.logger.debug(
                    `${stepLabel}   [skip] triggerNot=${this.triggerNot} triggerable=${this.triggerable}`,
                    {
                        roomId: this.room.state.roomId,
                        event: `${this.type}:${this.id}.triggerFunc`,
                    },
                );
            }

            if (timing.after) {
                for (const fn of timing.after) {
                    const fnName =
                        (fn as any).__original?.name || fn.name || '<anon>';
                    this.room.logger.debug(`${stepLabel}   [after] ${fnName}`, {
                        roomId: this.room.state.roomId,
                        event: `${this.type}:${this.id}.triggerFunc`,
                    });
                    await fn(this.room, this.eventData);
                }
            }
        } catch (e) {
            console.error(
                `[EventProcess] trigger error type=${this.type} timing=${timing.name}`,
                e,
            );
        }
    }

    /** 将 room.refreshsByTiming 中匹配的 refreshs 注入到 Timing 的 before/after */
    private injectRefreshs(timing: Timing) {
        const entry = this.room.refreshsByTiming.get(timing.name as TimingName);
        if (!entry) return;
        const addedBefore = entry.before.length;
        const addedAfter = entry.after.length;
        if (addedBefore > 0) {
            if (!timing.before) timing.before = [];
            timing.before.push(...entry.before.map((item) => item.fn));
        }
        if (addedAfter > 0) {
            if (!timing.after) timing.after = [];
            timing.after.push(...entry.after.map((item) => item.fn));
        }
        if (addedBefore + addedAfter > 0) {
            this.room.logger.debug(
                `[injectRefreshs] ${timing.name} +${addedBefore}before +${addedAfter}after`,
                {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.injectRefreshs`,
                },
            );
        }
    }

    /** 事件完成后的清理 */
    async processCompleted() {
        try {
            const isTurnOrPhase =
                this.type === EventType.Turn || this.type === EventType.Phase;
            if (isTurnOrPhase) {
                const idx = this.room.turnStack.indexOf(this as any);
                if (idx >= 0) this.room.turnStack.splice(idx, 1);
            } else {
                const idx = this.room.eventStack.indexOf(this);
                if (idx >= 0) this.room.eventStack.splice(idx, 1);
            }

            // ===== 清理处理区中因此事件移入的牌 =====
            const toDiscard: GameCard[] = [];
            for (const card of this._processingCards) {
                const { areaType } = parseAreaId(card.area);
                if (areaType === AreaType.Processing) {
                    toDiscard.push(card);
                }
            }
            if (toDiscard.length > 0) {
                // 直接操作区域，不走 MoveCardEvent（避免递归追踪）
                for (const card of toDiscard) {
                    this.room.area.move(
                        [card.id],
                        card.area,
                        AreaType.Discard,
                        'bottom',
                    );
                }
            }
            this._processingCards.length = 0;

            this.room.logger.debug(
                `[cleanup] stackDepth=${this.room.eventStack.length} fuhuos=${this.room.fuhuos.length} deferredOpens=${this.room.deferredOpens.length}`,
                {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.processCompleted`,
                },
            );

            if (this.room.eventStack.length === 0) {
                if (this.room.fuhuos.length > 0) {
                    this.room.logger.debug(
                        `[cleanup] draining ${this.room.fuhuos.length} fuhuos`,
                        {
                            roomId: this.room.state.roomId,
                            event: `${this.type}:${this.id}.processCompleted`,
                        },
                    );
                    while (this.room.fuhuos.length > 0) {
                        const fn = this.room.fuhuos.shift()!;
                        await fn();
                    }
                }
                if (this.room.deferredOpens.length > 0) {
                    this.room.logger.debug(
                        `[cleanup] processing ${this.room.deferredOpens.length} deferredOpens`,
                        {
                            roomId: this.room.state.roomId,
                            event: `${this.type}:${this.id}.processCompleted`,
                        },
                    );
                    while (this.room.deferredOpens.length > 0) {
                        const open = this.room.deferredOpens.shift()!;
                        await this.room.event.trigger(TimingName.Open, open);
                    }
                }
                this.room.logger.debug(`[cleanup] → AllEventEnd`, {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.processCompleted`,
                });
                await this.room.event.trigger(TimingName.AllEventEnd, this);
            }
        } catch (e) {
            console.error(
                `[EventProcess] cleanup error type=${this.type} id=${this.id}`,
                e,
            );
        }
    }

    // ===== 工具方法 =====

    /**
     * 在时机序列中插入新时机。
     * @param timings 插入的时机（TimingName 会自动构建为无回调的 Timing）
     * @param appoint 在此时机名之后插入，不指定则插到最前
     */
    insert(timings: (TimingName | Timing)[], appoint?: string) {
        const target = this.isEnd ? this.endTriggers : this.eventTriggers;
        const wrapped: Timing[] = timings.map((t) =>
            typeof t === 'string' ? { name: t } : t,
        );
        const names = wrapped.map((t) => t.name).join(',');
        if (appoint) {
            const idx = target.findIndex((t) => t.name === appoint);
            if (idx >= 0) {
                target.splice(idx + 1, 0, ...wrapped);
                this.room.logger.debug(
                    `[insert] +[${names}] after ${appoint} → ${target.map((t) => t.name).join(' > ')}`,
                    {
                        roomId: this.room.state.roomId,
                        event: `${this.type}:${this.id}.insert`,
                    },
                );
            }
        } else {
            target.unshift(...wrapped);
            this.room.logger.debug(
                `[insert] +[${names}] to front → ${target.map((t) => t.name).join(' > ')}`,
                {
                    roomId: this.room.state.roomId,
                    event: `${this.type}:${this.id}.insert`,
                },
            );
        }
    }

    // ===== 回调注册 =====

    /**
     * 在指定时机的 before 列表中注册回调。
     * 若该时机不存在则自动创建。
     * @param fn 回调函数，this 指向当前事件实例
     */
    registerBefore(
        timingName: string,
        fn: (room: Room, data: any) => Promise<any>,
    ) {
        const timing = this.findOrCreate(timingName);
        if (!timing.before) timing.before = [];
        timing.before.push(this.bindWithMark(fn));
    }

    /**
     * 在指定时机的 after 列表中注册回调。
     * 若该时机不存在则自动创建。
     * @param fn 回调函数，this 指向当前事件实例
     */
    registerAfter(
        timingName: string,
        fn: (room: Room, data: any) => Promise<any>,
    ) {
        const timing = this.findOrCreate(timingName);
        if (!timing.after) timing.after = [];
        timing.after.push(this.bindWithMark(fn));
    }

    /** 从 before/after 中移除指定回调（需传入原始未 bind 的函数引用） */
    removeCallback(timingName: string, fn: (...args: any[]) => any) {
        for (const list of [this.eventTriggers, this.endTriggers]) {
            const timing = list.find((t) => t.name === timingName);
            if (!timing) continue;
            if (timing.before) {
                const bi = timing.before.findIndex(
                    (bound: any) => bound.__original === fn,
                );
                if (bi >= 0) timing.before.splice(bi, 1);
            }
            if (timing.after) {
                const ai = timing.after.findIndex(
                    (bound: any) => bound.__original === fn,
                );
                if (ai >= 0) timing.after.splice(ai, 1);
            }
        }
    }

    /** 包装 bind 并标记原始函数引用，便于后续 remove */
    protected bindWithMark(
        fn: Function,
    ): (room: Room, data: any) => Promise<any> {
        const bound = fn.bind(this);
        (bound as any).__original = fn;
        return bound;
    }

    /** 查找或创建一个 Timing（优先查 eventTriggers，再查 endTriggers） */
    private findOrCreate(timingName: string): Timing {
        let timing = this.eventTriggers.find((t) => t.name === timingName);
        if (!timing) {
            timing = this.endTriggers.find((t) => t.name === timingName);
        }
        if (!timing) {
            timing = { name: timingName };
            this.eventTriggers.push(timing);
        }
        return timing;
    }
    async end() {
        this.isEnd = true;
        this.triggerable = false;
        return this;
    }

    /** 强制完成事件 */
    async complete() {
        await this.end();
        this.isComplete = true;
        return this;
    }
}
