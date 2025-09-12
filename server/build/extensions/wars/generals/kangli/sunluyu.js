"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.biebao = exports.mumu = exports.sunluyu = void 0;
exports.sunluyu = sgs.General({
    name: 'xl.sunluyu',
    kingdom: 'wu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.mumu = sgs.Skill({
    name: 'xl.sunluyu.mumu',
});
exports.mumu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "AssignTarget" /* EventTriggers.AssignTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.targetCount > 1 &&
            data.targetList.find((v) => v.target === player) &&
            data.from &&
            player.isAdjacent(data.from) &&
            data.isFirstTarget);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: ['mumu.drop', 'mumu.draw'],
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: '穆穆：你可以选择一项发动',
                        thinkPrompt: '穆穆',
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '穆穆',
                                timebar: room.responseTime,
                                prompt: '穆穆：请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '穆穆',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const result = context.req_result.results.option.result;
        if (result.includes('mumu.draw')) {
            return await room.drawCards({
                player: data.from,
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('mumu.drop')) {
            context.targets = [data.from];
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
        }
    },
}));
exports.mumu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "AssignTarget" /* EventTriggers.AssignTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.targetCount > 1 &&
            data.targetList.find((v) => v.target === player) &&
            data.from &&
            !player.isAdjacent(data.from) &&
            data.isFirstTarget);
    },
    context(room, player, data) {
        return {
            targets: data.targets,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const targets = context.targets;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return targets.includes(item);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '穆穆：你可以弃置一张牌，取消一个目标',
                        thinkPrompt: `穆穆`,
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
        const { from, targets } = context;
        await data.cancle(targets);
    },
}));
exports.biebao = sgs.Skill({
    name: 'xl.sunluyu.biebao',
});
exports.biebao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.has_lose(player, 'e');
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    room.sameAsKingdom(from, item));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '别抱：你可以选择一名与你势力相同的其他角色，与其交换副将',
                        thinkPrompt: `别抱`,
                    },
                };
            },
            choose: () => {
                const min = Math.min(...room.playerAlives.map((v) => v.hp));
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item.hp === min;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '别抱：请选择一名角色回复1点体力',
                        thinkPrompt: `别抱`,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const min = Math.min(...room.playerAlives.map((v) => v.hp));
        const players = room.playerAlives.filter((v) => v.hp === min);
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const to = room.getResultPlayers(req).at(0);
        await room.recoverhp({
            player: to,
            source: data,
            reason: this.name,
        });
        const from_deputy = from.deputy;
        const target_deputy = target.deputy;
        await room.change({
            player: target,
            general: 'deputy',
            to_general: from_deputy,
            source: data,
            reason: this.name,
            triggerNot: true,
        });
        await room.change({
            player: from,
            general: 'deputy',
            to_general: target_deputy,
            source: data,
            reason: this.name,
            triggerNot: true,
        });
    },
}));
exports.sunluyu.addSkill(exports.mumu);
exports.sunluyu.addSkill(exports.biebao);
sgs.loadTranslation({
    ['mumu.drop']: '弃置使用者一张牌',
    ['mumu.draw']: '使用者摸一张牌',
});
