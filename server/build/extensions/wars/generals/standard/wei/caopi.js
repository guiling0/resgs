"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xingshang = exports.fangzhu = exports.caopi = void 0;
exports.caopi = sgs.General({
    name: 'wars.caopi',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.fangzhu = sgs.Skill({
    name: 'wars.caopi.fangzhu',
});
exports.fangzhu.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== context.from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `放逐：你可以选择一名角色，他叠置并摸${context.from.losshp}张牌`,
                        thinkPrompt: this.skill.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            data.to === player);
    },
    async cost(room, data, context) {
        const { targets: { [0]: target }, } = context;
        return await room.skip({
            player: target,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: { [0]: target }, } = context;
        await room.drawCards({
            player: target,
            count: from.losshp,
            source: data,
            reason: this.name,
        });
    },
}));
exports.xingshang = sgs.Skill({
    name: 'wars.caopi.xingshang',
});
exports.xingshang.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    trigger: "Death" /* EventTriggers.Death */,
    priorityType: 1 /* PriorityType.General */,
    forced: 'cost',
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.player !== player &&
            data.player.hasCardsInArea());
    },
    context(room, player, data) {
        return {
            targets: [data.player],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        if (target) {
            return await room.obtainCards({
                player: from,
                cards: target.getSelfCards(),
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.caopi.addSkill(exports.fangzhu);
exports.caopi.addSkill(exports.xingshang);
