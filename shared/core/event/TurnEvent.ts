import { Room } from '../room/Room';
import { Phase } from '../player/PlayerTypes';
import { Player } from '../player/Player';
import { EventProcess } from './EventProcess';
import {
    EventType,
    PhaseEventData,
    Timing,
    TimingName,
    TurnEventData,
} from './EventTypes';

// ===== PhaseEvent 静态 Timing 映射表 =====

const PHASE_TIMING: Record<
    number,
    { triggers: TimingName[]; end: TimingName }
> = {
    [Phase.Ready]: {
        triggers: [
            TimingName.ReadyPhaseStartBefore,
            TimingName.ReadyPhaseStart,
            TimingName.ReadyPhase,
        ],
        end: TimingName.ReadyPhaseEnd,
    },
    [Phase.Judge]: {
        triggers: [
            TimingName.JudgePhaseStartBefore,
            TimingName.JudgePhaseStart,
            TimingName.JudgePhase,
        ],
        end: TimingName.JudgePhaseEnd,
    },
    [Phase.Draw]: {
        triggers: [
            TimingName.DrawPhaseStartBefore,
            TimingName.DrawPhaseStart1,
            TimingName.DrawPhaseStart2,
            TimingName.DrawPhase,
        ],
        end: TimingName.DrawPhaseEnd,
    },
    [Phase.Play]: {
        triggers: [
            TimingName.PlayPhaseStartBefore,
            TimingName.PlayPhaseStart,
            TimingName.PlayPhase,
        ],
        end: TimingName.PlayPhaseEnd,
    },
    [Phase.Drop]: {
        triggers: [
            TimingName.DiscardPhaseStartBefore,
            TimingName.DiscardPhaseStart,
            TimingName.DiscardPhase,
        ],
        end: TimingName.DiscardPhaseEnd,
    },
    [Phase.End]: {
        triggers: [
            TimingName.EndPhaseStartBefore,
            TimingName.EndPhaseStart,
            TimingName.EndPhase,
        ],
        end: TimingName.EndPhaseEnd,
    },
};

/**
 * 回合事件。
 *
 * 执行流程：
 *   TurnStartBefore → TurnStart → TurnStartAfter
 *     → [各阶段 PhaseEvent 依次执行]
 *   TurnEnd → TurnEndAfter
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

    get isExtra(): boolean {
        return this.eventData.isExtraTurn;
    }
    set isExtra(v: boolean) {
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
        const T = (name: TimingName, after?: Array<(room: Room, data: TurnEventData) => Promise<void>>) =>
            ({ name, after } as Timing);

        this.eventTriggers = [
            T(TimingName.TurnStartBefore, [this._onTurnStartBefore.bind(this)]),
            T(TimingName.TurnStart),
            T(TimingName.TurnStartAfter, [this._onTurnStarted.bind(this)]),
        ];
        this.endTriggers = [
            T(TimingName.TurnEnd, [this._onTurnEnd.bind(this)]),
            T(TimingName.TurnEndAfter),
        ];
    }

    // ===== TurnStartBefore 回调 =====

    private async _onTurnStartBefore(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        const player = this.player;

        // 休整逻辑
        if (player.rest > 0) {
            player.rest = player.rest - 1;
            if (player.rest === 0) {
                player.death = false;
                // TODO Phase 5: RestEvent（复活动画在其中播放）
            } else {
                this._skipTurn();
                return;
            }
        }

        // 翻面逻辑
        if (player.skip) {
            this._skipTurn('#TurnSkip');
            return;
        }

        // 正常回合
        player.inturn = true;
        this._sendTurnLog('#TurnStart');

        // TODO Phase 8: 阵法动画（queue/siege）
    }

    // ===== TurnStartAfter 回调 =====

    private async _onTurnStarted(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        await this._generatePhases();
    }

    // ===== TurnEnd 回调 =====

    private async _onTurnEnd(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        this.player.inturn = false;

        // 规则：酒效果持续到回合结束，全体清零
        for (const p of this.room.players) {
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
        this._sendTurnLog('#TurnEnd');
        // TODO Phase 6: 3v3 模式标记
    }

    async skipPhase(phase?: Phase | Phase[]): Promise<void> {
        const current = this._findCurrentPhaseEvent();

        if (phase !== undefined) {
            const phases = Array.isArray(phase) ? phase : [phase];
            if (
                phases.length > 0 &&
                phases.every((v) => v !== undefined && !this.skippedPhases.includes(v))
            ) {
                this.skippedPhases.push(...phases);
            }
        }

        if (current) {
            await current.skip();
        }
    }

    async end(): Promise<this> {
        await super.end();
        await this.skipPhase();
        return this;
    }

    isNotSkip(phase: Phase): boolean {
        return !this.skippedPhases.includes(phase);
    }

    // ===== 内部方法 =====

    private _skipTurn(logKey?: string): void {
        this.isEnd = true;
        this.isComplete = true;
        this.eventData.isSkipped = true;
        if (logKey) {
            this._sendTurnLog(logKey);
        }
    }

    private _sendTurnLog(text: string): void {
        this.room.broadcast.sendLog(
            {
                text,
                values: [{ type: 'player', value: this.player.playerId }],
            },
            false,
        );
    }

    private _findCurrentPhaseEvent(): PhaseEvent | undefined {
        for (let i = this.room.eventStack.length - 1; i >= 0; i--) {
            const event = this.room.eventStack[i];
            if (event instanceof PhaseEvent) {
                return event;
            }
        }
        return undefined;
    }
}

/**
 * 阶段事件。
 *
 * 每个阶段有 3 个 eventTriggers + 1 个 endTrigger：
 *   {Phase}StartBefore → {Phase}Start → {Phase} → {Phase}End
 *
 * 摸牌阶段的 DrawPhaseStart1/Start2 提供两次修正摸牌数的时机。
 */
export class PhaseEvent extends EventProcess<EventType.Phase> {
    constructor(room: Room, data: PhaseEventData) {
        super(room, EventType.Phase, data);
        if (data.drawCount === undefined || data.drawCount === null) {
            data.drawCount = 2;
        }
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get executor(): Player {
        return this.eventData.player;
    }

    get phase(): Phase {
        return this.eventData.phase;
    }

    get isExtra(): boolean {
        return this.eventData.isExtraPhase;
    }

    get drawCount(): number {
        return this.eventData.drawCount;
    }
    set drawCount(value: number) {
        if (value < 0) value = 0;
        this.eventData.drawCount = value;
    }

    times: Record<string, Record<number, number>> = {};

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        const entry = PHASE_TIMING[this.phase];
        if (entry) {
            this.eventTriggers = entry.triggers.map(
                (name) => ({ name } as Timing),
            );
            this.endTriggers = [{ name: entry.end } as Timing];
        } else {
            this.eventTriggers = [];
            this.endTriggers = [];
        }
    }

    // ===== 公共方法 =====

    checkEvent(): boolean {
        return this.executor.alive;
    }

    async skip(): Promise<this> {
        this.isComplete = true;
        this.triggerable = false;

        if (!this.isExtra && this.room.currentTurn) {
            this.room.currentTurn.skippedPhases.push(this.phase);
        }
        return this;
    }

    isExecutor(player: Player, phase: Phase = this.phase): boolean {
        return this.executor === player && this.phase === phase;
    }
}
