"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuangli_skill = exports.shuangli = exports.shuangli_sameequip = exports.shuangli_lose = void 0;
exports.shuangli_lose = sgs.TriggerEffect({
    name: 'shuangli_lose',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'shuangli' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const shuangli = data.getCard((d, c) => c.name === 'shuangli' && d.toArea === room.discardArea);
        const _data = data.get(shuangli);
        return {
            from: _data.player,
            cards: [shuangli],
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
exports.shuangli_sameequip = sgs.TriggerEffect({
    name: 'shuangli_sameequip',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */,
    can_trigger(room, player, data) {
        const shuangli = data.filter((d, c) => c.name === 'shuangli' && d.toArea.type === 92 /* AreaType.Equip */);
        if (shuangli.length > 0) {
            const player = shuangli.at(0)?.toArea?.player;
            if (player) {
                const qunque = player
                    .getEquipCards()
                    .find((v) => v.name === 'qunque');
                return !!qunque;
            }
        }
    },
    async cost(room, data, context) {
        const shuangli = data.filter((d, c) => c.name === 'shuangli' && d.toArea.type === 92 /* AreaType.Equip */);
        if (shuangli.length > 0) {
            const player = shuangli.at(0)?.toArea?.player;
            if (player) {
                const qunque = player
                    .getEquipCards()
                    .find((v) => v.name === 'qunque');
                if (qunque) {
                    return await data.cancle([qunque]);
                }
            }
        }
    },
});
exports.shuangli = sgs.CardUseEquip({
    name: 'shuangli',
    effects: [exports.shuangli_lose.name, exports.shuangli_sameequip.name],
});
sgs.setCardData('shuangli', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'i',
});
exports.shuangli_skill = sgs.Skill({
    name: 'shuangli',
    attached_equip: 'shuangli',
});
exports.shuangli_skill.addEffect(sgs.TriggerEffect({
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
exports.shuangli_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (item.getMark('wars.mark.yinyangyu', 0) <
                                    2);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `双鲤：你可以令一名“阴阳鱼”标记小于2的角色获得一枚“阴阳鱼”`,
                        thinkPrompt: '双鲤',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        room.broadcast({
            type: 'MsgPlayFaceAni',
            ani: 'yinyangyu',
            player: target.playerId,
        });
        await room.delay(2);
        await room.addSkill('wars.mark.yinyangyu', target, {
            source: this.name,
            showui: 'mark',
        });
        return true;
    },
}));
exports.shuangli_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "Dying" /* EventTriggers.Dying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.skill && this.skill.sourceEquip;
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item !== effect.skill?.sourceEquip;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `双鲤：你可以弃置一张牌并移除双鲤，令濒死的角色回复1点体力`,
                        thinkPrompt: '双鲤',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
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
        await room.recoverhp({
            player: data.player,
            source: data,
            reason: this.name,
        });
    },
}));
