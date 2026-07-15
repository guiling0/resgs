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

    // ===== 便捷访问器（读写 eventData） =====

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

    /** 本回合是否因翻面/休整被跳过 */
    get isSkipped(): boolean {
        return this.eventData.isSkipped;
    }

    /** 阶段列表（按执行顺序） */
    get phases(): TurnEventData['phases'] {
        return this.eventData.phases;
    }

    /** 已被跳过的阶段 */
    get skippedPhases(): Phase[] {
        return this.eventData.skippedPhases;
    }

    /** 是否为新的一轮开始 */
    get isRoundStart(): boolean {
        return this.eventData.isRoundStart;
    }
    set isRoundStart(v: boolean) {
        this.eventData.isRoundStart = v;
    }

    /** 是否为一轮结束 */
    get isRoundEnd(): boolean {
        return this.eventData.isRoundEnd;
    }
    set isRoundEnd(v: boolean) {
        this.eventData.isRoundEnd = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            {
                name: TimingName.TurnStartBefore,
                after: [this._onTurnStartBefore.bind(this)],
            } as Timing,
            { name: TimingName.TurnStart } as Timing,
            {
                name: TimingName.TurnStartAfter,
                after: [this._onTurnStarted.bind(this)],
            } as Timing,
        ];
        this.endTriggers = [
            {
                name: TimingName.TurnEnd,
                after: [this._onTurnEnd.bind(this)],
            } as Timing,
            { name: TimingName.TurnEndAfter } as Timing,
        ];
    }

    // ===== TurnStartBefore 回调 =====

    /**
     * TurnStartBefore 触发完成后执行：
     * 1. 休整倒计时 → 复活或跳过
     * 2. 翻面检测 → 跳过回合
     * 3. 设置 inturn 标记
     */
    private async _onTurnStartBefore(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        const player = this.player;

        // --- 休整逻辑 ---
        if (player.rest > 0) {
            player.rest = player.rest - 1;
            if (player.rest === 0) {
                // 休整结束，复活
                player.death = false;
                // TODO Phase 5: 创建 RestEvent 并触发（复活动画在 RestEvent 中播放）
                // const restEvent = new RestEvent(this.room, { player });
                // await restEvent.exec();
            } else {
                // 仍在休整，跳过本回合
                this.isEnd = true;
                this.isComplete = true;
                this.eventData.isSkipped = true;
                return;
            }
        }

        // --- 翻面逻辑 ---
        if (player.skip) {
            this.isEnd = true;
            this.isComplete = true;
            this.eventData.isSkipped = true;

            this.room.broadcast.sendLog(
                {
                    text: '#TurnSkip',
                    values: [{ type: 'player', value: player.playerId }],
                },
                false,
            );
            return;
        }

        // --- 正常回合 ---
        player.inturn = true;

        this.room.broadcast.sendLog(
            {
                text: '#TurnStart',
                values: [{ type: 'player', value: player.playerId }],
            },
            false,
        );

        // TODO Phase 8: 阵法动画（queue/siege）— 依赖技能系统
    }

    // ===== TurnStartAfter 回调 =====

    /** TurnStarted 触发完成后：开始依次执行各阶段 */
    private async _onTurnStarted(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        await this._generatePhases();
    }

    // ===== TurnEnd 回调 =====

    /**
     * TurnEnd 触发完成后执行：
     * 清理 inturn 标记、酒状态。
     */
    private async _onTurnEnd(
        _room: Room,
        _data: TurnEventData,
    ): Promise<void> {
        // 清除 inturn
        this.player.inturn = false;

        // 重置所有玩家的酒状态
        // 规则：酒效果仅持续到当前回合结束，回合结束时全体酒状态清零
        for (const p of this.room.players) {
            p.setMark('jiuState', 0);
        }
    }

    // ===== 阶段执行 =====

    /**
     * 依次执行阶段列表中的每个阶段。
     * 每个阶段创建一个 PhaseEvent 并执行。
     */
    private async _generatePhases(): Promise<void> {
        while (this.phases.length > 0 && !this.isEnd) {
            const phaseItem = this.phases.shift()!;
            if (!phaseItem.player) {
                phaseItem.player = this.player;
            }
            if (this.skippedPhases.includes(phaseItem.phase)) {
                continue;
            }

            const executor = phaseItem.player;

            await this.room.delay(0.2);

            executor.phase = phaseItem.phase;

            const phaseEvent = new PhaseEvent(this.room, {
                phaseId: 0, // TODO Phase 6: 由 GameFlowManager 生成
                player: executor,
                phase: phaseItem.phase,
                isExtraPhase: phaseItem.isExtraPhase,
                // 摸牌阶段默认摸 2 张，当 drawCount 变为 0 时规则技能不再执行摸牌动作
                drawCount: phaseItem.phase === Phase.Draw ? 2 : 0,
            });
            await phaseEvent.exec();

            executor.phase = Phase.None;
        }
    }

    // ===== 公共方法 =====

    /** 完成后的清理 */
    async processCompleted(): Promise<void> {
        await super.processCompleted();

        // 无论是否跳过回合，都发送 TurnEnd 战报（面向玩家）
        this.room.broadcast.sendLog(
            {
                text: '#TurnEnd',
                values: [{ type: 'player', value: this.player.playerId }],
            },
            false,
        );

        // TODO Phase 6: 3v3 模式标记
    }

    /**
     * 跳过本回合中的一个或多个阶段。
     * @param phase 要跳过的阶段，不传则跳过当前阶段。
     */
    async skipPhase(phase?: Phase | Phase[]): Promise<void> {
        if (phase !== undefined) {
            const phases = Array.isArray(phase) ? phase : [phase];
            const canTrigger =
                phases.length > 0 &&
                phases.every(
                    (v) => v !== undefined && !this.skippedPhases.includes(v),
                );
            if (canTrigger) {
                this.skippedPhases.push(...phases);

                // 如果当前正在执行的阶段在跳过列表中，直接跳过当前阶段
                const current = this._findCurrentPhaseEvent();
                if (current && phases.includes(current.phase)) {
                    await current.skip();
                }
            }
        } else {
            const current = this._findCurrentPhaseEvent();
            if (current) {
                await current.skip();
            }
        }
    }

    /** 结束当前回合 */
    async end(): Promise<this> {
        this.isEnd = true;
        this.triggerable = false;
        await this.skipPhase();
        return this;
    }

    /** 指定阶段是否未被跳过 */
    isNotSkip(phase: Phase): boolean {
        return !this.skippedPhases.includes(phase);
    }

    // ===== 内部方法 =====

    /**
     * 在事件栈中查找当前正在执行的 PhaseEvent。
     * 当前阶段事件是事件栈中最后一个 PhaseEvent。
     */
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
        // drawCount 默认值：未设置时兜底为 2
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

    /**
     * 此阶段的摸牌数。
     * 当值变为 0 时，摸牌阶段的摸牌动作（规则技能）不再执行。
     */
    get drawCount(): number {
        return this.eventData.drawCount;
    }
    set drawCount(value: number) {
        if (value < 0) value = 0;
        this.eventData.drawCount = value;
    }

    /** 记录本阶段内的技能使用次数（出牌阶段用） */
    times: Record<string, Record<number, number>> = {};

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        switch (this.phase) {
            case Phase.Ready:
                this.eventTriggers = [
                    { name: TimingName.ReadyPhaseStartBefore } as Timing,
                    { name: TimingName.ReadyPhaseStart } as Timing,
                    { name: TimingName.ReadyPhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.ReadyPhaseEnd } as Timing,
                ];
                break;
            case Phase.Judge:
                this.eventTriggers = [
                    { name: TimingName.JudgePhaseStartBefore } as Timing,
                    { name: TimingName.JudgePhaseStart } as Timing,
                    { name: TimingName.JudgePhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.JudgePhaseEnd } as Timing,
                ];
                break;
            case Phase.Draw:
                this.eventTriggers = [
                    { name: TimingName.DrawPhaseStartBefore } as Timing,
                    { name: TimingName.DrawPhaseStart1 } as Timing,
                    { name: TimingName.DrawPhaseStart2 } as Timing,
                    { name: TimingName.DrawPhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.DrawPhaseEnd } as Timing,
                ];
                break;
            case Phase.Play:
                this.eventTriggers = [
                    { name: TimingName.PlayPhaseStartBefore } as Timing,
                    { name: TimingName.PlayPhaseStart } as Timing,
                    { name: TimingName.PlayPhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.PlayPhaseEnd } as Timing,
                ];
                break;
            case Phase.Drop:
                this.eventTriggers = [
                    { name: TimingName.DiscardPhaseStartBefore } as Timing,
                    { name: TimingName.DiscardPhaseStart } as Timing,
                    { name: TimingName.DiscardPhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.DiscardPhaseEnd } as Timing,
                ];
                break;
            case Phase.End:
                this.eventTriggers = [
                    { name: TimingName.EndPhaseStartBefore } as Timing,
                    { name: TimingName.EndPhaseStart } as Timing,
                    { name: TimingName.EndPhase } as Timing,
                ];
                this.endTriggers = [
                    { name: TimingName.EndPhaseEnd } as Timing,
                ];
                break;
            default:
                this.eventTriggers = [];
                this.endTriggers = [];
                break;
        }
    }

    // ===== 公共方法 =====

    /**
     * 检查事件是否应该继续。
     * 阶段执行期间，若执行者死亡则终止阶段。
     */
    checkEvent(): boolean {
        return this.executor.alive;
    }

    /** 跳过当前阶段 */
    async skip(): Promise<this> {
        this.isComplete = true;
        this.triggerable = false;

        // 非额外阶段：记录到当前回合的 skippedPhases
        if (!this.isExtra && this.room.currentTurn) {
            this.room.currentTurn.skippedPhases.push(this.phase);
        }
        return this;
    }

    /** 结束当前阶段（正常退出，会执行 endTriggers） */
    async end(): Promise<this> {
        this.isEnd = true;
        this.triggerable = false;
        return this;
    }

    /**
     * 检查某个玩家是否是当前阶段的执行者。
     * @param player 待检测玩家
     * @param phase 要匹配的阶段，默认当前阶段
     */
    isExecutor(player: Player, phase: Phase = this.phase): boolean {
        return this.executor === player && this.phase === phase;
    }
}
