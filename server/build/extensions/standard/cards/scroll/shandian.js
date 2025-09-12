"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shandian = void 0;
const shandian_end = sgs.TriggerEffect({
    name: 'shandian_end',
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.UseCardSpecialEvent) &&
            data.card.name === 'shandian' &&
            !data.data.damaged);
    },
    async cost(room, data, context) {
        let target = data.target.target.next;
        while (true) {
            if (!target)
                break;
            const putto = room.createEventData(sgs.DataType.PutToCardsData, {
                player: target,
                cards: data.card.subcards,
                toArea: target.judgeArea,
                movetype: 1 /* CardPut.Up */,
                puttype: 1 /* CardPut.Up */,
                animation: false,
                source: data,
                reason: this.name,
            });
            if (putto.check()) {
                await room.puto(putto);
                break;
            }
            else {
                target = target.next;
            }
            if (target === data.target.target.next)
                break;
        }
        return true;
    },
});
exports.shandian = sgs.CardUse({
    name: 'shandian',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [shandian_end.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item && !item.hasJudgeCard('shandian');
            },
            auto: true,
        });
    },
    async effect(room, target, data) {
        const judge = await room.judge({
            player: target.target,
            isSucc(result) {
                return (result.suit === 1 /* CardSuit.Spade */ &&
                    result.number >= 2 &&
                    result.number <= 9);
            },
            source: data,
            reason: this.name,
        });
        if (judge.success) {
            data.data.damaged = true;
            await room.damage({
                to: target.target,
                number: 3,
                damageType: 2 /* DamageType.Thunder */,
                channel: data.card,
                isChain: false,
                source: data,
                reason: this.name,
            });
        }
    },
});
sgs.setCardData('shandian', {
    type: 2 /* CardType.Scroll */,
    subtype: 22 /* CardSubType.DelayedScroll */,
    length: 2,
    damage: true,
    rhyme: 'an',
});
