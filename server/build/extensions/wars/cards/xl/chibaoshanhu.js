"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chibaoshanhu_skill = exports.chibaoshanhu = void 0;
const rules_1 = require("../../rules");
exports.chibaoshanhu = sgs.CardUseEquip({
    name: 'chibaoshanhu',
});
sgs.setCardData('chibaoshanhu', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'u',
});
exports.chibaoshanhu_skill = sgs.Skill({
    name: 'chibaoshanhu',
    attached_equip: 'chibaoshanhu',
    global(room, to) {
        return this.player !== to;
    },
});
exports.chibaoshanhu_skill.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.chibaoshanhu_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 1 /* Phase.Ready */ &&
            data.executor === player &&
            this.skill &&
            this.skill.sourceEquip);
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const cards = context.cards;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: cards,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '赤宝珊瑚',
                                timebar: room.responseTime,
                                prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: `赤宝珊瑚`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(2);
        await room.flashCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        context.cards = cards;
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost;
        if (cards.some((v) => v.subtype === 36 /* CardSubType.Treasure */)) {
            await room.puto({
                player: from,
                cards: [this.skill.sourceEquip],
                toArea: room.discardArea,
                source: data,
                reason: this.name,
            });
        }
        else {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const gcards = room.getResultCards(req);
            await room.removeCard({
                player: from,
                cards: gcards,
                puttype: 1 /* CardPut.Up */,
                source: data,
                reason: this.name,
                skill: this,
            });
            await room.puto({
                player: from,
                cards: cards.filter((v) => v.area === room.processingArea),
                toArea: room.discardArea,
                source: data,
                movetype: 1 /* CardPut.Up */,
                reason: this.name,
            });
        }
    },
}));
exports.chibaoshanhu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const canuses = room
                .getReserveUpCards()
                .filter((v) => data.has(v.name, 0));
            if (canuses.length === 0)
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            canuses: data.cards,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const canuses = context.canuses;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: room.getReserveUpCards(),
                            filter(item, selected) {
                                return (canuses.find((v) => v.name === item.name) &&
                                    from.canUseCard(room.createVirtualCardByOne(item, false)));
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByOne(item, false);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `赤宝珊瑚：你可以从后备区明区中使用一张牌`,
                        thinkPrompt: `赤宝珊瑚`,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                        thinkPrompt: `赤宝珊瑚`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        if (from.hasCardsInArea()) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.removeCard({
                player: from,
                cards,
                puttype: 1 /* CardPut.Up */,
                source: data,
                reason: this.name,
                skill: this,
            });
        }
        else {
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.chibaoshanhu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const canuses = room
                .getReserveUpCards()
                .filter((v) => data.has(v.name));
            if (canuses.length === 0)
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            canuses: data.cards,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const canuses = context.canuses;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: room.getReserveUpCards(),
                            filter(item, selected) {
                                return (canuses.find((v) => v === item.name) &&
                                    from.canPlayCard(room.createVirtualCardByOne(item, false)));
                            },
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByOne(item, false);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `赤宝珊瑚：你可以从后备区明区中打出一张牌`,
                        thinkPrompt: `赤宝珊瑚`,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                        thinkPrompt: `赤宝珊瑚`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        if (from.hasCardsInArea()) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.removeCard({
                player: from,
                cards,
                puttype: 1 /* CardPut.Up */,
                source: data,
                reason: this.name,
                skill: this,
            });
        }
        else {
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.chibaoshanhu_skill.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (!this.isOwner(player) &&
            data.isOwner(player) &&
            this.player &&
            this.skill &&
            this.skill.sourceEquip);
    },
    context(room, player, data) {
        return {
            targets: [this.player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return (item.subtype === 36 /* CardSubType.Treasure */);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `赤宝珊瑚：你可以将一张宝物牌塞入${target.gameName}`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.removeCard({
            player: from,
            cards: [this.skill.sourceEquip],
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
        return true;
    },
    async effect(room, data, context) {
        const { from, cards, targets: [target], } = context;
        await room.puto({
            player: from,
            cards,
            toArea: target.equipArea,
            source: data,
            reason: this.name,
        });
    },
}));
