import {
    CardAttr,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { ChainEvent } from '../../../../core/event/types/event.state';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

export const mingguangkai = sgs.CardUseEquip({
    name: 'mingguangkai',
});

sgs.setCardData('mingguangkai', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'ai',
});

export const mingguangkai_skill = sgs.Skill({
    name: 'mingguangkai',
    attached_equip: 'mingguangkai',
});

mingguangkai_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        anim: 'mingguangkai1_skill',
        audio: ['mingguangkai1'],
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card &&
                (data.card.name === 'huoshaolianying' ||
                    data.card.name === 'huogong' ||
                    (data.card.name === 'sha' &&
                        data.card.hasAttr(CardAttr.Fire))) &&
                data.current.target === player
            );
        },
        async cost(room, data: UseCardEvent, context) {
            return await data.cancleCurrent();
        },
    })
);

mingguangkai_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        anim: 'mingguangkai2_skill',
        audio: ['mingguangkai2'],
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.StateChange,
        can_trigger(room, player, data: ChainEvent) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.ChainEvent) &&
                data.player === player &&
                player.isSmallKingdom() &&
                data.to_state === true
            );
        },
        async cost(room, data: ChainEvent, context) {
            return await data.prevent();
        },
    })
);
