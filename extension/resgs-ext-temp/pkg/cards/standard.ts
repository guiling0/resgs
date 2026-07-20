/**
 * 标准卡牌扩展包
 */

// 卡牌类型信息 → sgs.carddatas
sgs.CardConfig({
    name: 'sha',
    type: sgs.CardType.Basic,
    subtype: sgs.CardSubType.Basic,
    damage: true,
});
sgs.CardConfig({
    name: 'shan',
    type: sgs.CardType.Basic,
    subtype: sgs.CardSubType.Basic,
});
sgs.CardConfig({
    name: 'tao',
    type: sgs.CardType.Basic,
    subtype: sgs.CardSubType.Basic,
    recover: true,
});

// 实体牌
const cards = [
    sgs.GameCard({ suit: sgs.CardSuit.Spade, number: sgs.CardNumber.A }),
    sgs.GameCard({ suit: sgs.CardSuit.Spade, number: sgs.CardNumber.Number2 }),
    sgs.GameCard({
        name: 'shan',
        suit: sgs.CardSuit.Heart,
        number: sgs.CardNumber.Number2,
    }),
    sgs.GameCard({
        name: 'tao',
        suit: sgs.CardSuit.Heart,
        number: sgs.CardNumber.A,
    }),
];

// 注册卡牌扩展包（内部调用 registerCards + sgs.cardpacks.set）
sgs.CardPackage('standard', cards);
