import { GameCard } from '../../../../core/card/card';
import { CardPut, CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const zhongyan = sgs.General({
    name: 'xl.zhongyan',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const xiasi = sgs.Skill({
    name: 'xl.zhongyan.xiasi',
});

xiasi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data, context) {
            const { from } = context;
            await room.showCards({
                player: from,
                cards: from.getHandCards(),
                source: data,
                reason: this.name,
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            const hands = from.getHandCards();
            if (
                hands.every(
                    (v1) =>
                        !hands.find((v2) => v1 !== v2 && v1.suit === v2.suit)
                )
            ) {
                const suits = [
                    CardSuit.Spade,
                    CardSuit.Heart,
                    CardSuit.Club,
                    CardSuit.Diamond,
                ].filter((v) => !hands.find((c) => c.suit === v));
                const cards: GameCard[] = [];
                suits.forEach((v) => {
                    const _cards = room.drawArea.get(
                        1,
                        sgs.DataType.GameCard,
                        'top',
                        (c) => c.suit === v
                    );
                    if (_cards.length === 0) {
                        cards.push(
                            ...room.discardArea.get(
                                1,
                                sgs.DataType.GameCard,
                                'random',
                                (c) => c.suit === v
                            )
                        );
                    } else {
                        cards.push(..._cards);
                    }
                });
                await room.obtainCards({
                    player: from,
                    movetype: CardPut.Up,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const lifa = sgs.Skill({
    name: 'xl.zhongyan.lifa',
});

lifa.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseEnd,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                !data.isOwner(player) &&
                room.sameAsKingdom(player, data.executor)
            );
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const current = room.getPlayer(context.current);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: current.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: current === this.player ? true : false,
                            showMainButtons: true,
                            prompt:
                                current === this.player
                                    ? `礼法：你可以交出一张牌`
                                    : `礼法：请交出一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            context.current = from.playerId;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            context.current = to.playerId;
            const req = await room.doRequest({
                player: to,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.giveCards({
                from: to,
                to: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

zhongyan.addSkill(xiasi);
zhongyan.addSkill(lifa);
