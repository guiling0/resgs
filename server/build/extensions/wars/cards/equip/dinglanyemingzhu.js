"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yemingzhu_skill = exports.dinglanyemingzhu = void 0;
exports.dinglanyemingzhu = sgs.CardUseEquip({
    name: 'dinglanyemingzhu',
});
sgs.setCardData('dinglanyemingzhu', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'u',
});
exports.yemingzhu_skill = sgs.Skill({
    name: 'dinglanyemingzhu',
    attached_equip: 'dinglanyemingzhu',
});
exports.yemingzhu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            return !room.skills.find((s) => s.isOpen() &&
                s !== this.skill &&
                s.trueName === 'zhiheng' &&
                s.player === player);
        }
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: [1, from.maxhp],
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `制衡(定澜夜明珠)：你可以弃置至多${from.maxhp}张牌，然后摸等量的牌`,
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
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player?.setMark('#yemingzhu_level', true);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark('#yemingzhu_level');
            },
        },
    ],
}));
