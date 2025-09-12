"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shunshouqianyang = exports.shunshouqianyang_choose = void 0;
exports.shunshouqianyang_choose = sgs.TriggerEffect({
    name: 'shunshouqianyang_choose',
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
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '顺手牵羊',
                                timebar: room.responseTime,
                                prompt: '顺手牵羊，请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: '顺手牵羊',
                    },
                };
            },
        };
    },
});
exports.shunshouqianyang = sgs.CardUse({
    name: 'shunshouqianyang',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.shunshouqianyang_choose.name],
    distanceCondition(room, from, target, card) {
        return from.distanceTo(target) === 1;
    },
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
        const s = room.getData('shunshouqianyang_choose');
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
        await room.obtainCards({
            player: from,
            cards: result,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('shunshouqianyang', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'ang',
});
