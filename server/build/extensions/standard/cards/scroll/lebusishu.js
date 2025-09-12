"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lebusishu = void 0;
exports.lebusishu = sgs.CardUse({
    name: 'lebusishu',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item && !item.hasJudgeCard('lebusishu');
            },
        });
    },
    async effect(room, target, data) {
        const judge = await room.judge({
            player: target.target,
            isSucc(result) {
                return result.suit !== 2 /* CardSuit.Heart */;
            },
            source: data,
            reason: this.name,
        });
        if (judge.success) {
            await room.currentTurn.skipPhase(4 /* Phase.Play */);
        }
    },
});
sgs.setCardData('lebusishu', {
    type: 2 /* CardType.Scroll */,
    subtype: 22 /* CardSubType.DelayedScroll */,
    length: 4,
    rhyme: 'u',
});
