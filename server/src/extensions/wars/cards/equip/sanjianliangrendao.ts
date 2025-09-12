import { GameCard } from '../../../../core/card/card';
import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const sanjianliangrendao = sgs.CardUseEquip({
    name: 'sanjianliangrendao',
});

sgs.setCardData('sanjianliangrendao', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'ao',
});

export const sanjian_skill = sgs.Skill({
    name: 'sanjianliangrendao',
    attached_equip: 'sanjianliangrendao',
});

sanjian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 3;
            }
        },
    })
);

sanjian_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'sanjianliangrendao_skill',
        audio: [],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CauseDamaged,
        getSelectors(room, context) {
            const from = context.from;
            const target = context.targets.at(0);
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        target && target.distanceTo(item) === 1
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `三尖两刃刀：你可以弃置一张手牌并选择一个角色，对他造成1点普通伤害`,
                            thinkPrompt: `三尖两刃刀`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                data.reason === 'sha' &&
                data.to.alive
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
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
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            await room.damage({
                from,
                to: target,
                source: data,
                reason: this.name,
            });
        },
    })
);
