"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caiyuan = exports.ciwei = exports.yanghuiyu = void 0;
exports.yanghuiyu = sgs.General({
    name: 'wars.yanghuiyu',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.ciwei = sgs.Skill({
    name: 'wars.yanghuiyu.ciwei',
});
exports.ciwei.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            player !== data.from &&
            player.inturn) {
            return !!room
                .getPeriodHistory(room.currentTurn)
                .findLast((v) => {
                return ((v.data.is(sgs.DataType.UseCardEvent) ||
                    v.data.is(sgs.DataType.UseCardToCardEvent) ||
                    v.data.is(sgs.DataType.PlayCardEvent)) &&
                    v.data.from !== data.from &&
                    v.data.from !== player &&
                    v.data.from.alive &&
                    room.isOtherKingdom(data.from, v.data.from));
            });
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
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
                        prompt: `慈威：你可以弃置一张牌，令此牌失效`,
                        this: '慈威',
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
        data.isEnd = true;
    },
}));
exports.caiyuan = sgs.Skill({
    name: 'wars.yanghuiyu.caiyuan',
});
exports.caiyuan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "TurnStarted" /* EventTriggers.TurnStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.player === player &&
            !player.hasNoneOpen() &&
            this.skill) {
            const opens = room.getHistorys(sgs.DataType.OpenEvent, (v) => v.generals.includes(this.skill.sourceGeneral), data);
            return opens.length === 0;
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
exports.caiyuan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            !player.hasNoneOpen() &&
            this.skill &&
            this.skill.sourceGeneral);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.close({
            player: from,
            generals: [this.skill.sourceGeneral],
            source: data,
            reason: this.name,
        });
    },
}));
exports.yanghuiyu.addSkill(exports.ciwei);
exports.yanghuiyu.addSkill(exports.caiyuan);
