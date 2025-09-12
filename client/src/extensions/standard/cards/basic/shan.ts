import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardToCardEvent } from '../../../../core/event/types/event.use';

export const shan = sgs.CardUse({
    name: 'shan',
    method: 1,
    trigger: EventTriggers.CardEffectBefore,
    prompt(room, from, card, context) {
        if (context.prompt) return context.prompt;
        else return '';
    },
    condition(room, from, card, data) {
        if (
            data.is(sgs.DataType.UseCardEvent) &&
            data.card.name === 'sha' &&
            data.current.target === from
        ) {
            return data.card;
        }
    },
    async effect(room, target, data: UseCardToCardEvent) {
        const { from, source } = data;
        if (
            source.is(sgs.DataType.UseCardEvent) &&
            source.card.name === 'sha' &&
            source.current.target === from
        ) {
            source.current.offset = data;
        }
    },
});

sgs.setCardData('shan', {
    type: CardType.Basic,
    subtype: CardSubType.Basic,
    rhyme: 'an',
});
