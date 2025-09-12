"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kanpo = exports.tianfu = exports.guanxing = exports.yizhi = exports.tiaoxin = exports.jiangwei = void 0;
const rules_1 = require("../../rules");
exports.jiangwei = sgs.General({
    name: 'wars.jiangwei',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.tiaoxin = sgs.Skill({
    name: 'wars.jiangwei.tiaoxin',
});
exports.tiaoxin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
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
                                return item.rangeOf(from);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `挑衅：你可以选择一名攻击范围内含有你的角色，令其选择是否对你使用【杀】`,
                        thinkPrompt: this.name,
                    },
                };
            },
            target_limit: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return selected.length === 0
                                    ? item === from
                                    : true;
                            },
                        }),
                    },
                };
            },
            choose_card: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '挑衅',
                                timebar: room.responseTime,
                                prompt: '挑衅：请选择一张牌',
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
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const use = await room.needUseCard({
            from: target,
            cards: [{ name: 'sha' }],
            targetSelector: {
                selectorId: this.getSelectorName('target_limit'),
                context,
            },
            reqOptions: {
                canCancle: true,
                prompt: `@wars.tiaoxin`,
                thinkPrompt: this.name,
            },
            source: data,
            reason: this.name,
        });
        if (!use) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.yizhi = sgs.Skill({
    name: 'wars.jiangwei.yizhi',
});
exports.yizhi.addEffect(sgs.copy(rules_1.reduce_yinyangyu, {
    tag: [3 /* SkillTag.Deputy */, 9 /* SkillTag.Secret */],
}));
exports.yizhi.addEffect(sgs.StateEffect({
    tag: [3 /* SkillTag.Deputy */],
    regard_skill(room, player, data) {
        if (this.isOwner(player)) {
            return 'wars.jiangwei.guanxing';
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                room.setData('#yizhi', this);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeData('#yizhi');
            },
        },
    ],
}));
exports.guanxing = sgs.Skill({
    name: 'wars.jiangwei.guanxing',
});
exports.guanxing.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const guanxing = room.skills.find((v) => v !== this.skill &&
                v.name.includes('guanxing') &&
                v.sourceGeneral === this.player.head &&
                v.isOpen());
            return !guanxing;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = Math.min(5, room.aliveCount);
        const cards = await room.getNCards(count);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            animation: false,
            puttype: 2 /* CardPut.Down */,
            cardVisibles: [from],
            source: data,
            reason: this.name,
        });
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost;
        const datas = { type: 'items', datas: [] };
        datas.datas.push({ title: 'cards_top', items: [] });
        datas.datas.push({ title: 'cards_bottom', items: [] });
        cards.forEach((v) => {
            datas.datas[0].items.push({
                title: 'cards_top',
                card: v.id,
            });
            datas.datas[1].items.push({
                title: 'cards_bottom',
                card: undefined,
            });
        });
        const req = await room.sortCards(from, cards, [
            {
                title: 'cards_top',
                max: cards.length,
            },
            {
                title: 'cards_bottom',
                max: cards.length,
            },
        ], {
            canCancle: false,
            showMainButtons: false,
            prompt: this.name,
            thinkPrompt: this.name,
        });
        const result = req.result.sort_result;
        await room.moveCards({
            move_datas: [
                {
                    cards: [...result[0].items, ...result[1].items],
                    toArea: room.drawArea,
                    reason: 1 /* MoveCardReason.PutTo */,
                    animation: false,
                    puttype: 2 /* CardPut.Down */,
                },
            ],
            source: data,
            reason: this.name,
        });
        room.drawArea.remove(result[0].items);
        room.drawArea.add(result[0].items.reverse(), 'top');
    },
}));
exports.tianfu = sgs.Skill({
    name: 'wars.jiangwei.tianfu',
});
exports.tianfu.addEffect(sgs.StateEffect({
    tag: [2 /* SkillTag.Head */, 7 /* SkillTag.Array_Quene */],
    regard_skill(room, player, data) {
        if (this.isOwner(player)) {
            return 'wars.jiangwei.kanpo';
        }
    },
}));
exports.tianfu.addEffect(sgs.copy(rules_1.arraycall_queue));
exports.kanpo = sgs.Skill({
    name: 'wars.jiangwei.kanpo',
});
exports.kanpo.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const wuxie = room.createVirtualCardByNone('wuxiekeji', undefined, false);
                wuxie.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === 2 /* CardColor.Black */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    wuxie.addSubCard(item);
                                if (type === 'remove')
                                    wuxie.delSubCard(item);
                                wuxie.set({ attr: [] });
                                this._use_or_play_vcard = wuxie;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '看破，你可以将一张黑色手牌当【无懈可击】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('wuxiekeji')) {
            return room.getQueue(room.currentTurn.player).length > 1;
        }
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.jiangwei.addSkill(exports.tiaoxin);
exports.jiangwei.addSkill(exports.tianfu);
exports.jiangwei.addSkill('#wars.jiangwei.kanpo');
exports.jiangwei.addSkill(exports.yizhi);
exports.jiangwei.addSkill('#wars.jiangwei.guanxing');
sgs.loadTranslation({
    ['@wars.tiaoxin']: '挑衅：你需要使用一张【杀】，否则被弃置一张牌',
});
