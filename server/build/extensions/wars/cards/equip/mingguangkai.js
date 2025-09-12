"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mingguangkai_skill = exports.mingguangkai = void 0;
exports.mingguangkai = sgs.CardUseEquip({
    name: 'mingguangkai',
});
sgs.setCardData('mingguangkai', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'ai',
});
exports.mingguangkai_skill = sgs.Skill({
    name: 'mingguangkai',
    attached_equip: 'mingguangkai',
});
exports.mingguangkai_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    anim: 'mingguangkai1_skill',
    audio: ['mingguangkai1'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            (data.card.name === 'huoshaolianying' ||
                data.card.name === 'huogong' ||
                (data.card.name === 'sha' &&
                    data.card.hasAttr(1 /* CardAttr.Fire */))) &&
            data.current.target === player);
    },
    async cost(room, data, context) {
        return await data.cancleCurrent();
    },
}));
exports.mingguangkai_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    anim: 'mingguangkai2_skill',
    audio: ['mingguangkai2'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "StateChange" /* EventTriggers.StateChange */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.ChainEvent) &&
            data.player === player &&
            player.isSmallKingdom() &&
            data.to_state === true);
    },
    async cost(room, data, context) {
        return await data.prevent();
    },
}));
