import { Room } from '../room/Room';
import { EventData, EventType, Timing, TimingName } from './EventTypes';

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

    /** 初始化：设置 source → 推入事件栈 */
    protected async init() {
        if (this.room.eventStack.length > 0) {
            this.source = this.room.eventStack[this.room.eventStack.length - 1];
        }
        this.room.eventStack.push(this);
    }

    /** 主执行循环 */
    async exec(): Promise<this> {
        if (!this.check() || this.isComplete || this.isEnd) return this;
        await this.init();
        while (
            !this.isEnd &&
            !this.isComplete &&
            this.eventTriggers.length > 0
        ) {
            if (!this.checkEvent()) break;
            await this.triggerFunc(this.eventTriggers.shift()!);
        }
        this.isEnd = true;
        while (!this.isComplete && this.endTriggers.length > 0) {
            await this.triggerFunc(this.endTriggers.shift()!);
        }
        this.isComplete = true;
        await this.processCompleted();
        return this;
    }

    /** 触发单个时机：注入 refreshs → before → trigger → after */
    async triggerFunc(timing: Timing) {
        try {
            this.trigger = timing.name as TimingName;
            this.triggerable = true;

            this.injectRefreshs(timing);

            if (timing.before) {
                for (const fn of timing.before) {
                    await fn(this.room, this.eventData);
                }
            }

            if (!this.triggerNot && this.triggerable) {
                await this.room.event.trigger(
                    timing.name as TimingName,
                    this,
                );
            }

            if (timing.after) {
                for (const fn of timing.after) {
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
        const entry = this.room.refreshsByTiming.get(
            timing.name as TimingName,
        );
        if (!entry) return;
        if (entry.before.length > 0) {
            if (!timing.before) timing.before = [];
            timing.before.push(...entry.before.map((item) => item.fn));
        }
        if (entry.after.length > 0) {
            if (!timing.after) timing.after = [];
            timing.after.push(...entry.after.map((item) => item.fn));
        }
    }

    /** 事件完成后的清理 */
    async processCompleted() {
        try {
            const idx = this.room.eventStack.indexOf(this);
            if (idx >= 0) this.room.eventStack.splice(idx, 1);

            if (this.room.eventStack.length === 0) {
                while (this.room.fuhuos.length > 0) {
                    const fn = this.room.fuhuos.shift()!;
                    await fn();
                }
                while (this.room.deferredOpens.length > 0) {
                    const open = this.room.deferredOpens.shift()!;
                    await this.room.event.trigger(TimingName.Open, open);
                }
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
        if (appoint) {
            const idx = target.findIndex((t) => t.name === appoint);
            if (idx >= 0) target.splice(idx + 1, 0, ...wrapped);
        } else {
            target.unshift(...wrapped);
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
    private bindWithMark(
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
