"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huxinjing_skill = exports.huxinjing = void 0;
exports.huxinjing = sgs.CardUseEquip({
    name: 'huxinjing',
});
sgs.setCardData('huxinjing', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'ing',
});
exports.huxinjing_skill = sgs.Skill({
    name: 'huxinjing',
    attached_equip: 'huxinjing',
});
exports.huxinjing_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.number >= player.hp &&
            this.skill &&
            !!this.skill.sourceEquip);
    },
    async cost(room, data, context) {
        const { from } = context;
        const equip = this.skill?.sourceEquip;
        if (equip) {
            return await room.puto({
                player: from,
                cards: [equip],
                toArea: room.discardArea,
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        await data.prevent();
    },
}));
