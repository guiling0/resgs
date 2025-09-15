import { EventTriggers } from '../../../../../core/event/triggers';
import { RecoverHpEvent } from '../../../../../core/event/types/event.hp';
import {
    DropCardsData,
    MoveCardEvent,
} from '../../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const ganfuren = sgs.General({
    name: 'wars.ganfuren',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const shushen = sgs.Skill({
    name: 'wars.ganfuren.shushen',
});

shushen.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.RecoverHpAfter,
        can_trigger(room, player, data: RecoverHpEvent) {
            return this.isOwner(player) && data.player === player;
        },
        context(room, player, data: RecoverHpEvent) {
            return {
                maxTimes: data.number,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `淑慎：你可以选择一名其他角色，让他摸一张牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            return await room.drawCards({
                player: target,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const shenzhi = sgs.Skill({
    name: 'wars.ganfuren.shenzhi',
});

shenzhi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasCanDropCards(
                    'h',
                    player,
                    player.getHandCards().length,
                    this.name
                )
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = from.getHandCards();
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const drop = context.cost as MoveCardEvent;
            if (drop.getMoveCount() >= from.inthp) {
                await room.recoverhp({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

ganfuren.addSkill(shushen);
ganfuren.addSkill(shenzhi);
