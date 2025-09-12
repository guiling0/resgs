"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiesuolianhuan = void 0;
exports.tiesuolianhuan = sgs.CardUse({
    name: 'tiesuolianhuan',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, 2],
            filter(item, selected) {
                return true;
            },
        });
    },
    async effect(room, target, data) {
        const { current } = data;
        await room.chain({
            player: current.target,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('tiesuolianhuan', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'an',
});
