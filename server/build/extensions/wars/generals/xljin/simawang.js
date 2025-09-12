"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linlian = exports.weisu = exports.simawang = void 0;
const rules_1 = require("../../rules");
exports.simawang = sgs.General({
    name: 'xl.simawang',
    kingdom: 'jin',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.weisu = sgs.Skill({
    name: 'xl.simawang.weisu',
});
exports.weisu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((d, c) => (d.fromArea.type === 91 /* AreaType.Hand */ ||
                d.fromArea.type === 92 /* AreaType.Equip */) &&
                d.player !== d.fromArea.player &&
                room.sameAsKingdom(d.fromArea.player, player) &&
                (d.reason === 6 /* MoveCardReason.DisCard */ ||
                    d.reason === 10 /* MoveCardReason.Obtain */)));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.losehp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = data.getCards((d, c) => (d.fromArea.type === 91 /* AreaType.Hand */ ||
            d.fromArea.type === 92 /* AreaType.Equip */) &&
            d.player !== d.fromArea.player &&
            room.sameAsKingdom(d.fromArea.player, from) &&
            (d.reason === 6 /* MoveCardReason.DisCard */ ||
                d.reason === 10 /* MoveCardReason.Obtain */));
        await data.cancle(cards);
    },
}));
exports.linlian = sgs.Skill({
    name: 'xl.simawang.linlian',
});
exports.linlian.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "Death" /* EventTriggers.Death */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.removeCard({
            player: from,
            cards: from.getSelfCards(),
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.linlian.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.simawang.addSkill(exports.weisu);
exports.simawang.addSkill(exports.linlian);
