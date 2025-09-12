import {
    CardType,
    CardSubType,
    CardColor,
} from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

export const tengjia = sgs.CardUseEquip({
    name: 'tengjia',
});

sgs.setCardData('tengjia', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'a',
});

export const tengjia_skill = sgs.Skill({
    name: 'tengjia',
    attached_equip: 'tengjia',
});

tengjia_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'tengjia1_skill',
        audio: ['tengjia'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CardEffectStart,
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { card, current } = data;
                return (
                    (card.isCommonSha() ||
                        card.name === 'wanjianqifa' ||
                        card.name === 'nanmanruqin') &&
                    player === current.target
                );
            }
        },
        async cost(room, data: UseCardEvent, context) {
            await data.invalidCurrent();
            return true;
        },
    })
);

tengjia_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'tengjia2_skill',
        audio: ['tengjia_fire'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage2,
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
                const { damageType, to } = data;
                return damageType === DamageType.Fire && player === to;
            }
        },
        async cost(room, data: DamageEvent, context) {
            data.number++;
            return true;
        },
    })
);
