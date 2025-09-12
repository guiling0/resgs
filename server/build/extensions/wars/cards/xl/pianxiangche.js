"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pianxiangche_skill = exports.pianxiangche = exports.pianxiangche_lose = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.pianxiangche_lose = sgs.TriggerEffect({
    name: 'pianxiangche_lose',
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'pianxiangche' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const pianxiangche = data.getCard((d, c) => c.name === 'pianxiangche' && d.toArea === room.discardArea);
        const _data = data.get(pianxiangche);
        return {
            from: _data.player,
            cards: [pianxiangche],
        };
    },
    async cost(room, data, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});
exports.pianxiangche = sgs.CardUseEquip({
    name: 'pianxiangche',
    effects: [exports.pianxiangche_lose.name],
});
sgs.setCardData('pianxiangche', {
    type: 3 /* CardType.Equip */,
    subtype: 34 /* CardSubType.OffensiveMount */,
    rhyme: 'e',
});
exports.pianxiangche_skill = sgs.Skill({
    name: 'pianxiangche',
    attached_equip: 'pianxiangche',
});
exports.pianxiangche_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(from)) {
            return -1;
        }
        if (this.isOwner(to) &&
            this.room.getSiege(to).find((v) => v.target === to)) {
            return 1;
        }
    },
}));
exports.pianxiangche_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
            const _data = data.get(this.skill.sourceEquip);
            if (!_data)
                return false;
            return (_data.reason === 10 /* MoveCardReason.Obtain */ &&
                _data.toArea.player !== player);
        }
    },
    async cost(room, data, context) {
        return await data.cancle([this.skill.sourceEquip]);
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.removeCard({
            player: from,
            cards: [this.skill.sourceEquip],
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
