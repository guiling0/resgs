import { GameCard } from '../../../../core/card/card';
import { CardPut, CardSuit, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { eyes_reserve } from '../../rules';

export const tangbin = sgs.General({
    name: 'xl.tangbin',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const suiyu = sgs.Skill({
    name: 'xl.tangbin.suiyu',
});

suiyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.UseCardEnd3,
        can_trigger(room, player, data: UseEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.card &&
                (data.card.type === CardType.Basic ||
                    data.card.type === CardType.Scroll) &&
                data.card.hasSubCards() &&
                !room.getReserveUpCards().find((v) => v.suit === data.card.suit)
            );
        },
        async cost(room, data: UseEvent, context) {
            const { from } = context;
            const cards: GameCard[] = [];
            const _cards = room.drawArea.get(
                1,
                sgs.DataType.GameCard,
                'top',
                (c) => c.suit === data.card.suit
            );
            if (_cards.length === 0) {
                cards.push(
                    ...room.discardArea.get(
                        1,
                        sgs.DataType.GameCard,
                        'random',
                        (c) => c.suit === data.card.suit
                    )
                );
            } else {
                cards.push(..._cards);
            }
            await room.removeCard({
                player: from,
                cards,
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);

suiyu.addEffect(sgs.copy(eyes_reserve));

suiyu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.BecomeTarget,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const suit = context.suit;
                    const s_suit = sgs.getTranslation(`suit${suit}`);
                    const cards = room.getReserveUpCards();
                    return {
                        selectors: {
                            card: room.createDropCards(
                                from,
                                {
                                    step: 1,
                                    count: 1,
                                    selecte_type: 'rows',
                                    selectable: room.reserveArea.cards,
                                    filter(item, selected) {
                                        return (
                                            cards.includes(item) &&
                                            item.suit === suit
                                        );
                                    },
                                    data_rows: room.getReserveRowDatas(),
                                    windowOptions: {
                                        title: '后备区',
                                        timebar: room.responseTime,
                                        prompt: `绥御：你可以弃置一张后备区里的${s_suit}牌，让${target.gameName}摸一张牌`,
                                        buttons: ['confirm'],
                                    },
                                },
                                false
                            ),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                room.sameAsKingdom(player, data.current.target) &&
                !data.current.target.inturn &&
                data.card &&
                data.card.suit !== CardSuit.None &&
                room.getReserveUpCards().length > 0
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
                suit: data.card.suit,
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: UseCardEvent, context) {
            const {
                targets: [target],
            } = context;
            await room.drawCards({
                player: target,
                source: data,
                reason: this.name,
            });
        },
    })
);

tangbin.addSkill(suiyu);
