"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wushuang = exports.lvbu = void 0;
exports.lvbu = sgs.General({
    name: 'wars.lvbu',
    kingdom: 'qun',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.wushuang = sgs.Skill({
    name: 'wars.lvbu.wushuang',
});
exports.wushuang.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    auto_directline: 1,
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.from &&
            data.card &&
            (data.card.name === 'sha' || data.card.name === 'juedou'));
    },
    async cost(room, data, context) {
        data.current.wushuang.push(context.from);
        return true;
    },
}));
exports.wushuang.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    auto_directline: 1,
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.current.target &&
            data.card &&
            data.card.name === 'juedou');
    },
    async cost(room, data, context) {
        data.current.wushuang.push(context.from);
        return true;
    },
}));
exports.lvbu.addSkill(exports.wushuang);
