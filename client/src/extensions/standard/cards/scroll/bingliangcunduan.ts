import {
    CardSubType,
    CardSuit,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardSpecialEvent,
} from '../../../../core/event/types/event.use';
import { Phase } from '../../../../core/player/player.types';

export const bingliangcunduan = sgs.CardUse({
    name: 'bingliangcunduan',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item && !item.hasJudgeCard('bingliangcunduan');
            },
        });
    },
    distanceCondition(room, from, target, card) {
        return from.distanceTo(target) === 1;
    },
    async effect(room, target: TargetListItem, data: UseCardSpecialEvent) {
        const judge = await room.judge({
            player: target.target,
            isSucc(result) {
                return result.suit !== CardSuit.Club;
            },
            source: data,
            reason: this.name,
        });
        if (judge.success) {
            await room.currentTurn.skipPhase(Phase.Draw);
        }
    },
});

sgs.setCardData('bingliangcunduan', {
    type: CardType.Scroll,
    subtype: CardSubType.DelayedScroll,
    length: 4,
    rhyme: 'an',
});
