"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuxi = exports.zhangliao = void 0;
exports.zhangliao = sgs.General({
    name: 'wars.zhangliao',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.tuxi = sgs.Skill({
    name: 'wars.zhangliao.tuxi',
});
exports.tuxi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "DrawPhaseProceeding" /* EventTriggers.DrawPhaseProceeding */,
    auto_directline: 1,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const count = context.count;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: [1, count],
                            filter(item, selected) {
                                return item !== from && item.hasHandCards();
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `突袭，你可以选择至多${count}名其他角色，获得他们各一张手牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
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
                                title: '突袭',
                                timebar: room.responseTime,
                                prompt: `突袭：请选择一张牌`,
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
            data.ratedDrawnum > 0);
    },
    context(room, player, data) {
        return {
            count: data.ratedDrawnum,
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        data.ratedDrawnum -= targets.length;
        return targets.length > 0;
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        while (targets.length > 0) {
            const to = targets.shift();
            context.player = to.playerId;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
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
exports.zhangliao.addSkill(exports.tuxi);
