import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const simayan = sgs.General({
    name: 'xl.simayan',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const kangning = sgs.Skill({
    name: 'xl.simayan.kangning',
});

kangning.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.MaxHand_Correct](from) {
            if (from.room.sameAsKingdom(this.player, from)) {
                return 1;
            }
        },
    })
);

export const porang = sgs.Skill({
    name: 'xl.simayan.porang',
});

porang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const max = Math.max(
                        ...room.playerAlives
                            .filter((v) => v !== from)
                            .map((v) => v.getHandCards().length)
                    );
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        item.getHandCards().length === max
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `迫让：你可以弃置一张牌对令手牌最多的一名其他角色移除两张牌或受到1点伤害`,
                        },
                    };
                },
                choose: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            prompt: '迫让：请选择一项',
                            showMainButtons: false,
                        },
                    };
                },
                choose_card: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 2,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `迫让：请选择两张牌移除`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const handles = ['porang.remove', 'porang.damage'];
            if (target.getSelfCards().length < 2) {
                handles[0] = '!' + handles[0];
            }
            context.handles = handles;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('porang.remove')) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.removeCard({
                    player: target,
                    cards,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            }
            if (result.includes('porang.damage')) {
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);
porang.addEffect(sgs.copy(eyes_reserve));

export const fenfeng = sgs.Skill({
    name: 'xl.simayan.fenfeng',
});

fenfeng.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Limit],
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
                                count: [1, -1],
                                filter(item, selected) {
                                    return room.sameAsKingdom(from, item, 1);
                                },
                                auto: true,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `分封：你可以分别交给每名与你势力相同的角色至多三张后备区里的牌`,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const current = room.getPlayer(context.current);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [0, 3],
                                selecte_type: 'rows',
                                selectable: room.reserveArea.cards,
                                data_rows: room.getReserveRowDatas(),
                                windowOptions: {
                                    title: '后备区',
                                    timebar: room.responseTime,
                                    prompt: `分封：你可以将至多3张牌交给${current.gameName}`,
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
        async effect(room, data, context) {
            const { from, targets } = context;
            while (targets.length > 0) {
                const to = targets.shift();
                context.current = to.playerId;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                if (cards.length) {
                    await room.giveCards({
                        from,
                        to,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);
fenfeng.addEffect(sgs.copy(eyes_reserve));

simayan.addSkill(kangning);
simayan.addSkill(porang);
simayan.addSkill(fenfeng);

sgs.loadTranslation({
    ['porang.remove']: '移除两张牌',
    ['porang.damage']: '受到伤害',
});
