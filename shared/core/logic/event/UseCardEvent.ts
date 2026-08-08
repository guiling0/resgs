import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { VirtualCard } from '../../entity/VirtualCard';
import { AreaType } from '../../types/AreaTypes';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import { CardSubType, CardType } from '../../types/CardTypes';
import type { MoveCardData, TargetEntry, UseCardEventData } from '../../types/EventTypes';
import { sgs } from '../../sgs';

/** 目标扩展的四阶段 */
const TARGET_PHASES = [
    TimingName.UseCardAssignTarget,
    TimingName.UseCardBecomeTarget,
    TimingName.UseCardAssignTargetAfter,
    TimingName.UseCardBecomeTargetAfter,
] as const;

/** 合法性检测的异样规则类型（成为目标的例外条件） */
export type TargetValidType = 'unlimitedDistance';

/**
 * 牌的使用事件
 * @rules events/use-card
 * @description 采用生成式时序（每个时机完成后根据当前状态即时生成下一个）。三种使用路径：正常使用（完整序列：Declare → DeclareAfter → ChooseTarget → Used → 目标扩展段 → Ready → 结算段 → End）；目标是牌（无目标扩展段）；无使用者直接结算延时锦囊效果（仅结算段）。Ready 移除死者并安置装备/延时锦囊牌
 */
export class UseCardEvent extends EventProcess<EventType.UseCard> {
    /** 目标自增 id——仅用于同玩家时稳定排序，不回写 */
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

    /**
     * 使用者
     * @rules terms/description-terms/user
     * @description 使用/打出者即使用/打出此牌的角色
     */
    get player(): Player | undefined {
        return this.eventData.player;
    }

    get card(): VirtualCard {
        return this.eventData.card;
    }

    get targets(): Player[] {
        return this.eventData.targets;
    }

    /**
     * 目标列表
     * @rules terms/description-terms/target
     * @description 此牌的目标即此牌的目标列表里的所有目标
     */
    get targetList(): TargetEntry[] {
        return this.eventData.targetList!;
    }

    /**
     * 目标对应的角色数
     * @rules terms/value-terms/targetCount
     * @description 目标列表中不同角色的数量（按角色去重）
     */
    get targetCount(): number {
        return new Set(this.targetList.map((e) => e.target)).size;
    }

    // ===== Timing 预构建（固定段） =====

    private _buildTriggers(): void {
        if (this.eventData.responseTo) {
            // 响应路径（目标是牌）：无目标扩展段（声明使用牌后/选择目标后/指定目标/成为目标及其后置时机不触发）
            this.eventTriggers = [
                createTiming(TimingName.UseCardDeclare, [
                    this.bindWithMark(this._onUseCardDeclare),
                ]),
                createTiming(TimingName.UseCardUsed, [
                    this.bindWithMark(this._onUseCardUsed),
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

    // ===== 当前正在结算的目标 =====

    private _settlingTarget?: Player;

    // ===== 生命周期 =====

    check(): boolean {
        if (this.eventData.responseTo || this.eventData.directSettle) {
            return !!this.card && !this.card.destroyed;
        }
        return this.targetList.length > 0 && !!this.card && !this.card.destroyed;
    }

    checkEvent(): boolean {
        if (this.eventData.responseTo || this.eventData.directSettle) return !this.room.isEnding;
        return !this.room.isEnding && this.targetList.length > 0;
    }

    // ===== 主执行循环（生成式） =====

    async exec(): Promise<this> {
        if (!this.check()) return this;
        await this.init();

        // ===== ③ 无使用者直接结算（延时锦囊效果）：仅结算段时机 =====
        if (this.eventData.directSettle) {
            await this._runSettleLoop();
            return this._finish();
        }

        // ===== ② 响应路径（目标是牌）：无目标扩展段 =====
        if (this.eventData.responseTo) {
            await this._runFixedTriggers();
            if (this.isEnd || this.isComplete) return this._finish();
            await this._runReady();
            if (this.isEnd || this.isComplete || this.targetList.length === 0) {
                return this._finish();
            }
            await this._runSettleLoop();
            await this._applyResponse();
            return this._finish();
        }

        // ===== Part 1: 预结算固定段 =====
        await this._runFixedTriggers();
        if (this.isEnd || this.isComplete) return this._finish();

        // ===== Part 2: 目标扩展段（生成式） =====
        await this._runTargetPhases();

        // Ready
        await this._runReady();
        if (this.isEnd || this.isComplete || this.targetList.length === 0) {
            return this._finish();
        }

        // ===== Part 3: 结算段（生成式轮询） =====
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

    /** 执行 Ready 时机：移除死者、重排序、安置装备/延时锦囊 */
    private async _runReady(): Promise<void> {
        await this._runTiming(
            createTiming(TimingName.UseCardReady, [
                this.bindWithMark(this._onUseCardReady),
            ]),
        );
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

        this.room.logger.info(
            `[exec] complete`,
            { roomId: this.room.roomId, playerId: this.player?.playerId, event: `${this.type}:${this.id}.exec` },
        );

        await this.processCompleted();
        return this;
    }

    // ===== 目标扩展段（生成式） =====

    /** 逐阶段 × 逐个当前目标，生成式执行四阶段。每阶段第一个目标设置 isFirstTarget=true */
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

                const before =
                    phaseName === TimingName.UseCardBecomeTarget
                        ? [this.bindWithMark(this._onBecomeTarget)]
                        : undefined;

                await this._runTiming(createTiming(phaseName, before));
                this._markDonePhase(entry, phaseName);
            }

            // BecomeTarget 全部完成后定型「对XX使用过此牌」
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

    /** BecomeTarget 阶段全部完成后定型使用关系 */
    private _finalizeBecomeTarget(): void {
        // TODO(R3): 标记「对XX使用过此牌」（技能判定用）
    }

    // ===== 结算段（生成式轮询） =====

    /** 按 effectTimes 轮询结算。每轮的第一个目标设置 isFirstTarget=true */
    private async _runSettleLoop(): Promise<void> {
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
        // 已有 invalid → 跳过全部
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

        // EffectBefore（响应窗口）
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
                this.bindWithMark((_r: Room, _d: unknown) => this._onEffectAfter(entry)),
            ]),
        );

        entry.settleCount = (entry.settleCount || 0) + 1;
    }

    // ===== 固定操作回调 =====

    /** UseCardDeclare 之前：实体牌移入处理区 */
    private async _onUseCardDeclare(_room: Room, _data: UseCardEventData): Promise<void> {
        const card = this.card;
        if (card && card.hasSubCards()) {
            const subcards = [...card.subcards];
            await this.room.event.moveCards(
                [{ cards: subcards, toArea: AreaType.Processing, reason: 'use' }],
                { source: this },
            );
        }
    }

    /** UseCardUsed 之前：重排序目标 */
    private async _onUseCardUsed(_room: Room, _data: UseCardEventData): Promise<void> {
        this._sortTargets();
    }

    /** BecomeTarget before（每个目标）时机钩子 */
    private _onBecomeTarget = this.bindWithMark(async (_r: Room, _d: unknown): Promise<void> => {
        // 定型逻辑由统一入口处理
    });

    /** UseCardReady 之前：移除死者、重排序；装备牌/延时锦囊牌安置后结束 */
    private async _onUseCardReady(_room: Room, _data: UseCardEventData): Promise<void> {
        // 移除已死亡目标并重排序，形成最终目标列表
        this.eventData.targetList = this.targetList.filter((e) => e.target.alive);
        if (this.targetList.length > 0) {
            this._sortTargets();
        }
        // 目标列表没有任何角色：使用事件结束
        if (this.targetList.length === 0) {
            await this.end();
            return;
        }
        // 装备牌：实体牌置入第一个目标的装备区后结束
        if (this.card.type === CardType.Equip) {
            await this._equipToFirstTarget();
            await this.end();
            return;
        }
        // 延时锦囊牌：实体牌置入第一个目标的判定区（或同名牌时结束）
        if (this.card.subtype === CardSubType.DelayedScroll) {
            await this._delayedScrollToFirstTarget();
            await this.end();
            return;
        }
        // 基本牌/非延时锦囊：继续后续结算流程
    }

    /** 装备牌：将实体牌置入第一个目标的装备区（同栏已有装备一并弃置，经一个移动事件处理） */
    private async _equipToFirstTarget(): Promise<void> {
        const target = this.targetList[0].target;
        const cards = [...this.card.subcards];
        if (cards.length === 0) return;
        const datas: MoveCardData[] = [];
        // 目标装备区有已记录的同类型装备：将其实体牌置入弃牌堆
        const subtype = sgs.carddatas.get(this.card.name)?.subtype;
        const oldEquip =
            subtype !== undefined
                ? target.equips.find((e) => sgs.carddatas.get(e.name)?.subtype === subtype)
                : undefined;
        if (oldEquip) {
            const oldCards = this.room.getCards(oldEquip.subcards);
            if (oldCards.length > 0) {
                datas.push({ cards: oldCards, toArea: AreaType.Discard, reason: 'equip' });
            }
        }
        // 新装备实体牌置入目标装备区
        datas.push({ cards, toArea: target.getAreaId(AreaType.Equip), reason: 'equip' });
        await this.room.event.moveCards(datas, { source: this });
    }

    /** 延时锦囊牌：目标判定区无同名牌时置入判定区；有同名牌则结束（实体牌经处理区清理时消失） */
    private async _delayedScrollToFirstTarget(): Promise<void> {
        const target = this.targetList[0].target;
        // 目标判定区已有同名牌：使用事件结束，虚拟牌经处理区清理时消失
        if (target.judgeCards.some((j) => j.name === this.card.name)) {
            return;
        }
        const cards = [...this.card.subcards];
        if (cards.length === 0) return;
        await this.room.event.moveCards(
            [{ cards, toArea: target.getAreaId(AreaType.Judge), reason: 'use' }],
            { source: this },
        );
    }

    /** 响应路径：对被响应的牌设置 offset */
    private async _applyResponse(): Promise<void> {
        const responseTo = this.eventData.responseTo!;
        for (let i = this.room.eventStack.length - 1; i >= 0; i--) {
            const ev = this.room.eventStack[i];
            if (ev instanceof UseCardEvent && ev !== this && ev.card === responseTo) {
                const settlingTarget = (ev as unknown as { _settlingTarget?: Player })._settlingTarget;
                if (settlingTarget) {
                    ev.offset(settlingTarget, this);
                }
                return;
            }
        }
    }

    /** EffectAfter 之后：执行牌面效果（经 carduses 定义） */
    private async _onEffectAfter(entry: TargetEntry): Promise<void> {
        const cardUse = this.room.carduses.get(this.card.name);
        if (cardUse) {
            await cardUse.effect(this.room, entry.target, this.eventData);
        }
    }

    /** UseCardEnd3 之后：虚拟牌消失（装备牌与延时锦囊牌的虚拟牌由移动事件安置，不销毁） */
    private async _onUseCardEnd3(_room: Room, _data: UseCardEventData): Promise<void> {
        const card = this.card;
        if (!card) return;
        if (card.type === CardType.Equip) return;
        if (card.subtype === CardSubType.DelayedScroll) return;
        this.room.destroyVirtualCard(card);
    }

    // ===== 目标列表管理 =====

    /**
     * 对目标列表排序。
     * - 从当前回合角色（或其下家）开始逆时针（默认）/ 顺时针
     * - 同玩家 → index 升序
     */
    private _sortTargets(): void {
        const clockwise = this.eventData.clockwise ?? false;
        const players = [...this.room.players.values()];
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

    /**
     * 转移目标：取消此目标并生成与角色 B 具有对应关系的新的目标加入目标列表 + 重排序
     * @rules terms/description-terms/zhuanyi
     * @description 转移目标即取消原目标，并将此牌的目标改为另一名角色
     * @param oldTarget 原目标角色
     * @param newTarget 新目标角色
     */
    transfer(oldTarget: Player, newTarget: Player): void {
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

    /**
     * 也成为目标：将玩家列表作为此牌的合法目标加入目标列表
     * @rules terms/description-terms/yechengweimubiao
     * @description 对玩家列表进行此牌的合法性检测（距离条件可经 type 豁免），通过检测且不在当前目标列表中的玩家以 addTarget 加入
     * @param players 新目标玩家列表
     * @param type 合法性检测的异样规则类型（如无视距离限制）
     */
    becomeTarget(players: Player[], type?: TargetValidType): void {
        const cardUse = this.room.carduses.get(this.card.name);
        if (!cardUse || !this.player) return;
        const validTargets = cardUse.target(this.room, this.player, this.card);
        for (const p of players) {
            // 合法性检测：非此牌的合法目标不能成为目标
            if (!validTargets.includes(p)) continue;
            // 距离条件检测（异样规则类型可豁免）
            if (
                type !== 'unlimitedDistance' &&
                cardUse.distanceCondition &&
                !cardUse.distanceCondition(this.room, this.player, p, this.card)
            ) {
                continue;
            }
            // 已在目标列表中不重复加入
            if (this.targetList.some((e) => e.target === p)) continue;
            this.addTarget(p);
        }
    }

    /**
     * 取消目标：移出目标列表并终止当前时机
     * @rules terms/resolution-terms/cancel
     * @description 取消是「在响应过程中将目标移出目标列表并终止此时机」的操作
     * @param target 被取消的目标
     */
    cancel(target: Player): void {
        const idx = this.targetList.findIndex((e) => e.target === target);
        if (idx < 0) return;
        this.targetList.splice(idx, 1);
        this.triggerable = false;
    }

    /**
     * 标记无效：此牌对该目标无效（跳过生效时机）
     * @rules terms/resolution-terms/invalid
     * @description 无效是「一张牌对一个目标无效，即不会生成对此目标生效的四个时机」的标记
     * @param target 被标记无效的目标
     */
    invalid(target: Player): void {
        const entry = this.targetList.find((e) => e.target === target);
        if (!entry) return;
        entry.invalid = true;
    }

    /** 标记被抵消 */
    offset(target: Player, offsetEvent: EventProcess): void {
        const entry = this.targetList.find((e) => e.target === target);
        if (!entry) return;
        entry.offset = offsetEvent;
    }
}
