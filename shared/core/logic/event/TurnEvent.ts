import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type { PhaseEventData, Timing, TimingTrigger, TurnEventData } from '../../types/EventTypes';
import { Phase } from '../../types/PlayerTypes';

// ===== 回合事件 =====

/**
 * 回合事件。
 * 执行流程：TurnStartBefore（休整/翻面处理）→ TurnStart → TurnStartAfter（生成阶段）
 *   → [各阶段 PhaseEvent 依次执行] → TurnEnd（清 inturn/酒状态）→ TurnEndAfter
 */
export class TurnEvent extends EventProcess<EventType.Turn> {
    constructor(room: Room, data: TurnEventData) {
        super(room, EventType.Turn, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }
    set player(v: Player) {
        this.eventData.player = v;
    }

    get turnId(): number {
        return this.eventData.turnId;
    }
    set turnId(v: number) {
        this.eventData.turnId = v;
    }

    get isExtraTurn(): boolean {
        return this.eventData.isExtraTurn;
    }
    set isExtraTurn(v: boolean) {
        this.eventData.isExtraTurn = v;
    }

    get isSkipped(): boolean {
        return this.eventData.isSkipped;
    }

    get phases(): TurnEventData['phases'] {
        return this.eventData.phases;
    }

    get skippedPhases(): Phase[] {
        return this.eventData.skippedPhases;
    }

    get isRoundStart(): boolean {
        return this.eventData.isRoundStart;
    }
    set isRoundStart(v: boolean) {
        this.eventData.isRoundStart = v;
    }

    get isRoundEnd(): boolean {
        return this.eventData.isRoundEnd;
    }
    set isRoundEnd(v: boolean) {
        this.eventData.isRoundEnd = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.TurnStartBefore, undefined, [
                this.bindWithMark(this._onTurnStartBefore),
            ]),
            createTiming(TimingName.TurnStart),
            createTiming(TimingName.TurnStartAfter, undefined, [
                this.bindWithMark(this._onTurnStarted),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.TurnEnd, undefined, [
                this.bindWithMark(this._onTurnEnd),
            ]),
            createTiming(TimingName.TurnEndAfter),
        ];
    }

    // ===== TurnStartBefore 回调 =====

    private async _onTurnStartBefore(_room: Room, _data: TurnEventData): Promise<void> {
        const player = this.player;

        // 休整逻辑（rest>0 减扣；归零复活，未归零跳过本回合）
        if (player.rest > 0) {
            player.rest = player.rest - 1;
            if (player.rest === 0) {
                player.death = false;
                // TODO(R5): 复活动画/战报
            } else {
                this._skipTurn();
                return;
            }
        }

        // 翻面逻辑：跳过当前回合，翻回正面
        if (player.skip) {
            player.skip = false;
            this._skipTurn();
            return;
        }

        // 正常回合
        player.inturn = true;
        // TODO(R9): 回合开始战报
    }

    // ===== TurnStartAfter 回调 =====

    private async _onTurnStarted(_room: Room, _data: TurnEventData): Promise<void> {
        await this._generatePhases();
    }

    // ===== TurnEnd 回调 =====

    private async _onTurnEnd(_room: Room, _data: TurnEventData): Promise<void> {
        this.player.inturn = false;

        // 规则：酒效果持续到回合结束，全体清零
        for (const p of this.room.players.values()) {
            if (p.getMark('jiuState') !== 0) {
                p.setMark('jiuState', 0);
            }
        }
    }

    // ===== 阶段执行 =====

    private async _generatePhases(): Promise<void> {
        const skipped = new Set(this.skippedPhases);
        for (let i = 0; i < this.phases.length && !this.isEnd; i++) {
            const phaseItem = this.phases[i];
            if (skipped.has(phaseItem.phase)) continue;

            if (!phaseItem.player) {
                phaseItem.player = this.player;
            }
            const executor = phaseItem.player;

            await this.room.delay(0.2);

            executor.phase = phaseItem.phase;

            const phaseEvent = new PhaseEvent(this.room, {
                phaseId: 0,
                player: executor,
                phase: phaseItem.phase,
                isExtraPhase: phaseItem.isExtraPhase,
                drawCount: phaseItem.phase === Phase.Draw ? 2 : 0,
            });
            await phaseEvent.exec();

            executor.phase = Phase.None;
        }
    }

    // ===== 公共方法 =====

    async processCompleted(): Promise<void> {
        await super.processCompleted();
        // TODO(R7): 3v3 模式回合标记
    }

    /** 跳过指定阶段（或当前阶段） */
    async skipPhase(phase?: Phase | Phase[]): Promise<void> {
        const current = this._findCurrentPhaseEvent();

        if (phase !== undefined) {
            const phases = Array.isArray(phase) ? phase : [phase];
            if (phases.length > 0 && phases.every((v) => v !== undefined && !this.skippedPhases.includes(v))) {
                this.skippedPhases.push(...phases);
            }
        }

        if (current) {
            await current.skip();
        }
    }

    /** 结束当前回合（含跳过剩余阶段） */
    async end(): Promise<this> {
        await super.end();
        await this.skipPhase();
        return this;
    }

    isNotSkip(phase: Phase): boolean {
        return !this.skippedPhases.includes(phase);
    }

    // ===== 内部方法 =====

    private _skipTurn(): void {
        this.isEnd = true;
        this.isComplete = true;
        this.eventData.isSkipped = true;
    }

    private _findCurrentPhaseEvent(): PhaseEvent | undefined {
        return this.room.currentPhase;
    }
}

// ===== 阶段事件 =====

/**
 * 阶段事件。
 * 每个阶段 3 个 eventTriggers + 1 个 endTrigger：{Phase}StartBefore → {Phase}Start → {Phase} → {Phase}End
 * 摸牌阶段的 DrawPhaseStart1/Start2 提供两次修正摸牌数的时机。
 */
export class PhaseEvent extends EventProcess<EventType.Phase> {
    /** draw_start1 归零后锁定，阻止 draw_start2 再修改 */
    private _drawCountLocked: boolean = false;

    constructor(room: Room, data: PhaseEventData) {
        super(room, EventType.Phase, data);
        if (data.drawCount === undefined || data.drawCount === null) {
            data.drawCount = 2;
        }
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get phase(): Phase {
        return this.eventData.phase;
    }

    get isExtraPhase(): boolean {
        return this.eventData.isExtraPhase;
    }

    get drawCount(): number {
        return this.eventData.drawCount;
    }
    set drawCount(value: number) {
        if (this._drawCountLocked) return;
        if (value < 0) value = 0;
        this.eventData.drawCount = value;
    }

    /** draw_start1 类效果：额定摸牌数改为 0，锁定后续 draw_start2 修改 */
    zeroDrawCount(): void {
        this.eventData.drawCount = 0;
        this._drawCountLocked = true;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        const entry = this._phaseTiming(this.phase);
        this.eventTriggers = entry.triggers.map((name) => ({ name }) as Timing<TimingTrigger>);
        this.endTriggers = [{ name: entry.end } as Timing<TimingTrigger>];
    }
    private _phaseTiming(phase: Phase): { triggers: TimingName[]; end: TimingName } {
        switch (phase) {
            case Phase.Ready:
                return {
                    triggers: [
                        TimingName.ReadyPhaseStartBefore,
                        TimingName.ReadyPhaseStart,
                        TimingName.ReadyPhase,
                    ],
                    end: TimingName.ReadyPhaseEnd,
                };
            case Phase.Judge:
                return {
                    triggers: [
                        TimingName.JudgePhaseStartBefore,
                        TimingName.JudgePhaseStart,
                        TimingName.JudgePhase,
                    ],
                    end: TimingName.JudgePhaseEnd,
                };
            case Phase.Draw:
                return {
                    triggers: [
                        TimingName.DrawPhaseStartBefore,
                        TimingName.DrawPhaseStart1,
                        TimingName.DrawPhaseStart2,
                        TimingName.DrawPhase,
                    ],
                    end: TimingName.DrawPhaseEnd,
                };
            case Phase.Play:
                return {
                    triggers: [
                        TimingName.PlayPhaseStartBefore,
                        TimingName.PlayPhaseStart,
                        TimingName.PlayPhase,
                    ],
                    end: TimingName.PlayPhaseEnd,
                };
            case Phase.Drop:
                return {
                    triggers: [
                        TimingName.DiscardPhaseStartBefore,
                        TimingName.DiscardPhaseStart,
                        TimingName.DiscardPhase,
                    ],
                    end: TimingName.DiscardPhaseEnd,
                };
            case Phase.End:
                return {
                    triggers: [
                        TimingName.EndPhaseStartBefore,
                        TimingName.EndPhaseStart,
                        TimingName.EndPhase,
                    ],
                    end: TimingName.EndPhaseEnd,
                };
            default:
                return { triggers: [], end: TimingName.ReadyPhaseEnd };
        }
    }

    // ===== 公共方法 =====

    checkEvent(): boolean {
        return this.player.alive;
    }

    /** 跳过当前阶段 */
    async skip(): Promise<this> {
        this.isComplete = true;
        this.triggerable = false;

        if (!this.isExtraPhase && this.room.currentTurn) {
            this.room.currentTurn.skippedPhases.push(this.phase);
        }
        return this;
    }

    isExecutor(player: Player, phase: Phase = this.phase): boolean {
        return this.player === player && this.phase === phase;
    }

    // ===== 流程回调（摸牌阶段） =====

    // TODO(R1): DrawPhase 阶段摸牌（按 drawCount 经 room.draw 执行）
}
