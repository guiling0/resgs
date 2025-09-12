"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhugeliannu_skill = exports.zhugeliannu = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.zhugeliannu = sgs.CardUseEquip({
    name: 'zhugeliannu',
});
sgs.setCardData('zhugeliannu', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'u',
});
exports.zhugeliannu_skill = sgs.Skill({
    name: 'zhugeliannu',
    attached_equip: 'zhugeliannu',
});
exports.zhugeliannu_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 1;
        }
    },
    [skill_types_1.StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        return this.isOwner(from) && card.name === 'sha';
    },
}));
exports.zhugeliannu_skill.addEffect(sgs.TriggerEffect({
    anim: 'zhugeliannu_skill',
    audio: ['zhugeliannu'],
    auto_log: 1,
    priorityType: 0 /* PriorityType.None */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (data.is(sgs.DataType.UseCardEvent)) {
            const { from, card } = data;
            return (card.name === 'sha' &&
                this.player === from &&
                this.player.getMark('__sha_times') >= 2);
        }
    },
}));
