"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhiheng = exports.sunquan = void 0;
exports.sunquan = sgs.General({
    name: 'wars.sunquan',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhiheng = sgs.Skill({
    name: 'wars.sunquan.zhiheng',
});
exports.zhiheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
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
                            count: from.getMark('#yemingzhu_level')
                                ? [1, -1]
                                : [1, from.maxhp],
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `制衡，你可以弃置至多${from.maxhp}张牌，然后摸等量的牌`,
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
        const { from, cards } = context;
        await room.drawCards({
            player: from,
            count: cards.length,
            source: data,
            reason: this.name,
        });
    },
}));
exports.sunquan.addSkill(exports.zhiheng);
