"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jianxiong = exports.caocao = void 0;
exports.caocao = sgs.General({
    name: 'wars.caocao',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jianxiong = sgs.Skill({
    name: 'wars.caocao.jianxiong',
});
exports.jianxiong.addEffect(sgs.TriggerEffect({
    priorityType: 1 /* PriorityType.General */,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    forced: 'cost',
    auto_log: 1,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            player === data.to &&
            data.channel?.hasSubCards());
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.obtainCards({
            player: from,
            cards: data.channel?.subcards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.caocao.addSkill(exports.jianxiong);
