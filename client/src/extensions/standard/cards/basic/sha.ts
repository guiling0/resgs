import {
    CardAttr,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const sha = sgs.CardUse({
    name: 'sha',
    method: 1,
    trigger: EventTriggers.PlayPhaseProceeding,
    timeCondition(room, from, card) {
        return 1;
    },
    distanceCondition(room, from, target, card) {
        return from.rangeOf(target);
    },
    target(room, from, card) {
        const count =
            room
                .getStates(StateEffectType.TargetMod_CardLimit, [from, card])
                .at(-1) ?? 1;
        return room.createChoosePlayer({
            count,
            filter(item, selected) {
                return from !== item;
            },
        });
    },
    async onuse(room, data: UseCardEvent) {
        const { from, card, source } = data;
        data.baseDamage = 1 + from.jiuState;
        from.setProperty('jiuState', 0);
        if (
            source.is(sgs.DataType.PhaseEvent) &&
            source.trigger === EventTriggers.PlayPhaseProceeding &&
            source.executor === from
        ) {
            const pass = room
                .getStates(StateEffectType.TargetMod_PassCountingTime, [
                    from,
                    card,
                    undefined,
                ])
                .some((v) => v);
            if (!pass) {
                from.increaseMark('__sha_times', 1);
            }
        }
    },
    async effect(room, target, data: UseCardEvent) {
        const { card, from, current, baseDamage = 1 } = data;
        let damageType = DamageType.None;
        if (card.hasAttr(CardAttr.Thunder)) {
            damageType = DamageType.Thunder;
        }
        if (card.hasAttr(CardAttr.Fire)) {
            damageType = DamageType.Fire;
        }
        await room.damage({
            from,
            to: current.target,
            number: baseDamage,
            damageType,
            channel: card,
            isChain: false,
            source: data,
            reason: this.name,
        });
    },
});

sgs.setCardData('sha', {
    type: CardType.Basic,
    subtype: CardSubType.Basic,
    damage: true,
});
