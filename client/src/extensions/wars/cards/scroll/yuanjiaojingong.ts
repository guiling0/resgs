import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';

export const yuanjiaojingong = sgs.CardUse({
    name: 'yuanjiaojingong',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return room.differentAsKingdom(from, item);
            },
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { from, current } = data;
        await room.drawCards({
            player: current.target,
            count: 1,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('yuanjiaojingong', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ong',
});
