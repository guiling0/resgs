import { GameCard } from '../../../../core/card/card';
import {
    CardType,
    CardSubType,
    VirtualCardData,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const fangtianhuaji = sgs.CardUseEquip({
    name: 'fangtianhuaji_bs',
});

sgs.setCardData('fangtianhuaji_bs', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'i',
});

export const fangtian_skill = sgs.Skill({
    name: 'fangtianhuaji_bs',
    attached_equip: 'fangtianhuaji_bs',
});

fangtian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 4;
            }
        },
        [StateEffectType.TargetMod_CardLimit](from, card) {
            if (this.isOwner(from) && card.name === 'sha') {
                if (
                    card.subcards.length &&
                    card.subcards.every((v) => v.area === from.handArea) &&
                    card.subcards.length === from.handArea.count
                )
                    return [1, 3];
            }
        },
    })
);
