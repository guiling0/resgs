import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const xuchu = sgs.General({
    name: 'wars.xuchu',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const luoyi = sgs.Skill({
    name: 'wars.xuchu.luoyi',
});

luoyi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseEnd,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Draw &&
                data.executor === player
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '裸衣：你可以弃置一张牌，本回合使用【杀】或【决斗】的伤害+1',
                        },
                    };
                },
            };
        },
        async cost(room, data: PhaseEvent, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const effect = await room.addEffect('luoyi.delay', from);
            effect.setData('turn', room.currentTurn);
        },
    })
);

xuchu.addSkill(luoyi);

export const luoyi_delay = sgs.TriggerEffect({
    name: 'luoyi.delay',
    priorityType: PriorityType.General,
    trigger: EventTriggers.CauseDamage1,
    can_trigger(room, player, data) {
        return (
            this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            data.from === player &&
            (data.reason === 'sha' || data.reason === 'juedou')
        );
    },
    async cost(room, data: DamageEvent, context) {
        data.number++;
        return true;
    },
    lifecycle: [
        {
            trigger: EventTriggers.onObtain,
            async on_exec(room, data) {
                this.player?.setMark(this.name, true, {
                    visible: true,
                });
            },
        },
        {
            trigger: EventTriggers.onLose,
            async on_exec(room, data) {
                this.player?.removeMark(this.name);
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});

sgs.loadTranslation({
    [luoyi_delay.name]: '裸衣',
});
