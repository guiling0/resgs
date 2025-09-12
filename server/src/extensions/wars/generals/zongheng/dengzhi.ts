import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const dengzhi = sgs.General({
    name: 'wars.dengzhi',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const jianliang = sgs.Skill({
    name: 'wars.dengzhi.jianliang',
});

jianliang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                const min = Math.min(
                    ...room.playerAlives.map((v) => v.getHandCards().length)
                );
                return player.getHandCards().length === min;
            }
        },
        context(room, player, data) {
            return {
                targets: room.getPlayerByFilter((v) =>
                    room.sameAsKingdom(this.player, v)
                ),
            };
        },
        async cost(room, data, context) {
            const { targets } = context;
            for (const player of targets) {
                await room.drawCards({
                    player,
                    source: data,
                    reason: this.name,
                });
            }
            return true;
        },
    })
);

export const weimeng = sgs.Skill({
    name: 'wars.dengzhi.weimeng',
});

weimeng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
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
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `危盟：你可以选择一名其他角色获得他的${from.hp}张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: [1, from.hp],
                                selecte_type: 'rows',
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '危盟',
                                    timebar: room.responseTime,
                                    prompt: `危盟：请选择至多${from.hp}张牌`,
                                    buttons: ['confirm'],
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
                choose: () => {
                    const from = context.from;
                    const count = context.count;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: count,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `危盟：请将${count}张牌交给${target.gameName}`,
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
                    selectorId: this.getSelectorName('choose_card'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.obtainCards({
                player: from,
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
            const move = context.cost as MoveCardEvent;
            const count = move.getMoveCount();
            context.count = count;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });

            await room.chooseYesOrNo(
                from,
                {
                    prompt: `@weimeng`,
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.addSkill('wars.dengzhi.weimengzongheng', to, {
                        source: this.name,
                        showui: 'default',
                    });
                }
            );
        },
    })
);

export const weimeng_zongheng = sgs.Skill({
    name: 'wars.dengzhi.weimengzongheng',
});

weimeng_zongheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        mark: ['weimengzongheng'],
        trigger: EventTriggers.PlayPhaseProceeding,
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
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `危盟(纵横)：你可以选择一名其他角色获得他的一张牌`,
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
                                selectable: target.getHandCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '危盟(纵横)',
                                    timebar: room.responseTime,
                                    prompt: `危盟(纵横)：请选择一张牌`,
                                    buttons: ['confirm'],
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
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `危盟(纵横)：请将一张牌交给${target.gameName}`,
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
                    selectorId: this.getSelectorName('choose_card'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.obtainCards({
                player: from,
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
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data: TurnEvent) {
                    if (data.player === this.player && this.skill) {
                        await this.skill.removeSelf();
                    }
                },
            },
        ],
    })
);

dengzhi.addSkill(jianliang);
dengzhi.addSkill(weimeng);
dengzhi.addSkill(weimeng_zongheng, true);

sgs.loadTranslation({
    ['@weimeng']: '是否令其获得“危盟(纵横)”',
    ['weimengzongheng']: '纵横:危盟',
});
