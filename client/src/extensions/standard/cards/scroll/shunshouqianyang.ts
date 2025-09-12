import { GameCard } from '../../../../core/card/card';
import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { TriggerEffect } from '../../../../core/skill/effect';

export const shunshouqianyang_choose = sgs.TriggerEffect({
    name: 'shunshouqianyang_choose',
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '顺手牵羊',
                                timebar: room.responseTime,
                                prompt: '顺手牵羊，请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '顺手牵羊',
                    },
                };
            },
        };
    },
});

export const shunshouqianyang = sgs.CardUse({
    name: 'shunshouqianyang',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [shunshouqianyang_choose.name],
    distanceCondition(room, from, target, card) {
        return from.distanceTo(target) === 1;
    },
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
        const s = room.getData<TriggerEffect>('shunshouqianyang_choose');
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
        await room.obtainCards({
            player: from,
            cards: result,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('shunshouqianyang', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ang',
});
