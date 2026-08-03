import { CardColor, CardSuit } from '../types/CardTypes';

/** 根据花色获取颜色（黑桃/梅花 → 黑，红桃/方片 → 红，其余无色） */
export function getColorBySuit(suit: CardSuit): CardColor {
    if (suit === CardSuit.Club || suit === CardSuit.Spade) {
        return CardColor.Black;
    }
    if (suit === CardSuit.Diamond || suit === CardSuit.Heart) {
        return CardColor.Red;
    }
    return CardColor.None;
}
