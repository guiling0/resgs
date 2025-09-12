import { VirtualCardData } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import {
    PhaseEvent,
    TurnEvent,
} from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import {
    PriorityType,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const dingfeng = sgs.General({
    name: 'wars.dingfeng',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const duanbing = sgs.Skill({
    name: 'wars.dingfeng.duanbing',
});

duanbing.addEffect(
    sgs.TriggerEffect({
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
                                        from.distanceTo(item) === 1 &&
                                        from.canUseCard(
                                            sha,
                                            [item],
                                            skill.name,
                                            { excluesCardTimesLimit: true }
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `短兵：你可以选择一名距离1的其他角色也成为【杀】的目标`,
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
    })
);

export const fenxun = sgs.Skill({
    name: 'wars.dingfeng.fenxun',
});

fenxun.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
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
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return from !== item;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `奋迅：你可以弃置一张牌再选择一名其他角色，本回合你距离他的距离视为1`,
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
                targets: [target],
            } = context;
            target.setMark('marks.fenxun', true, {
                visible: true,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data: TurnEvent) {
                    if (data.player === this.player) {
                        room.players.forEach((v) => {
                            v.removeMark('marks.fenxun');
                        });
                    }
                },
            },
        ],
    })
);

fenxun.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Fixed](from, to) {
            if (this.isOwner(from) && to.hasMark('marks.fenxun')) {
                return 1;
            }
        },
    })
);

dingfeng.addSkill(duanbing);
dingfeng.addSkill(fenxun);

sgs.loadTranslation({
    ['marks.fenxun']: '奋迅',
});
