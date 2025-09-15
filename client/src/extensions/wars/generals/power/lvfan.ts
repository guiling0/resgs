import { GameCard } from '../../../../core/card/card';
import { CardPut, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const lvfan = sgs.General({
    name: 'wars.lvfan',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const diaodu = sgs.Skill({
    name: 'wars.lvfan.diaodu',
});

diaodu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card &&
                data.card.type === CardType.Equip &&
                room.sameAsKingdom(this.player, data.from)
            );
        },
        async effect(room, data: UseCardEvent, context) {
            await room.chooseYesOrNo(
                data.from,
                {
                    prompt: '@diaodu',
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.drawCards({
                        player: data.from,
                        source: data,
                        reason: this.name,
                    });
                }
            );
        },
    })
);

diaodu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        room.sameAsKingdom(from, item) &&
                                        item.getEquipCards().length > 0
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `调度：你可以获得一名与你势力相同的角色装备区里的一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getEquipCards(),
                                data_rows: target.getCardsToArea('e'),
                                windowOptions: {
                                    title: '调度',
                                    timebar: room.responseTime,
                                    prompt: '调度：请选择一张牌',
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
                choose_give: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== target;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `调度：你可以将此牌交给一名除${sgs.getTranslation(
                                target.gameName
                            )}外的角色`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            if (
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                })
            ) {
                return cards;
            }
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = context.cost as GameCard[];
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_give'),
                    context,
                },
            });
            const to = room.getResultPlayers(req).at(0);
            if (to) {
                await room.giveCards({
                    from,
                    to,
                    cards,
                    movetype: CardPut.Up,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

export const diancai = sgs.Skill({
    name: 'wars.lvfan.diancai',
});

diancai.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.PlayPhaseEnd,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && !data.isOwner(player)) {
                let count = 0;
                room.getPeriodHistory(data).forEach((v) => {
                    if (v.data.is(sgs.DataType.MoveCardEvent)) {
                        v.data.getLoseDatas(player, 'he').forEach((d) => {
                            count += d.cards.length;
                        });
                    }
                });
                return count >= player.hp;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            room.drawCards({
                player: from,
                count: from.maxhp - from.getHandCards().length,
                source: data,
                reason: this.name,
            });
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.chooseYesOrNo(
                from,
                {
                    prompt: '@diancai',
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.change({
                        player: from,
                        general: 'deputy',
                        source: data,
                        reason: this.name,
                    });
                }
            );
        },
    })
);

lvfan.addSkill('wars.lvfan.diaodu');
lvfan.addSkill('wars.lvfan.diancai');

sgs.loadTranslation({
    ['@diaodu']: '调度：是否摸一张牌',
    ['@diancai']: '典财：是否变更',
});
