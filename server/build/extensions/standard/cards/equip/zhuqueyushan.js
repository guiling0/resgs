"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhuque_skill = exports.zhuque = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.zhuque = sgs.CardUseEquip({
    name: 'zhuqueyushan',
});
sgs.setCardData('zhuqueyushan', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'an',
});
exports.zhuque_skill = sgs.Skill({
    name: 'zhuqueyushan',
    attached_equip: 'zhuqueyushan',
});
exports.zhuque_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 4;
        }
    },
}));
exports.zhuque_skill.addEffect(sgs.TriggerEffect({
    anim: 'zhuqueyushan_skill',
    audio: ['zhuqueyushan'],
    auto_log: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "DeclareUseCard" /* EventTriggers.DeclareUseCard */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { from, card } = data;
            return card.isCommonSha() && player === from;
        }
    },
    async cost(room, data, context) {
        data.card.sourceData.attr.push(1 /* CardAttr.Fire */);
        return true;
    },
}));
