import { CardSubType, CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const yuxi = sgs.CardUseEquip({
    name: 'yuxi',
});

sgs.setCardData('yuxi', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'i',
});

export const yuxi_skill = sgs.Skill({
    name: 'yuxi',
    attached_equip: 'yuxi',
    condition(room) {
        return !this.player.isNoneKingdom();
    },
});

yuxi_skill.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Regard_OnlyBig](player) {
            return this.isOwner(player);
        },
    })
);

yuxi_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.DrawPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data: PhaseEvent, context) {
            data.ratedDrawnum++;
            return true;
        },
    })
);

yuxi_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.PlayPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            if (this.isOwner(player) && data.isOwner(player)) {
                return player.canUseCard(
                    { name: 'zhijizhibi' },
                    undefined,
                    this.name
                );
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const zhijizhibi = room.createVirtualCardByNone('zhijizhibi');
            zhijizhibi.custom.method = 1;
            return await room.preUseCard({
                from,
                card: zhijizhibi,
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: 'yuxi.zhijizhibi',
                    thinkPrompt: this.name,
                    showMainButtons: true,
                    canCancle: false,
                },
            });
        },
    })
);

sgs.loadTranslation({
    ['yuxi.zhijizhibi']: '玉玺：你可以视为使用一张【知己知彼】',
});
