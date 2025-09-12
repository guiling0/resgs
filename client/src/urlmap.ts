import { CardColor, CardSuit } from './core/card/card.types';

export const AssetsUrlMapping = {
    //颜色
    color: {
        [CardColor.None]: 'resources/card/texture/card/suit/none.png',
        [CardColor.Black]: 'resources/card/texture/card/suit/black.png',
        [CardColor.Red]: 'resources/card/texture/card/suit/red.png',
    },

    //花色
    suit: {
        [CardSuit.None]: '',
        [CardSuit.Club]: 'resources/card/texture/card/suit/club.png',
        [CardSuit.Diamond]: 'resources/card/texture/card/suit/diamond.png',
        [CardSuit.Heart]: 'resources/card/texture/card/suit/heart.png',
        [CardSuit.Spade]: 'resources/card/texture/card/suit/spade.png',
    },

    //logsuit
    logsuit: {
        [CardSuit.None]: '',
        [CardSuit.Club]: 'resources/card/texture/card/logsuit/club.png',
        [CardSuit.Diamond]: 'resources/card/texture/card/logsuit/diamond.png',
        [CardSuit.Heart]: 'resources/card/texture/card/logsuit/heart.png',
        [CardSuit.Spade]: 'resources/card/texture/card/logsuit/spade.png',
    },
};
