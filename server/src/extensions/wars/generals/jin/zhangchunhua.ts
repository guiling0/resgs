import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const zhangchunhua_jin = sgs.General({
    name: 'wars.zhangchunhua_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const ejue = sgs.Skill({
    name: 'wars.zhangchunhua_jin.ejue',
});

ejue.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.CauseDamage1,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.reason === 'sha' &&
                data.to.isNoneKingdom()
            );
        },
        async cost(room, data: DamageEvent, context) {
            data.number += 1;
            return true;
        },
    })
);

export const shangshi = sgs.Skill({
    name: 'wars.zhangchunhua_jin.shangshi',
});

shangshi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.TurnEnd,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                player.getHandCards().length < player.losshp
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const count = from.losshp - from.getHandCards().length;
            return await room.drawCards({
                player: from,
                count,
                source: data,
                reason: this.name,
            });
        },
    })
);

zhangchunhua_jin.addSkill(ejue);
zhangchunhua_jin.addSkill(shangshi);
