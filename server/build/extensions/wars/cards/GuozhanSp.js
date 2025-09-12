"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarsExtraCards = void 0;
const WarsExtraCards = sgs.Package('WarsExtraCards');
exports.WarsExtraCards = WarsExtraCards;
WarsExtraCards.addGameCards([
    sgs.GameCard({
        name: 'feilongduofeng',
        suit: 1 /* CardSuit.Spade */,
        number: 2,
    }),
    sgs.GameCard({
        name: 'taipingyaoshu',
        suit: 2 /* CardSuit.Heart */,
        number: 3,
    }),
    sgs.GameCard({
        name: 'dinglanyemingzhu',
        suit: 4 /* CardSuit.Diamond */,
        number: 6,
    }),
    sgs.GameCard({
        name: 'liulongcanjia',
        suit: 2 /* CardSuit.Heart */,
        number: 13,
    }),
    sgs.GameCard({
        name: 'jilinqianyi',
        suit: 1 /* CardSuit.Spade */,
        number: 6,
    }),
    sgs.GameCard({
        name: 'chibaoshanhu',
        suit: 3 /* CardSuit.Club */,
        number: 2,
    }),
    sgs.GameCard({
        name: 'cishizhen',
        suit: 1 /* CardSuit.Spade */,
        number: 10,
    }),
    sgs.GameCard({
        name: 'xijia',
        suit: 2 /* CardSuit.Heart */,
        number: 7,
    }),
    sgs.GameCard({
        name: 'pianxiangche',
        suit: 3 /* CardSuit.Club */,
        number: 2,
    }),
    sgs.GameCard({
        name: 'bazhenzongshu',
        suit: 4 /* CardSuit.Diamond */,
        number: 8,
    }),
    sgs.GameCard({
        name: 'shuangli',
        suit: 4 /* CardSuit.Diamond */,
        number: 11,
    }),
    sgs.GameCard({
        name: 'qunque',
        suit: 3 /* CardSuit.Club */,
        number: 12,
    }),
]);
sgs.loadTranslation({
    ['WarsExtraCards']: '国战·衍生牌',
});
