"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qinglong_skill = exports.qinglongyanyuedao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.qinglongyanyuedao = sgs.CardUseEquip({
    name: 'qinglongyanyuedao',
});
sgs.setCardData('qinglongyanyuedao', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ao',
});
exports.qinglong_skill = sgs.Skill({
    name: 'qinglongyanyuedao',
    attached_equip: 'qinglongyanyuedao',
});
exports.qinglong_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 3;
        }
    },
    [skill_types_1.StateEffectType.Prohibit_Open](player, generals, reason) {
        const use = this.skill?.getData('data');
        return (use &&
            !use.isComplete &&
            !!use.targetList.find((v) => v.target === player));
    },
}));
exports.qinglong_skill.addEffect(sgs.TriggerEffect({
    anim: 'qinglongyanyuedao_skill',
    audio: ['qinglongyanyuedao'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            data.card.name === 'sha');
    },
    async cost(room, data, context) {
        this.skill?.setData('data', data);
        return true;
    },
}));
