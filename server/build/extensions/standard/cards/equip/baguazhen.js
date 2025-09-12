"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baguazhen_skill = exports.baguazhen = void 0;
exports.baguazhen = sgs.CardUseEquip({ name: 'baguazhen' });
sgs.setCardData('baguazhen', {
    type: 3 /* CardType.Equip */,
    subtype: 32 /* CardSubType.Armor */,
    rhyme: 'en',
});
exports.baguazhen_skill = sgs.Skill({
    name: 'baguazhen',
    attached_equip: 'baguazhen',
});
exports.baguazhen_skill.addEffect(sgs.TriggerEffect({
    anim: 'baguazhen_skill',
    audio: ['baguazhen'],
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedUseCard1" /* EventTriggers.NeedUseCard1 */,
    auto_log: 1,
    forced: 'cost',
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
            return data.from === player && data.has('shan');
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.color === 1 /* CardColor.Red */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const judge = context.cost;
        if (judge.success) {
            const shan = room.createVirtualCardByNone('shan');
            shan.custom.method = 1;
            data.used = await room.preUseCard(Object.assign({
                from,
                card: shan,
            }, data.copy()));
        }
    },
}));
exports.baguazhen_skill.addEffect(sgs.TriggerEffect({
    anim: 'baguazhen_skill',
    audio: ['baguazhen'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedPlayCard1" /* EventTriggers.NeedPlayCard1 */,
    forced: 'cost',
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedPlayCardData)) {
            return data.from === player && data.has('shan');
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.color === 1 /* CardColor.Red */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const judge = context.cost;
        if (judge.success) {
            const shan = room.createVirtualCardByNone('shan');
            data.played = await room.prePlayCard(Object.assign({
                from,
                card: shan,
            }, data.copy()));
        }
    },
}));
