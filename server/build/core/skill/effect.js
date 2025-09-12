"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateEffect = exports.TriggerEffect = exports.Effect = void 0;
const skill_types_1 = require("./skill.types");
class Effect {
    constructor(id, room, player, skill) {
        this.broadcastCustom = (data) => {
            this.room.markChanges.push({
                objType: 'effect',
                objId: this.id,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        /** 每名玩家因此技能而视为拥有的技能 */
        this.regardSkills = new Map();
        /** 技能失效状态 */
        this._invalids = [];
        this.id = id;
        this.room = room;
        this.player = player;
        this.skill = skill;
    }
    get DataId() {
        return this.data.name;
    }
    get name() {
        return this.skill?.name ?? this.data.name;
    }
    /**
     * 设置技能的失效状态
     * @param reason 失效原因
     * @param state 状态 true为该技能因原因失效，false为该技能不再因原因而失效
     */
    setInvalids(reason, state = true) {
        if (state) {
            if (!this._invalids.includes(reason)) {
                this._invalids.push(reason);
            }
        }
        else {
            lodash.remove(this._invalids, (v) => v === reason);
        }
    }
    /** 技能是否失效 */
    get isInvalid() {
        if (this.hasTag(10 /* SkillTag.Eternal */))
            return false;
        return (this._invalids.length > 0 ||
            this.room
                .getStates(skill_types_1.StateEffectType.Skill_Invalidity, [this])
                .some((v) => v));
    }
    check(data) {
        //技能失效不能发动
        if (this.isInvalid)
            return false;
        if (this.skill && !this.skill.check())
            return false;
        const hd = this.skill &&
            this.room
                .getStates(skill_types_1.StateEffectType.IgnoreHeadAndDeputy, [this])
                .some((v) => v);
        if (!hd) {
            //主副将技
            if (this.hasTag(2 /* SkillTag.Head */)) {
                if (this.skill &&
                    this.player &&
                    this.skill.sourceGeneral !== this.player.head)
                    return false;
            }
            if (this.hasTag(3 /* SkillTag.Deputy */)) {
                if (this.skill &&
                    this.player &&
                    this.skill.sourceGeneral !== this.player.deputy)
                    return false;
            }
        }
        //限定技
        if (this.isLimit) {
            const limit = this.player?.getMark(`@limit:${this.id}`);
            if (!limit || limit === '@limit-false')
                return false;
        }
        //阵法技
        if (this.isArray) {
            if (this.room.aliveCount < 4)
                return false;
        }
        return true;
    }
    /** 检测某玩家是否是该效果的拥有者 */
    isOwner(player) {
        return this.player === player;
    }
    /** 所属技能是否明置 */
    isOpen() {
        return (this.skill?.isOpen() ?? true) || this.hasTag(9 /* SkillTag.Secret */);
    }
    /** 移除自身 */
    async removeSelf() {
        await this.room.removeEffect(this);
    }
    async onObtain() {
        await this.handle();
        if (this.player) {
            this.data.mark.forEach((v) => {
                this.player.setMark(v, true, {
                    visible: true,
                });
            });
        }
    }
    async onLose() {
        if ((this.isLimit && this, this.player)) {
            this.player.removeMark(`@limit:${this.id}`);
        }
        if (this.player) {
            this.data.mark.forEach((v) => {
                this.player.removeMark(v);
            });
        }
        const cards = [];
        this.room.playerAlives.forEach((v) => {
            //将所有因此技能移动至角色武将牌上和武将牌旁的牌置入弃牌堆
            v.upArea.cards.forEach((c) => {
                const move = this.room.getLastOneHistory(sgs.DataType.MoveCardEvent, (d) => d.has(c));
                if (move && this.name === move.reason) {
                    cards.push(c);
                }
            });
            v.sideArea.cards.forEach((c) => {
                const move = this.room.getLastOneHistory(sgs.DataType.MoveCardEvent, (d) => d.has(c));
                if (move && this.name === move.reason) {
                    cards.push(c);
                }
            });
            //所有因此技能添加的标记失去
            const marks = Object.keys(v._mark).filter((key) => {
                const mark = v._mark[key];
                return mark && this.name === mark.options.source;
            });
            if (marks.length) {
                marks.forEach((key) => {
                    v.removeMark(key);
                });
            }
        });
        if (cards.length > 0) {
            await this.room.puto({
                player: this.player,
                cards,
                toArea: this.room.discardArea,
                source: this.room.events.at(-1),
                reason: 'remove_handle',
            });
        }
    }
    async handle() {
        if (this.isLimit && this.player) {
            const visible = this.isOpen();
            const limit = this.player.getMark(`@limit:${this.id}`) ??
                '@limit-true';
            this.player.setMark(`@limit:${this.id}`, limit, {
                type: 'img',
                visible: visible ? true : [this.player.playerId],
                url: limit,
            });
        }
        if (!this.isOpen()) {
            const cards = [];
            this.room.playerAlives.forEach((v) => {
                //将所有因此技能移动至角色武将牌上和武将牌旁的牌置入弃牌堆
                v.upArea.cards.forEach((c) => {
                    const move = this.room.getLastOneHistory(sgs.DataType.MoveCardEvent, (d) => d.has(c));
                    if (move && this.name === move.reason) {
                        cards.push(c);
                    }
                });
                v.sideArea.cards.forEach((c) => {
                    const move = this.room.getLastOneHistory(sgs.DataType.MoveCardEvent, (d) => d.has(c));
                    if (move && this.name === move.reason) {
                        cards.push(c);
                    }
                });
                //所有因此技能添加的标记失去
                const marks = Object.keys(v._mark).filter((key) => {
                    const mark = v._mark[key];
                    return mark && this.name === mark.options.source;
                });
                if (marks.length) {
                    marks.forEach((key) => {
                        v.removeMark(key);
                    });
                }
            });
            if (cards.length > 0) {
                await this.room.puto({
                    player: this.player,
                    cards,
                    toArea: this.room.discardArea,
                    source: this.room.events.at(-1),
                    reason: 'remove_handle',
                });
            }
        }
    }
    hasTag(tag) {
        return tag === undefined
            ? this.data.tag && this.data.tag.length > 0
            : this.data?.tag.includes(tag);
    }
    /** 是否为锁定技 */
    get isLock() {
        return this.data.tag?.includes(1 /* SkillTag.Lock */) || this.isAwake;
    }
    /** 是否为限定技 */
    get isLimit() {
        return this.data.tag?.includes(5 /* SkillTag.Limit */) || this.isAwake;
    }
    /** 是否为觉醒技 */
    get isAwake() {
        return this.data.tag?.includes(4 /* SkillTag.Awake */);
    }
    /** 是否为主公技/君主技 */
    get isLord() {
        return this.data.tag?.includes(6 /* SkillTag.Lord */);
    }
    /** 是否为阵法技 */
    get isArray() {
        return (this.data.tag?.includes(7 /* SkillTag.Array_Quene */) ||
            this.data.tag?.includes(8 /* SkillTag.Array_Siege */));
    }
}
exports.Effect = Effect;
class TriggerEffect extends Effect {
    constructor(id, room, player, data, skill) {
        super(id, room, player, skill);
        this.data = data;
        if (data.audio) {
            this.audios = [];
            if (this.skill && this.skill.data.attached_equip) {
                data.audio.forEach((v) => {
                    this.audios.push(`audio/equip/${v}.mp3`);
                });
            }
            else {
                data.audio.forEach((v) => {
                    this.audios.push(`generals/${v}.mp3`);
                });
            }
        }
        if (this.audios)
            sgs.utils.shuffle(this.audios);
    }
    check(data) {
        if (!super.check(data))
            return false;
        //lifes
        const lifes = this.room.lifes.get("onCheck" /* EventTriggers.onCheck */);
        if (lifes && lifes.before.length) {
            const before = lifes.before.find((v) => v.effect === this);
            if (before) {
                before.life.on_check?.call(this, this.room, data) ?? true;
                if (!before)
                    return false;
            }
            const after = lifes.before.find((v) => v.effect === this);
            if (after) {
                after.life.on_check?.call(this, this.room, data) ?? true;
                if (!after)
                    return false;
            }
        }
        //国战化身耦合检测-有标签的技能不通过检测
        if (this.skill && this.skill.getData('huashen_source')) {
            const general = this.skill.getData('huashen_source');
            if (this.room.getData(`huashen_cost_${general.id}`))
                return false;
            if (this.hasTag())
                return false;
        }
        if (this.skill &&
            this.skill.sourceGeneral &&
            !this.isOpen() &&
            !this.hasTag(9 /* SkillTag.Secret */) &&
            this.player) {
            if (this.room
                .getStates(skill_types_1.StateEffectType.Prohibit_Open, [
                this.player,
                [this.skill.sourceGeneral],
                'useskill',
            ])
                .some((v) => v)) {
                return false;
            }
        }
        if (data) {
            //国战化身耦合检测-于一个时机发动过技能不通过检测
            if (this.skill && this.skill.getData('huashen_source')) {
                if (data.data[`wars.huashen.${data.trigger}`])
                    return false;
            }
            if (Array.isArray(this.data.trigger) &&
                !this.data.trigger.includes(data.trigger))
                return false;
            if (!Array.isArray(this.data.trigger) &&
                data.trigger !== this.data.trigger)
                return false;
            const can_trigger = Boolean(this.data.can_trigger.call(this, this.room, data.triggerCurrent, data));
            if (!can_trigger)
                return false;
        }
        return true;
    }
    getContext(data) {
        const context = this.data.context?.call(this, this.room, data.triggerCurrent, data) ?? {};
        context.effect = this;
        context.maxTimes = context.maxTimes ?? 1;
        context.from = context.from ?? data.triggerCurrent ?? this.player;
        return context;
    }
    getSelectorName(name) {
        return `${this.data.name}.${name}`;
    }
    inTrigger(trigger) {
        if (Array.isArray(this.data.trigger)) {
            return this.data.trigger.includes(trigger);
        }
        else {
            return this.data.trigger === trigger;
        }
    }
}
exports.TriggerEffect = TriggerEffect;
class StateEffect extends Effect {
    constructor(id, room, player, data, skill) {
        super(id, room, player, skill);
        this.data = data;
    }
    check() {
        //lifes
        const lifes = this.room.lifes.get("onCheck" /* EventTriggers.onCheck */);
        if (lifes && lifes.before.length) {
            const before = lifes.before.find((v) => v.effect === this);
            if (before) {
                before.life.on_check?.call(this, this.room) ?? true;
                if (!before)
                    return false;
            }
            const after = lifes.before.find((v) => v.effect === this);
            if (after) {
                after.life.on_check?.call(this, this.room) ?? true;
                if (!after)
                    return false;
            }
        }
        //国战化身耦合检测-不通过检测
        if (this.skill && this.skill.getData('huashen_source')) {
            return false;
        }
        if (!super.check())
            return false;
        if (!this.isOpen())
            return false;
        return true;
    }
}
exports.StateEffect = StateEffect;
