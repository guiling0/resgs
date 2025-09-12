import { CardType, CardSubType } from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Phase } from '../../../../core/player/player.types';
import { TriggerEffect } from '../../../../core/skill/effect';
import { PriorityType } from '../../../../core/skill/skill.types';

export const xietianzi_effect = sgs.TriggerEffect({
    name: 'xietianzi_effect',
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `挟天子以令诸侯：你可以弃置一张手牌获得一个额外回合`,
                        thinkPrompt: '挟天子',
                    },
                };
            },
        };
    },
    priorityType: PriorityType.Card,
    trigger: EventTriggers.DropPhaseEnd,
    audio: [],
    can_trigger(room, player, data: PhaseEvent) {
        return (
            this.isOwner(player) &&
            data.isOwner(player) &&
            this.getData('turn') === room.currentTurn
        );
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        await this.removeSelf();
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.executeExtraTurn(
            room.createEventData(sgs.DataType.TurnEvent, {
                player: from,
                isExtra: true,
                phases: room.getRatedPhases(),
                skipPhases: [],
                source: undefined,
                reason: this.name,
            })
        );
    },
    lifecycle: [
        {
            trigger: EventTriggers.TurnEnded,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

export const xietianzi = sgs.CardUse({
    name: 'xietianziyilingzhuhou',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return item === from && item.isBigKingdom();
            },
            auto: true,
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, current } = data;
        const phase = room.getCurrentPhase();
        if (phase && phase.isOwner(current.target, Phase.Play)) {
            await phase.end();
            const effect = await room.addEffect(
                'xietianzi_effect',
                current.target
            );
            effect.setData('turn', room.currentTurn);
        }
    },
});

sgs.setCardData('xietianziyilingzhuhou', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 7,
    rhyme: 'ou',
});

sgs.loadTranslation({ ['xietianzi_effect']: '挟天子以令诸侯' });
