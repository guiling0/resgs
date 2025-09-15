import { VirtualCardData } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PindianEvent } from '../../../../../core/event/types/event.pindian';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const taishici = sgs.General({
    name: 'wars.taishici',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const tianyi = sgs.Skill({
    name: 'wars.taishici.tianyi',
});

tianyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
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
                            prompt: `天义：你可以与一名其他角色拼点`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player, Phase.Play) &&
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
                    prompt: `tianyi_pindian`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const pindian = context.cost as PindianEvent;
            if (pindian.win === from) {
                const effect1 = await room.addEffect('tianyi.states', from);
                // const effect3 = await room.addEffect('tianyi.targets', from);
                effect1.setData('turn', room.currentTurn);
                // effect3.setData('turn', room.currentTurn);
            }
            if (pindian.lose.includes(from)) {
                const effect1 = await room.addEffect('tianyi.cantuse', from);
                effect1.setData('turn', room.currentTurn);
            }
        },
    })
);

export const tianyi_states = sgs.StateEffect({
    name: 'tianyi.states',
    [StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') {
            return 1;
        }
    },
    [StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        return this.isOwner(from) && card.name === 'sha';
    },
    [StateEffectType.TargetMod_CardLimit](from, card) {
        if (this.isOwner(from) && card.name === 'sha') {
            return [1, 2];
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                if (!this.player?.hasMark('marks.tianyi.win')) {
                    this.player?.setMark('marks.tianyi.win', true, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.win');
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

export const tianyi_target = sgs.TriggerEffect({
    name: 'tianyi.targets',
    auto_log: 1,
    auto_directline: 1,
    priorityType: PriorityType.General,
    trigger: EventTriggers.ChooseTarget,
    can_trigger(room, player, data: UseCardEvent) {
        return (
            this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player
        );
    },
    context(room, player, data: UseCardEvent) {
        return {
            sha: data.card.vdata,
            targets: data.targets,
        };
    },
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = context.sha as VirtualCardData;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (
                                    sha &&
                                    !targets.includes(item) &&
                                    from.canUseCard(sha, [item], skill.name, {
                                        excluesCardTimesLimit: true,
                                    })
                                );
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `天义：你可以选择一名其他角色也成为【杀】的目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data: UseCardEvent, context) {
        const { targets } = context;
        return await data.becomTarget(targets);
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                if (!this.player?.hasMark('marks.tianyi.win')) {
                    this.player?.setMark('marks.tianyi.win', true, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.win');
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

export const tianyi_cantuse = sgs.StateEffect({
    name: 'tianyi.cantuse',
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return this.isOwner(this.player) && card.name === 'sha';
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                this.player?.setMark('marks.tianyi.lose', true, {
                    visible: true,
                });
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.lose');
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});

taishici.addSkill(tianyi);

sgs.loadTranslation({
    ['tianyi_pindian']: '天义，请选择一张牌拼点',
    ['marks.tianyi.win']: '天义[赢]',
    ['marks.tianyi.lose']: '天义[没赢]',
});
