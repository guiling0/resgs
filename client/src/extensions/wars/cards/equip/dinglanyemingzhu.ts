import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType } from '../../../../core/skill/skill.types';

export const dinglanyemingzhu = sgs.CardUseEquip({
    name: 'dinglanyemingzhu',
});

sgs.setCardData('dinglanyemingzhu', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'u',
});

export const yemingzhu_skill = sgs.Skill({
    name: 'dinglanyemingzhu',
    attached_equip: 'dinglanyemingzhu',
});

yemingzhu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                return !room.skills.find(
                    (s) =>
                        s.isOpen() &&
                        s !== this.skill &&
                        s.trueName === 'zhiheng' &&
                        s.player === player
                );
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: [1, from.maxhp],
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `制衡(定澜夜明珠)：你可以弃置至多${from.maxhp}张牌，然后摸等量的牌`,
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
            const { from, cards } = context;
            await room.drawCards({
                player: from,
                count: cards.length,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    this.player?.setMark('#yemingzhu_level', true);
                },
            },
            {
                trigger: EventTriggers.onLose,
                async on_exec(room, data) {
                    this.player?.removeMark('#yemingzhu_level');
                },
            },
        ],
    })
);
