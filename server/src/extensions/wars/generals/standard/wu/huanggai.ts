import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import {
    PriorityType,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const huanggai = sgs.General({
    name: 'wars.huanggai',
    kingdom: 'wu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const kurou = sgs.Skill({
    name: 'wars.huanggai.kurou',
});

kurou.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
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
                            prompt: `苦肉，你可以弃置一张牌，然后失去1点体力。摸三张牌，本回合可以多使用一张【杀】`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
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
            await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
            await room.drawCards({
                player: from,
                count: 3,
                source: data,
                reason: this.name,
            });
            const effect = await room.addEffect('kurou.delay', from);
            effect.setData('turn', room.currentTurn);
        },
    })
);

export const kurou_delay = sgs.StateEffect({
    name: 'kurou.delay',
    [StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') {
            return 1;
        }
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

huanggai.addSkill(kurou);

sgs.loadTranslation({
    [kurou_delay.name]: '苦肉',
});
