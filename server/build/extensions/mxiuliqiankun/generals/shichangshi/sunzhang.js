"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zimou = exports.cs_sunzhang = void 0;
exports.cs_sunzhang = sgs.General({
    name: 'mobile.cs_sunzhang',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.zimou = sgs.Skill({
    name: 'mobile.cs_sunzhang.zimou',
});
exports.zimou.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.from === player) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(player, 4 /* Phase.Play */))
                return false;
            const uses = room
                .getPeriodHistory(room.currentTurn)
                .filter((v) => {
                return ((v.data.is(sgs.DataType.UseCardEvent) ||
                    v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                    v.data.from === player);
            }).length;
            return uses === 2 || uses === 4 || uses === 6;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const uses = room.getPeriodHistory(room.currentTurn).filter((v) => {
            return ((v.data.is(sgs.DataType.UseCardEvent) ||
                v.data.is(sgs.DataType.UseCardToCardEvent)) &&
                v.data.from === from);
        }).length;
        let cards;
        if (uses === 2) {
            cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (v) => v.name === 'jiu');
        }
        if (uses === 4) {
            cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (v) => v.name === 'sha');
        }
        if (uses === 6) {
            cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (v) => v.name === 'juedou');
        }
        await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        return true;
    },
}));
exports.cs_sunzhang.addSkill(exports.zimou);
