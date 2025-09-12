"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shenzhi = exports.shushen = exports.ganfuren = void 0;
exports.ganfuren = sgs.General({
    name: 'wars.ganfuren',
    kingdom: 'shu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.shushen = sgs.Skill({
    name: 'wars.ganfuren.shushen',
});
exports.shushen.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "RecoverHpAfter" /* EventTriggers.RecoverHpAfter */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    context(room, player, data) {
        return {
            maxTimes: data.number,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `淑慎：你可以选择一名其他角色，让他摸一张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.drawCards({
            player: target,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shenzhi = sgs.Skill({
    name: 'wars.ganfuren.shenzhi',
});
exports.shenzhi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.hasCanDropCards('h', player, player.getHandCards().length, this.name));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = from.getHandCards();
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const drop = context.cost;
        if (drop.getMoveCount() >= from.inthp) {
            await room.recoverhp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.ganfuren.addSkill(exports.shushen);
exports.ganfuren.addSkill(exports.shenzhi);
