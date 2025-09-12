"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gudingdao_skill = exports.gudingdao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.gudingdao = sgs.CardUseEquip({
    name: 'gudingdao',
});
sgs.setCardData('gudingdao', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ao',
});
exports.gudingdao_skill = sgs.Skill({
    name: 'gudingdao',
    attached_equip: 'gudingdao',
});
exports.gudingdao_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
}));
exports.gudingdao_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    anim: 'gudingdao_skill',
    audio: ['gudingdao'],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.reason === 'sha' &&
            data.to &&
            !data.to.hasHandCards());
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
}));
