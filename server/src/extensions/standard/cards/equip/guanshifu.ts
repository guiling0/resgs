import { GameCard } from '../../../../core/card/card';
import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const guanshifu = sgs.CardUseEquip({
    name: 'guanshifu',
});

sgs.setCardData('guanshifu', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'u',
});

export const guanshi_skill = sgs.Skill({
    name: 'guanshifu',
    attached_equip: 'guanshifu',
});

guanshi_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 3;
            }
        },
    })
);

guanshi_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'guanshifu_skill',
        audio: ['guanshifu'],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.BeOffset,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 2,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.name !== 'guanshifu';
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `贯石斧：你可以弃置两张牌让【杀】依然对${target.gameName}造成伤害`,
                            thinkPrompt: '贯石斧',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { from, current, card } = data;
                return (
                    card.name === 'sha' &&
                    player === from &&
                    current.target.alive
                );
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: UseCardEvent, context) {
            data.insert([EventTriggers.CardEffect, EventTriggers.CardEffected]);
        },
    })
);
