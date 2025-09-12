"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shensu = exports.xiahouyuan = void 0;
exports.xiahouyuan = sgs.General({
    name: 'wars.xiahouyuan',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.shensu = sgs.Skill({
    name: 'wars.xiahouyuan.shensu',
});
exports.shensu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "JudgePhaseStart" /* EventTriggers.JudgePhaseStart */,
    auto_directline: 1,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const skill = this;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.custom.method = 1;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return from.canUseCard(sha.vdata, [item], skill.name, {
                                    excluesCardTimesLimit: true,
                                    excluesCardDistanceLimit: true,
                                }, selected);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '神速，你可以跳过判定和摸牌阶段，视为使用一张【杀】',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 2 /* Phase.Judge */ &&
            data.executor === player &&
            !data.isComplete &&
            room.currentTurn.isNotSkip(3 /* Phase.Draw */));
    },
    async cost(room, data, context) {
        await room.currentTurn.skipPhase([2 /* Phase.Judge */, 3 /* Phase.Draw */]);
        return true;
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        const sha = room.createVirtualCardByNone('sha');
        sha.custom.method = 1;
        await room.usecard({
            from,
            targets,
            card: sha,
            noPlayDirectLine: true,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shensu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseStart" /* EventTriggers.PlayPhaseStart */,
    auto_directline: 1,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const skill = this;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.type === 3 /* CardType.Equip */;
                            },
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return from.canUseCard(sha.vdata, [item], skill.name, {
                                    excluesCardTimesLimit: true,
                                    excluesCardDistanceLimit: true,
                                }, selected);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '神速，你可以跳过出牌阶段并弃置一张装备牌，视为使用一张【杀】',
                        thinkPrompt: this.name,
                    },
                };
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
        const { from, targets } = context;
        await room.currentTurn.skipPhase(4 /* Phase.Play */);
        const sha = room.createVirtualCardByNone('sha');
        sha.custom.method = 1;
        await room.usecard({
            from,
            targets,
            card: sha,
            noPlayDirectLine: true,
            source: data,
            reason: this.name,
        });
    },
}));
exports.xiahouyuan.addSkill(exports.shensu);
