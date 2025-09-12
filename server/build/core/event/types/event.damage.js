"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReduceHpEvent = exports.LoseHpEvent = exports.DamageEvent = void 0;
const event_1 = require("../event");
/** 可以防止伤害的时机 */
const preventTriggers = [
    "DamageStart" /* EventTriggers.DamageStart */,
    "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    "InflictDamage1" /* EventTriggers.InflictDamage1 */,
    "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    "InflictDamage3" /* EventTriggers.InflictDamage3 */,
];
/** 伤害事件 */
class DamageEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 伤害类型 */
        this.damageType = 0 /* DamageType.None */;
        /** 伤害值 */
        this.number = 1;
        /** 是否为连环伤害 */
        this.isChain = false;
        this.triggerChain = false;
    }
    static async exec(room, data) {
        return room.damage(data);
    }
    async init() {
        this.damageType = this.damageType ?? 0 /* DamageType.None */;
        await super.init();
        this.eventTriggers = [
            "DamageStart" /* EventTriggers.DamageStart */,
            "CauseDamage1" /* EventTriggers.CauseDamage1 */,
            "CauseDamage2" /* EventTriggers.CauseDamage2 */,
            "InflictDamage1" /* EventTriggers.InflictDamage1 */,
            "InflictDamage2" /* EventTriggers.InflictDamage2 */,
            "InflictDamage3" /* EventTriggers.InflictDamage3 */,
            "CauseDamaged" /* EventTriggers.CauseDamaged */,
            "InflictDamaged" /* EventTriggers.InflictDamaged */,
        ];
        this.endTriggers = ["DamageEnd" /* EventTriggers.DamageEnd */];
    }
    async [`${"CauseDamaged" /* EventTriggers.CauseDamaged */}_Before`]() {
        await this.room.reducehp({
            player: this.to,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.insertHistory(this);
    }
    async [`${"DamageEnd" /* EventTriggers.DamageEnd */}_After`]() {
        if (this.triggerChain) {
            const players = this.room.playerAlives.filter((v) => v.chained);
            this.room.sortResponse(players);
            while (players.length > 0) {
                const player = players.shift();
                if (player.chained) {
                    await this.room.damage({
                        from: this.from,
                        to: player,
                        damageType: this.damageType,
                        channel: this.channel,
                        number: this.number,
                        isChain: true,
                        source: this,
                        reason: 'damage_chain',
                        skill: this.skill,
                    });
                }
            }
        }
    }
    check_event() {
        if (this.from && this.from.death) {
            this.from = undefined;
        }
        return this.to.alive && this.number > 0;
    }
    check() {
        return this.to && this.to.alive && this.number > 0;
    }
    /**
     * 防止伤害
     * @returns
     */
    async prevent() {
        if (preventTriggers.includes(this.trigger)) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
    /**
     * 转移伤害
     */
    async transfer(to) {
        if (preventTriggers.includes(this.trigger)) {
            if (to === this.to)
                return;
            await this.prevent();
            await this.room.damage({
                from: this.from,
                to,
                damageType: this.damageType,
                channel: this.channel,
                number: this.number,
                isChain: this.isChain,
                source: this.source,
                reason: this.reason,
                skill: this.skill,
            });
        }
        return this;
    }
}
exports.DamageEvent = DamageEvent;
/** 失去体力事件 */
class LoseHpEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 失去体力的数值 */
        this.number = 1;
    }
    static async exec(room, data) {
        return room.losehp(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = ["LoseHpStart" /* EventTriggers.LoseHpStart */, "LoseHp" /* EventTriggers.LoseHp */];
        this.endTriggers = ["LoseHpEnd" /* EventTriggers.LoseHpEnd */];
    }
    async [`${"LoseHp" /* EventTriggers.LoseHp */}_Before`]() {
        await this.room.reducehp({
            player: this.player,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.insertHistory(this);
    }
    check_event() {
        return this.player.alive;
    }
    check() {
        return this.player.inthp >= this.number;
    }
    /**
     * 防止失去体力
     * @returns
     */
    async prevent() {
        if (this.trigger === "LoseHpStart" /* EventTriggers.LoseHpStart */) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}
exports.LoseHpEvent = LoseHpEvent;
/** 扣减体力事件 */
class ReduceHpEvent extends event_1.EventProcess {
    static async exec(room, data) {
        return room.reducehp(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = [
            "ReduceHpStart" /* EventTriggers.ReduceHpStart */,
            "ReduceHp" /* EventTriggers.ReduceHp */,
            "ReduceHpAfter" /* EventTriggers.ReduceHpAfter */,
        ];
        this.endTriggers = ["ReduceHpEnd" /* EventTriggers.ReduceHpEnd */];
        const damage = this.getDamage();
        if (damage &&
            this.player.chained &&
            damage.damageType !== 0 /* DamageType.None */) {
            await this.room.chain({
                player: this.player,
                to_state: false,
                damageType: damage.damageType,
                source: this,
                reason: 'chain_conduct',
            });
            if (!damage.isChain &&
                this.room.getPlayerByFilter((v) => v.chained).length > 0) {
                damage.triggerChain = true;
            }
        }
    }
    async [`${"ReduceHp" /* EventTriggers.ReduceHp */}_After`]() {
        // this.player.changeHp(this.player.hp - this.number);
        const damage = this.getDamage();
        if (damage) {
            if (this.player.shield) {
                const s = this.player.shield - this.number;
                this.player.shield -= this.number;
                if (this.player.shield < 0) {
                    this.player.changeHp(this.player.hp - this.player.shield * -1);
                }
                this.player.setProperty('shield', this.player.shield);
            }
            else {
                this.player.changeHp(this.player.hp - this.number);
            }
            let log;
            if (damage.from) {
                log = {
                    text: '#DamageLog1',
                    values: [
                        { type: 'player', value: damage.from.playerId },
                        { type: 'player', value: damage.to.playerId },
                        { type: 'number', value: damage.number },
                        {
                            type: 'string',
                            value: `damage${damage.damageType}`,
                        },
                        { type: 'number', value: damage.to.hp },
                        { type: 'number', value: damage.to.maxhp },
                    ],
                };
            }
            else {
                log = {
                    text: '#DamageLog2',
                    values: [
                        { type: 'player', value: damage.to.playerId },
                        { type: 'number', value: damage.number },
                        {
                            type: 'string',
                            value: `damage${damage.damageType}`,
                        },
                        { type: 'number', value: damage.to.hp },
                        { type: 'number', value: damage.to.maxhp },
                    ],
                };
            }
            this.room.broadcast({
                type: 'MsgPlayFaceAni',
                player: damage.to.playerId,
                ani: 'damage',
                audio: `./audio/system/damage${this.number > 3 ? 3 : this.number}.mp3`,
                log,
            });
        }
        const lose = this.getLosehp();
        if (lose) {
            this.player.changeHp(this.player.hp - this.number);
            this.room.broadcast({
                type: 'MsgPlayFaceAni',
                player: this.player.playerId,
                ani: 'losehp',
                audio: './audio/system/losehp.mp3',
                log: {
                    text: '#LoseHp',
                    values: [
                        { type: 'player', value: lose.player.playerId },
                        { type: 'number', value: this.number },
                        { type: 'number', value: lose.player.hp },
                        { type: 'number', value: lose.player.maxhp },
                    ],
                },
            });
        }
        this.room.insertHistory(this);
    }
    async [`${"ReduceHpAfter" /* EventTriggers.ReduceHpAfter */}_After`]() {
        if (this.player.inthp <= 0) {
            await this.room.dying({
                player: this.player,
                source: this,
                reason: 'dying_reducehp',
            });
        }
    }
    check_event() {
        return this.player.alive;
    }
    check() {
        return this.player && this.player.alive;
    }
    /** 获取对应的伤害事件 */
    getDamage() {
        if (this.source instanceof DamageEvent && this.reason === 'reducehp') {
            return this.source;
        }
    }
    /** 获取对应的失去体力事件 */
    getLosehp() {
        if (this.source instanceof LoseHpEvent && this.reason === 'reducehp') {
            return this.source;
        }
    }
}
exports.ReduceHpEvent = ReduceHpEvent;
