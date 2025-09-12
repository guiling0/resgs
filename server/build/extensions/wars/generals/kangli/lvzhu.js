"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xianghun = exports.jiaorao = exports.lvzhu = void 0;
exports.lvzhu = sgs.General({
    name: 'xl.lvzhu',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.jiaorao = sgs.Skill({
    name: 'xl.lvzhu.jiaorao',
});
exports.jiaorao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.card.subtype === 21 /* CardSubType.InstantScroll */ &&
            data.current.target === player &&
            data.card &&
            data.card.color !== 0 /* CardColor.None */);
    },
    context(room, player, data) {
        return {
            color: data.card.color,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const color = context.color;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.color === color;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `娇娆，你可以弃置一张${color}牌，取消目标中的你`,
                        thinkPrompt: '娇娆',
                    },
                };
            },
            choose: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: false,
                        prompt: '娇娆：请选择一项',
                        showMainButtons: false,
                        thinkPrompt: '娇娆',
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
        await data.cancleCurrent();
        const card = room.createVirtualCardByData(data.card.vdata);
        card.clearSubCard();
        const handles = ['jiaorao.use', 'jiaorao.yinyangyu'];
        if (!from.canUseCard(card, [data.from], this.name, {
            excluesCardTimesLimit: true,
            excluesCardDistanceLimit: true,
        })) {
            handles[0] = '!jiaorao.use';
        }
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('jiaorao.use')) {
            await room.usecard({
                from,
                card,
                targets: [data.from],
                source: data,
                reason: this.name,
                skill: this,
            });
        }
        if (result.includes('jiaorao.yinyangyu')) {
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yinyangyu',
                player: from.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yinyangyu', from, {
                source: this.name,
                showui: 'mark',
            });
        }
    },
}));
exports.xianghun = sgs.Skill({
    name: 'xl.lvzhu.xianghun',
});
exports.xianghun.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.number >= player.hp);
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
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `香魂：你可以将你区域里的所有牌交给一名其他角色`,
                        thinkPrompt: '香魂',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        await data.prevent();
        return true;
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        await room.giveCards({
            from,
            to: target,
            cards: from.getAreaCards(),
            source: data,
            reason: this.name,
        });
        await room.executeExtraTurn(room.createEventData(sgs.DataType.TurnEvent, {
            player: target,
            isExtra: true,
            phases: room.getRatedPhases(),
            skipPhases: [],
            source: undefined,
            reason: this.name,
        }));
        await room.die({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.lvzhu.addSkill(exports.jiaorao);
exports.lvzhu.addSkill(exports.xianghun);
sgs.loadTranslation({
    ['jiaorao.use']: '视为使用该牌',
    ['jiaorao.yinyangyu']: '获得阴阳鱼',
});
