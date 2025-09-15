import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';

export const baiyinshizi = sgs.CardUseEquip({ name: 'baiyinshizi' });

sgs.setCardData('baiyinshizi', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'i',
});

export const baiyinshizi_skill = sgs.Skill({
    name: 'baiyinshizi',
    attached_equip: 'baiyinshizi',
});

baiyinshizi_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        anim: 'baiyinshizi_skill',
        audio: ['baiyinshizi'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                data.to === player &&
                data.number > 1
            );
        },
        async cost(room, data: DamageEvent, context) {
            data.number = 1;
            return true;
        },
    })
);

baiyinshizi_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore2,
        auto_log: 1,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                player.losshp > 0 &&
                data.is(sgs.DataType.MoveCardEvent) &&
                data.get(this.skill.sourceEquip)?.fromArea === player.equipArea
            );
        },
        async cost(room, data: DamageEvent, context) {
            const { from } = context;
            const effect = await room.addEffect('baiyin_effect_delay', from);
            effect.setData('baiyin_move', data);
            return true;
        },
    })
);

export const baiyin_effect_delay = sgs.TriggerEffect({
    name: 'baiyin_effect_delay',
    anim: 'baiyinshizi_skill',
    audio: ['baiyinshizi'],
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.MoveCardAfter2,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('baiyin_move') === data;
    },
    async cost(room, data: DamageEvent, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.recoverhp({
            player: from,
            number: 1,
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: EventTriggers.MoveCardEnd,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('baiyin_move') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
