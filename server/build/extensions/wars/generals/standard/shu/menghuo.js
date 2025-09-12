"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zaiqi = exports.huoshou_delay = exports.huoshou = exports.menghuo = void 0;
exports.menghuo = sgs.General({
    name: 'wars.menghuo',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.huoshou = sgs.Skill({
    name: 'wars.menghuo.huoshou',
});
exports.huoshou.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'nanmanruqin' &&
            data.current.target === player);
    },
    async cost(room, data, context) {
        return await data.invalidCurrent();
    },
}));
exports.huoshou.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'nanmanruqin' &&
            data.from !== player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('huoshou.delay', from);
        effect.setData('use', data);
        return true;
    },
}));
exports.huoshou_delay = sgs.TriggerEffect({
    name: 'huoshou.delay',
    audio: [],
    priorityType: 1 /* PriorityType.General */,
    trigger: "DamageStart" /* EventTriggers.DamageStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.source === this.getData('use') &&
            data.from !== player);
    },
    async cost(room, data, context) {
        data.from = context.from;
        return true;
    },
    lifecycle: [
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            priority: 'after',
            async on_exec(room, data) {
                if (data === this.getData('use')) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.zaiqi = sgs.Skill({
    name: 'wars.menghuo.zaiqi',
});
exports.zaiqi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "DrawPhaseStartedAfter" /* EventTriggers.DrawPhaseStartedAfter */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.losshp > 0 &&
            data.ratedDrawnum > 0);
    },
    async cost(room, data, context) {
        await data.end();
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(from.losshp);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            animation: true,
            source: data,
            reason: this.name,
        });
        await room.delay(1);
        const count = cards.filter((v) => v.suit === 2 /* CardSuit.Heart */);
        await room.recoverhp({
            player: from,
            number: count.length,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards: count,
            toArea: room.discardArea,
            animation: true,
            source: data,
            reason: this.name,
        });
        await room.obtainCards({
            player: from,
            cards: cards.filter((v) => v.suit !== 2 /* CardSuit.Heart */ &&
                v.area === room.processingArea),
            source: data,
            reason: this.name,
        });
    },
}));
exports.menghuo.addSkill(exports.huoshou);
exports.menghuo.addSkill(exports.zaiqi);
