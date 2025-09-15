import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventData } from '../../../../core/event/data';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { GameRoom } from '../../../../core/room/room';
import { TriggerEffect } from '../../../../core/skill/effect';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const qinglongyanyuedao = sgs.CardUseEquip({
    name: 'qinglongyanyuedao',
});

sgs.setCardData('qinglongyanyuedao', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'ao',
});

export const qinglong_skill = sgs.Skill({
    name: 'qinglongyanyuedao',
    attached_equip: 'qinglongyanyuedao',
});

qinglong_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 3;
            }
        },
        [StateEffectType.Prohibit_Open](player, generals, reason) {
            const use = this.skill?.getData<UseCardEvent>('data');
            return (
                use &&
                !use.isComplete &&
                !!use.targetList.find((v) => v.target === player)
            );
        },
    })
);
qinglong_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'qinglongyanyuedao_skill',
        audio: ['qinglongyanyuedao'],
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
