"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taiping_delay = exports.taiping_skill = exports.taipingyaoshu = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.taipingyaoshu = sgs.CardUseEquip({
    name: 'taipingyaoshu',
});
sgs.setCardData('taipingyaoshu', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'u',
});
exports.taiping_skill = sgs.Skill({
    name: 'taipingyaoshu',
    attached_equip: 'taipingyaoshu',
});
exports.taiping_skill.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) {
            return this.room.getPlayerCountByKingdom(from.kingdom, false, true);
        }
    },
}));
exports.taiping_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    anim: 'taipingyaoshu1_skill',
    audio: ['taipingyaoshu1'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.damageType !== 0 /* DamageType.None */ &&
            data.to === player);
    },
    async cost(room, data, context) {
        return await data.prevent();
    },
}));
exports.taiping_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.get(this.skill.sourceEquip)?.fromArea === player.equipArea);
    },
    async cost(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('taiping_effect_delay', from);
        effect.setData('data', data);
        return true;
    },
}));
exports.taiping_delay = sgs.TriggerEffect({
    name: 'taiping_effect_delay',
    anim: 'taipingyaoshu2_skill',
    audio: ['taipingyaoshu2'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        if (from.hp > 1) {
            await room.losehp({
                player: from,
                number: 1,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: "MoveCardEnd" /* EventTriggers.MoveCardEnd */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
