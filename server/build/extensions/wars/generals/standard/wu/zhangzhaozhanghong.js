"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guzheng = exports.zhijian = exports.zhangzhaozhanghong = void 0;
exports.zhangzhaozhanghong = sgs.General({
    name: 'wars.zhangzhaozhanghong',
    kingdom: 'wu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isDualImage: true,
    isWars: true,
});
exports.zhijian = sgs.Skill({
    name: 'wars.zhangzhaozhanghong.zhijian',
});
exports.zhijian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    context(room, player, data) {
        return {
            maxTimes: -1,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.type === 3 /* CardType.Equip */;
                            },
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                const card = this.selectors.card.result.at(0);
                                return (card &&
                                    card.type === 3 /* CardType.Equip */ &&
                                    item !== from &&
                                    !item.getEquip(card.subtype));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `直谏，你可以将一张装备牌置入其他角色的装备区，然后摸一张牌`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [target], } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: target.equipArea,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.drawCards({
            player: from,
            count: 1,
            source: data,
            reason: this.name,
        });
    },
}));
exports.guzheng = sgs.Skill({
    name: 'wars.zhangzhaozhanghong.guzheng',
});
exports.guzheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "DropPhaseEnd" /* EventTriggers.DropPhaseEnd */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && !data.isOwner(player)) {
            const drops = room.getHistorys(sgs.DataType.MoveCardEvent, (v) => v.filter((d, c) => d.toArea === room.discardArea &&
                c.area === room.discardArea).length > 0, data);
            return drops.length > 0;
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const cards = context.cards;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: cards,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '固政',
                                timebar: room.responseTime,
                                buttons: ['guzheng.back', 'guzheng.all'],
                                prompt: '固政，请选择一张牌并选择一项',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        let cards = [];
        room.getPeriodHistory(data).forEach((v) => {
            if (v.data.is(sgs.DataType.MoveCardEvent)) {
                v.data.move_datas.forEach((d) => {
                    if (d.toArea === room.discardArea) {
                        d.cards.forEach((c) => {
                            if (c.area === room.discardArea) {
                                cards.push(c);
                            }
                        });
                    }
                });
            }
        });
        if (!cards.length)
            return;
        context.cards = cards;
        let give;
        let other = false;
        if (cards.length > 1) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'card');
            const card = result.result.at(0);
            const option = result.windowResult.at(0);
            give = card;
            other = option === 'guzheng.all';
        }
        else {
            give = cards.at(0);
        }
        if (!give)
            return;
        await room.giveCards({
            from,
            to: target,
            cards: [give],
            source: data,
            reason: this.name,
        });
        cards = cards.filter((v) => v.area === room.discardArea);
        if (cards.length > 0 && other) {
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.zhangzhaozhanghong.addSkill(exports.zhijian);
exports.zhangzhaozhanghong.addSkill(exports.guzheng);
sgs.loadTranslation({
    ['guzheng.back']: '返回手牌',
    ['guzheng.all']: '返回手牌并获得其余牌',
});
