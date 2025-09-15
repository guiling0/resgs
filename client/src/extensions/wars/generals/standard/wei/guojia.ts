import { CardPut } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { JudgeEvent } from '../../../../../core/event/types/event.judge';
import { Gender } from '../../../../../core/general/general.type';
import { MoveCardReason } from '../../../../../core/room/room.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const guojia = sgs.General({
    name: 'wars.guojia',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const tiandu = sgs.Skill({
    name: 'wars.guojia.tiandu',
});

tiandu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.JudgeResulted2,
        forced: 'cost',
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.JudgeEvent) &&
                data.player === player &&
                data.card
            );
        },
        async cost(room, data: JudgeEvent, context) {
            const { from } = context;
            return await room.obtainCards({
                player: from,
                cards: [data.card],
                source: data,
                reason: this.name,
            });
        },
    })
);

export const yiji = sgs.Skill({
    name: 'wars.guojia.yiji',
});

yiji.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        forced: 'cost',
        getSelectors(room, context) {
            return {
                choose: () => {
                    const cards = context.cards;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, cards.length],
                                selectable: cards,
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '遗计：请分配牌（选择任意张牌再选择一名角色），点击取消留给自己',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                data.to === player
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(2);
            context.cards = cards;
            return await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: false,
                puttype: CardPut.Down,
                cardVisibles: [from],
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = context.cards.slice();
            while (cards.length > 0) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                let card = room.getResultCards(req);
                let to = room.getResultPlayers(req).at(0);
                if (card.length === 0) {
                    card = cards.slice();
                }
                if (!to) {
                    to = from;
                }
                await room.giveCards({
                    from,
                    to,
                    cards: card,
                    source: data,
                    movetype: CardPut.Down,
                    reason: this.name,
                });
                if (card.length === cards.length) break;
                card.forEach((v) => lodash.remove(cards, (c) => c === v));
                context.cards = cards;
            }
        },
    })
);

guojia.addSkill(tiandu);
guojia.addSkill(yiji);
