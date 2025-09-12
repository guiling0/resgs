import {
    CardAttr,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { ChainEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const taipingyaoshu = sgs.CardUseEquip({
    name: 'taipingyaoshu',
});

sgs.setCardData('taipingyaoshu', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'u',
});

export const taiping_skill = sgs.Skill({
    name: 'taipingyaoshu',
    attached_equip: 'taipingyaoshu',
});

taiping_skill.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.MaxHand_Correct](from) {
            if (this.isOwner(from)) {
                return this.room.getPlayerCountByKingdom(
                    from.kingdom,
                    false,
                    true
                );
            }
        },
    })
);

taiping_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        anim: 'taipingyaoshu1_skill',
        audio: ['taipingyaoshu1'],
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.damageType !== DamageType.None &&
                data.to === player
            );
        },
        async cost(room, data: DamageEvent, context) {
            return await data.prevent();
        },
    })
);

taiping_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.get(this.skill.sourceEquip)?.fromArea === player.equipArea
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const effect = await room.addEffect('taiping_effect_delay', from);
            effect.setData('data', data);
            return true;
        },
    })
);

export const taiping_delay = sgs.TriggerEffect({
    name: 'taiping_effect_delay',
    anim: 'taipingyaoshu2_skill',
    audio: ['taipingyaoshu2'],
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.MoveCardAfter2,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data: DamageEvent, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        if (from.hp > 1) {
            await room.losehp({
                player: from,
                number: 1,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: EventTriggers.MoveCardEnd,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
