"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lord_shelie = exports.lord_duoshi = exports.lord_haoshi = exports.lord_yingzi = exports.lord_zhiheng = exports.fenghuo_delay = exports.flamemap = exports.jubao = exports.lianzi = exports.jiahe = exports.lord_sunquan = void 0;
const lusu_1 = require("../standard/wu/lusu");
const luxun_1 = require("../standard/wu/luxun");
const sunquan_1 = require("../standard/wu/sunquan");
const zhouyu_1 = require("../standard/wu/zhouyu");
exports.lord_sunquan = sgs.General({
    name: 'wars.lord_sunquan',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    lord: true,
    enable: false,
    isWars: true,
});
exports.jiahe = sgs.Skill({
    name: 'wars.lord_sunquan.jiahe',
});
exports.jiahe.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */, 6 /* SkillTag.Lord */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "StateChangeEnd" /* EventTriggers.StateChangeEnd */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.OpenEvent) &&
            data.generals.includes(this.skill?.sourceGeneral));
    },
    async effect(room, data, context) {
        room.broadcast({
            type: 'MsgChangeBgmAndBg',
            bg_url: 'resources/background/wu.png',
            bgm_url: 'resources/background/wu.mp3',
            bgm_loop: false,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                const skill = await room.addSkill('wars.lord_sunquan.flamemap', this.player, {
                    source: `effect:${this.id}`,
                    showui: 'other',
                });
                this.setData('fenghuo', skill);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                await this.getData('fenghuo').removeSelf();
            },
        },
    ],
}));
exports.lianzi = sgs.Skill({
    name: 'wars.lord_sunquan.lianzi',
});
exports.lianzi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                let count = from.getUpOrSideCards('mark.fenghuo').length;
                room.players.forEach((v) => {
                    if (room.sameAsKingdom(from, v)) {
                        count += v.equipArea.count;
                    }
                });
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: `是否发动技能敛资，弃置一张手牌，亮出{0}张牌并获得其中与弃置牌类别相同的牌`,
                            values: [{ type: 'number', value: count }],
                        },
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
        const { from, cards } = context;
        let count = from.getUpOrSideCards('mark.fenghuo').length;
        room.players.forEach((v) => {
            if (room.sameAsKingdom(from, v)) {
                count += v.equipArea.count;
            }
        });
        let dcards = await room.getNCards(count);
        await room.flashCards({
            player: from,
            cards: dcards,
            source: data,
            reason: this.name,
        });
        const card = cards.at(0);
        await room.delay(1);
        const obtains = dcards.slice().filter((v) => v.type === card.type);
        await room.obtainCards({
            player: from,
            cards: obtains,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards: dcards.filter((v) => v.area === room.processingArea),
            toArea: room.discardArea,
            // animation: false,
            source: data,
            reason: this.name,
        });
        if (obtains.length > 3) {
            await this.skill?.removeSelf();
            await room.addSkill('wars.lord_sunquan.zhiheng', from, {
                source: this.name,
                showui: 'default',
            });
        }
    },
}));
exports.jubao = sgs.Skill({
    name: 'wars.lord_sunquan.jubao',
});
exports.jubao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            return data.has_filter((v, c) => {
                return (c.subtype === 36 /* CardSubType.Treasure */ &&
                    v.fromArea === player.equipArea &&
                    v.reason === 10 /* MoveCardReason.Obtain */ &&
                    v.toArea !== player.handArea);
            });
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = data.getCards((v, c) => {
            return (c.subtype === 36 /* CardSubType.Treasure */ &&
                v.fromArea === from.equipArea &&
                v.reason === 10 /* MoveCardReason.Obtain */ &&
                v.toArea !== from.handArea);
        });
        await data.cancle(cards);
        return true;
    },
}));
exports.jubao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            if (room.discardArea.cards.find((v) => v.name === 'dinglanyemingzhu')) {
                return true;
            }
            if (room.playerAlives.find((v) => v
                .getEquipCards()
                .find((c) => c.name === 'dinglanyemingzhu'))) {
                return true;
            }
        }
    },
    getSelectors(room, context) {
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '聚宝',
                                timebar: room.responseTime,
                                prompt: '聚宝：请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '聚宝',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const target = room.playerAlives.find((v) => v.getEquipCards().find((c) => c.name === 'dinglanyemingzhu'));
        if (target) {
            context.targets = [target];
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.flamemap = sgs.Skill({
    name: 'wars.lord_sunquan.flamemap',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});
//拿技能
exports.flamemap.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    audio: [],
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, player) &&
            data.isOwner(player) &&
            this.player.hasUpOrSideCards('mark.fenghuo'));
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const options = [
                    'wars.lord_sunquan.yingzi',
                    'wars.lord_sunquan.haoshi',
                    'wars.lord_sunquan.shelie',
                    'wars.lord_sunquan.duoshi',
                ];
                const count = effect.player.getUpOrSideCards('mark.fenghuo').length;
                for (let i = 3; i >= count; i--) {
                    options[i] = '!' + options[i];
                }
                const c_count = count >= 5 ? 2 : 1;
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: c_count,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: {
                            text: '缘江烽火图：你可以选择{0}个技能获得',
                            values: [{ type: 'number', value: c_count }],
                        },
                        thinkPrompt: '缘江烽火图',
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from } = context;
        const skill_names = context.req_result.results.option
            .result;
        const skills = [];
        for (const name of skill_names) {
            const skill = await room.addSkill(name, from, {
                source: this.name,
                showui: 'default',
            });
            skills.push(skill);
        }
        const effect = await room.addEffect('fenghuo.delay', from);
        effect.setData('skills', skills);
        effect.setData('data', room.currentTurn);
    },
}));
exports.fenghuo_delay = sgs.TriggerEffect({
    name: 'fenghuo.delay',
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    const skills = this.getData('skills');
                    for (const skill of skills) {
                        await skill?.removeSelf();
                    }
                }
            },
        },
    ],
});
//放烽火
exports.flamemap.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    audio: ['lord_sunquan/flamemap1', 'lord_sunquan/flamemap2'],
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, player) && data.isOwner(player));
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
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.type === 3 /* CardType.Equip */;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `缘江烽火图：你可以将一张装备牌置于缘江烽火图上`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [target], } = context;
        await room.showCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards,
            toArea: target.upArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
        cards.forEach((v) => v.setMark('mark.fenghuo', true));
        this.player.setMark('mark.fenghuo', true, {
            visible: true,
            source: this.name,
            type: 'cards',
            areaId: this.player.upArea.areaId,
        });
        return true;
    },
}));
//掉烽火
exports.flamemap.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: ['lord_sunquan/flamemap3', 'lord_sunquan/flamemap4'],
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.channel &&
            (data.channel.name === 'sha' ||
                data.channel.type === 2 /* CardType.Scroll */) &&
            player.hasUpOrSideCards('mark.fenghuo'));
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const cards = from.getUpOrSideCards('mark.fenghuo');
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: cards,
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `缘江烽火图：请将一张“烽火”置入弃牌堆`,
                        thinkPrompt: '缘江烽火图',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.refreshMark = 'mark.fenghuo';
    },
}));
//制衡
exports.lord_zhiheng = sgs.Skill(sgs.copy(sunquan_1.zhiheng, {
    name: 'wars.lord_sunquan.zhiheng',
}));
//英姿
exports.lord_yingzi = sgs.Skill(sgs.copy(zhouyu_1.yingzi, {
    name: 'wars.lord_sunquan.yingzi',
}));
//好施
exports.lord_haoshi = sgs.Skill(sgs.copy(lusu_1.haoshi, {
    name: 'wars.lord_sunquan.haoshi',
}));
//度势
exports.lord_duoshi = sgs.Skill(sgs.copy(luxun_1.duoshi_v2025, {
    name: 'wars.lord_sunquan.duoshi',
}));
//涉猎
exports.lord_shelie = sgs.Skill({
    name: 'wars.lord_sunquan.shelie',
});
exports.lord_shelie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseStartedAfter" /* EventTriggers.DrawPhaseStartedAfter */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && !data.isComplete);
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const cards = context.cards;
                const suits = [];
                cards.forEach((v) => {
                    if (!suits.includes(v.suit)) {
                        suits.push(v.suit);
                    }
                });
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: suits.length,
                            selectable: cards,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '涉猎',
                                timebar: room.responseTime,
                                prompt: '涉猎：请选择想要的牌（每种花色一张）',
                                buttons: ['confirm'],
                            },
                            filter(item, selected) {
                                return !selected.find((v) => v.suit === item.suit);
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '涉猎',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        await data.end();
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(5);
        await room.flashCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        context.cards = cards;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const gcards = room.getResultCards(req);
        await room.obtainCards({
            player: from,
            cards: gcards,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards: cards.filter((v) => v.area === room.processingArea),
            toArea: room.discardArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
    },
}));
exports.lord_sunquan.addSkill(exports.jiahe);
exports.lord_sunquan.addSkill('#wars.lord_sunquan.flamemap');
exports.lord_sunquan.addSkill('#wars.lord_sunquan.yingzi');
exports.lord_sunquan.addSkill('#wars.lord_sunquan.haoshi');
exports.lord_sunquan.addSkill('#wars.lord_sunquan.shelie');
exports.lord_sunquan.addSkill('#wars.lord_sunquan.duoshi');
exports.lord_sunquan.addSkill(exports.lianzi);
exports.lord_sunquan.addSkill('#wars.lord_sunquan.zhiheng');
exports.lord_sunquan.addSkill(exports.jubao);
sgs.loadTranslation({
    ['mark.fenghuo']: '烽火',
});
