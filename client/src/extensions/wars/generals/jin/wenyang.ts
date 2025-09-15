import { EventTriggers } from '../../../../core/event/triggers';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { UseCardEvent, UseEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const wenyang = sgs.General({
    name: 'wars.wenyang',
    kingdom: 'jin',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});

export const duanqiu = sgs.Skill({
    name: 'wars.wenyang.duanqiu',
});

duanqiu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Ready &&
                data.executor === player
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = context.effect;
                    const juedou = room.createVirtualCardByNone(
                        'juedou',
                        undefined,
                        false
                    );
                    juedou.custom.method = 1;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        !item.isNoneKingdom() &&
                                        from.canUseCard(
                                            juedou.vdata,
                                            [item],
                                            skill.name,
                                            undefined,
                                            selected
                                        )
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '断虬：你可以选择一名确定势力的角色，对他的势力的所有角色视为使用【决斗】',
                            thinkPrompt: '断虬',
                        },
                    };
                },
                target_limit: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                count: [1, -1],
                                filter(item, selected) {
                                    return room.sameAsKingdom(target, item);
                                },
                                auto: true,
                            }),
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (!target) return false;
            const card = room.createVirtualCardByNone('juedou');
            return await room.preUseCard({
                from,
                card,
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context,
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const use = context.cost as UseCardEvent;
            const plays = room.getHistorys(
                sgs.DataType.PlayCardEvent,
                (v) => v.source === use && v.card && v.card.name === 'sha',
                use
            );

            const effect = await room.addEffect('duanqiu.delay', from);
            from.setMark('duanqiu.states', `${0}/${plays.length}`, {
                visible: true,
            });
            effect.setData('turn', room.currentTurn);
        },
    })
);

export const duanqiu_delay = sgs.StateEffect({
    name: 'duanqiu.delay',
    [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        const state = (
            this.player.getMark<string>('duanqiu.states') ?? '0/0'
        ).split('/');
        const count = Number(state[0]);
        const max = Number(state[1]);
        if (card.subcards.length + count > max) {
            return true;
        }
    },
    lifecycle: [
        //记录使用的牌数
        {
            trigger: EventTriggers.DeclareUseCard,
            async on_exec(room, data: UseEvent) {
                if (data.card) {
                    const state = (
                        this.player.getMark<string>('duanqiu.states') ?? '0/0'
                    ).split('/');
                    let count = Number(state[0]);
                    let max = Number(state[1]);
                    count += data.card.subcards.length;
                    this.player.setMark('duanqiu.states', `${count}/${max}`, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: EventTriggers.TurnEnded,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    this.player.removeMark('duanqiu.states');
                    await this.removeSelf();
                }
            },
        },
    ],
});

wenyang.addSkill(duanqiu);

sgs.loadTranslation({
    ['duanqiu.states']: '断虬',
});
