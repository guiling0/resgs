"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bowu = exports.xiuzhuan = exports.zhanghua = void 0;
const rules_1 = require("../../rules");
exports.zhanghua = sgs.General({
    name: 'xl.zhanghua',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.xiuzhuan = sgs.Skill({
    name: 'xl.zhanghua.xiuzhuan',
});
exports.xiuzhuan.addEffect(sgs.TriggerEffect({
    name: 'xl.zhanghua.xiuzhuan0',
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const cards = room.getReserveUpCards();
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return !cards.find((v) => v.suit === item.suit);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `修撰，你可以将一张后备区里没有的花色的牌置入后备区`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.removeCard({
            player: from,
            cards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.xiuzhuan.addEffect(sgs.TriggerEffect({
    name: 'xl.zhanghua.xiuzhuan1',
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            room.reserveArea.count > 0);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `修撰：你可以将后备区里的一张牌交给一名角色`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: room.reserveArea.cards,
                            data_rows: room.getReserveRowDatas(),
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `修撰：选择一张牌交给${target.gameName}`,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: ``,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.giveCards({
            from,
            to,
            cards,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.xiuzhuan.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.bowu = sgs.Skill({
    name: 'xl.zhanghua.bowu',
});
exports.bowu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DropPhaseStarted" /* EventTriggers.DropPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            room.getReserveUpCards().length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        const types = [];
        room.getReserveUpCards().forEach((v) => {
            if (!types.includes(v.type))
                types.push(v.type);
        });
        return await room.drawCards({
            player: from,
            count: types.length,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const canuse = [
            ...room.cardNamesToType.get(3 /* CardType.Equip */),
            ...room.getReserveUpCards().map((v) => v.name),
        ];
        await room.preUseCard({
            from: from,
            can_use_cards: canuse.map((v) => {
                return {
                    name: v,
                    method: 1,
                };
            }),
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `@bowu`,
                thinkPrompt: this.name,
                canCancle: true,
            },
        });
    },
}));
exports.bowu.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.zhanghua.addSkill(exports.xiuzhuan);
exports.zhanghua.addSkill(exports.bowu);
sgs.loadTranslation({
    ['@method:xl.zhanghua.xiuzhuan0']: '移除牌',
    ['@method:xl.zhanghua.xiuzhuan1']: '交出后备区的牌',
    ['@bowu']: '博物：你可以使用一张装备牌或与后备区里的牌的同名牌',
});
