import { CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const yuejin = sgs.General({
    name: 'wars.yuejin',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const xiaoguo = sgs.Skill({
    name: 'wars.yuejin.xiaoguo',
});

xiaoguo.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                !data.isOwner(player, Phase.End) &&
                player.hasCanDropCards('h', player, 1, this.name)
            );
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
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Basic;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `骁果，你可以弃置一张基本牌，令${target.gameName}弃置装备牌或受到伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                                filter(item, selected) {
                                    return item.type === CardType.Equip;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `骁果，你需要弃置一张装备牌，否则受到1点伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        context(room, player, data: PhaseEvent) {
            return {
                targets: [data.executor],
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
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            } else {
                await room.drawCards({
                    player: from,
                    count: 1,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

yuejin.addSkill(xiaoguo);
