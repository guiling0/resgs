import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';

export const wuzhongshengyou = sgs.CardUse({
    name: 'wuzhongshengyou',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item;
            },
            auto: true,
        });
    },
    async effect(room, target, data: UseCardEvent) {
        const { current } = data;
        await room.drawCards({
            player: current.target,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('wuzhongshengyou', {
    type: CardType.Scroll,
    subtype: CardSubType.InstantScroll,
    length: 4,
    rhyme: 'ou',
});
