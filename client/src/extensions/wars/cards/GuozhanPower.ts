import { CardSuit, CardAttr } from '../../../core/card/card.types';

const WarsPowerCards = sgs.Package('WarsPowerCards');

WarsPowerCards.addGameCards([
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 4,
    }),
    sgs.GameCard({
        name: 'jiu',
        suit: CardSuit.Spade,
        number: 6,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 7,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 8,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 9,
        attr: [CardAttr.Thunder],
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 10,
        attr: [CardAttr.Thunder],
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Spade,
        number: 11,
        attr: [CardAttr.Thunder],
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Heart,
        number: 4,
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Heart,
        number: 5,
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Heart,
        number: 6,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Heart,
        number: 7,
    }),
    sgs.GameCard({
        name: 'tao',
        suit: CardSuit.Heart,
        number: 8,
    }),
    sgs.GameCard({
        name: 'tao',
        suit: CardSuit.Heart,
        number: 9,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Heart,
        number: 10,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Heart,
        number: 11,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Club,
        number: 4,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Club,
        number: 5,
        attr: [CardAttr.Thunder, CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Club,
        number: 6,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Club,
        number: 7,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Club,
        number: 8,
    }),
    sgs.GameCard({
        name: 'jiu',
        suit: CardSuit.Club,
        number: 9,
    }),
    sgs.GameCard({
        name: 'tao',
        suit: CardSuit.Diamond,
        number: 2,
    }),
    sgs.GameCard({
        name: 'tao',
        suit: CardSuit.Diamond,
        number: 3,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Diamond,
        number: 6,
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Diamond,
        number: 7,
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Diamond,
        number: 8,
        attr: [CardAttr.Fire],
    }),
    sgs.GameCard({
        name: 'sha',
        suit: CardSuit.Diamond,
        number: 9,
        attr: [CardAttr.Fire],
    }),
    sgs.GameCard({
        name: 'shan',
        suit: CardSuit.Diamond,
        number: 13,
    }),
    sgs.GameCard({
        name: 'xietianziyilingzhuhou',
        suit: CardSuit.Spade,
        number: 1,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'huoshaolianying',
        suit: CardSuit.Spade,
        number: 3,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'lulitongxin',
        suit: CardSuit.Spade,
        number: 12,
        attr: [CardAttr.Recastable],
    }),
    sgs.GameCard({
        name: 'wuxiekeji',
        suit: CardSuit.Spade,
        number: 13,
    }),
    sgs.GameCard({
        name: 'lianjunshengyan',
        suit: CardSuit.Heart,
        number: 1,
    }),
    sgs.GameCard({
        name: 'diaohulishan',
        suit: CardSuit.Heart,
        number: 2,
    }),
    sgs.GameCard({
        name: 'huoshaolianying',
        suit: CardSuit.Heart,
        number: 12,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'shuiyanqijun',
        suit: CardSuit.Heart,
        number: 13,
    }),
    sgs.GameCard({
        name: 'chiling',
        suit: CardSuit.Club,
        number: 3,
    }),
    sgs.GameCard({
        name: 'lulitongxin',
        suit: CardSuit.Club,
        number: 10,
        attr: [CardAttr.Recastable],
    }),
    sgs.GameCard({
        name: 'huoshaolianying',
        suit: CardSuit.Club,
        number: 11,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'shuiyanqijun',
        suit: CardSuit.Club,
        number: 12,
    }),
    sgs.GameCard({
        name: 'wuxiekeji',
        suit: CardSuit.Club,
        number: 13,
        attr: [CardAttr.Country],
    }),
    sgs.GameCard({
        name: 'xietianziyilingzhuhou',
        suit: CardSuit.Diamond,
        number: 1,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'xietianziyilingzhuhou',
        suit: CardSuit.Diamond,
        number: 4,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'diaohulishan',
        suit: CardSuit.Diamond,
        number: 10,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'wuxiekeji',
        suit: CardSuit.Diamond,
        number: 11,
        attr: [CardAttr.Country],
    }),
    sgs.GameCard({
        name: 'mingguangkai',
        suit: CardSuit.Spade,
        number: 2,
    }),
    sgs.GameCard({
        name: 'qinglongyanyuedao',
        suit: CardSuit.Spade,
        number: 5,
    }),
    sgs.GameCard({
        name: 'jingfan',
        suit: CardSuit.Heart,
        number: 3,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'yuxi',
        suit: CardSuit.Club,
        number: 1,
    }),
    sgs.GameCard({
        name: 'huxinjing',
        suit: CardSuit.Club,
        number: 2,
        attr: [CardAttr.Transferable],
    }),
    sgs.GameCard({
        name: 'muniuliuma',
        suit: CardSuit.Diamond,
        number: 5,
    }),
    sgs.GameCard({
        name: 'fangtianhuaji',
        suit: CardSuit.Diamond,
        number: 12,
    }),
]);

sgs.loadTranslation({
    ['WarsPowerCards']: '国战·势备篇',
});

export { WarsPowerCards };
