import { GamePlayer } from '../../player/player';
import { Phase } from '../../player/player.types';
import { SkillTag } from '../../skill/skill.types';
import { EventProcess } from '../event';
import { EventTriggers } from '../triggers';
import { SkipEvent } from './event.state';

/**
 * 回合事件
 */
export class TurnEvent extends EventProcess {
    /** 回合ID */
    turnId: number;
    /** 执行回合的玩家 */
    player: GamePlayer;
    /** 是否为额外回合 */
    isExtra: boolean = false;
    /** 该回合是否因翻面而被跳过 */
    isSkip: boolean = false;
    /** 未执行阶段 */
    phases: { executor?: GamePlayer; phase: Phase; isExtra: boolean }[] = [];
    /** 已被跳过的阶段
     * @description 这是用来记录哪些阶段被提前跳过了。
     * 提前跳过不会触发阶段开始前的时机。但阶段开始前时机依旧可以用来跳过正在执行的那个阶段。
     */
    skipPhases: Phase[] = [];
    /** 是否为新的一轮 */
    isCircleStart: boolean = false;
    /** 是否为一轮结束 */
    isCircleEnd: boolean = false;

    protected async init(): Promise<void> {
        this.eventTriggers = [
            EventTriggers.TurnStartBefore,
            EventTriggers.TurnStart,
            EventTriggers.TurnStarted,
            EventTriggers.TurnEnd,
        ];
        this.endTriggers = [EventTriggers.TurnEnded];
        this.room.insertHistory(this);
    }

    protected async [`${EventTriggers.TurnStartBefore}_After`]() {
        if (this.player.rest > 0) {
            this.player.setProperty('rest', this.player.rest - 1);
            if (this.player.rest === 0) {
                this.player.setProperty('death', false);
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'fuhuo',
                });
                await this.room.trigger(EventTriggers.RestOver, this);
            } else {
                this.isEnd = this.isComplete = true;
                this.isSkip = true;
                return;
            }
        }
        this.room.sendLog({
            text: '#TurnStart',
            values: [{ type: 'player', value: this.player.playerId }],
        });
        if (this.player.skip) {
            this.isEnd = this.isComplete = true;
            this.room.sendLog({
                text: '#TurnSkip',
                values: [{ type: 'player', value: this.player.playerId }],
            });
            this.isSkip = true;
            await this.room.skip(
                this.room.createEventData(SkipEvent, {
                    player: this.player,
                    source: this,
                    reason: 'turnstart',
                })
            );
        } else {
            this.player.setProperty('inturn', true);
            if (
                this.room.skills.find(
                    (v) =>
                        v.player === this.player &&
                        v.effects.find((e) => e.hasTag(SkillTag.Array_Quene)) &&
                        v.isOpen()
                )
            ) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'array',
                    data: { type: 'quene' },
                });
            }
            if (
                this.room.skills.find(
                    (v) =>
                        v.player === this.player &&
                        v.effects.find((e) => e.hasTag(SkillTag.Array_Siege)) &&
                        v.isOpen()
                )
            ) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'array',
                    data: { type: 'siege' },
                });
            }
        }
    }

    protected async [`${EventTriggers.TurnStarted}_After`]() {
        await this.generatePhase();
    }

    protected async [`${EventTriggers.TurnEnd}_After`]() {
        this.player.setProperty('inturn', false);
        this.player.setMark('__jiu_times', 0);
        this.room.players.forEach((v) => {
            v.setProperty('jiuState', 0);
        });
    }

    public async processCompleted(): Promise<void> {
        await super.processCompleted();
        this.room.sendLog({
            text: '#TurnEnd',
            values: [{ type: 'player', value: this.player.playerId }],
        });
    }

    protected async generatePhase() {
        while (this.phases.length > 0 && !this.isEnd) {
            const phase = this.phases.shift();
            if (!phase.executor) {
                phase.executor = this.player;
            }
            if (this.skipPhases.includes(phase.phase)) {
                continue;
            }
            await this.room.delay(0.2);
            phase.executor.setProperty('phase', phase.phase);
            await this.room
                .createEventData(PhaseEvent, {
                    phase: phase.phase,
                    executor: phase.executor,
                    isExtra: phase.isExtra,
                    source: this,
                    reason: 'generate_phase',
                })
                .exec();
            phase.executor.setProperty('phase', Phase.None);
        }
    }

    /** 跳过本回合的阶段 */
    public async skipPhase(phase?: Phase | Phase[]) {
        const current = this.room.getCurrentPhase();
        if (phase) {
            phase = Array.isArray(phase) ? phase : [phase];
            let can_trigger =
                phase.length > 0 &&
                phase.every((v) => v && !this.skipPhases.includes(v));
            if (can_trigger) {
                this.skipPhases.push(...phase);
                if (phase.includes(current.phase)) {
                    await current.skip();
                }
            }
        } else if (current) {
            await current.skip();
        }
    }

    /** 结束当前回合 */
    public async end() {
        this.isEnd = true;
        await this.skipPhase();
        return this;
    }

    /** 指定阶段是否未被跳过 */
    public isNotSkip(phase: Phase) {
        return !this.skipPhases.includes(phase);
    }

    /** 获取本轮开始的回合 */
    public getCircleStartTurn() {
        return this.room.getLastOneHistory(
            TurnEvent,
            (v) => !v.isExtra && v.isCircleStart
        );
    }
}

/**
 * 阶段数据
 */
export class PhaseEvent extends EventProcess {
    /** 当前阶段执行玩家 */
    executor: GamePlayer;
    /** 执行的阶段类型 */
    phase: Phase;
    /** 是否为额外阶段 */
    isExtra: boolean;
    /** 此阶段的额定摸牌数 */
    protected _ratedDrawnum: number = 2;
    /** 此阶段的额定摸牌数 */
    public set ratedDrawnum(value: number) {
        if (this._ratedDrawnum > 0) {
            this._ratedDrawnum = value;
        }
        if (this._ratedDrawnum < 0) this._ratedDrawnum = 0;
    }
    public get ratedDrawnum() {
        return this._ratedDrawnum;
    }
    /** 记录出牌阶段的技能使用次数 */
    public times: Record<string, Record<number, number>> = {};

    protected async init(): Promise<void> {
        this.room.insertHistory(this);
        switch (this.phase) {
            case Phase.Ready:
                this.eventTriggers = [
                    EventTriggers.ReadyPhaseStart,
                    EventTriggers.ReadyPhaseStarted,
                    EventTriggers.ReadyPhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.ReadyPhaseEnd];
                break;
            case Phase.Judge:
                this.eventTriggers = [
                    EventTriggers.JudgePhaseStart,
                    EventTriggers.JudgePhaseStarted,
                    EventTriggers.JudgePhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.JudgePhaseEnd];
                break;
            case Phase.Draw:
                this.eventTriggers = [
                    EventTriggers.DrawPhaseStart,
                    EventTriggers.DrawPhaseStarted,
                    EventTriggers.DrawPhaseStartedAfter,
                    EventTriggers.DrawPhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.DrawPhaseEnd];
                break;
            case Phase.Play:
                this.eventTriggers = [
                    EventTriggers.PlayPhaseStart,
                    EventTriggers.PlayPhaseStarted,
                    EventTriggers.PlayPhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.PlayPhaseEnd];
                break;
            case Phase.Drop:
                this.eventTriggers = [
                    EventTriggers.DropPhaseStart,
                    EventTriggers.DropPhaseStarted,
                    EventTriggers.DropPhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.DropPhaseEnd];
                break;
            case Phase.End:
                this.eventTriggers = [
                    EventTriggers.EndPhaseStart,
                    EventTriggers.EndPhaseStarted,
                    EventTriggers.EndPhaseProceeding,
                ];
                this.endTriggers = [EventTriggers.EndPhaseEnd];
                break;
        }
    }

    protected async [`${EventTriggers.PlayPhaseEnd}_After`]() {
        this.executor.setMark('__sha_times', 0);
    }

    public check_event(): boolean {
        return this.executor.alive;
    }

    /** 跳过当前阶段 */
    public async skip() {
        this.isComplete = true;
        this.triggerable = false;
        if (!this.isExtra) {
            this.room.currentTurn.skipPhases.push(this.phase);
        }
        return this;
    }

    /** 结束当前阶段 */
    public async end() {
        this.isEnd = true;
        this.triggerable = false;
        return this;
    }

    isOwner(player: GamePlayer, phase: Phase = this.phase) {
        return this.executor === player && this.phase === phase;
    }
}
