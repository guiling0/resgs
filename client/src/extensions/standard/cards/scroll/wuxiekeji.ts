import {
    CardAttr,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardToCardEvent } from '../../../../core/event/types/event.use';

export const wuxiekeji = sgs.CardUse({
    name: 'wuxiekeji',
    method: 1,
    trigger: EventTriggers.CardEffectBefore,
    sameTime: true,
    prompt(room, from, card, context) {
        if (context.prompt) return context.prompt;
        else return '';
    },
    condition(room, from, card, data) {
        if (
            (data.is(sgs.DataType.UseCardEvent) &&
                data.card.type === CardType.Scroll) ||
            (data.is(sgs.DataType.UseCardSpecialEvent) &&
                data.card.type === CardType.Scroll) ||
            (data.is(sgs.DataType.UseCardToCardEvent) &&
                data.card.name === 'wuxiekeji')
        ) {
            return data.card;
        }
    },
    async effect(room, target, data: UseCardToCardEvent) {
        const { from, card, source } = data;
        if (source.is(sgs.DataType.UseCardEvent)) {
            source.current.offset = data;
        }
        if (source.is(sgs.DataType.UseCardToCardEvent)) {
            source.current.offset = data;
        }
        if (source.is(sgs.DataType.UseCardSpecialEvent)) {
            source.target.offset = data;
        }
        if (
            card.hasAttr(CardAttr.Country) &&
            source.is(sgs.DataType.UseCardEvent)
        ) {
            const to = source.current.target;
            const players = room
                .getPlayerByFilter((v) => room.sameAsKingdom(to, v))
                .filter((v) =>
                    source.targetList.find(
                        (tar) => tar.target === v && !tar.offset
                    )
                );
            if (players.length > 0) {
                const yon = await room.chooseYesOrNo(from, {
                    prompt: {
                        text: '@wuxiekeji_guo',
                        values: [
                            {
                                type: 'string',
                                value: to.kingdom,
                            },
                        ],
                    },
                    thinkPrompt: `@@wuxiekeji_guo`,
                });
                if (yon) {
                    players.forEach((v) => {
                        source.targetList.forEach((tar) => {
                            if (tar.target === v) {
                                tar.invalid = true;
                                tar.offset = data;
                            }
                        });
                    });
                }
            }
        }
    },
});

sgs.setCardData('wuxiekeji', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    rhyme: 'i',
});

sgs.loadTranslation({
    ['@wuxiekeji_guo']: '国【无懈可击】：是否对所有{0}势力角色生效',
    ['@@wuxiekeji_guo']: '国无懈',
});
