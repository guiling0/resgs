"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreData = exports.RemoveEvent = exports.ChangeEvent = exports.SkipEvent = exports.ChainEvent = exports.CloseEvent = exports.OpenEvent = exports.StateChangeEvent = void 0;
const general_1 = require("../../general/general");
const data_1 = require("../data");
const event_1 = require("../event");
/** 牌状态改变事件 */
class StateChangeEvent extends event_1.EventProcess {
    async init() {
        await super.init();
        this.eventTriggers = [
            "StateChange" /* EventTriggers.StateChange */,
            "StateChanged" /* EventTriggers.StateChanged */,
        ];
        this.endTriggers = ["StateChangeEnd" /* EventTriggers.StateChangeEnd */];
    }
    /**
     * 防止状态改变
     */
    async prevent() {
        if (this.trigger === "StateChange" /* EventTriggers.StateChange */) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}
exports.StateChangeEvent = StateChangeEvent;
/** 明置武将牌事件 */
class OpenEvent extends StateChangeEvent {
    constructor() {
        super(...arguments);
        /** 明置的武将牌 */
        this.generals = [];
        /** 是否明置了主将 */
        this.is_open_head = false;
        /** 是否明置了副将将 */
        this.is_open_deputy = false;
    }
    async init() {
        await super.init();
        if (this.generals.includes(this.player.head)) {
            this.is_open_head = true;
        }
        if (this.generals.includes(this.player.deputy)) {
            this.is_open_deputy = true;
        }
    }
    async StateChanged_Before() {
        if (this.is_open_head) {
            this.player.setProperty('headOpen', true);
            this.room.sendLog({
                text: '#Open',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `head` },
                    {
                        type: 'string',
                        value: this.player.head.trueName,
                    },
                ],
            });
            for (const skill of this.room.skills) {
                if (skill.sourceGeneral === this.player.head) {
                    await skill.handle();
                }
            }
        }
        if (this.is_open_deputy) {
            this.player.setProperty('deputyOpen', true);
            this.room.sendLog({
                text: '#Open',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `deputy` },
                    {
                        type: 'string',
                        value: this.player.deputy.trueName,
                    },
                ],
            });
            for (const skill of this.room.skills) {
                if (skill.sourceGeneral === this.player.deputy) {
                    await skill.handle();
                }
            }
        }
        this.room.insertHistory(this);
        this.room.opens.push(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        const canopen = this.player.getCanOpenGenerals();
        let count = this.generals.length;
        this.generals = this.generals.filter((v) => canopen.includes(v));
        return this.generals.length === count;
    }
}
exports.OpenEvent = OpenEvent;
/** 暗置武将牌事件 */
class CloseEvent extends StateChangeEvent {
    constructor() {
        super(...arguments);
        /** 暗置的武将牌 */
        this.generals = [];
        /** 是否暗置了主将 */
        this.is_close_head = false;
        /** 是否暗置了副将将 */
        this.is_close_deputy = false;
    }
    async init() {
        await super.init();
        if (this.generals.includes(this.player.head)) {
            this.is_close_head = true;
        }
        if (this.generals.includes(this.player.deputy)) {
            this.is_close_deputy = true;
        }
    }
    async StateChanged_Before() {
        if (this.is_close_head) {
            this.player.setProperty('headOpen', false);
            this.room.sendLog({
                text: '#Close',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `head` },
                    {
                        type: 'string',
                        value: this.player.head.trueName,
                    },
                ],
            });
            this.room.skills.forEach((v) => {
                if (v.sourceGeneral === this.player.head) {
                    v.preshow = true;
                    v.handle();
                }
            });
        }
        if (this.is_close_deputy) {
            this.player.setProperty('deputyOpen', false);
            this.room.sendLog({
                text: '#Close',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `deputy` },
                    {
                        type: 'string',
                        value: this.player.deputy.trueName,
                    },
                ],
            });
            this.room.skills.forEach((v) => {
                if (v.sourceGeneral === this.player.head) {
                    v.preshow = true;
                    v.handle();
                }
            });
        }
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        const canclose = this.player.getCanCloseGenerals();
        let count = this.generals.length;
        this.generals = this.generals.filter((v) => canclose.includes(v));
        return this.generals.length === count;
    }
}
exports.CloseEvent = CloseEvent;
/** 横置/重置事件 */
class ChainEvent extends StateChangeEvent {
    async StateChanged_Before() {
        this.player.setProperty('chained', this.to_state);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.player.playerId,
            ani: 'chain',
            data: {
                to_state: this.to_state,
                damage_type: this.damageType,
            },
            log: {
                text: `#Chained${this.to_state ? 1 : 2}`,
                values: [{ type: 'player', value: this.player.playerId }],
            },
        });
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        this.to_state = this.to_state ?? !this.player.chained;
        return this.player.chained !== this.to_state;
    }
}
exports.ChainEvent = ChainEvent;
/** 翻面/叠置事件 */
class SkipEvent extends StateChangeEvent {
    async StateChanged_Before() {
        this.player.setProperty('skip', this.to_state);
        if (this.data.toState) {
            this.room.sendLog({
                text: `#Skip${this.player.deputy ? 3 : 1}`,
                values: [{ type: 'player', value: this.player.playerId }],
            });
        }
        else {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: `#Skip${this.player.deputy ? 4 : 2}`,
                    values: [{ type: 'player', value: this.player.playerId }],
                },
            });
        }
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        this.to_state = this.to_state ?? !this.player.skip;
        return this.player.skip !== this.to_state;
    }
}
exports.SkipEvent = SkipEvent;
/** 变更事件 */
class ChangeEvent extends StateChangeEvent {
    constructor() {
        super(...arguments);
        /** 是否明置了主将 */
        this.is_change_head = false;
        /** 是否明置了副将将 */
        this.is_change_deputy = false;
    }
    async init() {
        await super.init();
        if (this.general === this.player.head || this.general === 'head') {
            this.is_change_head = true;
            this.general = this.player.head;
        }
        if (this.general === this.player.deputy || this.general === 'deputy') {
            this.is_change_deputy = true;
            this.general = this.player.deputy;
        }
    }
    async StateChanged_Before() {
        let source;
        if (this.is_change_head) {
            this.general = this.player.head;
            this.player.setProperty('headOpen', true);
            this.player.setProperty('_head', this.to_general.id);
            source = 'head_general';
        }
        else if (this.is_change_deputy) {
            this.general = this.player.deputy;
            this.player.setProperty('deputyOpen', true);
            this.player.setProperty('_deputy', this.to_general.id);
            source = 'deputy_general';
        }
        else {
            this.general = this.player.head;
        }
        if (source) {
            this.room.sendLog({
                text: '#Change',
                values: [
                    { type: 'player', value: this.player.playerId },
                    {
                        type: 'string',
                        value: source === 'head_general' ? `head` : `deputy`,
                    },
                    {
                        type: 'string',
                        value: this.general.trueName,
                    },
                    {
                        type: 'string',
                        value: this.to_general.trueName,
                    },
                ],
            });
            //武将牌归还到武将堆
            this.player.handArea.remove([this.general]);
            this.room.generalArea.add([this.general]);
            //失去所有该武将牌上的技能
            while (true) {
                const skill = this.room.skills.find((v) => v.sourceGeneral === this.general &&
                    v.player === this.player &&
                    v.options.source === source);
                if (skill)
                    await skill.removeSelf();
                else
                    break;
            }
            //设置新武将
            this.room.generalArea.remove([this.to_general]);
            this.player.handArea.add([this.to_general]);
            this.room.recordGeneral(this.to_general.id, ['isChangePick']);
            //获得新技能
            for (const skill_name of this.to_general.skills) {
                const skill = await this.room.addSkill(skill_name, this.player, {
                    source,
                    showui: 'default',
                });
            }
        }
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        if (typeof this.general === 'string') {
            if (this.general !== 'head' && this.general !== 'deputy')
                return false;
        }
        else {
            if (this.general !== this.player.head &&
                this.general !== this.player.deputy)
                return false;
        }
        if (this.general === 'deputy' || this.general === this.player.deputy) {
            if (this.player.general_mode === 'single')
                return false;
        }
        if (!this.to_general) {
            const kindoms = [
                this.player.kingdom,
                this.player.head?.kingdom,
                this.player.deputy?.kingdom,
            ];
            const kindom = kindoms.find((v) => v && v !== 'none' && !v.includes('ye'));
            if (kindom) {
                this.to_general = this.room.generalArea
                    .get(1, general_1.General, 'top', (v) => v.kingdom === kindom || v.kingdom2 === kindom)
                    .at(0);
            }
        }
        if (!this.to_general)
            return false;
        return true;
    }
}
exports.ChangeEvent = ChangeEvent;
/** 移除事件 */
class RemoveEvent extends StateChangeEvent {
    constructor() {
        super(...arguments);
        /** 是否明置了主将 */
        this.is_remove_head = false;
        /** 是否明置了副将将 */
        this.is_remove_deputy = false;
    }
    async init() {
        await super.init();
        if (this.general === this.player.head) {
            this.is_remove_head = true;
        }
        if (this.general === this.player.deputy) {
            this.is_remove_deputy = true;
        }
    }
    async StateChanged_Before() {
        let pos;
        if (this.is_remove_head) {
            this.player.setProperty('headOpen', true);
            this.player.setProperty('_head', this.general.gender === 2 /* Gender.Female */
                ? 'default.shibingv'
                : 'default.shibingn');
            pos = 'head';
        }
        if (this.is_remove_deputy) {
            this.player.setProperty('deputyOpen', true);
            this.player.setProperty('_deputy', this.general.gender === 2 /* Gender.Female */
                ? 'default.shibingv'
                : 'default.shibingn');
            pos = 'deputy';
        }
        if (pos) {
            this.room.sendLog({
                text: '#Remove',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: pos },
                    {
                        type: 'string',
                        value: this.general.trueName,
                    },
                ],
            });
            //武将牌归还到武将堆
            this.player.handArea.remove([this.general]);
            this.room.generalArea.add([this.general]);
            this.room.recordGeneral(this.general.id, ['isRemovals']);
            //失去所有该武将牌上的技能
            while (true) {
                const skill = this.room.skills.find((v) => v.sourceGeneral === this.general);
                if (skill)
                    await skill.removeSelf();
                else
                    break;
            }
        }
        this.room.insertHistory(this);
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        if (!this.general)
            return false;
        if (this.general !== this.player.head &&
            this.general !== this.player.deputy)
            return false;
        if (this.general.isLord() || this.general.isShibing())
            return false;
        return true;
    }
}
exports.RemoveEvent = RemoveEvent;
class RestoreData extends data_1.EventData {
}
exports.RestoreData = RestoreData;
