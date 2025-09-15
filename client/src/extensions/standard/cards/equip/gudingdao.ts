import { GameCard } from '../../../../core/card/card';
import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const gudingdao = sgs.CardUseEquip({
    name: 'gudingdao',
});

sgs.setCardData('gudingdao', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'ao',
});

export const gudingdao_skill = sgs.Skill({
    name: 'gudingdao',
    attached_equip: 'gudingdao',
});

gudingdao_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 2;
            }
        },
    })
);

gudingdao_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        anim: 'gudingdao_skill',
        audio: ['gudingdao'],
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CauseDamage1,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                data.to &&
                !data.to.hasHandCards()
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: DamageEvent, context) {
            data.number++;
            return true;
        },
    })
);
