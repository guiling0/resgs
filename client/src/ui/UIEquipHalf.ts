const { regClass } = Laya;
import { GameCard } from '../core/card/card';
import { CardSuit, CardColor } from '../core/card/card.types';
import { AssetsUrlMapping } from '../urlmap';
import { UIEquipHalfBase } from './UIEquipHalf.generated';

@regClass()
export class UIEquipHalf extends UIEquipHalfBase {
    public card: GameCard;

    public set(card: GameCard) {
        if (card === undefined) {
            this.card = undefined;
            this.visible = false;
            return;
        }
        this.card = card;
        //suit
        if (card.suit === CardSuit.None) {
            this.suit.texture = undefined;
        } else {
            this.suit.loadImage(AssetsUrlMapping.suit[card.suit]);
        }
        //number
        if (card.number < 1 || card.number > 13) {
            this.number.texture = undefined;
        } else {
            const _color =
                card.color === undefined ||
                card.color === CardColor.None ||
                card.color === CardColor.Black
                    ? 'black'
                    : 'red';
            this.number.loadImage(
                `resources/card/texture/card/number/${_color}/${card.number}.png`
            );
        }
        this.visible = true;
    }
}
