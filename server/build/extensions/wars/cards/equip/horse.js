"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liulong_skill = exports.liulongcanjia = exports.chitu_skill = exports.jingfan = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
function offensiveMountCorrect(from, to) {
    if (this.isOwner(from)) {
        return -1;
    }
}
exports.jingfan = sgs.CardUseEquip({
    name: 'jingfan',
});
sgs.setCardData('jingfan', {
    type: 3 /* CardType.Equip */,
    subtype: 34 /* CardSubType.OffensiveMount */,
    rhyme: 'an',
});
exports.chitu_skill = sgs.Skill({
    name: 'jingfan',
    attached_equip: 'jingfan',
});
exports.chitu_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: offensiveMountCorrect,
}));
exports.liulongcanjia = sgs.CardUseEquip({
    name: 'liulongcanjia',
});
sgs.setCardData('liulongcanjia', {
    type: 3 /* CardType.Equip */,
    subtype: 35 /* CardSubType.SpecialMount */,
    rhyme: 'a',
});
exports.liulong_skill = sgs.Skill({
    name: 'liulongcanjia',
    attached_equip: 'liulongcanjia',
});
exports.liulong_skill.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(to)) {
            return 1;
        }
        if (this.isOwner(from)) {
            return -1;
        }
    },
    /** 5不能使用坐骑牌 */
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (this.isOwner(from)) {
            const type = sgs.utils.getCardSubtype(card.name);
            if (type === 33 /* CardSubType.DefensiveMount */ ||
                type === 34 /* CardSubType.OffensiveMount */ ||
                type === 35 /* CardSubType.SpecialMount */) {
                return true;
            }
        }
    },
}));
/** 3当【六龙骖驾】移至你的装备区后❶，你弃置你的装备区里所有其他坐骑牌。 */
exports.liulong_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.has(this.skill?.sourceEquip);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.dropCards({
            player: from,
            cards: from
                .getHorses()
                .filter((v) => v !== this.skill?.sourceEquip),
            source: data,
            reason: this.name,
        });
    },
}));
/** 4 锁定技，当坐骑牌移至你的装备区前❶，你将目标区域改为弃牌堆。*/
exports.liulong_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((v, c) => v.toArea === player.equipArea &&
                (c.subtype === 33 /* CardSubType.DefensiveMount */ ||
                    c.subtype === 34 /* CardSubType.OffensiveMount */ ||
                    c.subtype === 35 /* CardSubType.SpecialMount */)));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = [];
        data.move_datas.forEach((v) => {
            if (v.toArea === from.equipArea) {
                v.cards.forEach((c) => {
                    if (c.subtype === 33 /* CardSubType.DefensiveMount */ ||
                        c.subtype === 34 /* CardSubType.OffensiveMount */ ||
                        c.subtype === 35 /* CardSubType.SpecialMount */) {
                        cards.push(c);
                    }
                });
            }
        });
        if (cards.length) {
            await data.cancle(cards, false);
            data.add({
                cards: cards,
                toArea: room.discardArea,
                reason: 1 /* MoveCardReason.PutTo */,
                movetype: 1 /* CardPut.Up */,
                puttype: 1 /* CardPut.Up */,
                animation: true,
            });
            return true;
        }
    },
}));
