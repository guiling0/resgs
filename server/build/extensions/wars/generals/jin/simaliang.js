"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheju = exports.gongzhi = exports.simaliang = void 0;
exports.simaliang = sgs.General({
    name: 'wars.simaliang',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.gongzhi = sgs.Skill({
    name: 'wars.simaliang.gongzhi',
});
exports.gongzhi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseStart" /* EventTriggers.DrawPhaseStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && !data.isComplete);
    },
    async cost(room, data, context) {
        await data.skip();
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        let source = from;
        let number = 4;
        while (number-- > 0) {
            await room.drawCards({
                player: source,
                source: data,
                reason: this.name,
            });
            const players = room.sortPlayers(room.playerAlives, source);
            const player = players.find((v) => room.sameAsKingdom(from, v) && v !== source);
            if (player)
                source = player;
        }
    },
}));
exports.sheju = sgs.Skill({
    name: 'wars.simaliang.sheju',
});
exports.sheju.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "Opened" /* EventTriggers.Opened */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player !== data.player &&
            room.sameAsKingdom(player, data.player) &&
            player.losshp > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.recoverhp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.dropCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
    },
}));
exports.simaliang.addSkill(exports.gongzhi);
exports.simaliang.addSkill(exports.sheju);
