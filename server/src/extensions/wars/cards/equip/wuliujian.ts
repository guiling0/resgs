import { GameCard } from '../../../../core/card/card';
import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const wuliujian = sgs.CardUseEquip({
    name: 'wuliujian',
});

sgs.setCardData('wuliujian', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'an',
});

export const wuliujian_skill = sgs.Skill({
    name: 'wuliujian',
    attached_equip: 'wuliujian',
});

wuliujian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 2;
            }
        },
        [StateEffectType.Range_Correct](from) {
            const room = this.room;
            if (!this.isOwner(from) && room.sameAsKingdom(this.player, from)) {
                return 1;
            }
        },
    })
);
