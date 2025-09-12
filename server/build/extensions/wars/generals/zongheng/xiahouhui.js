"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shidu = exports.yishi = exports.xiahouhui = void 0;
exports.xiahouhui = sgs.General({
    name: 'wars.xiahouhui',
    kingdom: 'jin',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.yishi = sgs.Skill({
    name: 'wars.xiahouhui.yishi',
});
exports.yishi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player)) {
            const phase = room.getCurrentPhase();
            if (!phase ||
                phase.executor === player ||
                phase.phase !== 4 /* Phase.Play */)
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            if (uses.length > 0)
                return false;
            const moves = data.filter((v) => v.toArea === room.discardArea &&
                v.reason === 6 /* MoveCardReason.DisCard */ &&
                v.fromArea === phase.executor.handArea);
            if (moves.length > 0) {
                return phase.isOwner(moves.at(0).player, 4 /* Phase.Play */);
            }
        }
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
                                title: '宜室',
                                timebar: room.responseTime,
                                prompt: '宜室：请选择一张牌',
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
        const { from } = context;
        const target = room.getCurrentPhase()?.executor;
        if (!target)
            return;
        let cards = [];
        data.move_datas.forEach((v) => {
            if (v.toArea === room.discardArea &&
                v.reason === 6 /* MoveCardReason.DisCard */ &&
                v.fromArea === target.handArea) {
                v.cards.forEach((c) => {
                    if (c.area === room.discardArea) {
                        cards.push(c);
                    }
                });
            }
        });
        if (!cards.length)
            return;
        context.cards = cards;
        let give;
        if (cards.length > 1) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            give = room.getResultCards(req).at(0);
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
        if (cards.length > 0) {
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.shidu = sgs.Skill({
    name: 'wars.xiahouhui.shidu',
});
exports.shidu.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return from.canPindian([item], skill.name);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `识度：你可以与一名角色其他发起拼点`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const count = context.count;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: count,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `识度：请将${count}张牌交给${target.gameName}`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.canPindian([], this.name));
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `shidu_pindian`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from && target.hasHandCards()) {
            await room.obtainCards({
                player: from,
                cards: target.getHandCards(),
                source: data,
                reason: this.name,
            });
            context.count = Math.floor(from.getHandCards().length / 2);
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.giveCards({
                from,
                to: target,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.xiahouhui.addSkill(exports.yishi);
exports.xiahouhui.addSkill(exports.shidu);
sgs.loadTranslation({
    ['shidu_pindian']: '识度：请选择一张牌拼点',
});
