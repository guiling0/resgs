"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luanchang = exports.zhulan = exports.simalun = void 0;
exports.simalun = sgs.General({
    name: 'wars.simalun',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhulan = sgs.Skill({
    name: 'wars.simalun.zhulan',
});
exports.zhulan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from &&
            room.sameAsKingdom(data.from, data.to) &&
            player.hasCanDropCards('he', player, 1, this.name));
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `助澜：你可以弃置一张牌令伤害+1`,
                        thinkPrompt: `助澜`,
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
        data.number += 1;
    },
}));
exports.luanchang = sgs.Skill({
    name: 'wars.simalun.luanchang',
});
exports.luanchang.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
    auto_log: 1,
    forced: 'cost',
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const damages = room.getHistorys(sgs.DataType.DamageEvent, (v) => room.sameAsKingdom(v.to, player) && v.to.alive, data);
            return (damages.length > 0 &&
                data.player.canUseCard(room.createVirtualCard('wanjianqifa', data.player.getHandCards(), undefined, true, false).vdata, undefined, this.name));
        }
    },
    context(room, player, data) {
        return {
            targets: [data.player],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.preUseCard({
            from: target,
            card: room.createVirtualCard('wanjianqifa', target.getHandCards(), undefined, true, false),
            source: data,
            reason: this.name,
            transform: this,
        });
    },
}));
exports.simalun.addSkill(exports.zhulan);
exports.simalun.addSkill(exports.luanchang);
