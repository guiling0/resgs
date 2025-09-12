"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSkillMixin = void 0;
const event_skill_1 = require("../../event/types/event.skill");
const effect_1 = require("../../skill/effect");
const skill_1 = require("../../skill/skill");
const skill_types_1 = require("../../skill/skill.types");
class RoomSkillMixin {
    /**
     * 添加技能
     * @param this GameRoom
     * @param name 要添加的技能名
     * @param player 技能拥有者
     * @param options 技能设置
     * @returns 添加的技能对象
     */
    async addSkill(skillId, player, options = { source: 'defalut' }) {
        const data = sgs.getSkill(skillId);
        if (!data)
            return;
        options.circle = this.circleCount;
        const skill = new skill_1.Skill(this.skillids++, this, player, data, options);
        this.skills.push(skill);
        this.broadcast({
            type: 'MsgAddSkill',
            id: skill.id,
            player: player?.playerId,
            skill: skillId,
            options,
        });
        //创建效果
        for (const effect_name of data.effects) {
            await this.addEffect(effect_name, skill.player, skill);
        }
        if (this.currentTurn) {
            const data = this.createEventData(event_skill_1.ObtainSkillData, {
                obtain_skill: skill,
                source: undefined,
                reason: 'obtain_effect',
            });
            await this.trigger("onObtainTrigger" /* EventTriggers.onObtainTrigger */, data);
        }
        return skill;
    }
    /** 删除技能 */
    async removeSkill(skill) {
        if (!skill)
            return;
        //删除所有效果
        for (const effect of skill.effects) {
            await this.removeEffect(effect);
        }
        lodash.remove(this.skills, (c) => c === skill);
        this.broadcast({
            type: 'MsgRemoveSkill',
            id: skill.id,
        });
    }
    /**
     * 添加效果
     * @param this GameRoom
     * @param effect_name 要添加的效果名
     * @param player [可选]所属玩家。该属性只用来区分global属性为false时的主体玩家
     * @param fromSkill [可选]所属技能。如果不提供该属性，则此次添加的效果被视为延时效果
     * @returns
     */
    async addEffect(effect_name, player, fromSkill) {
        const data = sgs.getEffect(effect_name);
        if (!data)
            return;
        let effect;
        if (data.type === skill_types_1.EffectType.Trigger) {
            const _effect = new effect_1.TriggerEffect(this.effectids++, this, player, data, fromSkill);
            this.trigger_effects.push(_effect);
            if (_effect.skill) {
                _effect.skill.effects.push(_effect);
                _effect.skill.trigger_effects.push(_effect);
            }
            if (data.name === 'base_selectors') {
                this.base_selectors = _effect;
            }
            if (this.trigger_effects_priority.get(data.priorityType)) {
                this.trigger_effects_priority
                    .get(data.priorityType)
                    .push(_effect);
            }
            else {
                this.trigger_effects_priority.set(data.priorityType, [_effect]);
            }
            effect = _effect;
        }
        if (data.type === skill_types_1.EffectType.State) {
            const _effect = new effect_1.StateEffect(this.effectids++, this, player, data, fromSkill);
            this.state_effects.push(_effect);
            if (_effect.skill) {
                _effect.skill.effects.push(_effect);
                _effect.skill.state_effects.push(_effect);
            }
            effect = _effect;
        }
        if (effect) {
            this.broadcast({
                type: 'MsgAddEffect',
                id: effect.id,
                effect_name,
                player: player?.playerId,
                skill: fromSkill?.id,
            });
            this.effects.push(effect);
            //定义声明周期
            let obtain = [];
            effect.data.lifecycle.forEach((v) => {
                if (!v.priority)
                    v.priority = 'after';
                if (Array.isArray(v.trigger)) {
                    v.trigger.forEach((t) => {
                        if (!this.lifes.get(t)) {
                            this.lifes.set(t, {
                                before: [],
                                after: [],
                            });
                        }
                        this.lifes.get(t)[v.priority].push({
                            effect,
                            life: v,
                        });
                        if (t === "onObtain" /* EventTriggers.onObtain */) {
                            obtain.push(v);
                        }
                    });
                }
                else {
                    if (!this.lifes.get(v.trigger)) {
                        this.lifes.set(v.trigger, { before: [], after: [] });
                    }
                    this.lifes.get(v.trigger)[v.priority].push({
                        effect,
                        life: v,
                    });
                    if (v.trigger === "onObtain" /* EventTriggers.onObtain */) {
                        obtain.push(v);
                    }
                }
            });
            //执行获得效果时的周期
            for (const o of obtain) {
                await o.on_exec?.call(effect, this);
            }
            await effect.onObtain();
            //处理效果的视为拥有技能
            if (effect.data.regard_skill) {
                this.hasregard_effects.push(effect);
                await this.handleRegardSkill(this.events.at(-1));
            }
        }
        return effect;
    }
    /** 删除效果 */
    async removeEffect(effect) {
        if (!effect)
            return;
        if (!this.effects.includes(effect))
            return;
        lodash.remove(this.effects, (c) => c === effect);
        lodash.remove(this.trigger_effects, (c) => c === effect);
        lodash.remove(this.state_effects, (c) => c === effect);
        lodash.remove(this.hasregard_effects, (c) => c === effect);
        if (effect instanceof effect_1.TriggerEffect) {
            if (this.trigger_effects_priority.get(effect.data.priorityType)) {
                lodash.remove(this.trigger_effects_priority.get(effect.data.priorityType), (c) => c === effect);
            }
        }
        this.broadcast({
            type: 'MsgRemoveEffect',
            id: effect.id,
        });
        if (effect) {
            //定义声明周期
            let lose = [];
            effect.data.lifecycle.forEach((v) => {
                if (!v.priority)
                    v.priority = 'after';
                if (Array.isArray(v.trigger)) {
                    v.trigger.forEach((t) => {
                        lodash.remove(this.lifes.get(t)[v.priority], (v) => v.effect === effect);
                        if (t === "onLose" /* EventTriggers.onLose */) {
                            lose.push(v);
                        }
                    });
                }
                else {
                    lodash.remove(this.lifes.get(v.trigger)[v.priority], (v) => v.effect === effect);
                    if (v.trigger === "onLose" /* EventTriggers.onLose */) {
                        lose.push(v);
                    }
                }
            });
            //执行获得效果时的周期
            for (const o of lose) {
                await o.on_exec?.call(effect, this);
            }
            await effect.onLose();
            //删除所有视为拥有的技能
            for (const [player, skills] of effect.regardSkills) {
                for (const skill of skills) {
                    await skill.removeSelf();
                }
            }
        }
    }
    /** 根据ID获取一个技能 */
    getSkill(id) {
        return this.skills.find((v) => v.id === id);
    }
    /** 根据ID获取一个效果 */
    getEffect(id) {
        return this.effects.find((v) => v.id === id);
    }
    /** 根据装备获取一个技能 */
    getSkillByEquip(card) {
        return this.skills.find((v) => v.sourceEquip === card);
    }
    /** 获取使用牌的技能 */
    getCardUse(card, _method = 1) {
        let name, method;
        if (typeof card === 'string') {
            const sp = card.split('.');
            name = sp[0];
            method = sp.length > 1 ? Number(sp[1]) : _method;
        }
        else {
            name = card.name;
            method = Number(card.custom?.method ?? _method);
        }
        return (this.card_uses.find((v) => v.name === name && v.method === method) ?? sgs.getCardUse(name, method));
    }
    async handleRegardSkill(data) {
        const players = this.playerAlives;
        for (const effect of this.hasregard_effects) {
            if (!effect.data.regard_skill)
                continue;
            if (!effect.isOpen())
                continue;
            for (const player of players) {
                const skills = effect.check() &&
                    effect.data.regard_skill.call(effect, this, player, data);
                if (skills) {
                    if (Array.isArray(skills)) {
                        for (const skill of skills) {
                            if (!effect.regardSkills
                                .get(player)
                                ?.find((v) => v.name === skill)) {
                                const rs = await this.addSkill(skill, player, {
                                    source: `effect:${effect.id}`,
                                    showui: 'default',
                                });
                                if (rs) {
                                    if (effect.regardSkills.get(player)) {
                                        effect.regardSkills
                                            .get(player)
                                            .push(rs);
                                    }
                                    else {
                                        effect.regardSkills.set(player, [rs]);
                                    }
                                }
                            }
                        }
                    }
                    else if (!effect.regardSkills
                        .get(player)
                        ?.find((v) => v.name === skills)) {
                        const rs = await this.addSkill(skills, player, {
                            source: `effect:${effect.id}`,
                            showui: 'default',
                        });
                        if (rs) {
                            if (effect.regardSkills.get(player)) {
                                effect.regardSkills.get(player).push(rs);
                            }
                            else {
                                effect.regardSkills.set(player, [rs]);
                            }
                        }
                    }
                }
            }
        }
    }
    /** 处理国战左慈的化身 */
    async addWarsHuashen(from, general, mark) {
        const room = from.room;
        const huashen = from.upArea.generals.filter((v) => v.hasMark(mark));
        room.generalArea.remove([general]);
        from.upArea.add([general]);
        general.setMark(mark, true);
        from.setMark(mark, true, {
            source: mark,
            visible: [from.playerId],
            type: 'generals',
            areaId: from.upArea.areaId,
        });
        from.setMark(`${mark}.count`, huashen.length + 1, {
            visible: room.getPlayerIds(room.getPlayerByFilter((v) => v !== from)),
        });
        for (const name of general.skills) {
            if (name.at(0) !== '#') {
                const hskill = await room.addSkill(name, from, {
                    showui: 'other',
                    source: mark,
                });
                hskill.setData('huashen_source', general);
            }
        }
    }
    /** 处理国战左慈的化身 */
    async removeWarsHuashen(from, general, mark) {
        const room = from.room;
        const huashen = from.upArea.generals.filter((v) => v.hasMark(mark));
        from.upArea.remove([general]);
        room.generalArea.add([general]);
        general.removeMark(mark);
        if (huashen.length === 0) {
            from.removeMark(mark);
            from.removeMark(`${mark}.count`);
        }
        else {
            from.refreshMark = mark;
            from.setMark(`${mark}.count`, huashen.length - 1, {
                visible: room.getPlayerIds(room.getPlayerByFilter((v) => v !== from)),
            });
        }
        const skills = room.skills.filter((v) => v.player === from &&
            v.options.source === mark &&
            v.getData('huashen_source') === general);
        for (const skill of skills) {
            await skill.removeSelf();
        }
    }
}
exports.RoomSkillMixin = RoomSkillMixin;
