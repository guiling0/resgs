"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miaoji_cizheng = exports.cizheng = exports.liangzhi_delay = exports.liangzhi = exports.zhuju = void 0;
exports.zhuju = sgs.General({
    name: 'xl.zhuju',
    kingdom: 'wu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.liangzhi = sgs.Skill({
    name: 'xl.zhuju.liangzhi',
});
exports.liangzhi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "ChooseTarget" /* EventTriggers.ChooseTarget */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.card &&
            (data.card.type === 1 /* CardType.Basic */ ||
                data.card.subtype === 21 /* CardSubType.InstantScroll */) &&
            data.from === player) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            card: data.card.vdata,
            targets: data.targets,
        };
    },
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const effect = context.effect;
                const from = context.from;
                const card = context.sha;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (card &&
                                    !targets.includes(item) &&
                                    item.hasNoneOpen() &&
                                    from.canUseCard(card, [item], effect.name, {
                                        excluesCardTimesLimit: true,
                                    }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `良执：你可以选择一名有暗置武将牌的其他角色也成为此牌的目标`,
                        thinkPrompt: effect.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.becomTarget(targets);
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const effect = await room.addEffect('liangzhi.delay', target);
        effect.setData('data', data);
        effect.setData('from', from);
    },
}));
exports.liangzhi_delay = sgs.TriggerEffect({
    name: 'liangzhi.delay',
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            this.getData('data') === data &&
            player.hasNoneOpen());
    },
    context(room, player, data) {
        return {
            targets: [this.getData('from')],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const to = context.targets.at(0);
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: `良执：你可以明置一张武将牌牌并摸/弃一张牌，视为对${to?.gameName}使用【桃】/【杀】`,
                        thinkPrompt: '良执',
                    },
                };
            },
            choose2: () => {
                const to = context.targets.at(0);
                const from = context.from;
                return {
                    selectors: {
                        option: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `良执：你可以弃置一张牌并视为对${to?.gameName}使用【杀】；或点击取消摸牌并视为对${to?.gameName}使用【桃】`,
                        thinkPrompt: '良执',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const openHead = room.createEventData(sgs.DataType.OpenEvent, {
            player: from,
            generals: [from.head],
            source: data,
            reason: this.name,
        });
        const openDeputy = room.createEventData(sgs.DataType.OpenEvent, {
            player: from,
            generals: [from.deputy],
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${openHead.check() ? '' : '!'}openHead`);
        handles.push(`${openDeputy.check() ? '' : '!'}openDeputy`);
        context.handles = handles;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const result = req.result.results.option.result;
        if (result.includes('openHead')) {
            return await room.open(openHead);
        }
        if (result.includes('openDeputy')) {
            return await room.open(openDeputy);
        }
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose2'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        if (cards.length) {
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            const sha = room.createVirtualCardByNone('sha');
            await room.usecard({
                from,
                targets: [target],
                card: sha,
                source: data,
                reason: this.name,
            });
        }
        else {
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
            const tao = room.createVirtualCardByNone('tao');
            await room.usecard({
                from,
                targets: [target],
                card: tao,
                source: data,
                reason: this.name,
            });
        }
        await this.removeSelf();
    },
    lifecycle: [
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.cizheng = sgs.Skill({
    name: 'xl.zhuju.cizheng',
});
exports.cizheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !data.isOwner(player) &&
            data.executor.hp >= player.hp);
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        option: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `辞正：你可以弃置一张牌对${target.gameName}献策`,
                        thinkPrompt: `辞正`,
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
        const { from, targets: [target], } = context;
        this.setInvalids(this.name);
        //献策
        const xiance = await room.xiance({
            sourceFrom: from,
            from: target,
            source: data,
            reason: this.name,
        });
        if (xiance.command) {
            const skill = await room.addSkill('miaoji.cizheng', target, {
                source: this.name,
                showui: 'default',
            });
            skill.setData('command', xiance.command);
            skill.setData('from', from);
            target.setMark('mark.cizheng', xiance.command, {
                type: 'command',
                source: this.name,
                visible: true,
            });
        }
    },
    lifecycle: [
        {
            trigger: "CircleStarted" /* EventTriggers.CircleStarted */,
            async on_exec(room, data) {
                this.setInvalids(this.name, false);
            },
        },
    ],
}));
exports.miaoji_cizheng = sgs.Skill({
    name: 'miaoji.cizheng',
});
exports.miaoji_cizheng.addEffect(sgs.TriggerEffect({
    forced: 'cost',
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            this.skill &&
            this.skill.getData('command'));
    },
    context(room, player, data) {
        return {
            targets: [this.skill.getData('from')],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: `是否发动技能辞正：令一名角色执行妙计或弃置妙计`,
                });
            },
            choose: () => {
                const from = context.from;
                const source = context.targets.at(0) ?? { kingdom: 'ye' };
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    room.differentAsKingdom(item, source));
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `辞正：请选择一名角色执行妙计，或点击取消弃置妙计`,
                        thinkPrompt: `辞正`,
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
        const target = room.getResultPlayers(req).at(0);
        return target ?? true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const command = this.skill.getData('command');
        const target = context.cost;
        if (typeof target === 'boolean') {
            room.miaojis.push(command);
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [command],
                        fromArea: from.handArea.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '{0}',
                            values: [{ type: 'string', value: this.name }],
                        },
                    },
                ],
            });
            await room.currentTurn.skipPhase(5 /* Phase.Drop */);
        }
        else {
            await room.xiance({
                from,
                to: target,
                command,
                execute: true,
                source: data,
                reason: this.name,
            });
        }
        from.removeMark('mark.cizheng');
        await this.skill.removeSelf();
    },
}));
exports.zhuju.addSkill(exports.liangzhi);
exports.zhuju.addSkill(exports.cizheng);
sgs.loadTranslation({
    ['miaoji.cizheng']: '辞正',
    ['mark.cizheng']: '辞正',
});
