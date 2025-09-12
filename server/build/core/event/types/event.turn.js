"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseEvent = exports.TurnEvent = void 0;
const event_1 = require("../event");
const event_state_1 = require("./event.state");
/**
 * 回合事件
 */
class TurnEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 是否为额外回合 */
        this.isExtra = false;
        /** 该回合是否因翻面而被跳过 */
        this.isSkip = false;
        /** 未执行阶段 */
        this.phases = [];
        /** 已被跳过的阶段
         * @description 这是用来记录哪些阶段被提前跳过了。
         * 提前跳过不会触发阶段开始前的时机。但阶段开始前时机依旧可以用来跳过正在执行的那个阶段。
         */
        this.skipPhases = [];
        /** 是否为新的一轮 */
        this.isCircleStart = false;
        /** 是否为一轮结束 */
        this.isCircleEnd = false;
    }
    async init() {
        this.eventTriggers = [
            "TurnStartBefore" /* EventTriggers.TurnStartBefore */,
            "TurnStart" /* EventTriggers.TurnStart */,
            "TurnStarted" /* EventTriggers.TurnStarted */,
            "TurnEnd" /* EventTriggers.TurnEnd */,
        ];
        this.endTriggers = ["TurnEnded" /* EventTriggers.TurnEnded */];
        this.room.insertHistory(this);
    }
    async [`${"TurnStartBefore" /* EventTriggers.TurnStartBefore */}_After`]() {
        if (this.player.rest > 0) {
            this.player.setProperty('rest', this.player.rest - 1);
            if (this.player.rest === 0) {
                this.player.setProperty('death', false);
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'fuhuo',
                });
                await this.room.trigger("RestOver" /* EventTriggers.RestOver */, this);
            }
            else {
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
            await this.room.skip(this.room.createEventData(event_state_1.SkipEvent, {
                player: this.player,
                source: this,
                reason: 'turnstart',
            }));
        }
        else {
            this.player.setProperty('inturn', true);
            if (this.room.skills.find((v) => v.player === this.player &&
                v.effects.find((e) => e.hasTag(7 /* SkillTag.Array_Quene */)) &&
                v.isOpen())) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'array',
                    data: { type: 'quene' },
                });
            }
            if (this.room.skills.find((v) => v.player === this.player &&
                v.effects.find((e) => e.hasTag(8 /* SkillTag.Array_Siege */)) &&
                v.isOpen())) {
                this.room.broadcast({
                    type: 'MsgPlayFaceAni',
                    player: this.player.playerId,
                    ani: 'array',
                    data: { type: 'siege' },
                });
            }
        }
    }
    async [`${"TurnStarted" /* EventTriggers.TurnStarted */}_After`]() {
        await this.generatePhase();
    }
    async [`${"TurnEnd" /* EventTriggers.TurnEnd */}_After`]() {
        this.player.setProperty('inturn', false);
        this.player.setMark('__jiu_times', 0);
        this.room.players.forEach((v) => {
            v.setProperty('jiuState', 0);
        });
    }
    async processCompleted() {
        await super.processCompleted();
        this.room.sendLog({
            text: '#TurnEnd',
            values: [{ type: 'player', value: this.player.playerId }],
        });
    }
    async generatePhase() {
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
            phase.executor.setProperty('phase', 0 /* Phase.None */);
        }
    }
    /** 跳过本回合的阶段 */
    async skipPhase(phase) {
        const current = this.room.getCurrentPhase();
        if (phase) {
            phase = Array.isArray(phase) ? phase : [phase];
            let can_trigger = phase.length > 0 &&
                phase.every((v) => v && !this.skipPhases.includes(v));
            if (can_trigger) {
                this.skipPhases.push(...phase);
                if (phase.includes(current.phase)) {
                    await current.skip();
                }
            }
        }
        else if (current) {
            await current.skip();
        }
    }
    /** 结束当前回合 */
    async end() {
        this.isEnd = true;
        await this.skipPhase();
        return this;
    }
    /** 指定阶段是否未被跳过 */
    isNotSkip(phase) {
        return !this.skipPhases.includes(phase);
    }
    /** 获取本轮开始的回合 */
    getCircleStartTurn() {
        return this.room.getLastOneHistory(TurnEvent, (v) => !v.isExtra && v.isCircleStart);
    }
}
exports.TurnEvent = TurnEvent;
/**
 * 阶段数据
 */
class PhaseEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 此阶段的额定摸牌数 */
        this._ratedDrawnum = 2;
        /** 记录出牌阶段的技能使用次数 */
        this.times = {};
    }
    /** 此阶段的额定摸牌数 */
    set ratedDrawnum(value) {
        if (this._ratedDrawnum > 0) {
            this._ratedDrawnum = value;
        }
        if (this._ratedDrawnum < 0)
            this._ratedDrawnum = 0;
    }
    get ratedDrawnum() {
        return this._ratedDrawnum;
    }
    async init() {
        this.room.insertHistory(this);
        switch (this.phase) {
            case 1 /* Phase.Ready */:
                this.eventTriggers = [
                    "ReadyPhaseStart" /* EventTriggers.ReadyPhaseStart */,
                    "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
                    "ReadyPhaseProceeding" /* EventTriggers.ReadyPhaseProceeding */,
                ];
                this.endTriggers = ["ReadyPhaseEnd" /* EventTriggers.ReadyPhaseEnd */];
                break;
            case 2 /* Phase.Judge */:
                this.eventTriggers = [
                    "JudgePhaseStart" /* EventTriggers.JudgePhaseStart */,
                    "JudgePhaseStarted" /* EventTriggers.JudgePhaseStarted */,
                    "JudgePhaseProceeding" /* EventTriggers.JudgePhaseProceeding */,
                ];
                this.endTriggers = ["JudgePhaseEnd" /* EventTriggers.JudgePhaseEnd */];
                break;
            case 3 /* Phase.Draw */:
                this.eventTriggers = [
                    "DrawPhaseStart" /* EventTriggers.DrawPhaseStart */,
                    "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
                    "DrawPhaseStartedAfter" /* EventTriggers.DrawPhaseStartedAfter */,
                    "DrawPhaseProceeding" /* EventTriggers.DrawPhaseProceeding */,
                ];
                this.endTriggers = ["DrawPhaseEnd" /* EventTriggers.DrawPhaseEnd */];
                break;
            case 4 /* Phase.Play */:
                this.eventTriggers = [
                    "PlayPhaseStart" /* EventTriggers.PlayPhaseStart */,
                    "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
                    "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
                ];
                this.endTriggers = ["PlayPhaseEnd" /* EventTriggers.PlayPhaseEnd */];
                break;
            case 5 /* Phase.Drop */:
                this.eventTriggers = [
                    "DropPhaseStart" /* EventTriggers.DropPhaseStart */,
                    "DropPhaseStarted" /* EventTriggers.DropPhaseStarted */,
                    "DropPhaseProceeding" /* EventTriggers.DropPhaseProceeding */,
                ];
                this.endTriggers = ["DropPhaseEnd" /* EventTriggers.DropPhaseEnd */];
                break;
            case 6 /* Phase.End */:
                this.eventTriggers = [
                    "EndPhaseStart" /* EventTriggers.EndPhaseStart */,
                    "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
                    "EndPhaseProceeding" /* EventTriggers.EndPhaseProceeding */,
                ];
                this.endTriggers = ["EndPhaseEnd" /* EventTriggers.EndPhaseEnd */];
                break;
        }
    }
    async [`${"PlayPhaseEnd" /* EventTriggers.PlayPhaseEnd */}_After`]() {
        this.executor.setMark('__sha_times', 0);
    }
    check_event() {
        return this.executor.alive;
    }
    /** 跳过当前阶段 */
    async skip() {
        this.isComplete = true;
        this.triggerable = false;
        if (!this.isExtra) {
            this.room.currentTurn.skipPhases.push(this.phase);
        }
        return this;
    }
    /** 结束当前阶段 */
    async end() {
        this.isEnd = true;
        this.triggerable = false;
        return this;
    }
    isOwner(player, phase = this.phase) {
        return this.executor === player && this.phase === phase;
    }
}
exports.PhaseEvent = PhaseEvent;
