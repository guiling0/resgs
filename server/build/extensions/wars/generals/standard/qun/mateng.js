"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xiongyi = exports.mashu = exports.mateng = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.mateng = sgs.General({
    name: 'wars.mateng',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.mashu = sgs.Skill({
    name: 'wars.mateng.mashu',
});
exports.mashu.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(from)) {
            return -1;
        }
    },
}));
exports.xiongyi = sgs.Skill({
    name: 'wars.mateng.xiongyi',
});
exports.xiongyi.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
    auto_log: 1,
    auto_directline: 1,
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
                        player: room.createChoosePlayer({
                            step: 1,
                            count: [1, -1],
                            filter(item, selected) {
                                return room.sameAsKingdom(from, item, 1);
                            },
                            auto: true,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `雄异：所有与你势力相同的角色各摸三张牌`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        while (targets.length > 0) {
            const to = targets.shift();
            await room.drawCards({
                player: to,
                count: 3,
                source: data,
                reason: this.name,
            });
        }
        const min = Math.min(...room
            .getKingdoms()
            .map((v) => room.getPlayerCountByKingdom(v)));
        if (room.getPlayerCountByKingdom(from.kingdom) === min) {
            await room.recoverhp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.mateng.addSkill(exports.mashu);
exports.mateng.addSkill(exports.xiongyi);
