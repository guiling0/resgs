"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qunque_skill = exports.qunque = exports.qunque_sameequip = exports.qunque_lose = void 0;
exports.qunque_lose = sgs.TriggerEffect({
    name: 'qunque_lose',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'qunque' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const qunque = data.getCard((d, c) => c.name === 'qunque' && d.toArea === room.discardArea);
        const _data = data.get(qunque);
        return {
            from: _data.player,
            cards: [qunque],
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
exports.qunque_sameequip = sgs.TriggerEffect({
    name: 'qunque_sameequip',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */,
    can_trigger(room, player, data) {
        const qunque = data.filter((d, c) => c.name === 'qunque' && d.toArea.type === 92 /* AreaType.Equip */);
        if (qunque.length > 0) {
            const player = qunque.at(0)?.toArea?.player;
            if (player) {
                const shuangli = player
                    .getEquipCards()
                    .find((v) => v.name === 'shuangli');
                return !!shuangli;
            }
        }
    },
    async cost(room, data, context) {
        const qunque = data.filter((d, c) => c.name === 'qunque' && d.toArea.type === 92 /* AreaType.Equip */);
        if (qunque.length > 0) {
            const player = qunque.at(0)?.toArea?.player;
            if (player) {
                const shuangli = player
                    .getEquipCards()
                    .find((v) => v.name === 'shuangli');
                if (shuangli) {
                    return await data.cancle([shuangli]);
                }
            }
        }
    },
});
exports.qunque = sgs.CardUseEquip({
    name: 'qunque',
    effects: [exports.qunque_lose.name, exports.qunque_sameequip.name],
});
sgs.setCardData('qunque', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'ue',
});
exports.qunque_skill = sgs.Skill({
    name: 'qunque',
    attached_equip: 'qunque',
});
exports.qunque_skill.addEffect(sgs.TriggerEffect({
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
exports.qunque_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
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
exports.qunque_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.has_obtain(player)) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        const cards = data.getCards((d, c) => d.toArea === player.handArea);
        return {
            cards,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const cards = context.cards;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: cards,
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    room.sameAsKingdom(item, from));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `群雀，你可以将一张牌交给一名与你势力相同的其他角色`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [target], } = context;
        return await room.giveCards({
            from,
            to: target,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
