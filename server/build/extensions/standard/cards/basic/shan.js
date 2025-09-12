"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shan = void 0;
exports.shan = sgs.CardUse({
    name: 'shan',
    method: 1,
    trigger: "CardEffectBefore" /* EventTriggers.CardEffectBefore */,
    prompt(room, from, card, context) {
        if (context.prompt)
            return context.prompt;
        else
            return '';
    },
    condition(room, from, card, data) {
        if (data.is(sgs.DataType.UseCardEvent) &&
            data.card.name === 'sha' &&
            data.current.target === from) {
            return data.card;
        }
    },
    async effect(room, target, data) {
        const { from, source } = data;
        if (source.is(sgs.DataType.UseCardEvent) &&
            source.card.name === 'sha' &&
            source.current.target === from) {
            source.current.offset = data;
        }
    },
});
sgs.setCardData('shan', {
    type: 1 /* CardType.Basic */,
    subtype: 1 /* CardSubType.Basic */,
    rhyme: 'an',
});
