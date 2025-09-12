"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liegong_v2025 = exports.huangzhong_v2025 = exports.liegong = exports.huangzhong = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
function checkLiubeiLevel(room) {
    const wuhu = room.getEffect(room.getMark('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}
exports.huangzhong = sgs.General({
    name: 'wars.huangzhong',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.liegong = sgs.Skill({
    name: 'wars.huangzhong.liegong',
});
exports.liegong.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player) {
            const phase = room.getCurrentPhase();
            if (phase.isOwner(player, 4 /* Phase.Play */)) {
                const target = data.current.target;
                const count = target.getHandCards().length;
                return count >= player.hp || count <= player.range;
            }
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.targetCantResponse(targets);
    },
}));
exports.liegong.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Correct](from) {
        const room = this.room;
        if (this.isOwner(from) && checkLiubeiLevel(room)) {
            return 1;
        }
    },
}));
exports.huangzhong.addSkill(exports.liegong);
exports.huangzhong_v2025 = sgs.General({
    name: 'wars.v2025.huangzhong',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.liegong_v2025 = sgs.Skill({
    name: 'wars.v2025.huangzhong.liegong',
});
exports.liegong_v2025.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player) {
            const phase = room.getCurrentPhase();
            if (phase.isOwner(player, 4 /* Phase.Play */)) {
                const target = data.current.target;
                const count = target.getHandCards().length;
                return count >= player.hp || count <= player.range;
            }
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.targetCantResponse(targets);
    },
    async effect(room, data, context) {
        const { from } = context;
        const count = from.getHandCards().length;
        if (count >= from.hp && count <= from.range) {
            data.baseDamage += 1;
        }
    },
}));
exports.liegong_v2025.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Correct](from) {
        const room = this.room;
        if (this.isOwner(from) && checkLiubeiLevel(room)) {
            return 1;
        }
    },
}));
exports.huangzhong_v2025.addSkill(exports.liegong_v2025);
