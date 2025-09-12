"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lifa = exports.xiasi = exports.zhongyan = void 0;
exports.zhongyan = sgs.General({
    name: 'xl.zhongyan',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.xiasi = sgs.Skill({
    name: 'xl.zhongyan.xiasi',
});
exports.xiasi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.showCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const hands = from.getHandCards();
        if (hands.every((v1) => !hands.find((v2) => v1 !== v2 && v1.suit === v2.suit))) {
            const suits = [
                1 /* CardSuit.Spade */,
                2 /* CardSuit.Heart */,
                3 /* CardSuit.Club */,
                4 /* CardSuit.Diamond */,
            ].filter((v) => !hands.find((c) => c.suit === v));
            const cards = [];
            suits.forEach((v) => {
                const _cards = room.drawArea.get(1, sgs.DataType.GameCard, 'top', (c) => c.suit === v);
                if (_cards.length === 0) {
                    cards.push(...room.discardArea.get(1, sgs.DataType.GameCard, 'random', (c) => c.suit === v));
                }
                else {
                    cards.push(..._cards);
                }
            });
            await room.obtainCards({
                player: from,
                movetype: 1 /* CardPut.Up */,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.lifa = sgs.Skill({
    name: 'xl.zhongyan.lifa',
});
exports.lifa.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseEnd" /* EventTriggers.DrawPhaseEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !data.isOwner(player) &&
            room.sameAsKingdom(player, data.executor));
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const current = room.getPlayer(context.current);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: current.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: current === this.player ? true : false,
                        showMainButtons: true,
                        prompt: current === this.player
                            ? `礼法：你可以交出一张牌`
                            : `礼法：请交出一张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        context.current = from.playerId;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.giveCards({
            from,
            to,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [to], } = context;
        context.current = to.playerId;
        const req = await room.doRequest({
            player: to,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        await room.giveCards({
            from: to,
            to: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.zhongyan.addSkill(exports.xiasi);
exports.zhongyan.addSkill(exports.lifa);
