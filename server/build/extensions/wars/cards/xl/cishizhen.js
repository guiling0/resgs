"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cishizhen_skill = exports.cishizhen = exports.cishizhen_lose = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const rules_1 = require("../../rules");
exports.cishizhen_lose = sgs.TriggerEffect({
    name: 'cishizhen_lose',
    auto_log: 1,
    priorityType: 5 /* PriorityType.GlobalRule */,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return data.has_filter((d, c) => c.name === 'cishizhen' && d.toArea === room.discardArea);
    },
    context(room, player, data) {
        const cishizhen = data.getCard((d, c) => c.name === 'cishizhen' && d.toArea === room.discardArea);
        const _data = data.get(cishizhen);
        return {
            from: _data.player,
            cards: [cishizhen],
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
exports.cishizhen = sgs.CardUseEquip({
    name: 'cishizhen',
    effects: [exports.cishizhen_lose.name],
});
sgs.setCardData('cishizhen', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'en',
});
exports.cishizhen_skill = sgs.Skill({
    name: 'cishizhen',
    attached_equip: 'cishizhen',
});
exports.cishizhen_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 1;
        }
    },
    [skill_types_1.StateEffectType.Range_Within](from, to) {
        if (this.isOwner(from)) {
            const equips = to.getEquipCards();
            return (!equips.find((v) => v.name === 'xijia') && equips.length > 0);
        }
    },
}));
exports.cishizhen_skill.addEffect(sgs.TriggerEffect({
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
exports.cishizhen_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const skill = context.effect;
                const from = context.from;
                const cards = context.cards;
                const sha = room.createVirtualCardByOne(cards.at(0), false);
                sha.sourceData.name = 'sha';
                sha.custom.method = 1;
                sha.custom.canuse = from.canUseCard(sha, undefined, skill.name, { excluesCardDistanceLimit: true });
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: [sha.vdata],
                            filter(item, selected) {
                                return item.custom.canuse;
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByData(item, false);
                                }
                            },
                        }),
                        target: room.createChoosePlayer({
                            excluesCardDistanceLimit: true,
                            filter(item, selected) {
                                return !item
                                    .getEquipCards()
                                    .find((v) => v.name === 'xijia');
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `磁石阵：你可以将此牌当无距离限制的【杀】使用`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            this.skill &&
            this.skill.sourceEquip) {
            return data.from === player && data.has('sha');
        }
    },
    context(room, player, data) {
        return {
            cards: [this.skill.sourceEquip],
        };
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.cishizhen_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const skill = context.effect;
                const from = context.from;
                const cards = context.cards;
                const sha = room.createVirtualCardByOne(cards.at(0), false);
                sha.sourceData.name = 'sha';
                sha.custom.method = 1;
                sha.custom.canuse = from.canUseCard(sha, undefined, skill.name, { excluesCardDistanceLimit: true });
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: [sha.vdata],
                            filter(item, selected) {
                                return item.custom.canuse;
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByData(item, false);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `磁石阵：你可以将此牌当【杀】打出`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedPlayCardData) &&
            this.skill &&
            this.skill.sourceEquip) {
            return data.from === player && data.has('sha');
        }
    },
    context(room, player, data) {
        return {
            cards: [this.skill.sourceEquip],
        };
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.cishizhen_skill.addEffect(sgs.copy(rules_1.eyes_reserve));
