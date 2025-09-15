import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { TriggerEffect } from '../../../../core/skill/effect';

export const yiyidailao_choose = sgs.TriggerEffect({
    name: 'yiyidailao_choose',
    getSelectors(room, context) {
        const from = context.from;
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 2,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: '以逸待劳，你需要弃置两张牌',
                        thinkPrompt: '以逸待劳',
                    },
                };
            },
        };
    },
});

export const yiyidailao = sgs.CardUse({
    name: 'yiyidailao',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [yiyidailao_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return room.sameAsKingdom(from, item);
            },
            auto: true,
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        await room.drawCards({
            player: current.target,
            count: 2,
            source: data,
            reason: this.name,
        });
        const s = room.getData<TriggerEffect>('yiyidailao_choose');
        const req = await room.doRequest({
            player: current.target,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: {
                    from: current.target,
                },
            },
        });
        const result = room.getResult(req, 'cards').result;
        await room.dropCards({
            player: current.target,
            cards: result,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('yiyidailao', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ao',
});
