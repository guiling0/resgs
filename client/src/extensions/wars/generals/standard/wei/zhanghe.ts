import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { GameRoom } from '../../../../../core/room/room';
import {
    PriorityType,
    TriggerEffectContext,
} from '../../../../../core/skill/skill.types';

export const zhanghe = sgs.General({
    name: 'wars.zhanghe',
    kingdom: 'wei',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const qiaobian = sgs.Skill({
    name: 'wars.zhanghe.qiaobian',
});

function qiaobian_cost(
    room: GameRoom,
    context: TriggerEffectContext,
    prompt: string
) {
    const from = context.from;
    return {
        selectors: {
            card: room.createDropCards(from, {
                step: 1,
                count: 1,
                selectable: from.getHandCards(),
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt,
            thinkPrompt: '巧变',
        },
    };
}

qiaobian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.JudgePhaseStart,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qiaobian_cost(
                        room,
                        context,
                        '巧变，你可以弃置一张手牌跳过判定阶段'
                    ) as any;
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Judge &&
                data.executor === player &&
                !data.isComplete
            );
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
            await room.currentTurn.skipPhase();
        },
    })
);

qiaobian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.DrawPhaseStart,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qiaobian_cost(
                        room,
                        context,
                        '巧变，你可以弃置一张手牌跳过摸牌阶段，然后获得至多两名其他角色各一张手牌'
                    ) as any;
                },
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: [1, 2],
                                filter(item, selected) {
                                    return item !== from && item.hasHandCards();
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '巧变，你可以选择至多两名其他角色，获得他们各一张手牌',
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose2: () => {
                    const target = room.getPlayer(context.player);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '巧变',
                                    timebar: room.responseTime,
                                    prompt: `巧变：请选择一张牌`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Draw &&
                data.executor === player &&
                !data.isComplete
            );
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
            await room.currentTurn.skipPhase();
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const targets = room.getResultPlayers(req);
            room.sortResponse(targets);
            room.directLine(from, targets);
            while (targets.length > 0) {
                const to = targets.shift();
                context.player = to.playerId;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose2'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.obtainCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

qiaobian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseStart,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qiaobian_cost(
                        room,
                        context,
                        '巧变，你可以弃置一张手牌跳过出牌阶段，然后可以移动场上的一张牌'
                    ) as any;
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Play &&
                data.executor === player &&
                !data.isComplete
            );
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
            await room.currentTurn.skipPhase();
            await room.moveFiled(
                from,
                'ej',
                {
                    canCancle: true,
                    showMainButtons: true,
                    prompt: this.name,
                },
                data,
                this.name
            );
        },
    })
);

qiaobian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.DropPhaseStart,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return qiaobian_cost(
                        room,
                        context,
                        '巧变，你可以弃置一张手牌跳过弃牌阶段'
                    ) as any;
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Drop &&
                data.executor === player &&
                !data.isComplete
            );
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
            await room.currentTurn.skipPhase();
        },
    })
);

zhanghe.addSkill(qiaobian);
