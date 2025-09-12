import { EventTriggers } from '../../../../../core/event/triggers';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { SkillTag } from '../../../../../core/skill/skill.types';

export const lvbu = sgs.General({
    name: 'wars.lvbu',
    kingdom: 'qun',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});

export const wushuang = sgs.Skill({
    name: 'wars.lvbu.wushuang',
});

wushuang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                player === data.from &&
                data.card &&
                (data.card.name === 'sha' || data.card.name === 'juedou')
            );
        },
        async cost(room, data: UseCardEvent, context) {
            data.current.wushuang.push(context.from);
            return true;
        },
    })
);

wushuang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.BecomeTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                player === data.current.target &&
                data.card &&
                data.card.name === 'juedou'
            );
        },
        async cost(room, data: UseCardEvent, context) {
            data.current.wushuang.push(context.from);
            return true;
        },
    })
);

lvbu.addSkill(wushuang);
