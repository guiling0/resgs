"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jili = exports.shamoke = void 0;
exports.shamoke = sgs.General({
    name: 'wars.shamoke',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jili = sgs.Skill({
    name: 'wars.shamoke.jili',
});
exports.jili.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: ["CardBeUse" /* EventTriggers.CardBeUse */, "CardBePlay" /* EventTriggers.CardBePlay */],
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.from === player) {
            return (room.getPeriodHistory(room.currentTurn).filter((v) => {
                return ((v.data.is(sgs.DataType.UseCardEvent) ||
                    v.data.is(sgs.DataType.UseCardToCardEvent) ||
                    v.data.is(sgs.DataType.PlayCardEvent)) &&
                    v.data.from === player);
            }).length === player.range);
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: from.range,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shamoke.addSkill('wars.shamoke.jili');
