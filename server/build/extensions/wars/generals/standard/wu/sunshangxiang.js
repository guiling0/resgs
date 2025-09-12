"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xiaoji = exports.jieyin = exports.sunshangxiang = void 0;
exports.sunshangxiang = sgs.General({
    name: 'wars.sunshangxiang',
    kingdom: 'wu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.jieyin = sgs.Skill({
    name: 'wars.sunshangxiang.jieyin',
});
exports.jieyin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
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
                            count: 2,
                            selectable: from.getHandCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    item.gender === 1 /* Gender.Male */ &&
                                    item.losshp > 0);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `结姻，你可以弃置两张手牌并选择一名其他男性角色，你和他各回复1点体力`,
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
        const { from, targets: [target], } = context;
        await room.recoverhp({
            player: from,
            source: data,
            reason: this.name,
        });
        await room.recoverhp({
            player: target,
            source: data,
            reason: this.name,
        });
    },
}));
exports.xiaoji = sgs.Skill({
    name: 'wars.sunshangxiang.xiaoji',
});
exports.xiaoji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.has_lose(player, 'e');
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
}));
exports.sunshangxiang.addSkill(exports.jieyin);
exports.sunshangxiang.addSkill(exports.xiaoji);
