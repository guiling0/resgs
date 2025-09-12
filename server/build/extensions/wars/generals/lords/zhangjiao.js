"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huangjinsymbol = exports.wendao = exports.wuxin = exports.hongfa = exports.lord_zhangjiao = void 0;
exports.lord_zhangjiao = sgs.General({
    name: 'wars.lord_zhangjiao',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    lord: true,
    enable: false,
    isWars: true,
});
exports.hongfa = sgs.Skill({
    name: 'wars.lord_zhangjiao.hongfa',
});
exports.hongfa.addEffect(sgs.TriggerEffect({
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
            bg_url: 'resources/background/qun.png',
            bgm_url: 'resources/background/qun.mp3',
            bgm_loop: false,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                room.setMark('#huangjintianbingfu_state', this.id);
                const huangjin = await room.addSkill('wars.lord_zhangjiao.huangjinsymbol', this.player, {
                    source: `effect:${this.id}`,
                    showui: 'other',
                });
                this.setData('huangjin', huangjin);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                room.removeMark('#huangjintianbingfu_state');
                await this.getData('huangjin').removeSelf();
            },
        },
    ],
}));
exports.wuxin = sgs.Skill({
    name: 'wars.lord_zhangjiao.wuxin',
});
exports.wuxin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "DrawPhaseStarted" /* EventTriggers.DrawPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(Math.min(room.getPlayerCountByKingdom(from.kingdom, false, true), 10));
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
        cards.forEach((v) => {
            datas.datas[0].items.push({
                title: 'cards_top',
                card: v.id,
            });
        });
        const req = await room.sortCards(from, cards, [
            {
                title: 'cards_top',
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
                    cards: result[0].items,
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
exports.wendao = sgs.Skill({
    name: 'wars.lord_zhangjiao.wendao',
});
exports.wendao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
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
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getAreaCards(),
                            filter(item, selected) {
                                return (item.name !== 'taipingyaoshu' &&
                                    item.color === 1 /* CardColor.Red */);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `问道：你可以弃置一张不为【太平要术】的红色牌，获得弃牌堆或一名角色装备区里的太平要术`,
                        thinkPrompt: '问道',
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
        let taiping = room.discardArea.cards.find((v) => v.name === 'taipingyaoshu');
        if (!taiping) {
            room.playerAlives.forEach((v) => {
                const t = v
                    .getEquipCards()
                    .find((c) => c.name === 'taipingyaoshu');
                if (t) {
                    taiping = t;
                    return false;
                }
            });
        }
        if (taiping) {
            await room.obtainCards({
                player: from,
                cards: [taiping],
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.huangjinsymbol = sgs.Skill({
    name: 'wars.lord_zhangjiao.huangjinsymbol',
    audio: ['lord_zhangjiao/huangjinsymbol1', 'lord_zhangjiao/huangjinsymbol2'],
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});
exports.hongfa.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: [],
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            !player.hasUpOrSideCards('mark.tianbing'));
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(room.getPlayerCountByKingdom(from.kingdom));
        await room.showCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        await room.puto({
            player: from,
            cards,
            toArea: from.upArea,
            source: data,
            movetype: 1 /* CardPut.Up */,
            reason: this.name,
        });
        cards.forEach((v) => v.setMark('mark.tianbing', true));
        from.setMark('mark.tianbing', true, {
            visible: true,
            source: this.name,
            type: 'cards',
            areaId: from.upArea.areaId,
        });
        return true;
    },
}));
exports.hongfa.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: ['lord_zhangjiao/huangjinsymbol3'],
    trigger: "LoseHpStart" /* EventTriggers.LoseHpStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.player === player &&
            player.hasUpOrSideCards('mark.tianbing'));
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
                            selectable: from.upArea.cards.filter((v) => v.hasMark('mark.tianbing')),
                            filter(item, selected) {
                                return true;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `黄巾天兵符：你可以将一张“天兵”置入弃牌堆，防止此次体力流失`,
                        thinkPrompt: '黄巾天兵符',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.puto({
            player: from,
            cards,
            toArea: room.discardArea,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        from.refreshMark = 'mark.tianbing';
        await data.prevent();
    },
}));
function huangjin_choose(room, effect) {
    const sha = room.createVirtualCardByNone('sha', undefined, false);
    sha.custom.method = 1;
    const cards = effect.player?.getUpOrSideCards('mark.tianbing');
    return {
        selectors: {
            card: room.createChooseCard({
                step: 1,
                count: 1,
                selectable: cards,
                filter(item, selected) {
                    return true;
                },
                onChange(type, item) {
                    if (type === 'add')
                        sha.addSubCard(item);
                    if (type === 'remove')
                        sha.delSubCard(item);
                    sha.set({ attr: [] });
                    this._use_or_play_vcard = sha;
                },
            }),
        },
        options: {
            canCancle: true,
            showMainButtons: true,
            prompt: '黄巾天兵符：你可以将一张“天兵”当【杀】',
        },
    };
}
exports.huangjinsymbol.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return huangjin_choose(room, context.effect);
            },
        };
    },
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, data.from) &&
            data.has('sha') &&
            this.player.upArea.cards.filter((v) => v.hasMark('mark.tianbing')).length > 0);
    },
    async cost(room, data, context) {
        const { cards } = context;
        this.player.refreshMark = 'mark.tianbing';
        return true;
    },
}));
exports.huangjinsymbol.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedPlayCard3" /* EventTriggers.NeedPlayCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return huangjin_choose(room, context.effect);
            },
        };
    },
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, data.from) &&
            data.has('sha') &&
            this.player.upArea.cards.filter((v) => v.hasMark('mark.tianbing')).length > 0);
    },
    async cost(room, data, context) {
        const { cards } = context;
        this.player.refreshMark = 'mark.tianbing';
        return true;
    },
    async effect(room, data, context) { },
}));
exports.lord_zhangjiao.addSkill(exports.hongfa);
exports.lord_zhangjiao.addSkill('#wars.lord_zhangjiao.huangjinsymbol');
exports.lord_zhangjiao.addSkill(exports.wuxin);
exports.lord_zhangjiao.addSkill(exports.wendao);
sgs.loadTranslation({
    ['mark.tianbing']: '天兵',
});
