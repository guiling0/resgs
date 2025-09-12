"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xijia_skill = exports.xijia = exports.xijia_lose = void 0;
exports.xijia_lose = sgs.TriggerEffect({
    name: 'xijia_lose',
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'xijia' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const xijia = data.getCard((d, c) => c.name === 'xijia' && d.toArea === room.discardArea);
        const _data = data.get(xijia);
        return {
            from: _data.player,
            cards: [xijia],
        };
    },
    async cost(room, data, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});
exports.xijia = sgs.CardUseEquip({
    name: 'xijia',
    effects: [exports.xijia_lose.name],
});
sgs.setCardData('xijia', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'a',
});
exports.xijia_skill = sgs.Skill({
    name: 'xijia',
    attached_equip: 'xijia',
});
exports.xijia_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
            const _data = data.get(this.skill.sourceEquip);
            if (!_data)
                return false;
            return (_data.reason === 10 /* MoveCardReason.Obtain */ &&
                _data.toArea.player !== player);
        }
    },
    async cost(room, data, context) {
        return await data.cancle([this.skill.sourceEquip]);
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.removeCard({
            player: from,
            cards: [this.skill.sourceEquip],
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.xijia_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.damageType === 1 /* DamageType.Fire */ &&
            this.skill &&
            this.skill.sourceEquip);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.removeCard({
            player: from,
            cards: [this.skill.sourceEquip],
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.xijia_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.damageType === 0 /* DamageType.None */ &&
            !this.getData('times'));
    },
    async cost(room, data, context) {
        data.number -= 1;
        this.setData('times', 1);
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                this.removeData('times');
            },
        },
    ],
}));
