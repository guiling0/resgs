"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeMaxHpEvent = exports.RecoverHpEvent = void 0;
const skill_types_1 = require("../../skill/skill.types");
const event_1 = require("../event");
/** 回复体力事件 */
class RecoverHpEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 回复体力的数值 */
        this.number = 1;
    }
    static async exec(room, data) {
        return room.recoverhp(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = [
            "RecoverHpStart" /* EventTriggers.RecoverHpStart */,
            "RecoverHpAfter" /* EventTriggers.RecoverHpAfter */,
        ];
        this.endTriggers = ["RecoverHpEnd" /* EventTriggers.RecoverHpEnd */];
    }
    async [`${"RecoverHpAfter" /* EventTriggers.RecoverHpAfter */}_Before`]() {
        this.player.changeHp(this.player.hp + this.number);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.player.playerId,
            ani: 'recover',
            log: {
                text: '#RecoverHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            },
        });
        this.room.insertHistory(this);
    }
    check_event() {
        return this.player.alive;
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        if (!lodash.isNumber(this.number) || this.number <= 0)
            return false;
        if (this.room
            .getStates(skill_types_1.StateEffectType.Prohibit_RecoverHp, [
            this.player,
            this.number,
            this.reason,
        ])
            .some((v) => v)) {
            return false;
        }
        const y = this.player.losshp;
        if (y === 0)
            return false;
        if (y >= this.number)
            return true;
        if (y < this.number) {
            this.number = y;
            return true;
        }
    }
}
exports.RecoverHpEvent = RecoverHpEvent;
/** 体力上限改变事件 */
class ChangeMaxHpEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 改变体力上限的数值 */
        this.number = 1;
    }
    static async exec(room, data) {
        return room.changeMaxHp(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = [
            "MaxHpChangeStart" /* EventTriggers.MaxHpChangeStart */,
            "MaxHpChangeAfter" /* EventTriggers.MaxHpChangeAfter */,
        ];
        this.endTriggers = ["MaxHpChangeEnd" /* EventTriggers.MaxHpChangeEnd */];
    }
    async [`${"MaxHpChangeAfter" /* EventTriggers.MaxHpChangeAfter */}_Before`]() {
        const newhpmax = Math.max(0, this.player.maxhp + this.number);
        this.player.setProperty('maxhp', newhpmax);
        if (this.player.hp > newhpmax) {
            this.player.changeHp(newhpmax);
        }
        if (this.number > 0) {
            this.room.sendLog({
                text: '#IncreaseMaxHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            });
        }
        if (this.number < 0) {
            this.room.sendLog({
                text: '#ReduceMaxHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            });
            if (this.player.maxhp <= 0) {
                this.isEnd = true;
                await this.room.die({
                    player: this.player,
                    source: this,
                    reason: 'die_reducehpmax',
                });
            }
        }
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        return this.number !== 0;
    }
}
exports.ChangeMaxHpEvent = ChangeMaxHpEvent;
