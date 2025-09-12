"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhijian = exports.qianchong = exports.wangyuanji = void 0;
const rules_1 = require("../../rules");
exports.wangyuanji = sgs.General({
    name: 'xl.wangyuanji',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.qianchong = sgs.Skill({
    name: 'xl.wangyuanji.qianchong',
});
exports.qianchong.addEffect(sgs.TriggerEffect({
    audio: ['xl/xl.wangyuanji/qianchong1'],
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to &&
            room.sameAsKingdom(data.to, player) &&
            data.from &&
            room.sameAsKingdom(data.from, data.to));
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        await data.prevent();
        return true;
    },
}));
exports.qianchong.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOpen() &&
            data.from &&
            data.card &&
            data.card.name === 'tao' &&
            room.sameAsKingdom(this.player, data.from) &&
            data.from.inturn &&
            !!data.targets.find((v) => v !== data.from));
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            priority: 'before',
            async on_exec(room, data) {
                room.setMark('#qianchong', this.id);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeMark('#qianchong');
            },
        },
    ],
}));
exports.zhijian = sgs.Skill({
    name: 'xl.wangyuanji.zhijian',
});
exports.zhijian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DropPhaseEnd" /* EventTriggers.DropPhaseEnd */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            room.sameAsKingdom(player, data.executor)) {
            return room.hasHistorys(sgs.DataType.MoveCardEvent, (v) => v.has_filter((d, c) => d.toArea === room.discardArea &&
                d.reason === 6 /* MoveCardReason.DisCard */ &&
                c.area === room.discardArea &&
                d.player === data.executor), data);
        }
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const cards = context.cards;
                const count = Math.ceil(cards.length / 2);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: count,
                            selectable: cards,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '织俭',
                                timebar: room.responseTime,
                                buttons: ['confirm'],
                                prompt: `织俭，请选择${count}张牌置入后备区`,
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
                    if (d.toArea === room.discardArea &&
                        d.reason === 6 /* MoveCardReason.DisCard */ &&
                        d.player === target) {
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
        let to_cards;
        if (cards.length > 1) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            to_cards = room.getResult(req, 'card').result;
        }
        else {
            to_cards = cards;
        }
        await room.removeCard({
            player: from,
            cards: to_cards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.zhijian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (!player.inturn &&
            room.sameAsKingdom(this.player, player) &&
            data.has_lose(player, 'h') &&
            !player.hasHandCards());
    },
    context(room, player, data) {
        return {
            from: this.player,
            targets: [player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const target = context.targets.at(0);
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: {
                        text: `是否发动[b]织俭[/b]，交给{0}后备区里的一张牌`,
                        values: [
                            { type: 'player', value: target.playerId },
                        ],
                    },
                });
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
                                prompt: `织俭：请选择一张牌交给${target.gameName}`,
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
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
        });
    },
}));
exports.zhijian.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.wangyuanji.addSkill(exports.qianchong);
exports.wangyuanji.addSkill(exports.zhijian);
