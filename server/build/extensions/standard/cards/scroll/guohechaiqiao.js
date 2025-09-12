"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guohechaiqiao = exports.guohechaiqiao_choose = void 0;
exports.guohechaiqiao_choose = sgs.TriggerEffect({
    name: 'guohechaiqiao_choose',
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
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '过河拆桥',
                                timebar: room.responseTime,
                                prompt: '过河拆桥，请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '过河拆桥',
                    },
                };
            },
        };
    },
});
exports.guohechaiqiao = sgs.CardUse({
    name: 'guohechaiqiao',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.guohechaiqiao_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from !== item && item.hasCardsInArea(true);
            },
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        const s = room.getData('guohechaiqiao_choose');
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: {
                    from,
                    targets: [current.target],
                },
            },
        });
        const result = req.result.results.cards.result;
        await room.dropCards({
            player: from,
            cards: result,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('guohechaiqiao', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'ao',
});
