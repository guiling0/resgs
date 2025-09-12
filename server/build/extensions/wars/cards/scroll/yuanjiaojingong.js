"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yuanjiaojingong = void 0;
exports.yuanjiaojingong = sgs.CardUse({
    name: 'yuanjiaojingong',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return room.differentAsKingdom(from, item);
            },
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        await room.drawCards({
            player: current.target,
            count: 1,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('yuanjiaojingong', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'ong',
});
