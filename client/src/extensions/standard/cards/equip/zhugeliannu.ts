import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const zhugeliannu = sgs.CardUseEquip({
    name: 'zhugeliannu',
});

sgs.setCardData('zhugeliannu', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'u',
});

export const zhugeliannu_skill = sgs.Skill({
    name: 'zhugeliannu',
    attached_equip: 'zhugeliannu',
});

zhugeliannu_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 1;
            }
        },
        [StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
            return this.isOwner(from) && card.name === 'sha';
        },
    })
);

zhugeliannu_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'zhugeliannu_skill',
        audio: ['zhugeliannu'],
        auto_log: 1,
        priorityType: PriorityType.None,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data) {
            if (data.is(sgs.DataType.UseCardEvent)) {
                const { from, card } = data;
                return (
                    card.name === 'sha' &&
                    this.player === from &&
                    this.player.getMark<number>('__sha_times') >= 2
                );
            }
        },
    })
);
