"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bingliangcunduan = void 0;
exports.bingliangcunduan = sgs.CardUse({
    name: 'bingliangcunduan',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item && !item.hasJudgeCard('bingliangcunduan');
            },
        });
    },
    distanceCondition(room, from, target, card) {
        return from.distanceTo(target) === 1;
    },
    async effect(room, target, data) {
        const judge = await room.judge({
            player: target.target,
            isSucc(result) {
                return result.suit !== 3 /* CardSuit.Club */;
            },
            source: data,
            reason: this.name,
        });
        if (judge.success) {
            await room.currentTurn.skipPhase(3 /* Phase.Draw */);
        }
    },
});
sgs.setCardData('bingliangcunduan', {
    type: 2 /* CardType.Scroll */,
    subtype: 22 /* CardSubType.DelayedScroll */,
    length: 4,
    rhyme: 'an',
});
