"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardExCards = void 0;
const StandardExCards = sgs.Package('StandardExCards');
exports.StandardExCards = StandardExCards;
StandardExCards.addGameCards([
    sgs.GameCard({
        name: 'hanbingjian',
        suit: 1 /* CardSuit.Spade */,
        number: 2,
    }),
    sgs.GameCard({
        name: 'shandian',
        suit: 2 /* CardSuit.Heart */,
        number: 12,
    }),
    sgs.GameCard({
        name: 'renwangdun',
        suit: 3 /* CardSuit.Club */,
        number: 2,
    }),
    sgs.GameCard({
        name: 'wuxiekeji',
        suit: 4 /* CardSuit.Diamond */,
        number: 12,
    }),
]);
sgs.loadTranslation({
    ['StandardExCards']: '标准版EX',
});
