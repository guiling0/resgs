import { CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { TriggerEffect } from '../../../../core/skill/effect';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const cuiyanmaojie = sgs.General({
    name: 'wars.cuiyanmaojie',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isDualImage: true,
    isWars: true,
});

export const zhengbi = sgs.Skill({
    name: 'wars.cuiyanmaojie.zhengbi',
});

zhengbi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
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
                                    return item !== from;
                                },
                                onChange(type, item, selected) {
                                    if (type === 'add') {
                                        if (selected[0].isNoneKingdom()) {
                                            this.selectors.card.count = 0;
                                        } else {
                                            this.selectors.card.count = 1;
                                        }
                                    } else {
                                        this.selectors.card.count = 0;
                                    }
                                },
                            }),
                            card: room.createChooseCard({
                                step: 2,
                                count: 0,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `征辟：你可以选择一名其他角色，若其有势力则需再选择一张基本牌`,
                            thinkPrompt: `征辟`,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, 2],
                                selectable: target.getSelfCards(),
                                filter(item, selected) {
                                    if (selected.length === 0) {
                                        return true;
                                    } else if (
                                        selected[0].type === CardType.Basic
                                    ) {
                                        return item.type === CardType.Basic;
                                    }
                                    return false;
                                },
                                canConfirm(selected) {
                                    if (selected.length === 1) {
                                        return (
                                            selected[0].type !== CardType.Basic
                                        );
                                    } else if (selected.length === 2) {
                                        return selected.every(
                                            (v) => v.type === CardType.Basic
                                        );
                                    }
                                    return false;
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `征辟：你需要交出两张基本牌或一张非基本牌`,
                            thinkPrompt: `征辟`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [to],
            } = context;
            if (cards.length) {
                return await room.giveCards({
                    from,
                    to,
                    cards,
                    source: data,
                    reason: this.name,
                });
            } else {
                return !!to;
            }
        },
        async effect(room, data: PhaseEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            const cost = context.cost;
            if (typeof cost === 'boolean') {
                //使用牌无次数和距离的限制
                target.setMark('mark.zhengbi', true, { visible: true });
                const effect = await room.addEffect('zhengbi.delay', from);
                effect.setData('data', room.currentTurn);
            } else {
                if (target.getSelfCards().length === 1) {
                    await room.giveCards({
                        from: target,
                        to: from,
                        cards: target.getSelfCards(),
                        source: data,
                        reason: this.name,
                    });
                } else if (target.getSelfCards().length > 1) {
                    const req = await room.doRequest({
                        player: target,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
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
            }
        },
    })
);

export const zhengbi_delay = sgs.StateEffect({
    name: 'zhengbi.delay',
    [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        const room = this.room;
        if (!target) return this.isOwner(from);
        return this.isOwner(from) && target && target.hasMark('mark.zhengbi');
    },
    [StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        return this.isOwner(from) && target && target.hasMark('mark.zhengbi');
    },
    lifecycle: [
        {
            trigger: EventTriggers.StateChanged,
            async on_exec(room, data) {
                if (
                    data.is(sgs.DataType.OpenEvent) &&
                    data.player.hasMark('mark.zhengbi')
                ) {
                    data.player.removeMark('mark.zhengbi');
                }
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    room.players.forEach((v) => {
                        v.removeMark('mark.zhengbi');
                    });
                }
            },
        },
    ],
});

export const fengying = sgs.Skill({
    name: 'wars.cuiyanmaojie.fengying',
});

fengying.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        tag: [SkillTag.Limit],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasHandCards()
            ) {
                return player.canUseCard(
                    room.createVirtualCard(
                        'xietianziyilingzhuhou',
                        player.getHandCards(),
                        undefined,
                        true,
                        false
                    ).vdata,
                    undefined,
                    this.name,
                    { excluesCardLimit: true }
                );
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `奉迎：你可以将所有手牌当【挟天子以令诸侯】使用`,
                    });
                },
                target_limit: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                excluesCardLimit: true,
                                filter(item, selected) {
                                    return item === from;
                                },
                                auto: true,
                            }),
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('fengying.delay', from);
            effect.setData('source', this);
            const card = room.createVirtualCard(
                'xietianziyilingzhuhou',
                from.getHandCards(),
                undefined,
                true,
                false
            );
            card.custom.method = 1;
            return await room.preUseCard({
                from,
                card,
                source: data,
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context,
                },
                reason: this.name,
                transform: this,
            });
        },
    })
);

export const fengying_delay = sgs.TriggerEffect({
    name: 'fengying.delay',
    trigger: EventTriggers.CardBeUse,
    can_trigger(room, player, data: UseCardEvent) {
        return (
            this.isOwner(player) &&
            data.from === player &&
            data.reason === this.getData<TriggerEffect>('source').name
        );
    },
    async cost(room, data, context) {
        await this.removeSelf();
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const players = room.sortResponse(room.playerAlives);
        for (const player of players) {
            if (
                player.getHandCards().length < player.maxhp &&
                room.sameAsKingdom(from, player)
            ) {
                await room.drawCards({
                    player,
                    count: player.maxhp - player.getHandCards().length,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.UseCardEnd3,
            async on_exec(room, data) {
                if (
                    data.reason === this.getData<TriggerEffect>('source').name
                ) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

cuiyanmaojie.addSkill('wars.cuiyanmaojie.zhengbi');
cuiyanmaojie.addSkill('wars.cuiyanmaojie.fengying');

sgs.loadTranslation({
    ['mark.zhengbi']: '征辟',
});
