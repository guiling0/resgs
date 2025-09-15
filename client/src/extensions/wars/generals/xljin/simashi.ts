import { CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const simashi = sgs.General({
    name: 'xl.simashi',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const ruilue = sgs.Skill({
    name: 'xl.simashi.ruilue',
});

ruilue.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                this.isOwner(player) &&
                room.differentAsKingdom(data.executor, player) &&
                !data.executor.isYexinjia()
            ) {
                const damages = room.getHistorys(
                    sgs.DataType.DamageEvent,
                    (v) =>
                        v.from === data.executor &&
                        room.sameAsKingdom(v.to, player),
                    room.currentTurn
                );
                return damages.length > 0;
            }
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `睿略：你可以弃置一张牌令${target.gameName}执行一次军令`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        room.sameAsKingdom(item, target) &&
                                        !item.head.isLord()
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `睿略：你可以选择一名与${target.gameName}势力相同且不为君主的角色变为野心家`,
                            thinkPrompt: this.name,
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
                targets: [to],
            } = context;

            const command = await room.command({
                from,
                to,
                source: data,
                reason: this.name,
            });

            if (!command.execute) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const player = room.getResultPlayers(req).at(0);
                if (player) {
                    if (player.kingdom === 'ye') return;
                    if (player.kingdom === 'none') {
                        player.setProperty(
                            'kingdom',
                            `ye_${player.getKingdomAfterOpen()}`
                        );
                    } else {
                        player.setProperty('kingdom', `ye_${player.kingdom}`);
                    }
                }
            }
        },
    })
);

export const fuluan = sgs.Skill({
    name: 'xl.simashi.fuluan',
});

fuluan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.AssignTargeted,
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `抚乱，你需要弃置一张牌，否则不能响应此牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                (data.card.name === 'sha' ||
                    data.card.subtype === CardSubType.InstantScroll) &&
                data.from === player &&
                data.current.target &&
                data.current.target !== player &&
                data.current.target.isYexinjia()
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const {
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const drop = await room.dropCards({
                player: target,
                cards,
                source: data,
                reason: this.name,
            });
            if (!drop) {
                await data.targetCantResponse([data.current.target]);
            }
            return true;
        },
    })
);

simashi.addSkill(ruilue);
simashi.addSkill(fuluan);
