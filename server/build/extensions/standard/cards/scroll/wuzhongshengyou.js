"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wuzhongshengyou = void 0;
exports.wuzhongshengyou = sgs.CardUse({
    name: 'wuzhongshengyou',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item;
            },
            auto: true,
        });
    },
    async effect(room, target, data) {
        const { current } = data;
        await room.drawCards({
            player: current.target,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('wuzhongshengyou', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'ou',
});
