import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { GameCard } from '../../entity/GameCard';
import type { Effect } from '../../entity/Effect';
import { AreaType } from '../../types/AreaTypes';
import type { AreaId } from '../../types/AreaTypes';
import type { EventData, Timing, TimingData, TimingTrigger } from '../../types/EventTypes';
import { EventType, TimingName } from '../../types/EventTypes';
import type { TurnEvent, PhaseEvent } from './TurnEvent';

/** 创建 Timing 对象的便捷工厂（各事件子类统一使用） */
export function createTiming(
    name: TimingName,
    before?: Array<(room: Room, data: any) => Promise<unknown>>,
    after?: Array<(room: Room, data: any) => Promise<unknown>>,
): Timing<TimingTrigger> {
    return { name, before, after } as Timing<TimingTrigger>;
}

/**
 * 事件执行基类——权威端结算流程载体（logic 层，仅 host 注入后运行）。
 * 子类在构造函数填充 eventTriggers/endTriggers（Timing[]），
 * exec() 按顺序执行各时机：before → 触发调度（room.event.trigger）→ after。
 * 事件栈、历史、fuhuos/deferredOpens 均经 room.host 运行态访问（镜像端为空）。
 * @rules terms/resolution-terms/process
 * @description 事件在合理的时机插入发生后所进行的处理过程
 */
export abstract class EventProcess<T extends EventType = EventType> {
    /** 所属房间 */
    readonly room: Room;
    /** 事件类型 */
    readonly type: T;
    /** 事件自增 id */
    readonly id: number;
    /** 预设事件数据（按事件类型推导） */
    readonly eventData: EventData<T>;

    /** 进行中的时机序列 */
    eventTriggers: Timing<TimingTrigger>[] = [];
    /** 结束时的时机序列 */
    endTriggers: Timing<TimingTrigger>[] = [];
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
    /** 运行时自定义数据（如 buqu 等结算标记） */
    data: Record<string, unknown> = {};

    /** 源事件（事件栈上层，取自事件数据） */
    get source(): EventProcess | undefined {
        return this.eventData.source;
    }
    set source(v: EventProcess | undefined) {
        this.eventData.source = v;
    }

    /** 触发事件的技能效果（取自事件数据） */
    get effect(): Effect | undefined {
        return this.eventData.effect;
    }
    set effect(v: Effect | undefined) {
        this.eventData.effect = v;
    }

    /** 触发原因（取自事件数据） */
    get reason(): string | undefined {
        return this.eventData.reason;
    }
    set reason(v: string | undefined) {
        this.eventData.reason = v;
    }

    /**
     * 指令角色（A令B中的A，取自事件数据）
     * @rules terms/description-terms/cmd
     * @description A令B执行某操作，指令由A发出、动作由B执行
     */
    get cmd(): Player | undefined {
        return this.eventData.cmd;
    }
    set cmd(v: Player | undefined) {
        this.eventData.cmd = v;
    }

    /** 移动到处理区的牌及其原因（processCompleted 中清理） */
    private _processingCards: { card: GameCard; reason: string }[] = [];

    /** 将牌移动到处理区时的回调，基类自动收集 */
    _trackProcessingCard(card: GameCard, reason: string): void {
        this._processingCards.push({ card, reason });
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

    /** 初始化：设置 source → 推入事件栈（Turn→turnStack，Phase→phaseStack，其余→eventStack） */
    protected async init(): Promise<void> {
        const isTurnOrPhase = this.type === EventType.Turn || this.type === EventType.Phase;
        if (!this.source && !isTurnOrPhase && this.room.eventStack.length > 0) {
            this.source = this.room.eventStack[this.room.eventStack.length - 1];
        }
        if (this.type === EventType.Turn) {
            this.room.turnStack.push(this as unknown as TurnEvent);
        } else if (this.type === EventType.Phase) {
            this.room.phaseStack.push(this as unknown as PhaseEvent);
        } else {
            this.room.eventStack.push(this as unknown as EventProcess);
        }
        this.room.logger.debug(
            `[init] source=${this.source?.type}:${this.source?.id} stackDepth=${this.room.eventStack.length}`,
            { roomId: this.room.roomId, event: `${this.type}:${this.id}.init` },
        );
    }

    /**
     * 主执行循环：eventTriggers → endTriggers → processCompleted
     * @rules terms/resolution-terms/settle
     * @description 处理一个事件的过程
     */
    async exec(): Promise<this> {
        if (!this.check() || this.isComplete || this.isEnd) {
            this.room.logger.debug(
                `[exec] skipped check=${this.check()} isComplete=${this.isComplete} isEnd=${this.isEnd}`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.exec` },
            );
            return this;
        }

        this.room.logger.info(
            `[exec] start eventTriggers=${this.eventTriggers.length} endTriggers=${this.endTriggers.length}`,
            { roomId: this.room.roomId, event: `${this.type}:${this.id}.exec` },
        );

        await this.init();
        let step = 0;
        while (
            !this.room.isEnding &&
            !this.isEnd &&
            !this.isComplete &&
            this.eventTriggers.length > 0
        ) {
            if (!this.checkEvent()) {
                this.room.logger.debug(
                    `[exec] checkEvent=false, breaking`,
                    { roomId: this.room.roomId, event: `${this.type}:${this.id}.exec` },
                );
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

        this.room.logger.info(
            `[exec] complete totalSteps=${step}`,
            { roomId: this.room.roomId, event: `${this.type}:${this.id}.exec` },
        );

        await this.processCompleted();
        return this;
    }

    /** 触发单个时机：注入 refreshs → before → 触发调度 → after */
    async triggerFunc(timing: Timing<TimingTrigger>, step?: number): Promise<void> {
        const stepLabel = step !== undefined ? `[step${step}]` : '';
        try {
            this.trigger = timing.name as TimingName;
            this.triggerable = true;

            this.injectRefreshs(timing);

            const beforeCount = timing.before?.length ?? 0;
            const afterCount = timing.after?.length ?? 0;
            this.room.logger.debug(
                `${stepLabel} [trigger] ${timing.name} before=${beforeCount} after=${afterCount} triggerNot=${this.triggerNot}`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.triggerFunc` },
            );

            if (timing.before) {
                for (const fn of timing.before) {
                    this.room.logger.debug(
                        `${stepLabel}   [before] ${fn.name || '<anon>'}`,
                        { roomId: this.room.roomId, event: `${this.type}:${this.id}.triggerFunc` },
                    );
                    await fn(this.room, this.eventData as TimingData<TimingTrigger>);
                }
            }

            if (!this.triggerNot && this.triggerable) {
                await this.room.event.trigger(timing.name as TimingName, this, true);
            } else {
                this.room.logger.debug(
                    `${stepLabel}   [skip] triggerNot=${this.triggerNot} triggerable=${this.triggerable}`,
                    { roomId: this.room.roomId, event: `${this.type}:${this.id}.triggerFunc` },
                );
            }

            if (timing.after) {
                for (const fn of timing.after) {
                    this.room.logger.debug(
                        `${stepLabel}   [after] ${fn.name || '<anon>'}`,
                        { roomId: this.room.roomId, event: `${this.type}:${this.id}.triggerFunc` },
                    );
                    await fn(this.room, this.eventData as TimingData<TimingTrigger>);
                }
            }
        } catch (e) {
            this.room.logger.error(
                `[trigger] error timing=${timing.name} ${(e as Error)?.message ?? e}`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.triggerFunc` },
            );
        }
    }

    /** 将时机匹配的 refreshs 注入到 Timing 的 before/after */
    private injectRefreshs(timing: Timing<TimingTrigger>): void {
        const entry = this.room.event.refreshsByTiming.get(timing.name as TimingName);
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
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.injectRefreshs` },
            );
        }
    }

    /** 事件完成后的清理：出栈 + 处理区牌清理 + fuhuos/deferredOpens 排空 + AllEventEnd */
    async processCompleted(): Promise<void> {
        try {
            if (this.type === EventType.Turn) {
                const idx = this.room.turnStack.indexOf(this as unknown as TurnEvent);
                if (idx >= 0) this.room.turnStack.splice(idx, 1);
            } else if (this.type === EventType.Phase) {
                const idx = this.room.phaseStack.indexOf(this as unknown as PhaseEvent);
                if (idx >= 0) this.room.phaseStack.splice(idx, 1);
            } else {
                const idx = this.room.eventStack.indexOf(this as unknown as EventProcess);
                if (idx >= 0) this.room.eventStack.splice(idx, 1);
            }

            // ===== 清理处理区中因此事件移入的牌 =====
            if (this._processingCards.length > 0) {
                const byReason = new Map<string, GameCard[]>();
                for (const entry of this._processingCards) {
                    const area = this.findArea(entry.card);
                    if (!area || area.type !== AreaType.Processing) continue;
                    const group = byReason.get(entry.reason) || [];
                    group.push(entry.card);
                    byReason.set(entry.reason, group);
                }
                for (const [reason, cards] of byReason) {
                    await this.room.event.moveCards(
                        [{ cards, toArea: AreaType.Discard, reason: `${reason}.clear` }],
                        { source: this },
                    );
                }
            }
            this._processingCards.length = 0;

            this.room.logger.debug(
                `[cleanup] stackDepth=${this.room.eventStack.length} fuhuos=${this.room.fuhuos.length} deferredOpens=${this.room.deferredOpens.length}`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.processCompleted` },
            );

            if (this.room.eventStack.length === 0) {
                while (this.room.fuhuos.length > 0) {
                    const fn = this.room.fuhuos.shift()!;
                    await fn();
                }
                // 取出当前全部延时明置事件，按响应顺序（当前回合角色开始逆时针）排序后依次触发
                const opens = this.room.deferredOpens.splice(0);
                const byPlayer = new Map<Player, EventProcess<EventType.Open>[]>();
                for (const open of opens) {
                    const list = byPlayer.get(open.eventData.player) || [];
                    list.push(open);
                    byPlayer.set(open.eventData.player, list);
                }
                for (const player of this.room.sortResponse([...byPlayer.keys()])) {
                    if (!player.alive) continue;
                    for (const open of byPlayer.get(player)!) {
                        await this.room.event.trigger(TimingName.Open, open);
                    }
                }
                this.room.logger.debug(
                    `[cleanup] → AllEventEnd`,
                    { roomId: this.room.roomId, event: `${this.type}:${this.id}.processCompleted` },
                );
                await this.room.event.trigger(TimingName.AllEventEnd, this);
            }
        } catch (e) {
            this.room.logger.error(
                `[cleanup] error ${(e as Error)?.message ?? e}`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.processCompleted` },
            );
        }
    }

    /** 查询牌所在区域（经 card.area 直接读取） */
    findArea(card: GameCard): { type: AreaType; areaId: AreaId } | undefined {
        const area = card.area;
        if (!area) return undefined;
        return { type: area.type, areaId: area.areaId };
    }

    // ===== 工具方法 =====

    /**
     * 在时机序列中插入新时机。
     * @param timings 插入的时机（TimingName 自动构建为无回调 Timing）
     * @param appoint 在此时机名之后插入，不指定则插到最前
     */
    insert(timings: (TimingName | Timing<TimingTrigger>)[], appoint?: string): void {
        const target = this.isEnd ? this.endTriggers : this.eventTriggers;
        const wrapped: Timing<TimingTrigger>[] = timings.map((t) =>
            typeof t === 'string' ? { name: t } : t,
        );
        const names = wrapped.map((t) => t.name).join(',');
        if (appoint) {
            const idx = target.findIndex((t) => t.name === appoint);
            if (idx >= 0) {
                target.splice(idx + 1, 0, ...wrapped);
                this.room.logger.debug(
                    `[insert] +[${names}] after ${appoint}`,
                    { roomId: this.room.roomId, event: `${this.type}:${this.id}.insert` },
                );
            }
        } else {
            target.unshift(...wrapped);
            this.room.logger.debug(
                `[insert] +[${names}] to front`,
                { roomId: this.room.roomId, event: `${this.type}:${this.id}.insert` },
            );
        }
    }

    // ===== 回调注册 =====

    /** 在指定时机的 before 列表注册回调（时机不存在则自动创建），this 绑定当前事件 */
    registerBefore(timingName: string, fn: (room: Room, data: unknown) => Promise<unknown>): void {
        const timing = this.findOrCreate(timingName);
        if (!timing.before) timing.before = [];
        timing.before.push(this.bindWithMark(fn));
    }

    /** 在指定时机的 after 列表注册回调（时机不存在则自动创建），this 绑定当前事件 */
    registerAfter(timingName: string, fn: (room: Room, data: unknown) => Promise<unknown>): void {
        const timing = this.findOrCreate(timingName);
        if (!timing.after) timing.after = [];
        timing.after.push(this.bindWithMark(fn));
    }

    /** 从 before/after 中移除指定回调（传入原始未 bind 的函数引用） */
    removeCallback(timingName: string, fn: (...args: unknown[]) => unknown): void {
        for (const list of [this.eventTriggers, this.endTriggers]) {
            const timing = list.find((t) => t.name === timingName);
            if (!timing) continue;
            if (timing.before) {
                const bi = timing.before.findIndex((bound) => (bound as unknown as { __original?: unknown }).__original === fn);
                if (bi >= 0) timing.before.splice(bi, 1);
            }
            if (timing.after) {
                const ai = timing.after.findIndex((bound) => (bound as unknown as { __original?: unknown }).__original === fn);
                if (ai >= 0) timing.after.splice(ai, 1);
            }
        }
    }

    /** 包装 bind 并标记原始函数引用，便于 removeCallback 匹配 */
    protected bindWithMark(fn: Function): (room: Room, data: unknown) => Promise<unknown> {
        const bound = fn.bind(this) as ((room: Room, data: unknown) => Promise<unknown>) & { __original?: Function };
        bound.__original = fn;
        return bound;
    }

    /** 查找或创建一个 Timing（优先查 eventTriggers，再查 endTriggers） */
    private findOrCreate(timingName: string): Timing<TimingTrigger> {
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

    /** 结束事件（isEnd=true，triggerable=false） */
    async end(): Promise<this> {
        this.isEnd = true;
        this.triggerable = false;
        return this;
    }

    /**
     * 强制完成事件（终止流程/回合）
     * @rules terms/game-flow-terms/complete
     * @description 终止流程/回合是「结束此时机且不会生成此后直至结束的所有时机」的操作
     */
    async complete(): Promise<this> {
        await this.end();
        this.isComplete = true;
        return this;
    }
}