import {
    CardType,
    CardSubType,
    CardAttr,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const zhuque = sgs.CardUseEquip({
    name: 'zhuqueyushan',
});

sgs.setCardData('zhuqueyushan', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'an',
});

export const zhuque_skill = sgs.Skill({
    name: 'zhuqueyushan',
    attached_equip: 'zhuqueyushan',
});

zhuque_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 4;
            }
        },
    })
);

zhuque_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'zhuqueyushan_skill',
        audio: ['zhuqueyushan'],
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.DeclareUseCard,
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { from, card } = data;
                return card.isCommonSha() && player === from;
            }
        },
        async cost(room, data: UseCardEvent, context) {
            data.card.sourceData.attr.push(CardAttr.Fire);
            return true;
        },
    })
);
