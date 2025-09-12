import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const xiahouyuan = sgs.General({
    name: 'wars.xiahouyuan',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const shensu = sgs.Skill({
    name: 'wars.xiahouyuan.shensu',
});

shensu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.JudgePhaseStart,
        auto_directline: 1,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = this;
                    const sha = room.createVirtualCardByNone(
                        'sha',
                        undefined,
                        false
                    );
                    sha.custom.method = 1;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return from.canUseCard(
                                        sha.vdata,
                                        [item],
                                        skill.name,
                                        {
                                            excluesCardTimesLimit: true,
                                            excluesCardDistanceLimit: true,
                                        },
                                        selected
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '神速，你可以跳过判定和摸牌阶段，视为使用一张【杀】',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Judge &&
                data.executor === player &&
                !data.isComplete &&
                room.currentTurn.isNotSkip(Phase.Draw)
            );
        },
        async cost(room, data: PhaseEvent, context) {
            await room.currentTurn.skipPhase([Phase.Judge, Phase.Draw]);
            return true;
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            const sha = room.createVirtualCardByNone('sha');
            sha.custom.method = 1;
            await room.usecard({
                from,
                targets,
                card: sha,
                noPlayDirectLine: true,
                source: data,
                reason: this.name,
            });
        },
    })
);

shensu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseStart,
        auto_directline: 1,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = this;
                    const sha = room.createVirtualCardByNone(
                        'sha',
                        undefined,
                        false
                    );
                    sha.custom.method = 1;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Equip;
                                },
                            }),
                            target: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return from.canUseCard(
                                        sha.vdata,
                                        [item],
                                        skill.name,
                                        {
                                            excluesCardTimesLimit: true,
                                            excluesCardDistanceLimit: true,
                                        },
                                        selected
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '神速，你可以跳过出牌阶段并弃置一张装备牌，视为使用一张【杀】',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Play &&
                data.executor === player &&
                !data.isComplete
            );
        },
        async cost(room, data: PhaseEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            await room.currentTurn.skipPhase(Phase.Play);
            const sha = room.createVirtualCardByNone('sha');
            sha.custom.method = 1;
            await room.usecard({
                from,
                targets,
                card: sha,
                noPlayDirectLine: true,
                source: data,
                reason: this.name,
            });
        },
    })
);

xiahouyuan.addSkill(shensu);
