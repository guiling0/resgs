"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shangshi = exports.ejue = exports.zhangchunhua_jin = void 0;
exports.zhangchunhua_jin = sgs.General({
    name: 'wars.zhangchunhua_jin',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.ejue = sgs.Skill({
    name: 'wars.zhangchunhua_jin.ejue',
});
exports.ejue.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.reason === 'sha' &&
            data.to.isNoneKingdom());
    },
    async cost(room, data, context) {
        data.number += 1;
        return true;
    },
}));
exports.shangshi = sgs.Skill({
    name: 'wars.zhangchunhua_jin.shangshi',
});
exports.shangshi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player.getHandCards().length < player.losshp);
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = from.losshp - from.getHandCards().length;
        return await room.drawCards({
            player: from,
            count,
            source: data,
            reason: this.name,
        });
    },
}));
exports.zhangchunhua_jin.addSkill(exports.ejue);
exports.zhangchunhua_jin.addSkill(exports.shangshi);
