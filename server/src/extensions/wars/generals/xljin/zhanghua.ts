import { CardPut, CardSuit, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { eyes_reserve } from '../../rules';

export const zhanghua = sgs.General({
    name: 'xl.zhanghua',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const xiuzhuan = sgs.Skill({
    name: 'xl.zhanghua.xiuzhuan',
});

xiuzhuan.addEffect(
    sgs.TriggerEffect({
        name: 'xl.zhanghua.xiuzhuan0',
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const cards = room.getReserveUpCards();
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return !cards.find(
                                        (v) => v.suit === item.suit
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `修撰，你可以将一张后备区里没有的花色的牌置入后备区`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.removeCard({
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

xiuzhuan.addEffect(
    sgs.TriggerEffect({
        name: 'xl.zhanghua.xiuzhuan1',
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                room.reserveArea.count > 0
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `修撰：你可以将后备区里的一张牌交给一名角色`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: room.reserveArea.cards,
                                data_rows: room.getReserveRowDatas(),
                                windowOptions: {
                                    title: '后备区',
                                    timebar: room.responseTime,
                                    prompt: `修撰：选择一张牌交给${target.gameName}`,
                                    buttons: ['confirm'],
                                },
                            }),
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
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
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
                skill: this,
            });
        },
    })
);

xiuzhuan.addEffect(sgs.copy(eyes_reserve));

export const bowu = sgs.Skill({
    name: 'xl.zhanghua.bowu',
});

bowu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DropPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                room.getReserveUpCards().length > 0
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const types: CardType[] = [];
            room.getReserveUpCards().forEach((v) => {
                if (!types.includes(v.type)) types.push(v.type);
            });
            return await room.drawCards({
                player: from,
                count: types.length,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const canuse = [
                ...room.cardNamesToType.get(CardType.Equip),
                ...room.getReserveUpCards().map((v) => v.name),
            ];
            await room.preUseCard({
                from: from,
                can_use_cards: canuse.map((v) => {
                    return {
                        name: v,
                        method: 1,
                    };
                }),
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `@bowu`,
                    thinkPrompt: this.name,
                    canCancle: true,
                },
            });
        },
    })
);
bowu.addEffect(sgs.copy(eyes_reserve));

zhanghua.addSkill(xiuzhuan);
zhanghua.addSkill(bowu);

sgs.loadTranslation({
    ['@method:xl.zhanghua.xiuzhuan0']: '移除牌',
    ['@method:xl.zhanghua.xiuzhuan1']: '交出后备区的牌',
    ['@bowu']: '博物：你可以使用一张装备牌或与后备区里的牌的同名牌',
});
