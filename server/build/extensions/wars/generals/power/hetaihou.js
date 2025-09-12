"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qiluan = exports.zhendu = exports.hetaihou = void 0;
exports.hetaihou = sgs.General({
    name: 'wars.hetaihou',
    kingdom: 'qun',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.zhendu = sgs.Skill({
    name: 'wars.hetaihou.zhendu',
});
exports.zhendu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !data.isOwner(player) &&
            data.executor.alive &&
            player.hasCanDropCards('h', player, 1, this.name));
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: `${sgs.cac_skill(this.name)}，对{0}造成1点伤害并视为使用【酒】`,
                            values: [
                                { type: 'player', value: target.playerId },
                            ],
                        },
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [to], } = context;
        const jiu = room.createVirtualCardByNone('jiu');
        await room.preUseCard({
            from: to,
            card: jiu,
            source: data,
            reason: this.name,
        });
        await room.damage({
            from,
            to,
            source: data,
            reason: this.name,
        });
    },
}));
exports.qiluan = sgs.Skill({
    name: 'wars.hetaihou.qiluan',
});
exports.qiluan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            room.hasHistorys(sgs.DataType.DieEvent, (v) => v.killer && v.killer === player, data));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
    },
}));
exports.hetaihou.addSkill(exports.zhendu);
exports.hetaihou.addSkill(exports.qiluan);
