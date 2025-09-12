import {
    CardType,
    CardSubType,
    CardColor,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

export const renwangdun = sgs.CardUseEquip({
    name: 'renwangdun',
});

sgs.setCardData('renwangdun', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'un',
});

export const renwangdun_skill = sgs.Skill({
    name: 'renwangdun',
    attached_equip: 'renwangdun',
});

renwangdun_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'renwangdun_skill',
        audio: ['renwangdun'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CardEffectStart,
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { card, current } = data;
                return (
                    card.name === 'sha' &&
                    card.color === CardColor.Black &&
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
