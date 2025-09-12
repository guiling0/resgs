"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qiaobian = exports.zhanghe = void 0;
exports.zhanghe = sgs.General({
    name: 'wars.zhanghe',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qiaobian = sgs.Skill({
    name: 'wars.zhanghe.qiaobian',
});
function qiaobian_cost(room, context, prompt) {
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
exports.qiaobian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "JudgePhaseStart" /* EventTriggers.JudgePhaseStart */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qiaobian_cost(room, context, '巧变，你可以弃置一张手牌跳过判定阶段');
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 2 /* Phase.Judge */ &&
            data.executor === player &&
            !data.isComplete);
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
}));
exports.qiaobian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "DrawPhaseStart" /* EventTriggers.DrawPhaseStart */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qiaobian_cost(room, context, '巧变，你可以弃置一张手牌跳过摸牌阶段，然后获得至多两名其他角色各一张手牌');
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
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 3 /* Phase.Draw */ &&
            data.executor === player &&
            !data.isComplete);
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
}));
exports.qiaobian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseStart" /* EventTriggers.PlayPhaseStart */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qiaobian_cost(room, context, '巧变，你可以弃置一张手牌跳过出牌阶段，然后可以移动场上的一张牌');
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 4 /* Phase.Play */ &&
            data.executor === player &&
            !data.isComplete);
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
        await room.moveFiled(from, 'ej', {
            canCancle: true,
            showMainButtons: true,
            prompt: this.name,
        }, data, this.name);
    },
}));
exports.qiaobian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "DropPhaseStart" /* EventTriggers.DropPhaseStart */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return qiaobian_cost(room, context, '巧变，你可以弃置一张手牌跳过弃牌阶段');
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 5 /* Phase.Drop */ &&
            data.executor === player &&
            !data.isComplete);
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
}));
exports.zhanghe.addSkill(exports.qiaobian);
