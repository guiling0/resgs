import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const caocao = sgs.General({
    name: 'wars.caocao',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const jianxiong = sgs.Skill({
    name: 'wars.caocao.jianxiong',
});

jianxiong.addEffect(
    sgs.TriggerEffect({
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        forced: 'cost',
        auto_log: 1,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                player === data.to &&
                data.channel?.hasSubCards()
            );
        },
        async cost(room, data: DamageEvent, context) {
            const { from } = context;
            return await room.obtainCards({
                player: from,
                cards: data.channel?.subcards,
                source: data,
                reason: this.name,
            });
        },
    })
);

caocao.addSkill(jianxiong);
