"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiling_skill = exports.jilinqianyi = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.jilinqianyi = sgs.CardUseEquip({
    name: 'jilinqianyi',
});
sgs.setCardData('jilinqianyi', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'i',
});
exports.jiling_skill = sgs.Skill({
    name: 'jilinqianyi',
    attached_equip: 'jilinqianyi',
});
exports.jiling_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            // return Math.max(1, from.losshp);
            return from.losshp;
        }
    },
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        const use = this.skill?.getData('data');
        return (use &&
            !use.isComplete &&
            this.player.rangeOf(from) &&
            !use.targetList.find((v) => v.target === from));
    },
}));
exports.jiling_skill.addEffect(sgs.TriggerEffect({
    anim: 'jilinqianyi_skill',
    audio: ['jilinqianyi'],
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
