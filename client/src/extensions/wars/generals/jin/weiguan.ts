import { GameCard } from '../../../../core/card/card';
import { CardType } from '../../../../core/card/card.types';
import { CustomString } from '../../../../core/custom/custom.type';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';

export const weiguan = sgs.General({
    name: 'wars.weiguan',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const chengxi = sgs.Skill({
    name: 'wars.weiguan.chengxi',
});

chengxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const self = context.effect;
                    const yiyidailao = room.createVirtualCardByNone(
                        'yiyidailao',
                        undefined,
                        false
                    );
                    yiyidailao.custom.method = 1;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item.canUseCard(
                                        yiyidailao.vdata,
                                        undefined,
                                        self.name
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '乘隙：你可以让一名角色视为使用【以逸待劳】',
                            thinkPrompt: self.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            if (!target) return false;
            const card = room.createVirtualCardByNone('yiyidailao');
            return await room.preUseCard({
                from: target,
                card,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                targets: [target],
            } = context;
            const use = context.cost as UseCardEvent;
            const drop = room.getPeriodHistory(use).find((v) => {
                const move = v.data;
                return (
                    move &&
                    move.is(sgs.DataType.MoveCardEvent) &&
                    move.source === use &&
                    move.reason === 'yiyidailao' &&
                    move.has_filter(
                        (d, c) =>
                            d.reason === MoveCardReason.DisCard &&
                            c.type !== CardType.Basic
                    )
                );
            });
            if (drop) {
                const length = use.targets.length;
                for (let i = 0; i < length; i++) {
                    const to = use.targets[i];
                    await room.damage({
                        from: target,
                        to,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const jiantong = sgs.Skill({
    name: 'wars.weiguan.jiantong',
});

jiantong.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                player === data.to
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '监统：你可以观看一名角色的手牌并可用一张装备牌与其中至多两张进行交换',
                            thinkPrompt: '监统',
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    const cards: { title: CustomString; cards: GameCard[] }[] =
                        [];
                    cards.push({
                        title: 'jiantong.title1',
                        cards: target.getHandCards(),
                    });
                    cards.push({
                        title: 'jiantong.title2',
                        cards: from.getEquipCards(),
                    });
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: [2, 3],
                                selecte_type: 'rows',
                                selectable: [
                                    ...target.getHandCards(),
                                    ...from.getEquipCards(),
                                ],
                                data_rows: cards,
                                windowOptions: {
                                    title: '监统',
                                    timebar: room.responseTime,
                                    prompt: '监统：你可以用装备区里的一张牌与至多两张手牌进行交换',
                                    buttons: ['confirm'],
                                },
                                filter(item, selected) {
                                    const source = cards.find((v) =>
                                        v.cards.includes(item)
                                    );
                                    if (source.title === 'jiantong.title1') {
                                        return (
                                            selected.filter((v) =>
                                                source.cards.includes(v)
                                            ).length < 2
                                        );
                                    }
                                    if (source.title === 'jiantong.title2') {
                                        return (
                                            selected.filter((v) =>
                                                source.cards.includes(v)
                                            ).length < 1
                                        );
                                    }
                                    return false;
                                },
                                canConfirm(selected) {
                                    const length1 = selected.filter((v) =>
                                        cards[0].cards.includes(v)
                                    ).length;
                                    const length2 = selected.filter((v) =>
                                        cards[1].cards.includes(v)
                                    ).length;
                                    return (
                                        length1 > 0 &&
                                        length1 <= 2 &&
                                        length2 > 0 &&
                                        length2 <= 1
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: '监统',
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            sgs.DataType.WatchHandData.temp(from, target.getHandCards());
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            sgs.DataType.WatchHandData.temp_end(from, target.getHandCards());
            const cards = room.getResultCards(req);
            const cards1 = target
                .getHandCards()
                .filter((v) => cards.includes(v));
            const cards2 = from
                .getEquipCards()
                .filter((v) => cards.includes(v));
            if (cards1.length > 0 && cards2.length > 0) {
                await room.swapCards({
                    player: from,
                    cards1,
                    toArea1: from.handArea,
                    cards2,
                    toArea2: target.handArea,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

weiguan.addSkill(chengxi);
weiguan.addSkill(jiantong);

sgs.loadTranslation({
    ['jiantong.title1']: '观看手牌',
    ['jiantong.title2']: '装备区',
});
