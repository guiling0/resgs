import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';

export const tiesuolianhuan = sgs.CardUse({
    name: 'tiesuolianhuan',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, 2],
            filter(item, selected) {
                return true;
            },
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        await room.chain({
            player: current.target,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('tiesuolianhuan', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'an',
});
