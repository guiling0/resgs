"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tengjia_skill = exports.tengjia = void 0;
exports.tengjia = sgs.CardUseEquip({
    name: 'tengjia',
});
sgs.setCardData('tengjia', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'a',
});
exports.tengjia_skill = sgs.Skill({
    name: 'tengjia',
    attached_equip: 'tengjia',
});
exports.tengjia_skill.addEffect(sgs.TriggerEffect({
    anim: 'tengjia1_skill',
    audio: ['tengjia'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { card, current } = data;
            return ((card.isCommonSha() ||
                card.name === 'wanjianqifa' ||
                card.name === 'nanmanruqin') &&
                player === current.target);
        }
    },
    async cost(room, data, context) {
        await data.invalidCurrent();
        return true;
    },
}));
exports.tengjia_skill.addEffect(sgs.TriggerEffect({
    anim: 'tengjia2_skill',
    audio: ['tengjia_fire'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
            const { damageType, to } = data;
            return damageType === 1 /* DamageType.Fire */ && player === to;
        }
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
}));
