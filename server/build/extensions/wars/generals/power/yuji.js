"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qianhuan = exports.yuji = void 0;
exports.yuji = sgs.General({
    name: 'wars.yuji',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qianhuan = sgs.Skill({
    name: 'wars.yuji.qianhuan',
});
exports.qianhuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to &&
            data.to.alive &&
            room.sameAsKingdom(player, data.to));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(1);
        await room.showCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards,
            toArea: from.upArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
        cards.forEach((v) => v.setMark(this.name, true));
        from.setMark(this.name, true, {
            visible: true,
            source: this.name,
            type: 'cards',
            areaId: from.upArea.areaId,
        });
        return cards.at(0);
    },
    async effect(room, data, context) {
        const { from } = context;
        const card = context.cost;
        const same = from.upArea.cards.find((v) => v !== card && v.hasMark(this.name) && v.suit === card.suit);
        if (same) {
            from.refreshMark = this.name;
            await room.puto({
                player: from,
                cards: [card],
                toArea: room.discardArea,
                source: data,
                movetype: 1 /* CardPut.Up */,
                reason: this.name,
            });
        }
    },
}));
exports.qianhuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            (data.card.type === 1 /* CardType.Basic */ ||
                data.card.subtype === 21 /* CardSubType.InstantScroll */) &&
            player.hasUpOrSideCards(this.name) &&
            room.sameAsKingdom(player, data.current.target) &&
            data.targets.length === 1);
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getUpOrSideCards(this.name),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `千幻：你可以将一张“幻”置入弃牌堆，取消当前目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.refreshMark = this.name;
        await data.cancleCurrent();
    },
}));
exports.qianhuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        if (this.player.hasUpOrSideCards(this.name) &&
            room.sameAsKingdom(this.player, player)) {
            return data.has_filter((v, c) => v.toArea === player.judgeArea &&
                c.vcard &&
                c.vcard.subtype === 22 /* CardSubType.DelayedScroll */);
        }
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
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getUpOrSideCards(this.name),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `千幻：你可以将一张“幻”置入弃牌堆，取消当前目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [player], } = context;
        from.refreshMark = this.name;
        await data.cancle(data.getCards((v, c) => v.toArea === player.judgeArea &&
            c.vcard &&
            c.vcard.subtype === 22 /* CardSubType.DelayedScroll */));
    },
}));
exports.yuji.addSkill(exports.qianhuan);
