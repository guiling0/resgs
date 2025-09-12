"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chixia = exports.cs_duangui = void 0;
exports.cs_duangui = sgs.General({
    name: 'mobile.cs_duangui',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.chixia = sgs.Skill({
    name: 'mobile.cs_duangui.chixia',
});
//TODO 禁用特定条件的响应
exports.chixia.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            data.card.name === 'sha' &&
            data.targetCount === 1);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(2);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            animation: true,
            source: data,
            reason: this.name,
        });
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost;
        const suits = [];
        cards.forEach((v) => {
            if (!suits.includes(v.suit) && v.suit !== 0 /* CardSuit.None */) {
                suits.push(v.suit);
            }
            if (room.sameAsSuit(v, data.card)) {
                data.baseDamage += 1;
            }
        });
        await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            animation: true,
            source: data,
            reason: this.name,
        });
    },
}));
exports.cs_duangui.addSkill(exports.chixia);
