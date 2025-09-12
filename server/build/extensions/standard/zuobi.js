"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zuobi = void 0;
exports.zuobi = sgs.Skill({
    name: 'debug.zuobi',
});
exports.zuobi.addEffect(sgs.TriggerEffect({
    tag: [10 /* SkillTag.Eternal */],
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    audio: [],
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const options = [
                    'zuobi_draw',
                    'zuobi_obtain',
                    'zuobi_change',
                ];
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                        }),
                        option: room.createChooseOptions({
                            step: 2,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: 'zuobi',
                    },
                };
            },
            obtain_card: () => {
                const vcards = [];
                room.cardNames.forEach((v) => {
                    vcards.push(...room.createVData({ name: v }, false));
                });
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: vcards,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '',
                                timebar: room.responseTime,
                                prompt: 'zuobi_obtain_chooseone',
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                    },
                };
            },
            change1: () => {
                const options = ['head', 'deputy'];
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: 'zuobi_change',
                    },
                };
            },
            change2: () => {
                const generals = [...room.generals.values()];
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '',
                                timebar: 60,
                                prompt: 'zuobi_general_chooseone',
                                buttons: ['confirm'],
                            },
                        }),
                    },
                    options: {
                        ms: 60,
                        canCancle: true,
                        showMainButtons: false,
                        prompt: 'zuobi_change_1',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return this.isOwner(player);
    },
    context(room, player, data) {
        return {
            maxTimes: -1,
        };
    },
    async cost(room, data, context) {
        const { from, req_result, targets: { [0]: target }, } = context;
        const option = req_result.results.option.result;
        if (option.includes('zuobi_draw')) {
            return await room.drawCards({
                player: target,
                count: 1,
                source: data,
                reason: this.name,
            });
        }
        if (option.includes('zuobi_obtain')) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('obtain_card'),
                    context,
                },
            });
            const res = req.result.results?.card?.result?.at(0);
            if (res && res.name) {
                const cards = room.cards.filter((v) => v.name === res.name);
                const card = cards[sgs.utils.randomInt(0, cards.length - 1)];
                if (card) {
                    await room.obtainCards({
                        player: target,
                        cards: [card],
                        source: data,
                        reason: this.name,
                    });
                }
            }
        }
        if (option.includes('zuobi_change')) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('change1'),
                    context,
                },
            });
            const req2 = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('change2'),
                    context,
                },
            });
            const pos = room.getResult(req, 'option').result;
            const generals = room.getResult(req2, 'general')
                .result;
            if (pos?.length && generals?.length) {
                if (pos.includes('head')) {
                    await room.change({
                        player: target,
                        general: target.head,
                        to_general: generals.at(0),
                        source: data,
                        reason: this.name,
                    });
                }
                if (pos.includes('deputy')) {
                    await room.change({
                        player: target,
                        general: target.deputy,
                        to_general: generals.at(0),
                        source: data,
                        reason: this.name,
                    });
                }
            }
        }
    },
}));
sgs.loadTranslation({
    ['debug.zuobi']: '作弊',
    ['@zuobi']: '选择一名角色执行对应效果',
    ['zuobi_draw']: '摸牌',
    ['zuobi_obtain']: '获得牌',
    ['zuobi_obtain_chooseone']: '选择一个牌名，获得一张同名牌',
    ['zuobi_change']: '变更',
    ['@zuobi_change']: '选择变更的位置',
    ['zuobi_general_chooseone']: '选择一张武将牌',
});
