"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huogong = exports.huogong_choose = void 0;
exports.huogong_choose = sgs.TriggerEffect({
    name: 'huogong_choose',
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            show: () => {
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: '火攻，请展示一张手牌',
                        thinkPrompt: '火攻展示牌',
                    },
                };
            },
            drop: () => {
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
                                return item.suit === suit;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `火攻，你可以弃置一张${s_suit}牌，对${target.gameName}造成1点火焰伤害`,
                        thinkPrompt: '火攻弃置牌',
                    },
                };
            },
        };
    },
});
exports.huogong = sgs.CardUse({
    name: 'huogong',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.huogong_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return item.hasHandCards();
            },
        });
    },
    async onuse(room, data) {
        data.baseDamage = 1;
    },
    async effect(room, target, data) {
        const { from, card, current, baseDamage = 1 } = data;
        if (!current.target.hasHandCards())
            return;
        const s = room.getData('huogong_choose');
        //展示手牌
        const req_show = await room.doRequest({
            player: current.target,
            get_selectors: {
                selectorId: s.getSelectorName('show'),
                context: {
                    targets: [current.target],
                },
            },
        });
        const show_result = room
            .getResult(req_show, 'card')
            .result.at(0);
        if (!show_result)
            return;
        const show = await room.showCards({
            player: current.target,
            cards: [show_result],
            source: data,
            reason: this.name,
        });
        if (!show)
            return;
        if (!from.hasCanDropCards('h', from, 1, this.name))
            return;
        //弃置牌
        const req_drop = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: s.getSelectorName('drop'),
                context: {
                    suit: show_result.suit,
                    from,
                    targets: [current.target],
                },
            },
        });
        const drop_result = room
            .getResult(req_drop, 'card')
            .result.at(0);
        if (!drop_result)
            return;
        await room.dropCards({
            player: from,
            cards: [drop_result],
            source: data,
            reason: this.name,
        });
        await room.damage({
            from,
            to: current.target,
            number: baseDamage,
            damageType: 1 /* DamageType.Fire */,
            channel: card,
            isChain: false,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('huogong', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 2,
    damage: true,
    rhyme: 'ong',
});
