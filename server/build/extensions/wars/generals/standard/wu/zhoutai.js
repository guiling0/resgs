"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fenji = exports.buqu = exports.zhoutai = void 0;
exports.zhoutai = sgs.General({
    name: 'wars.zhoutai',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.buqu = sgs.Skill({
    name: 'wars.zhoutai.buqu',
});
exports.buqu.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "Dying" /* EventTriggers.Dying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
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
        const same = from.upArea.cards.find((v) => v !== card &&
            v.hasMark(this.name) &&
            v.number === card.number);
        if (same) {
            await room.puto({
                player: from,
                cards: [card],
                toArea: room.discardArea,
                source: data,
                movetype: 1 /* CardPut.Up */,
                reason: this.name,
            });
            from.refreshMark = this.name;
        }
        if (!same) {
            await room.recoverTo({
                player: from,
                number: 1,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.fenji = sgs.Skill({
    name: 'wars.zhoutai.fenji',
});
exports.fenji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && !data.executor.hasHandCards()) {
            const lose = room.createEventData(sgs.DataType.LoseHpEvent, {
                player,
                number: 1,
                source: data,
                reason: this.name,
            });
            return lose.check();
        }
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.losehp({
            player: from,
            number: 1,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        await room.drawCards({
            player: target,
            count: 2,
            source: data,
            reason: this.name,
        });
    },
}));
exports.zhoutai.addSkill(exports.buqu);
exports.zhoutai.addSkill(exports.fenji);
