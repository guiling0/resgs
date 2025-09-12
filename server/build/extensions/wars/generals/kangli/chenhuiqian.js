"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiexu = exports.dejiao = exports.chenhuiqian = void 0;
exports.chenhuiqian = sgs.General({
    name: 'xl.chenhuiqian',
    kingdom: 'qun',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.dejiao = sgs.Skill({
    name: 'xl.chenhuiqian.dejiao',
});
exports.dejiao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.from) {
            if (data.number > 1)
                return true;
            const damages = room.getHistorys(sgs.DataType.DamageEvent, (v) => v.to === data.to, room.currentTurn);
            return damages.length === 1;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        if (data.number === 1) {
            this.setInvalids(this.name);
        }
        data.number--;
        return true;
    },
    async effect(room, data, context) {
        if (data.from) {
            await room.recoverhp({
                player: data.from,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                this.setInvalids(this.name, false);
            },
        },
    ],
}));
exports.jiexu = sgs.Skill({
    name: 'xl.chenhuiqian.jiexu',
});
exports.jiexu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "RecoverHpAfter" /* EventTriggers.RecoverHpAfter */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !room.isCardReason(data.reason) &&
            data.player.getHandCards().find((v) => v.put === 2 /* CardPut.Down */));
    },
    context(room, player, data) {
        return {
            targets: [data.player],
        };
    },
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('h'),
                            windowOptions: {
                                title: '诫虚',
                                timebar: room.responseTime,
                                prompt: '诫虚，请选择一张牌',
                            },
                            filter(item, selected) {
                                return item.put === 2 /* CardPut.Down */;
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '诫虚',
                    },
                };
            },
            choose2: () => {
                const from = context.from;
                const suit = context.suit;
                const s_suit = sgs.getTranslation(`suit${suit}`);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return (item.suit === suit &&
                                    item.put === 2 /* CardPut.Down */);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `诫虚：你可以明置一张${s_suit}牌，摸一张牌`,
                        thinkPrompt: '诫虚',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const card = room.getResultCards(req).at(0);
        if (card) {
            card.turnTo(1 /* CardPut.Up */);
            await room.showCards({
                player: from,
                cards: [card],
                source: data,
                reason: this.name,
            });
            card.setLabel(this.name);
            return card;
        }
    },
    async effect(room, data, context) {
        const { from } = context;
        const length = from
            .getHandCards()
            .filter((v) => v.put === 1 /* CardPut.Up */).length;
        if (length < from.maxhp && length < from.getHandCards().length) {
            const card = context.cost;
            context.suit = card.suit;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose2'),
                    context,
                },
            });
            const result = room.getResultCards(req).at(0);
            if (result) {
                result.turnTo(1 /* CardPut.Up */);
                await room.showCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
                card.setLabel(this.name);
                await room.drawCards({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.jiexu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            (!data.card.hasSubCards() || data.card.transform) &&
            data.from &&
            data.from.getHandCards().find((v) => v.put === 2 /* CardPut.Down */));
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('h'),
                            windowOptions: {
                                title: '诫虚',
                                timebar: room.responseTime,
                                prompt: '诫虚，请选择一张牌',
                            },
                            filter(item, selected) {
                                return item.put === 2 /* CardPut.Down */;
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '诫虚',
                    },
                };
            },
            choose2: () => {
                const from = context.from;
                const suit = context.suit;
                const s_suit = sgs.getTranslation(`suit${suit}`);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return (item.suit === suit &&
                                    item.put === 2 /* CardPut.Down */);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `诫虚：你可以明置一张${s_suit}牌，摸一张牌`,
                        thinkPrompt: '诫虚',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const card = room.getResultCards(req).at(0);
        if (card) {
            card.turnTo(1 /* CardPut.Up */);
            return card;
        }
    },
    async effect(room, data, context) {
        const { from } = context;
        const length = from
            .getHandCards()
            .filter((v) => v.put === 1 /* CardPut.Up */).length;
        if (length < from.maxhp && length < from.getHandCards().length) {
            const card = context.cost;
            context.suit = card.suit;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose2'),
                    context,
                },
            });
            const result = room.getResultCards(req).at(0);
            if (result) {
                result.turnTo(1 /* CardPut.Up */);
                await room.drawCards({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.chenhuiqian.addSkill(exports.dejiao);
exports.chenhuiqian.addSkill(exports.jiexu);
