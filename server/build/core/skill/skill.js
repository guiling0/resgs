"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = void 0;
const effect_1 = require("./effect");
const skill_types_1 = require("./skill.types");
class Skill {
    constructor(id, room, player, data, options) {
        this.broadcastCustom = (data) => {
            this.room.markChanges.push({
                objType: 'skill',
                objId: this.id,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        /** 所有效果 */
        this.effects = [];
        /** 所有触发效果 */
        this.trigger_effects = [];
        /** 所有状态效果 */
        this.state_effects = [];
        /** 技能失效状态 */
        this._invalids = [];
        /** 是否预亮 */
        this.preshow = true;
        this.id = id;
        this.room = room;
        this.player = player;
        this.data = data;
        this.options = options;
        this.trueName = data.name.split('.').at(-1);
        if (player) {
            if (options.source === 'head_general') {
                this.sourceGeneral = player.head;
            }
            if (options.source === 'deputy_general') {
                this.sourceGeneral = player.deputy;
            }
        }
        if (this.options.source.includes('effect:')) {
            this.sourceEffect = this.room.getEffect(Number(this.options.source.split(':')[1]));
        }
        if (data.audio) {
            this.audios = [];
            if (this.data.attached_equip) {
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
        else {
            this.setAudio();
        }
        this.audios = this.audios ?? [];
        sgs.utils.shuffle(this.audios);
    }
    setAudio() {
        const assets = sgs.skillAssets[this.name];
        if (assets && assets.audios && assets.audios.length) {
            this.audios = [];
            assets.audios.forEach((v) => {
                this.audios.push(`${v}.mp3`);
            });
        }
    }
    get DataId() {
        return this.data.name;
    }
    get name() {
        return this.data.name;
    }
    /**
     * 设置技能的失效状态
     * @param reason 失效原因
     * @param state 状态 true为该技能因原因失效，false为该技能不再因原因而失效
     */
    setInvalids(reason, state = true) {
        if (state && !this._invalids.includes(reason)) {
            this._invalids.push(reason);
        }
        else {
            const index = this._invalids.indexOf(reason);
            if (index > -1) {
                this._invalids.splice(index, 1);
            }
        }
    }
    /** 技能是否失效 */
    get isInvalid() {
        return this._invalids.length > 0;
    }
    /** 所属武将牌是否明置
     * @description 如果该技能没有拥有者或来源不为武将牌，则返回true
     */
    isOpen() {
        if (!this.player)
            return true;
        if (this.sourceGeneral === this.player.head)
            return this.player.headOpen;
        if (this.sourceGeneral === this.player.deputy)
            return this.player.deputyOpen;
        return true;
    }
    check() {
        if (this.sourceEffect && this.sourceEffect.skill !== this) {
            if (!this.sourceEffect.isOpen())
                return false;
            if (!this.sourceEffect.check())
                return false;
        }
        //未预亮不能发动
        if (!this.preshow)
            return false;
        //技能失效不能发动
        if (this.isInvalid)
            return false;
        if (this.data.condition && !this.data.condition.call(this, this.room))
            return false;
        return true;
    }
    /** 失去本技能 */
    async removeSelf() {
        await this.room.removeSkill(this);
    }
    async handle() {
        for (const effect of this.effects) {
            await effect.handle();
        }
        if (this.isOpen() && !this.preshow) {
            this.preshow = true;
            this.room.broadcast({
                type: 'MsgSkillState',
                id: this.id,
                preshow: true,
            });
        }
    }
    visible() {
        if (this.data.attached_equip) {
            return !this.player.equipCards.find((v) => v.name === this.name);
        }
        if (!this.data.visible || !this.data.visible.call(this, this.room)) {
            return false;
        }
        //忽略主副将技标签，只要效果中有被忽略的就显示
        const hd = this.effects.some((e) => this.room
            .getStates(skill_types_1.StateEffectType.IgnoreHeadAndDeputy, [e])
            .some((v) => v));
        if (!hd) {
            const head = this.effects.some((v) => v.hasTag(2 /* SkillTag.Head */));
            if (head && this.sourceGeneral !== this.player.head) {
                return false;
            }
            const deputy = this.effects.some((v) => v.hasTag(3 /* SkillTag.Deputy */));
            if (deputy && this.sourceGeneral !== this.player.deputy) {
                return false;
            }
        }
        return true;
    }
    global(player) {
        if (this.data.attached_equip) {
            return !this.player.equipCards.find((v) => v.name === this.name);
        }
        return (this.data.global && this.data.global.call(this, this.room, player));
    }
    /** 是否包含锁定技标签的效果 */
    hasLockEffect() {
        return this.effects.some((v) => v.hasTag(1 /* SkillTag.Lock */));
    }
    /** 是否可以设置预亮 */
    canPreshow() {
        return (!this.effects.length ||
            !this.effects.every((v) => {
                if (v instanceof effect_1.StateEffect)
                    return true;
                if (v instanceof effect_1.TriggerEffect) {
                    if (v.inTrigger("NeedUseCard1" /* EventTriggers.NeedUseCard1 */))
                        return true;
                    if (v.inTrigger("NeedUseCard2" /* EventTriggers.NeedUseCard2 */))
                        return true;
                    if (v.inTrigger("NeedUseCard3" /* EventTriggers.NeedUseCard3 */))
                        return true;
                    if (v.inTrigger("NeedPlayCard1" /* EventTriggers.NeedPlayCard1 */))
                        return true;
                    if (v.inTrigger("NeedPlayCard2" /* EventTriggers.NeedPlayCard2 */))
                        return true;
                    if (v.inTrigger("NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */))
                        return true;
                    if (v.inTrigger("PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */))
                        return true;
                }
                return false;
            }));
    }
}
exports.Skill = Skill;
