"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoucheng = exports.shengxi = exports.jiangwanfeiyi = void 0;
exports.jiangwanfeiyi = sgs.General({
    name: 'wars.jiangwanfeiyi',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isDualImage: true,
    isWars: true,
});
exports.shengxi = sgs.Skill({
    name: 'wars.jiangwanfeiyi.shengxi',
});
exports.shengxi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DropPhaseStarted" /* EventTriggers.DropPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const damages = room.getHistorys(sgs.DataType.DamageEvent, (v) => v.from === player, room.currentTurn);
            return damages.length === 0;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shoucheng = sgs.Skill({
    name: 'wars.jiangwanfeiyi.shoucheng',
});
exports.shoucheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (!player.inturn &&
            room.sameAsKingdom(this.player, player) &&
            data.has_lose(player, 'h') &&
            !player.hasHandCards());
    },
    context(room, player, data) {
        return {
            from: this.player,
            targets: [player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const target = context.targets.at(0);
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: {
                        text: `是否发动[b]守成[/b]，令{0}摸一张牌`,
                        values: [
                            { type: 'player', value: target.playerId },
                        ],
                    },
                });
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [player], } = context;
        return await room.drawCards({
            player,
            source: data,
            reason: this.name,
        });
    },
}));
exports.jiangwanfeiyi.addSkill(exports.shengxi);
exports.jiangwanfeiyi.addSkill(exports.shoucheng);
