import { GameCard } from '../../../../../core/card/card';
import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const zhangzhaozhanghong = sgs.General({
    name: 'wars.zhangzhaozhanghong',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const zhijian = sgs.Skill({
    name: 'wars.zhangzhaozhanghong.zhijian',
});

zhijian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        context(room, player, data) {
            return {
                maxTimes: -1,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Equip;
                                },
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    const card = this.selectors.card.result.at(
                                        0
                                    ) as GameCard;
                                    return (
                                        card &&
                                        card.type === CardType.Equip &&
                                        item !== from &&
                                        !item.getEquip(card.subtype as number)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `直谏，你可以将一张装备牌置入其他角色的装备区，然后摸一张牌`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            return await room.puto({
                player: from,
                cards,
                toArea: target.equipArea,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.drawCards({
                player: from,
                count: 1,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const guzheng = sgs.Skill({
    name: 'wars.zhangzhaozhanghong.guzheng',
});

guzheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.DropPhaseEnd,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && !data.isOwner(player)) {
                const drops = room.getHistorys(
                    sgs.DataType.MoveCardEvent,
                    (v) =>
                        v.filter(
                            (d, c) =>
                                d.toArea === room.discardArea &&
                                c.area === room.discardArea
                        ).length > 0,
                    data
                );
                return drops.length > 0;
            }
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const cards = context.cards;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '固政',
                                    timebar: room.responseTime,
                                    buttons: ['guzheng.back', 'guzheng.all'],
                                    prompt: '固政，请选择一张牌并选择一项',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            let cards: GameCard[] = [];
            room.getPeriodHistory(data).forEach((v) => {
                if (v.data.is(sgs.DataType.MoveCardEvent)) {
                    v.data.move_datas.forEach((d) => {
                        if (d.toArea === room.discardArea) {
                            d.cards.forEach((c) => {
                                if (c.area === room.discardArea) {
                                    cards.push(c);
                                }
                            });
                        }
                    });
                }
            });
            if (!cards.length) return;
            context.cards = cards;
            let give: GameCard;
            let other = false;
            if (cards.length > 1) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const result = room.getResult(req, 'card');
                const card = result.result.at(0) as GameCard;
                const option = result.windowResult.at(0) as string;
                give = card;
                other = option === 'guzheng.all';
            } else {
                give = cards.at(0);
            }
            if (!give) return;
            await room.giveCards({
                from,
                to: target,
                cards: [give],
                source: data,
                reason: this.name,
            });
            cards = cards.filter((v) => v.area === room.discardArea);
            if (cards.length > 0 && other) {
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zhangzhaozhanghong.addSkill(zhijian);
zhangzhaozhanghong.addSkill(guzheng);

sgs.loadTranslation({
    ['guzheng.back']: '返回手牌',
    ['guzheng.all']: '返回手牌并获得其余牌',
});
