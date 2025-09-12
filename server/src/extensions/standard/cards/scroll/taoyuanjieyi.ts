import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

const taoyuanjieyi_invalid = sgs.TriggerEffect({
    name: 'taoyuanjieyi_invalid',
    priorityType: PriorityType.Card,
    trigger: EventTriggers.CardEffectStart,
    can_trigger(room, player, data) {
        return (
            data.is(sgs.DataType.UseCardEvent) &&
            data.current.target === player &&
            data.card.name === 'taoyuanjieyi' &&
            player.losshp === 0
        );
    },
    async cost(room, data: UseCardEvent, context) {
        data.current.invalid = true;
        return true;
    },
});

export const taoyuanjieyi = sgs.CardUse({
    name: 'taoyuanjieyi',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [taoyuanjieyi_invalid.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return true;
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseRecover = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('taoyuanjieyi', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'i',
});
