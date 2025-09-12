"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripleReward = exports.jianzhi = exports.chujue = exports.jiachong = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.jiachong = sgs.General({
    name: 'wars.jiachong',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.chujue = sgs.Skill({
    name: 'wars.jiachong.chujue',
});
exports.chujue.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.from === player && this.isOpen()) {
            const target = data.current.target;
            return room.playerDeads.some((v) => room.sameAsKingdom(v, target));
        }
    },
    async cost(room, data, context) {
        return await data.targetCantResponse([data.current.target]);
    },
}));
exports.chujue.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        const room = this.room;
        if (!target)
            return this.isOwner(from);
        return (this.isOwner(from) &&
            target &&
            room.playerDeads.some((v) => room.sameAsKingdom(v, target)));
    },
}));
exports.jianzhi = sgs.Skill({
    name: 'wars.jiachong.jianzhi',
});
exports.jianzhi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.from &&
            data.to &&
            data.number >= data.to.hp &&
            player.hasCanDropCards('h', player, 1, this.name));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.dropCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        if (!from.getData('chujue.tripleReward')) {
            const effect = await room.addEffect('wars.chujue.tripleReward', from);
            from.setData('chujue.tripleReward', effect);
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                const effect = this.player.getData('chujue.tripleReward');
                if (effect) {
                    await effect.removeSelf();
                }
            },
        },
    ],
}));
exports.tripleReward = sgs.TriggerEffect({
    name: 'wars.chujue.tripleReward',
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.reason === 'reward' &&
            data.filter((d) => d.reason === 11 /* MoveCardReason.Draw */).length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        from.removeData('chujue.tripleReward');
        await this.removeSelf();
        const datas = data.filter((v) => v.reason === 11 /* MoveCardReason.Draw */);
        const length = datas.length;
        for (let i = 0; i < length; i++) {
            const data = datas[i];
            const count = data.cards.length;
            const cards = await room.getNCards(count * 3);
            data.cards.length = 0;
            data.cards.push(...cards);
        }
        return true;
    },
});
exports.jiachong.addSkill(exports.chujue);
exports.jiachong.addSkill(exports.jianzhi);
