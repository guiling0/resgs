import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { PriorityType } from '../../../../core/skill/skill.types';

export const huxinjing = sgs.CardUseEquip({
    name: 'huxinjing',
});

sgs.setCardData('huxinjing', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'ing',
});

export const huxinjing_skill = sgs.Skill({
    name: 'huxinjing',
    attached_equip: 'huxinjing',
});

huxinjing_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.number >= player.hp &&
                this.skill &&
                !!this.skill.sourceEquip
            );
        },
        async cost(room, data: DamageEvent, context) {
            const { from } = context;
            const equip = this.skill?.sourceEquip;
            if (equip) {
                return await room.puto({
                    player: from,
                    cards: [equip],
                    toArea: room.discardArea,
                    source: data,
                    reason: this.name,
                });
            }
        },
        async effect(room, data: DamageEvent, context) {
            await data.prevent();
        },
    })
);
