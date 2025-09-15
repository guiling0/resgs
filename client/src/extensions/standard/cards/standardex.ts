import { CardSuit } from '../../../core/card/card.types';

const StandardExCards = sgs.Package('StandardExCards');

StandardExCards.addGameCards([
    sgs.GameCard({
        name: 'hanbingjian',
        suit: CardSuit.Spade,
        number: 2,
    }),
    sgs.GameCard({
        name: 'shandian',
        suit: CardSuit.Heart,
        number: 12,
    }),
    sgs.GameCard({
        name: 'renwangdun',
        suit: CardSuit.Club,
        number: 2,
    }),
    sgs.GameCard({
        name: 'wuxiekeji',
        suit: CardSuit.Diamond,
        number: 12,
    }),
]);

sgs.loadTranslation({
    ['StandardExCards']: '标准版EX',
});

export { StandardExCards };
