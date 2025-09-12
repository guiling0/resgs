"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suiyu = exports.tangbin = void 0;
const rules_1 = require("../../rules");
exports.tangbin = sgs.General({
    name: 'xl.tangbin',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.suiyu = sgs.Skill({
    name: 'xl.tangbin.suiyu',
});
exports.suiyu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            (data.card.type === 1 /* CardType.Basic */ ||
                data.card.type === 2 /* CardType.Scroll */) &&
            data.card.hasSubCards() &&
            !room.getReserveUpCards().find((v) => v.suit === data.card.suit));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = [];
        const _cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (c) => c.suit === data.card.suit);
        if (_cards.length === 0) {
            cards.push(...room.discardArea.get(1, sgs.DataType.GameCard, 'random', (c) => c.suit === data.card.suit));
        }
        else {
            cards.push(..._cards);
        }
        await room.removeCard({
            player: from,
            cards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.suiyu.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.suiyu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                const suit = context.suit;
                const s_suit = sgs.getTranslation(`suit${suit}`);
                const cards = room.getReserveUpCards();
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: room.reserveArea.cards,
                            filter(item, selected) {
                                return (cards.includes(item) &&
                                    item.suit === suit);
                            },
                            data_rows: room.getReserveRowDatas(),
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `绥御：你可以弃置一张后备区里的${s_suit}牌，让${target.gameName}摸一张牌`,
                                buttons: ['confirm'],
                            },
                        }, false),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: ``,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            room.sameAsKingdom(player, data.current.target) &&
            !data.current.target.inturn &&
            data.card &&
            data.card.suit !== 0 /* CardSuit.None */ &&
            room.getReserveUpCards().length > 0);
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
            suit: data.card.suit,
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
        const { targets: [target], } = context;
        await room.drawCards({
            player: target,
            source: data,
            reason: this.name,
        });
    },
}));
exports.tangbin.addSkill(exports.suiyu);
