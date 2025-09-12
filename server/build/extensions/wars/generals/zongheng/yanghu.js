"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mingfa_delay = exports.mingfa = exports.deshao = exports.yanghu = void 0;
exports.yanghu = sgs.General({
    name: 'wars.wei.yanghu',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.deshao = sgs.Skill({
    name: 'wars.wei.yanghu.deshao',
});
exports.deshao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.from.hasCanDropCards('he', player, 1, this.name) &&
            data.current.target === player &&
            data.targetCount === 1 &&
            data.card &&
            data.card.color === 2 /* CardColor.Black */) {
            if (data.from.getOpenGenerls().length >
                player.getOpenGenerls().length)
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < player.hp;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        const from = context.from;
        const target = context.targets.at(0);
        return {
            choose: () => {
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '德劭',
                                timebar: room.responseTime,
                                prompt: '德劭：请选择一张牌',
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
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.mingfa = sgs.Skill({
    name: 'wars.wei.yanghu.mingfa',
});
exports.mingfa.addEffect(sgs.TriggerEffect({
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
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return room.isOtherKingdom(from, item);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `明伐：你可以选择一名其他势力的角色，他下个回合结束时根据其的手牌数执行不同的效果`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        const effect = await room.addEffect('mingfa.delay', from);
        effect.setData('target', target);
        target.setMark('mark.mingfa', true, {
            visible: true,
            source: this.name,
        });
        return true;
    },
}));
exports.mingfa_delay = sgs.TriggerEffect({
    name: 'mingfa.delay',
    auto_log: 1,
    auto_directline: 1,
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const target = this.getData('target');
            return target === data.player;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.player],
        };
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
                            selectable: target.getHandCards(),
                            data_rows: target.getCardsToArea('h'),
                            windowOptions: {
                                title: '明伐',
                                timebar: room.responseTime,
                                prompt: '明伐：请选择一张牌',
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
        const { from, targets: [to], } = context;
        const count1 = to.getHandCards().length;
        const count2 = from.getHandCards().length;
        if (count1 < count2) {
            await room.damage({
                from,
                to,
                source: data,
                reason: this.name,
            });
            if (to.alive && to.hasHandCards()) {
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
        }
        else if (count1 > count2) {
            await room.drawCards({
                player: from,
                count: count1 - count2,
                source: data,
                reason: this.name,
            });
        }
        to.removeMark('mark.mingfa');
        this.removeData('target');
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                const target = this.getData('target');
                if (!target) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.yanghu.addSkill(exports.deshao);
exports.yanghu.addSkill(exports.mingfa);
sgs.loadTranslation({
    ['mark.mingfa']: '明伐',
});
