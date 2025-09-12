"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tao2 = exports.tao = void 0;
function checkXlWyuanjiLevel(room, from) {
    const qianchong = room.getEffect(room.getMark('#qianchong'));
    if (qianchong && room.sameAsKingdom(qianchong.player, from)) {
        return qianchong.isOpen() && qianchong.check();
    }
    return false;
}
exports.tao = sgs.CardUse({
    name: 'tao',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        if (checkXlWyuanjiLevel(room, from)) {
            //谦冲修改
            return room.createChoosePlayer({
                count: 1,
                filter(item, selected) {
                    return room.sameAsKingdom(from, item) && item.losshp > 0;
                },
            });
        }
        else {
            return room.createChoosePlayer({
                count: 1,
                filter(item, selected) {
                    return from === item && item.losshp > 0;
                },
                auto: true,
            });
        }
    },
    async onuse(room, data) {
        data.baseRecover = 1;
    },
    async effect(room, target, data) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});
exports.tao2 = sgs.CardUse({
    name: 'tao',
    method: 2,
    trigger: "Dying" /* EventTriggers.Dying */,
    condition(room, from, card, data) {
        return data.is(sgs.DataType.DyingEvent) && data.player.hp <= 0;
    },
    prompt(room, from, card, context) {
        if (context.prompt) {
            return context.prompt;
        }
        else
            return {};
    },
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return (item.hp <= 0 &&
                    Math.max(...room.players.map((v) => v.indying)) ===
                        item.indying);
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        data.baseRecover = 1;
    },
    async effect(room, target, data) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('tao', {
    type: 1 /* CardType.Basic */,
    subtype: 1 /* CardSubType.Basic */,
    recover: true,
    rhyme: 'ao',
});
