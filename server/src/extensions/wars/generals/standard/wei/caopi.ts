import { EventTriggers } from '../../../../../core/event/triggers';
import { DieEvent } from '../../../../../core/event/types/event.die';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const caopi = sgs.General({
    name: 'wars.caopi',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const fangzhu = sgs.Skill({
    name: 'wars.caopi.fangzhu',
});

fangzhu.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== context.from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `放逐：你可以选择一名角色，他叠置并摸${context.from.losshp}张牌`,
                            thinkPrompt: this.skill.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                data.to === player
            );
        },
        async cost(room, data, context) {
            const {
                targets: { [0]: target },
            } = context;
            return await room.skip({
                player: target,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: { [0]: target },
            } = context;
            await room.drawCards({
                player: target,
                count: from.losshp,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const xingshang = sgs.Skill({
    name: 'wars.caopi.xingshang',
});

xingshang.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        trigger: EventTriggers.Death,
        priorityType: PriorityType.General,
        forced: 'cost',
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player !== player &&
                data.player.hasCardsInArea()
            );
        },
        context(room, player, data: DieEvent) {
            return {
                targets: [data.player],
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target) {
                return await room.obtainCards({
                    player: from,
                    cards: target.getSelfCards(),
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

caopi.addSkill(fangzhu);
caopi.addSkill(xingshang);
