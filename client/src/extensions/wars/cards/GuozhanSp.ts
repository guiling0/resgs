import { CardSuit } from '../../../core/card/card.types';

const WarsExtraCards = sgs.Package('WarsExtraCards');

WarsExtraCards.addGameCards([
    sgs.GameCard({
        name: 'feilongduofeng',
        suit: CardSuit.Spade,
        number: 2,
    }),
    sgs.GameCard({
        name: 'taipingyaoshu',
        suit: CardSuit.Heart,
        number: 3,
    }),
    sgs.GameCard({
        name: 'dinglanyemingzhu',
        suit: CardSuit.Diamond,
        number: 6,
    }),
    sgs.GameCard({
        name: 'liulongcanjia',
        suit: CardSuit.Heart,
        number: 13,
    }),
    sgs.GameCard({
        name: 'jilinqianyi',
        suit: CardSuit.Spade,
        number: 6,
    }),
    sgs.GameCard({
        name: 'chibaoshanhu',
        suit: CardSuit.Club,
        number: 2,
    }),
    sgs.GameCard({
        name: 'cishizhen',
        suit: CardSuit.Spade,
        number: 10,
    }),
    sgs.GameCard({
        name: 'xijia',
        suit: CardSuit.Heart,
        number: 7,
    }),
    sgs.GameCard({
        name: 'pianxiangche',
        suit: CardSuit.Club,
        number: 2,
    }),
    sgs.GameCard({
        name: 'bazhenzongshu',
        suit: CardSuit.Diamond,
        number: 8,
    }),
    sgs.GameCard({
        name: 'shuangli',
        suit: CardSuit.Diamond,
        number: 11,
    }),
    sgs.GameCard({
        name: 'qunque',
        suit: CardSuit.Club,
        number: 12,
    }),
]);

sgs.loadTranslation({
    ['WarsExtraCards']: '国战·衍生牌',
});

export { WarsExtraCards };
