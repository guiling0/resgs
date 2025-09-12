"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xiangan = exports.bugu = exports.jishao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.jishao = sgs.General({
    name: 'xl.jishao',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    enable: false,
    isWars: true,
});
exports.bugu = sgs.Skill({
    name: 'xl.jishao.bugu',
});
exports.bugu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `不孤：你可以交给${this.player.gameName}一张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.player &&
            room.sameAsKingdom(this.player, data.executor) &&
            player === data.executor &&
            player.hasCardsInArea() &&
            !data.isOwner(this.player));
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.giveCards({
            from,
            to: this.player,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.bugu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "MoveCardFixed" /* EventTriggers.MoveCardFixed */,
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, player) &&
            data.has_filter((d, c) => d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
                d.reason === 6 /* MoveCardReason.DisCard */));
    },
    context(room, player, data) {
        let h_player;
        let count = data.getCards((d, c) => {
            if (d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
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
            choose: () => {
                const from = context.from;
                const player = room.getPlayer(context.h_player);
                const count = context.count;
                return {
                    selectors: {
                        card: room.createDropCards(player, {
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                            selecte_type: 'rows',
                            data_rows: from.getCardsToArea('he'),
                            windowOptions: {
                                title: '不孤',
                                timebar: room.responseTime,
                                prompt: '不孤：请重新选择要弃置的牌',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const player = room.getPlayer(context.h_player);
        if (player) {
            const req = await room.doRequest({
                player,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            data.update(data.getCards((d, c) => d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
                d.reason === 6 /* MoveCardReason.DisCard */), { cards });
            return true;
        }
    },
}));
exports.bugu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "MoveCardFixed" /* EventTriggers.MoveCardFixed */,
    forced: 'cost',
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, player) &&
            data.has_filter((d, c) => d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
                d.reason === 10 /* MoveCardReason.Obtain */));
    },
    context(room, player, data) {
        let h_player;
        let count = data.getCards((d, c) => {
            if (d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
                d.reason === 10 /* MoveCardReason.Obtain */) {
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
            choose: () => {
                const from = context.from;
                const player = room.getPlayer(context.h_player);
                const count = context.count;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                            selecte_type: 'rows',
                            data_rows: from.getCardsToArea('he'),
                            windowOptions: {
                                title: '不孤',
                                timebar: room.responseTime,
                                prompt: '不孤：请重新选择要获得的牌',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const player = room.getPlayer(context.h_player);
        if (player) {
            const req = await room.doRequest({
                player,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            data.update(data.getCards((d, c) => d.player !== this.player &&
                (d.fromArea === this.player.equipArea ||
                    d.fromArea === this.player.handArea) &&
                d.reason === 10 /* MoveCardReason.Obtain */), { cards });
            return true;
        }
    },
}));
exports.xiangan = sgs.Skill({
    name: 'xl.jishao.xiangan',
});
exports.xiangan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "Death" /* EventTriggers.Death */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player.getMark('uncle') === data.player.playerId &&
            this.skill &&
            this.skill.sourceGeneral);
    },
    async effect(room, data, context) {
        const { from } = context;
        const general = this.skill.sourceGeneral;
        const length = general.skills.length;
        for (let i = 0; i < length; i++) {
            const skill = room.skills.find((s) => s.name === general.skills[i] &&
                s.player === from &&
                s.sourceGeneral === general);
            if (skill) {
                await skill.removeSelf();
            }
        }
    },
}));
exports.xiangan.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(to) && this.room.differentAsKingdom(from, to)) {
            return 1;
        }
    },
    [skill_types_1.StateEffectType.Regard_Kingdom](player) {
        if (this.isOwner(player)) {
            const uncle = player.room.getPlayer(player.getMark('uncle'));
            if (uncle)
                return uncle._kingdom;
        }
    },
}));
exports.jishao.addSkill(exports.bugu);
exports.jishao.addSkill(exports.xiangan);
