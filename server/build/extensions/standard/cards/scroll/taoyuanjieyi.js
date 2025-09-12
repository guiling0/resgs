"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoyuanjieyi = void 0;
const taoyuanjieyi_invalid = sgs.TriggerEffect({
    name: 'taoyuanjieyi_invalid',
    priorityType: 3 /* PriorityType.Card */,
    trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.UseCardEvent) &&
            data.current.target === player &&
            data.card.name === 'taoyuanjieyi' &&
            player.losshp === 0);
    },
    async cost(room, data, context) {
        data.current.invalid = true;
        return true;
    },
});
exports.taoyuanjieyi = sgs.CardUse({
    name: 'taoyuanjieyi',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [taoyuanjieyi_invalid.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return true;
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        data.baseRecover = 1;
    },
    async effect(room, target, data) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('taoyuanjieyi', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'i',
});
