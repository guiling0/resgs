"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xunxun = exports.wangxi = exports.lidian = void 0;
exports.lidian = sgs.General({
    name: 'wars.lidian',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.wangxi = sgs.Skill({
    name: 'wars.lidian.wangxi',
});
exports.wangxi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.from &&
            data.from.alive &&
            data.from !== player);
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async effect(room, data, context) {
        const { from, targets: [player], } = context;
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player,
            source: data,
            reason: this.name,
        });
    },
}));
exports.wangxi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.to &&
            data.to.alive &&
            data.to !== player);
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async effect(room, data, context) {
        const { from, targets: [player], } = context;
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player,
            source: data,
            reason: this.name,
        });
    },
}));
exports.xunxun = sgs.Skill({
    name: 'wars.lidian.xunxun',
});
exports.xunxun.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(4);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            animation: false,
            puttype: 2 /* CardPut.Down */,
            cardVisibles: [from],
            source: data,
            reason: this.name,
        });
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost;
        const datas = { type: 'items', datas: [] };
        datas.datas.push({ title: 'cards_top', items: [] });
        datas.datas.push({ title: 'cards_bottom', items: [] });
        cards.forEach((v) => {
            datas.datas[0].items.push({
                title: 'cards_bottom',
                card: v.id,
            });
        });
        for (let i = 0; i < 2; i++) {
            datas.datas[1].items.push({
                title: 'cards_top',
                card: undefined,
            });
        }
        const req = await room.sortCards(from, cards, [
            {
                title: 'cards_bottom',
                max: cards.length,
                condition: 2,
            },
            {
                title: 'cards_top',
                max: 2,
                condition: 2,
            },
        ], {
            canCancle: false,
            showMainButtons: false,
            prompt: this.name,
            thinkPrompt: this.name,
        });
        const result = req.result.sort_result;
        await room.moveCards({
            move_datas: [
                {
                    cards: [...result[0].items, ...result[1].items],
                    toArea: room.drawArea,
                    reason: 1 /* MoveCardReason.PutTo */,
                    animation: false,
                    puttype: 2 /* CardPut.Down */,
                },
            ],
            source: data,
            reason: this.name,
        });
        room.drawArea.remove(result[1].items);
        room.drawArea.add(result[1].items.reverse(), 'top');
    },
}));
exports.lidian.addSkill(exports.wangxi);
exports.lidian.addSkill(exports.xunxun);
