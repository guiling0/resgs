import { GameCard } from '../../../../core/card/card';
import {
    CardType,
    CardSubType,
    VirtualCardData,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { DieEvent } from '../../../../core/event/types/event.die';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { General } from '../../../../core/general/general';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const jilinqianyi = sgs.CardUseEquip({
    name: 'jilinqianyi',
});

sgs.setCardData('jilinqianyi', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'i',
});

export const jiling_skill = sgs.Skill({
    name: 'jilinqianyi',
    attached_equip: 'jilinqianyi',
});

jiling_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                // return Math.max(1, from.losshp);
                return from.losshp;
            }
        },
        [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
            const use = this.skill?.getData<UseCardEvent>('data');
            return (
                use &&
                !use.isComplete &&
                this.player.rangeOf(from) &&
                !use.targetList.find((v) => v.target === from)
            );
        },
    })
);

jiling_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'jilinqianyi_skill',
        audio: ['jilinqianyi'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.card &&
                data.card.name === 'sha'
            );
        },
        async cost(room, data: UseCardEvent, context) {
            this.skill?.setData('data', data);
            return true;
        },
    })
);
