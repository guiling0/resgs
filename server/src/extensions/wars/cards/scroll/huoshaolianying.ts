import { CardType, CardSubType } from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';

export const huoshaolianying = sgs.CardUse({
    name: 'huoshaolianying',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                if (selected.length === 0) {
                    return item === from.next;
                } else {
                    return (
                        item !== selected[0] &&
                        room.getQueue(selected[0]).includes(item)
                    );
                }
            },
            auto: true,
        });
    },
    async onuse(room, data: UseCardEvent) {
        data.baseDamage = 1;
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, current } = data;
        await room.damage({
            from: data.from,
            to: current.target,
            number: data.baseDamage,
            damageType: DamageType.Fire,
            channel: data.card,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('huoshaolianying', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ing',
    damage: true,
});
