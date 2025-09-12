"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renwangdun_skill = exports.renwangdun = void 0;
exports.renwangdun = sgs.CardUseEquip({
    name: 'renwangdun',
});
sgs.setCardData('renwangdun', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'un',
});
exports.renwangdun_skill = sgs.Skill({
    name: 'renwangdun',
    attached_equip: 'renwangdun',
});
exports.renwangdun_skill.addEffect(sgs.TriggerEffect({
    anim: 'renwangdun_skill',
    audio: ['renwangdun'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { card, current } = data;
            return (card.name === 'sha' &&
                card.color === 2 /* CardColor.Black */ &&
                player === current.target);
        }
    },
    async cost(room, data, context) {
        await data.invalidCurrent();
        return true;
    },
}));
