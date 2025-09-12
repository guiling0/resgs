"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yuejian = exports.wanwei = exports.bianfuren = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.bianfuren = sgs.General({
    name: 'wars.bianfuren',
    kingdom: 'wei',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.wanwei = sgs.Skill({
    name: 'wars.bianfuren.wanwei',
});
exports.wanwei.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "MoveCardFixed" /* EventTriggers.MoveCardFixed */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((d, c) => d.player !== player &&
                (d.fromArea === player.equipArea ||
                    d.fromArea === player.handArea) &&
                d.reason === 6 /* MoveCardReason.DisCard */));
    },
    context(room, player, data) {
        let h_player;
        let count = data.getCards((d, c) => {
            if (d.player !== player &&
                (d.fromArea === player.equipArea ||
                    d.fromArea === player.handArea) &&
                d.reason === 6 /* MoveCardReason.DisCard */) {
                h_player = d.player;
                return true;
            }
        }).length;
        return {
            h_player: h_player.playerId,
            count,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const player = room.getPlayer(context.h_player);
                const count = context.count;
                return {
                    selectors: {
                        card: room.createDropCards(player, {
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `婉危：你可以选择${count}张牌作为本次被弃置的牌`,
                        thinkPrompt: '婉危',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        data.update(data.getCards((d, c) => d.player !== from &&
            (d.fromArea === from.equipArea ||
                d.fromArea === from.handArea) &&
            d.reason === 6 /* MoveCardReason.DisCard */), { cards });
        return true;
    },
}));
exports.wanwei.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "MoveCardFixed" /* EventTriggers.MoveCardFixed */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.has_filter((d, c) => d.player !== player &&
                (d.fromArea === player.equipArea ||
                    d.fromArea === player.handArea) &&
                d.reason === 10 /* MoveCardReason.Obtain */));
    },
    context(room, player, data) {
        let count = data.getCards((d, c) => {
            if (d.player !== player &&
                (d.fromArea === player.equipArea ||
                    d.fromArea === player.handArea) &&
                d.reason === 10 /* MoveCardReason.Obtain */) {
                return true;
            }
        }).length;
        return {
            count,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const count = context.count;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `婉危：你可以选择${count}张牌作为本次被获得的牌`,
                        thinkPrompt: '婉危',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        data.update(data.getCards((d, c) => d.player !== from &&
            (d.fromArea === from.equipArea ||
                d.fromArea === from.handArea) &&
            d.reason === 10 /* MoveCardReason.Obtain */), { cards });
        return true;
    },
}));
exports.wanwei.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.has_filter((d, c) => d.player !== player &&
                (d.fromArea === player.equipArea ||
                    d.fromArea === player.handArea) &&
                (d.reason === 6 /* MoveCardReason.DisCard */ ||
                    d.reason === 10 /* MoveCardReason.Obtain */))) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = data.getCards((d, c) => d.player !== from &&
            (d.fromArea === from.equipArea ||
                d.fromArea === from.handArea) &&
            (d.reason === 6 /* MoveCardReason.DisCard */ ||
                d.reason === 10 /* MoveCardReason.Obtain */));
        if (cards.length > 1) {
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        }
        else if (cards.length > 0) {
            const _cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (c) => c.name === cards.at(0).name);
            if (_cards.length) {
                return await room.obtainCards({
                    player: from,
                    cards: _cards,
                    source: data,
                    reason: this.name,
                });
            }
            else {
                return await room.drawCards({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.yuejian = sgs.Skill({
    name: 'wars.bianfuren.yuejian',
});
exports.yuejian.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "DropPhaseProceeding" /* EventTriggers.DropPhaseProceeding */,
    can_trigger(room, player, data) {
        if (room.sameAsKingdom(player, this.player) &&
            data.isOwner(player)) {
            return !room.hasHistorys(sgs.DataType.UseCardEvent, (d) => d.from === player &&
                !!d.targets.some((t) => room.isOtherKingdom(t, player)), room.currentTurn);
        }
    },
    async cost(room, data, context) {
        context.from.setMark(this.name, true);
        return true;
    },
    lifecycle: [
        {
            trigger: "DropPhaseEnd" /* EventTriggers.DropPhaseEnd */,
            priority: 'after',
            async on_exec(room, data) {
                this.player.removeMark(this.name);
            },
        },
    ],
}));
exports.yuejian.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.MaxHand_Initial](from) {
        if (from.hasMark(this.name)) {
            return from.maxhp;
        }
    },
}));
exports.bianfuren.addSkill(exports.wanwei);
exports.bianfuren.addSkill(exports.yuejian);
