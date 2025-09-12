import { CardSubType, CardType } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import {
    UseCardEvent,
    UseCardToCardEvent,
} from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const huangyueying = sgs.General({
    name: 'wars.huangyueying',
    kingdom: 'shu',
    hp: 1.5,
    gender: Gender.Female,isWars: true,
});

export const jizhi = sgs.Skill({
    name: 'wars.huangyueying.jizhi',
});

jizhi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.CardBeUse,
        can_trigger(room, player, data: UseCardEvent | UseCardToCardEvent) {
            return (
                this.isOwner(player) &&
                data.card &&
                data.card.subtype === CardSubType.InstantScroll &&
                data.from === player &&
                !data.card.transform
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const qicai = sgs.Skill({
    name: 'wars.huangyueying.qicai',
});

qicai.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
            return (
                this.isOwner(from) &&
                sgs.utils.getCardType(card.name) === CardType.Scroll
            );
        },
    })
);

huangyueying.addSkill(jizhi);
huangyueying.addSkill(qicai);
