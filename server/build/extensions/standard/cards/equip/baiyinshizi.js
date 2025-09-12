"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baiyin_effect_delay = exports.baiyinshizi_skill = exports.baiyinshizi = void 0;
exports.baiyinshizi = sgs.CardUseEquip({ name: 'baiyinshizi' });
sgs.setCardData('baiyinshizi', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'i',
});
exports.baiyinshizi_skill = sgs.Skill({
    name: 'baiyinshizi',
    attached_equip: 'baiyinshizi',
});
exports.baiyinshizi_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    anim: 'baiyinshizi_skill',
    audio: ['baiyinshizi'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            data.to === player &&
            data.number > 1);
    },
    async cost(room, data, context) {
        data.number = 1;
        return true;
    },
}));
exports.baiyinshizi_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    auto_log: 1,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player.losshp > 0 &&
            data.is(sgs.DataType.MoveCardEvent) &&
            data.get(this.skill.sourceEquip)?.fromArea === player.equipArea);
    },
    async cost(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('baiyin_effect_delay', from);
        effect.setData('baiyin_move', data);
        return true;
    },
}));
exports.baiyin_effect_delay = sgs.TriggerEffect({
    name: 'baiyin_effect_delay',
    anim: 'baiyinshizi_skill',
    audio: ['baiyinshizi'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('baiyin_move') === data;
    },
    async cost(room, data, context) {
        const { from } = context;
        await this.removeSelf();
        return await room.recoverhp({
            player: from,
            number: 1,
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: "MoveCardEnd" /* EventTriggers.MoveCardEnd */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('baiyin_move') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
