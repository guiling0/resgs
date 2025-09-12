import { GameCard } from '../../../../core/card/card';
import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const jiananfeng = sgs.General({
    name: 'wars.jiananfeng',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const shanzheng = sgs.Skill({
    name: 'wars.jiananfeng.shanzheng',
});

shanzheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        audio: ['jiananfeng/shanzheng1', 'jiananfeng/shanzheng2'],
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasHandCards()
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [1, from.maxhp],
                                filter(item, selected) {
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `擅政：你可以选择至多${from.maxhp}名其他角色同时展示牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `擅政：请展示一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose_player: () => {
                    const from = context.from;
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        from !== item && !targets.includes(item)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `擅政：请选择一名角色造成1点伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, targets } = context;
            const reqs = await room.doRequestAll(
                [from, ...targets].map((v) => {
                    return {
                        player: v,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context: { from: v },
                        },
                    };
                })
            );
            const cards: GameCard[] = [];
            for (const req of reqs) {
                const _cards = room.getResultCards(req);
                await room.showCards({
                    player: req.player,
                    cards: _cards,
                    source: data,
                    reason: this.name,
                });
                cards.push(..._cards);
            }
            if (cards.length > 0) {
                return cards;
            }
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            const cards = context.cost as GameCard[];
            let red = 0;
            let black = 0;
            cards.forEach((v) => {
                if (v.color == CardColor.Red) {
                    red++;
                }
                if (v.color === CardColor.Black) {
                    black++;
                }
            });
            if (red > black) {
                if (targets.length + 1 < room.aliveCount) {
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_player'),
                            context,
                        },
                    });
                    const to = room.getResultPlayers(req).at(0);
                    room.directLine(from, [to]);
                    await room.damage({
                        from,
                        to,
                        source: data,
                        reason: this.name,
                    });
                    room.broadcast({
                        type: 'None',
                        audio: 'generals/jiananfeng/shanzheng4.mp3',
                    });
                }
            }
            if (black > red) {
                await room.obtainCards({
                    player: from,
                    cards: cards.filter((v) => v.color === CardColor.Black),
                    source: data,
                    reason: this.name,
                });
                room.broadcast({
                    type: 'None',
                    audio: 'generals/jiananfeng/shanzheng3.mp3',
                });
            }
        },
    })
);

export const liedu = sgs.Skill({
    name: 'wars.jiananfeng.liedu',
});

liedu.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                !data.data[this.id] &&
                data.targetList.some(
                    (v) =>
                        v.target !== player &&
                        (v.target.gender === Gender.Female ||
                            v.target.getHandCards().length >
                                player.getHandCards().length)
                )
            );
        },
        async cost(room, data: UseCardEvent, context) {
            const { from } = context;
            data.data[this.id] = true;
            return await data.targetCantResponse(
                data.targetList.map((v) => {
                    if (
                        v.target !== from &&
                        (v.target.gender === Gender.Female ||
                            v.target.getHandCards().length >
                                from.getHandCards().length)
                    ) {
                        return v.target;
                    }
                })
            );
        },
    })
);

jiananfeng.addSkill(shanzheng);
jiananfeng.addSkill(liedu);
