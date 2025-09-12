"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhijizhibi = exports.zhijizhibi_choose = void 0;
exports.zhijizhibi_choose = sgs.TriggerEffect({
    name: 'zhijizhibi_choose',
    getSelectors(room, context) {
        return {
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
                        prompt: '知己知彼：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
        };
    },
});
exports.zhijizhibi = sgs.CardUse({
    name: 'zhijizhibi',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [exports.zhijizhibi_choose.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return (from !== item && (item.hasHandCards() || item.hasNoneOpen()));
            },
        });
    },
    async effect(room, target, data) {
        const { from, current } = data;
        const watchHead = room.createEventData(sgs.DataType.WatchGeneralData, {
            watcher: from,
            player: current.target,
            generals: [current.target.head],
            source: data,
            reason: this.name,
        });
        const watchDeputy = room.createEventData(sgs.DataType.WatchGeneralData, {
            watcher: from,
            player: current.target,
            generals: [current.target.deputy],
            source: data,
            reason: this.name,
        });
        const watchHand = room.createEventData(sgs.DataType.WatchHandData, {
            watcher: from,
            player: current.target,
            source: data,
            reason: this.name,
        });
        const handles = [];
        handles.push(`${watchHand.check() ? '' : '!'}watchHand`);
        handles.push(`${watchHead.check() ? '' : '!'}watchHead`);
        handles.push(`${watchDeputy.check() ? '' : '!'}watchDeputy`);
        const s = room.getData('zhijizhibi_choose');
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: {
                    handles,
                },
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('watchHand')) {
            await room.watchHandCard(watchHand);
        }
        if (result.includes('watchHead')) {
            await room.watchGeneral(watchHead);
        }
        if (result.includes('watchDeputy')) {
            await room.watchGeneral(watchDeputy);
        }
    },
});
sgs.setCardData('zhijizhibi', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'i',
});
sgs.loadTranslation({
    ['@chooseone_zhijizhibi']: '知己知彼：请选择一项',
    ['@@chooseone_zhijizhibi']: '知己知彼',
    ['watchHand']: '观看手牌',
    ['watchHead']: '观看主将',
    ['watchDeputy']: '观看副将',
});
