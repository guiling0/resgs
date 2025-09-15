import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent, TurnEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';

export const yanghu = sgs.General({
    name: 'wars.wei.yanghu',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const deshao = sgs.Skill({
    name: 'wars.wei.yanghu.deshao',
});

deshao.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.from &&
                data.from !== player &&
                data.from.hasCanDropCards('he', player, 1, this.name) &&
                data.current.target === player &&
                data.targetCount === 1 &&
                data.card &&
                data.card.color === CardColor.Black
            ) {
                if (
                    data.from.getOpenGenerls().length >
                    player.getOpenGenerls().length
                )
                    return false;
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < player.hp;
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            const from = context.from;
            const target = context.targets.at(0);
            return {
                choose: () => {
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '德劭',
                                    timebar: room.responseTime,
                                    prompt: '德劭：请选择一张牌',
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
        async cost(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const mingfa = sgs.Skill({
    name: 'wars.wei.yanghu.mingfa',
});

mingfa.addEffect(
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
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return room.isOtherKingdom(from, item);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `明伐：你可以选择一名其他势力的角色，他下个回合结束时根据其的手牌数执行不同的效果`,
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
            const effect = await room.addEffect('mingfa.delay', from);
            effect.setData('target', target);
            return true;
        },
    })
);

export const mingfa_delay = sgs.TriggerEffect({
    name: 'mingfa.delay',
    mark: ['mark.mingfa'],
    auto_log: 1,
    auto_directline: 1,
    trigger: EventTriggers.TurnEnd,
    can_trigger(room, player, data: TurnEvent) {
        if (this.isOwner(player)) {
            const target = this.getData<GamePlayer>('target');
            return target === data.player;
        }
    },
    context(room, player, data: TurnEvent) {
        return {
            targets: [data.player],
        };
    },
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
                            selectable: target.getHandCards(),
                            data_rows: target.getCardsToArea('h'),
                            windowOptions: {
                                title: '明伐',
                                timebar: room.responseTime,
                                prompt: '明伐：请选择一张牌',
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
    async effect(room, data, context) {
        const {
            from,
            targets: [to],
        } = context;
        const count1 = to.getHandCards().length;
        const count2 = from.getHandCards().length;
        if (count1 < count2) {
            await room.damage({
                from,
                to,
                source: data,
                reason: this.name,
            });
            if (to.alive && to.hasHandCards()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        } else if (count1 > count2) {
            await room.drawCards({
                player: from,
                count: count1 - count2,
                source: data,
                reason: this.name,
            });
        }
        to.removeMark('mark.mingfa');
        this.removeData('target');
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                const target = this.getData<GamePlayer>('target');
                if (!target) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

yanghu.addSkill(deshao);
yanghu.addSkill(mingfa);

sgs.loadTranslation({
    ['mark.mingfa']: '明伐',
});
