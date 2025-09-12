import {
    CardPut,
    CardSubType,
    CardSuit,
    CardType,
} from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardSpecialEvent,
} from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

const shandian_end = sgs.TriggerEffect({
    name: 'shandian_end',
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.UseCardEnd1,
    can_trigger(room, player, data) {
        return (
            data.is(sgs.DataType.UseCardSpecialEvent) &&
            data.card.name === 'shandian' &&
            !data.data.damaged
        );
    },
    async cost(room, data: UseCardSpecialEvent, context) {
        let target = data.target.target.next;
        while (true) {
            if (!target) break;
            const putto = room.createEventData(sgs.DataType.PutToCardsData, {
                player: target,
                cards: data.card.subcards,
                toArea: target.judgeArea,
                movetype: CardPut.Up,
                puttype: CardPut.Up,
                animation: false,
                source: data,
                reason: this.name,
            });
            if (putto.check()) {
                await room.puto(putto);
                break;
            } else {
                target = target.next;
            }
            if (target === data.target.target.next) break;
        }
        return true;
    },
});

export const shandian = sgs.CardUse({
    name: 'shandian',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    effects: [shandian_end.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item && !item.hasJudgeCard('shandian');
            },
            auto: true,
        });
    },
    async effect(room, target: TargetListItem, data: UseCardSpecialEvent) {
        const judge = await room.judge({
            player: target.target,
            isSucc(result) {
                return (
                    result.suit === CardSuit.Spade &&
                    result.number >= 2 &&
                    result.number <= 9
                );
            },
            source: data,
            reason: this.name,
        });
        if (judge.success) {
            data.data.damaged = true;
            await room.damage({
                to: target.target,
                number: 3,
                damageType: DamageType.Thunder,
                channel: data.card,
                isChain: false,
                source: data,
                reason: this.name,
            });
        }
    },
});

sgs.setCardData('shandian', {
    type: CardType.Scroll,
    subtype: CardSubType.DelayedScroll,
    length: 2,
    damage: true,
    rhyme: 'an',
});
