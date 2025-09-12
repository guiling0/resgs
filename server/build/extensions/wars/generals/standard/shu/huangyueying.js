"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qicai = exports.jizhi = exports.huangyueying = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.huangyueying = sgs.General({
    name: 'wars.huangyueying',
    kingdom: 'shu',
    hp: 1.5,
    gender: 2 /* Gender.Female */, isWars: true,
});
exports.jizhi = sgs.Skill({
    name: 'wars.huangyueying.jizhi',
});
exports.jizhi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.card.subtype === 21 /* CardSubType.InstantScroll */ &&
            data.from === player &&
            !data.card.transform);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.qicai = sgs.Skill({
    name: 'wars.huangyueying.qicai',
});
exports.qicai.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        return (this.isOwner(from) &&
            sgs.utils.getCardType(card.name) === 2 /* CardType.Scroll */);
    },
}));
exports.huangyueying.addSkill(exports.jizhi);
exports.huangyueying.addSkill(exports.qicai);
