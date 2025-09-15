import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import {
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const mateng = sgs.General({
    name: 'wars.mateng',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const mashu = sgs.Skill({
    name: 'wars.mateng.mashu',
});

mashu.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return -1;
            }
        },
    })
);

export const xiongyi = sgs.Skill({
    name: 'wars.mateng.xiongyi',
});

xiongyi.addEffect(
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
                            prompt: `雄异：所有与你势力相同的角色各摸三张牌`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            while (targets.length > 0) {
                const to = targets.shift();
                await room.drawCards({
                    player: to,
                    count: 3,
                    source: data,
                    reason: this.name,
                });
            }
            const min = Math.min(
                ...room
                    .getKingdoms()
                    .map((v) => room.getPlayerCountByKingdom(v))
            );
            if (room.getPlayerCountByKingdom(from.kingdom) === min) {
                await room.recoverhp({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

mateng.addSkill(mashu);
mateng.addSkill(xiongyi);
