import { GameCard } from '../../../../core/card/card';
import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { TriggerEffect } from '../../../../core/skill/effect';

export const guohechaiqiao_choose = sgs.TriggerEffect({
    name: 'guohechaiqiao_choose',
    getSelectors(room, context) {
        const from = context.from;
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '过河拆桥',
                                timebar: room.responseTime,
                                prompt: '过河拆桥，请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '过河拆桥',
                    },
                };
            },
        };
    },
});

export const guohechaiqiao = sgs.CardUse({
    name: 'guohechaiqiao',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [guohechaiqiao_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item && item.hasCardsInArea(true);
            },
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, current } = data;
        const s = room.getData<TriggerEffect>('guohechaiqiao_choose');
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: {
                    from,
                    targets: [current.target],
                },
            },
        });
        const result = req.result.results.cards.result as GameCard[];
        await room.dropCards({
            player: from,
            cards: result,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('guohechaiqiao', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ao',
});
