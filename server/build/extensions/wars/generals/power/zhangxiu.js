"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.congjian = exports.fudi = exports.zhangxiu = void 0;
exports.zhangxiu = sgs.General({
    name: 'wars.zhangxiu',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.fudi = sgs.Skill({
    name: 'wars.zhangxiu.fudi',
});
exports.fudi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.to &&
            data.from &&
            data.from !== data.to &&
            player.hasHandCards());
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const targets = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `附敌：你可以交给${targets.gameName}一张手牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                const targets = room.playerAlives.filter((v) => room.sameAsKingdom(v, target));
                const max = Math.max(...targets.map((v) => v.hp));
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (targets.includes(item) &&
                                    item.hp === max);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '附敌：选择一名角色对他造成1点伤害',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], cards, } = context;
        return await room.giveCards({
            from,
            to,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const targets = room.playerAlives.filter((v) => room.sameAsKingdom(v, target));
        const max = Math.max(...targets.map((v) => v.hp));
        if (max >= from.hp) {
            let to;
            const tos = targets.filter((v) => v.hp === max);
            if (tos.length === 0)
                return;
            else if (tos.length === 1)
                to = tos[0];
            else {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const players = room.getResultPlayers(req);
                to = players.at(0);
            }
            if (to) {
                await room.damage({
                    from,
                    to,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.congjian = sgs.Skill({
    name: 'wars.zhangxiu.congjian',
});
exports.congjian.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: ["InflictDamage2" /* EventTriggers.InflictDamage2 */, "CauseDamage1" /* EventTriggers.CauseDamage1 */],
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            if (data.trigger === "InflictDamage2" /* EventTriggers.InflictDamage2 */ &&
                player === data.to &&
                player.inturn) {
                return true;
            }
            if (data.trigger === "CauseDamage1" /* EventTriggers.CauseDamage1 */ &&
                player === data.from &&
                !player.inturn) {
                return true;
            }
        }
    },
    async cost(room, data, context) {
        data.number += 1;
        return true;
    },
}));
exports.zhangxiu.addSkill(exports.fudi);
exports.zhangxiu.addSkill(exports.congjian);
