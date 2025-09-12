"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huoshaolianying = void 0;
exports.huoshaolianying = sgs.CardUse({
    name: 'huoshaolianying',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                if (selected.length === 0) {
                    return item === from.next;
                }
                else {
                    return (item !== selected[0] &&
                        room.getQueue(selected[0]).includes(item));
                }
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        data.baseDamage = 1;
    },
    async effect(room, target, data) {
        const { from, current } = data;
        await room.damage({
            from: data.from,
            to: current.target,
            number: data.baseDamage,
            damageType: 1 /* DamageType.Fire */,
            channel: data.card,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('huoshaolianying', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'ing',
    damage: true,
});
