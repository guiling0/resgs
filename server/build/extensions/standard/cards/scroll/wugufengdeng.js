"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wugufengdeng = void 0;
const wugufengdeng_action1 = sgs.TriggerEffect({
    name: 'wugufengdeng_action1',
    priorityType: 3 /* PriorityType.Card */,
    trigger: "UseCardReady" /* EventTriggers.UseCardReady */,
    getSelectors(room, context) {
        return {
            choose: () => {
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: context.cards,
                            selecte_type: 'win',
                            windowOptions: {
                                id: context.windowId,
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: 'wugufengdeng_choose',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.UseCardEvent) &&
            data.from === player &&
            data.card.name === 'wugufengdeng');
    },
    async cost(room, data, context) {
        const { from } = data;
        const cards = await room.getNCards(room.aliveCount);
        await room.puto({
            player: from,
            cards,
            toArea: room.processingArea,
            puttype: 1 /* CardPut.Up */,
            animation: false,
            source: data,
            reason: this.name,
        });
        data.data.wugu_cards = cards;
        data.data.wugu_cards_slice = cards.slice();
        const window = room.window({
            create: true,
            data: { type: 'datas', cards: room.getCardIds(cards) },
            options: {
                title: 'wugufengdeng',
            },
        });
        data.data.wugu_windowId = window;
        return true;
    },
});
const wugufengdeng_action2 = sgs.TriggerEffect({
    name: 'wugufengdeng_action2',
    priorityType: 3 /* PriorityType.Card */,
    trigger: "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.UseCardEvent) &&
            data.from === player &&
            data.card.name === 'wugufengdeng');
    },
    async cost(room, data, context) {
        const { from } = data;
        room.window({
            close: true,
            options: {
                id: data.data.wugu_windowId,
            },
        });
        return true;
    },
});
exports.wugufengdeng = sgs.CardUse({
    name: 'wugufengdeng',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    effects: [wugufengdeng_action1.name, wugufengdeng_action2.name],
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, -1],
            filter(item, selected) {
                return true;
            },
            auto: true,
        });
    },
    async effect(room, target, data) {
        const { current, baseRecover = 1 } = data;
        const windowId = data.data.wugu_windowId;
        const s = room.getData('wugufengdeng_action1');
        room.window({
            options: {
                id: windowId,
                title: this.name,
                timebar: room.responseTime,
                prompt: {
                    text: 'wugufengdeng_prompt',
                    values: [
                        { type: 'player', value: current.target.playerId },
                    ],
                },
            },
        });
        const req = await room.doRequest({
            player: current.target,
            get_selectors: {
                selectorId: s.getSelectorName('choose'),
                context: {
                    windowId: windowId,
                    cards: data.data.wugu_cards,
                },
            },
        });
        const result = room.getResult(req, 'card').result.at(0);
        if (result) {
            result.setLabel({
                text: 'wugufengdeng_tip',
                values: [{ type: 'player', value: current.target.playerId }],
            });
            await room.obtainCards({
                player: current.target,
                cards: [result],
                source: data,
                reason: this.name,
            });
            lodash.remove(data.data.wugu_cards, (c) => c === result);
        }
    },
});
sgs.setCardData('wugufengdeng', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'eng',
});
sgs.loadTranslation({
    ['wugufengdeng_prompt']: '等待{0}选择牌',
    ['@wugufengdeng_choose']: '',
    ['@@wugufengdeng_choose']: '五谷丰登',
    ['wugufengdeng_tip']: '{0}',
});
