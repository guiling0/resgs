import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PindianEvent } from '../../../../core/event/types/event.pindian';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';

export const xunchen = sgs.General({
    name: 'wars.xunchen',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const fenglue = sgs.Skill({
    name: 'wars.xunchen.fenglue',
});

fenglue.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return from.canPindian([item], skill.name);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `锋略：你可以与一名角色其他发起拼点`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card1: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChooseCard({
                                step: 1,
                                count: 2,
                                selectable: target.getAreaCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `锋略：你需要将两张牌交给${from.gameName}`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card2: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `锋略：你需要将一张牌交给${target.gameName}`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.canPindian([], this.name)
            );
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.pindian({
                from,
                targets: [target],
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `fenglue_pindian`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from && target.hasCardsInArea(true)) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card1'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.giveCards({
                    from: target,
                    to: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            if (pindian.win === target && from.hasCardsInArea()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card2'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.giveCards({
                    from,
                    to: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }

            await room.chooseYesOrNo(
                from,
                {
                    prompt: `@fenglue`,
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.addSkill(
                        'wars.xunchen.fengluezongheng',
                        target,
                        {
                            source: this.name,
                            showui: 'default',
                        }
                    );
                }
            );
        },
    })
);

export const fenglue_zongheng = sgs.Skill({
    name: 'wars.xunchen.fengluezongheng',
});

fenglue_zongheng.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        mark: ['fengluezongheng'],
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return from.canPindian([item], skill.name);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `锋略(纵横)：你可以与一名角色其他发起拼点`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card1: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: target.getAreaCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `锋略：你需要将一张牌交给${from.gameName}`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_card2: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChooseCard({
                                step: 1,
                                count: 2,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `锋略：你需要将两张牌交给${target.gameName}`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.canPindian([], this.name)
            );
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.pindian({
                from,
                targets: [target],
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `fenglue_pindian`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from && target.hasCardsInArea(true)) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card1'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.giveCards({
                    from: target,
                    to: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            if (pindian.win === target && from.hasCardsInArea()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card2'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.giveCards({
                    from,
                    to: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }

            await room.chooseYesOrNo(
                from,
                {
                    prompt: `@weimeng`,
                    thinkPrompt: this.name,
                },
                async () => {
                    await room.addSkill(
                        'wars.xunchen.fengluezongheng',
                        target,
                        {
                            source: this.name,
                            showui: 'default',
                        }
                    );
                }
            );
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

export const anyong = sgs.Skill({
    name: 'wars.xunchen.anyong',
});

anyong.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.CauseDamage2,
        can_trigger(room, player, data: DamageEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                room.sameAsKingdom(player, data.from) &&
                data.to &&
                data.from !== data.to
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 2,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `暗涌：你需要弃置两张手牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: DamageEvent, context) {
            data.number = data.number + data.number;
            return true;
        },
        async effect(room, data: DamageEvent, context) {
            const { from } = context;
            const target = data.to;
            if (!target.hasNoneOpen()) {
                await room.losehp({
                    player: from,
                    source: data,
                    reason: this.name,
                });
                await this.skill?.removeSelf();
            }
            if (target.getOpenGenerls().length === 1) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

xunchen.addSkill(fenglue);
xunchen.addSkill(anyong);

sgs.loadTranslation({
    ['@fenglue']: '是否令其获得“锋略(纵横)',
    ['fenglue_pindian']: '锋略：请选择一张牌拼点',
    ['fengluezongheng']: '纵横:锋略',
});
