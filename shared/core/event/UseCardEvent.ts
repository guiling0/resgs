import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { VirtualCard } from '../card/VirtualCard';
import { AreaType } from '../card/CardTypes';
import { EventProcess, createTiming } from './EventProcess';
import {
    EventType,
    TargetEntry,
    TimingName,
    UseCardEventData,
} from './EventTypes';

/** 目标扩展的四阶段 */
const TARGET_PHASES = [
    TimingName.UseCardAssignTarget,
    TimingName.UseCardBecomeTarget,
    TimingName.UseCardAssignTargetAfter,
    TimingName.UseCardBecomeTargetAfter,
] as const;

// ===== UseCardEvent =====

/**
 * 牌的使用事件（统一类，替代旧项目三子类）。
 *
 * 关键设计：目标扩展与使用结算采用**生成式**时序——
 * 每个时机完成后根据当前状态即时生成下一个时机。
 *
 * 执行流程（基本牌/普通锦囊）：
 *   预结算固定段：Declare → DeclareAfter → ChooseTarget → Used（重排序）
 *   目标扩展段（生成式）：逐阶段 × 逐个当前目标
 *     - 中途加入：从当前阶段开始，不补已过阶段
 *     - 中途移除：跳过剩余阶段
 *   Ready（移除死者→重排序→最终目标列表）
 *   结算段（生成式轮询）：按 effectTimes 逐轮结算
 *     - 已有 invalid → 跳过全部
 *     - EffectStart 期间 invalid → 跳过后续
 *     - EffectBefore 期间 offset → Offset + 跳过 Effect/EffectAfter
 *     - 否则 → Effect → EffectAfter
 *   结束后固定段：End1 → End2 → End3（虚拟牌消失）
 */
export class UseCardEvent extends EventProcess<EventType.UseCard> {
    /** 目标自增 ID——仅用于同玩家时稳定排序，不回写 */
    private _targetId: number = 0;

    /** 各目标已完成的目标扩展阶段（index → 已完成时机名集合） */
    private _doneTargetPhases: Map<number, Set<string>> = new Map();

    constructor(room: Room, data: UseCardEventData) {
        super(room, EventType.UseCard, data);
        data.autoSort = data.autoSort ?? true;
        data.clockwise = data.clockwise ?? false;
        data.effectTimes = data.effectTimes ?? 1;
        data.isFirstTarget = data.isFirstTarget ?? true;
        if (!data.targetList) data.targetList = [];

        // 从 targets 构建 TargetEntry（须在 _buildTriggers/check 之前）
        if (this.targetList.length === 0 && this.targets.length > 0) {
            const effTimes = data.effectTimes;
            for (const target of this.targets) {
                this.targetList.push({
                    index: ++this._targetId,
                    target,
                    effectTimes: effTimes,
                });
            }
        }
        if (data.autoSort) {
            this._sortTargets();
        }

        this._buildTriggers();
    }

    // ===== 便利访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get card(): VirtualCard {
        return this.eventData.card;
    }

    get targets(): Player[] {
        return this.eventData.targets;
    }

    get targetList(): TargetEntry[] {
        return this.eventData.targetList!;
    }

    // ===== Timing 预构建（固定段）=====

    private _buildTriggers(): void {
        if (this.eventData.responseTo) {
            // 响应路径（目标是牌）：仅 UseCardUsed（前置 Declare 移动卡牌）
            this.eventTriggers = [
                createTiming(TimingName.UseCardUsed, [
                    this.bindWithMark(this._onUseCardDeclare),
                ]),
            ];
        } else {
            this.eventTriggers = [
                createTiming(TimingName.UseCardDeclare, [
                    this.bindWithMark(this._onUseCardDeclare),
                ]),
                createTiming(TimingName.UseCardDeclareAfter),
                createTiming(TimingName.UseCardChooseTarget),
                createTiming(TimingName.UseCardUsed, [
                    this.bindWithMark(this._onUseCardUsed),
                ]),
            ];
        }

        this.endTriggers = [
            createTiming(TimingName.UseCardEnd1),
            createTiming(TimingName.UseCardEnd2),
            createTiming(TimingName.UseCardEnd3, undefined, [
                this.bindWithMark(this._onUseCardEnd3),
            ]),
        ];
    }

    // ===== 当前正在结算的目标（供 needUseCard 确定响应者）=====

    private _settlingTarget?: Player;

    // ===== 生命周期 =====

    protected async init(): Promise<void> {
        await super.init();
    }

    check(): boolean {
        if (this.eventData.responseTo) {
            return !!this.card && !this.card.destroyed;
        }
        return this.targetList.length > 0 && !!this.card && !this.card.destroyed;
    }

    checkEvent(): boolean {
        if (this.eventData.responseTo) return !this.room.isEnding;
        return !this.room.isEnding && this.targetList.length > 0;
    }

    // ===== 主执行循环（生成式）=====

    async exec(): Promise<this> {
        if (!this.check()) return this;
        await this.init();

        // ===== 响应路径（目标是牌）=====
        if (this.eventData.responseTo) {
            await this._runFixedTriggers();
            if (this.isEnd || this.isComplete) return this._finish();
            await this._applyResponse();
            return this._finish();
        }

        // ===== Part 1: 预结算固定段 =====
        await this._runFixedTriggers();
        if (this.isEnd || this.isComplete) return this._finish();

        // ===== Part 2: 目标扩展段（生成式）=====
        await this._runTargetPhases();

        // Ready
        await this._runTiming(
            createTiming(TimingName.UseCardReady, [
                this.bindWithMark(this._onUseCardReady),
            ]),
        );
        if (this.isEnd || this.isComplete || this.targetList.length === 0) {
            return this._finish();
        }

        // ===== Part 3: 结算段（生成式轮询）=====
        await this._runSettleLoop();

        // ===== Part 4: 结束后固定段 =====
        return this._finish();
    }

    /** 执行固定段的 eventTriggers */
    private async _runFixedTriggers(): Promise<void> {
        let step = 0;
        while (
            !this.room.isEnding &&
            !this.isComplete &&
            this.eventTriggers.length > 0
        ) {
            if (!this.checkEvent()) break;
            step++;
            await this.triggerFunc(this.eventTriggers.shift()!, step);
        }
    }

    /** 执行单个 timing */
    private async _runTiming(timing: ReturnType<typeof createTiming>): Promise<void> {
        if (this.isComplete || this.room.isEnding) return;
        await this.triggerFunc(timing);
    }

    /** 完成事件：执行 endTriggers + processCompleted */
    private async _finish(): Promise<this> {
        this.isEnd = true;
        let step = 0;
        while (!this.isComplete && this.endTriggers.length > 0) {
            step++;
            await this.triggerFunc(this.endTriggers.shift()!, step);
        }
        this.isComplete = true;

        this.room.logger.info(`[exec] complete`, {
            roomId: this.room.state.roomId,
            playerId: this.player?.playerId,
            event: `${this.type}:${this.id}.exec`,
        });

        await this.processCompleted();
        return this;
    }

    // ===== 目标扩展段（生成式）=====

    /**
     * 逐阶段 × 逐个当前目标，生成式执行四阶段。
     * 每个阶段的第一个目标设置 isFirstTarget=true。
     */
    private async _runTargetPhases(): Promise<void> {
        for (const phaseName of TARGET_PHASES) {
            const pending = this.targetList.filter(
                (e) => !this._hasDonePhase(e, phaseName),
            );
            let isFirst = true;
            for (const entry of pending) {
                if (!this.targetList.includes(entry)) continue;
                if (this.isComplete || this.room.isEnding) return;

                this.eventData.isFirstTarget = isFirst;
                isFirst = false;

                const before = phaseName === TimingName.UseCardBecomeTarget
                    ? [this.bindWithMark(this._onBecomeTarget)]
                    : undefined;

                await this._runTiming(createTiming(phaseName, before));
                this._markDonePhase(entry, phaseName);
            }

            // BecomeTarget 全部完成后定型"对XX使用过此牌"
            if (phaseName === TimingName.UseCardBecomeTarget) {
                this._finalizeBecomeTarget();
            }
        }
    }

    private _hasDonePhase(entry: TargetEntry, phase: string): boolean {
        return this._doneTargetPhases.get(entry.index)?.has(phase) ?? false;
    }

    private _markDonePhase(entry: TargetEntry, phase: string): void {
        let set = this._doneTargetPhases.get(entry.index);
        if (!set) {
            set = new Set();
            this._doneTargetPhases.set(entry.index, set);
        }
        set.add(phase);
    }

    /** BecomeTarget 阶段全部完成后定型"对XX使用过此牌" */
    private _finalizeBecomeTarget(): void {
        // 所有目标的 BecomeTarget 已完成——此时定型使用关系
    }

    // ===== 结算段（生成式轮询）=====

    /**
     * 按 effectTimes 轮询结算。
     * 每轮的第一个目标（即使 invalid）设置 isFirstTarget=true。
     */
    private async _runSettleLoop(): Promise<void> {
        // 持续轮询直到所有目标的 settleCount >= effectTimes
        let firstRound = true;
        while (!this.isComplete && !this.room.isEnding) {
            let anySettled = false;
            for (const entry of this.targetList) {
                if (this.isComplete || this.room.isEnding) return;

                const max = entry.effectTimes ?? 1;
                if ((entry.settleCount || 0) >= max) continue;

                this.eventData.isFirstTarget = firstRound;
                firstRound = false;
                anySettled = true;

                await this._settleOneTarget(entry);
            }
            if (!anySettled) break; // 全部结算完毕
        }
    }

    /** 结算单个目标的一次 */
    private async _settleOneTarget(entry: TargetEntry): Promise<void> {
        // 循环点 A：已有 invalid → 跳过全部
        if (entry.invalid) {
            entry.settleCount = (entry.settleCount || 0) + 1;
            return;
        }

        // EffectStart
        await this._runTiming(createTiming(TimingName.UseCardEffectStart));

        // EffectStart 期间被标记 invalid → 跳过后续
        if (entry.invalid) {
            entry.settleCount = (entry.settleCount || 0) + 1;
            return;
        }

        // EffectBefore（响应窗口）—— needUseCard 通过 _settlingTarget 确定响应者
        this._settlingTarget = entry.target;
        await this._runTiming(createTiming(TimingName.UseCardEffectBefore));
        this._settlingTarget = undefined;

        // EffectBefore 期间被 offset
        if (entry.offset) {
            await this._runTiming(createTiming(TimingName.UseCardOffset));
            entry.settleCount = (entry.settleCount || 0) + 1;
            return;
        }

        // Effect
        await this._runTiming(createTiming(TimingName.UseCardEffect));

        // EffectAfter（执行牌面效果）
        await this._runTiming(
            createTiming(TimingName.UseCardEffectAfter, undefined, [
                this.bindWithMark((_r: Room, _d: any) => this._onEffectAfter(entry)),
            ]),
        );

        entry.settleCount = (entry.settleCount || 0) + 1;
    }

    // ===== 固定操作回调 =====

    private async _onUseCardDeclare(
        _room: Room,
        _data: UseCardEventData,
    ): Promise<void> {
        const card = this.card;
        if (card && card.hasSubCards()) {
            const subcards = [...card.subcards];
            await this.room.event.moveCards(
                [{ cards: subcards, toArea: AreaType.Processing, reason: 'use' }],
                { source: this },
            );
        }
    }

    private async _onUseCardUsed(
        _room: Room,
        _data: UseCardEventData,
    ): Promise<void> {
        this._sortTargets();
    }

    /** BecomeTarget before（每个目标）：时机钩子，实际定型在 _finalizeBecomeTarget */
    private _onBecomeTarget = this.bindWithMark(
        async (_r: Room, _d: any): Promise<void> => {
            // 定型由 _finalizeBecomeTarget 统一处理
        },
    );

    private async _onUseCardReady(
        _room: Room,
        _data: UseCardEventData,
    ): Promise<void> {
        this.eventData.targetList = this.targetList.filter((e) => e.target.alive);
        if (this.targetList.length > 0) {
            this._sortTargets();
        }
    }

    /**
     * 响应路径：对被响应的牌设置 offset。
     * 在 eventStack 中找到被响应的 UseCardEvent → 通过 _settlingTarget 定位当前结算条目。
     */
    private async _applyResponse(): Promise<void> {
        const responseTo = this.eventData.responseTo!;
        for (let i = this.room.eventStack.length - 1; i >= 0; i--) {
            const ev = this.room.eventStack[i];
            if (
                ev instanceof UseCardEvent &&
                ev !== this &&
                ev.card === responseTo
            ) {
                // _settlingTarget 由 _settleOneTarget 在 EffectBefore 前设置
                const settlingTarget = (ev as any)._settlingTarget as Player | undefined;
                if (settlingTarget) {
                    ev.offsetTarget(settlingTarget, this);
                }
                return;
            }
        }
    }

    private async _onEffectAfter(entry: TargetEntry): Promise<void> {
        const cardUse = this.room.carduses.get(this.card.name);
        if (cardUse) {
            await cardUse.effect(this.room, entry.target, this.eventData);
        }
    }

    private async _onUseCardEnd3(
        _room: Room,
        _data: UseCardEventData,
    ): Promise<void> {
        const card = this.card;
        if (card) {
            this.room.vcard.destroy(card);
        }
    }

    // ===== 目标列表管理 =====

    /**
     * 对目标列表排序。
     * - 从当前回合角色（或其下家）开始
     * - 逆时针（默认）：座位升序偏移
     * - 顺时针：座位降序偏移
     * - 同玩家 → index 升序
     */
    private _sortTargets(): void {
        const clockwise = this.eventData.clockwise ?? false;
        const players = this.room.players;
        if (players.length === 0) return;

        const turnPlayer = this.room.currentTurn?.player;
        const startSeat = turnPlayer?.seat ?? 1;
        const maxSeat = players.length;

        const seatOrder = new Map<number, number>();
        for (const p of players) {
            const offset = clockwise
                ? (startSeat - p.seat + maxSeat) % maxSeat
                : (p.seat - startSeat + maxSeat) % maxSeat;
            seatOrder.set(p.seat, offset);
        }

        this.targetList.sort((a, b) => {
            const orderA = seatOrder.get(a.target.seat) ?? 0;
            const orderB = seatOrder.get(b.target.seat) ?? 0;
            if (orderA !== orderB) return orderA - orderB;
            return a.index - b.index;
        });
    }

    /** 转移目标：替换目标玩家 + 重排序 */
    changeTarget(oldTarget: Player, newTarget: Player): void {
        const entry = this.targetList.find((e) => e.target === oldTarget);
        if (!entry) return;
        entry.target = newTarget;
        if (this.eventData.autoSort) {
            this._sortTargets();
        }
    }

    /** 新增目标：构建 TargetEntry 加入列表 + 重排序 */
    addTarget(target: Player): TargetEntry {
        const entry: TargetEntry = {
            index: ++this._targetId,
            target,
            effectTimes: this.eventData.effectTimes ?? 1,
        };
        this.targetList.push(entry);
        if (this.eventData.autoSort) {
            this._sortTargets();
        }
        return entry;
    }

    /** 取消目标：移出列表 + 终止当前时机 */
    cancelTarget(target: Player): void {
        const idx = this.targetList.findIndex((e) => e.target === target);
        if (idx < 0) return;
        this.targetList.splice(idx, 1);
        this.triggerable = false;
    }

    /** 标记无效（跳过生效时机） */
    markInvalid(target: Player): void {
        const entry = this.targetList.find((e) => e.target === target);
        if (!entry) return;
        entry.invalid = true;
    }

    /** 标记被抵消（M3 接线） */
    offsetTarget(target: Player, offsetEvent: EventProcess): void {
        const entry = this.targetList.find((e) => e.target === target);
        if (!entry) return;
        entry.offset = offsetEvent;
    }
}
