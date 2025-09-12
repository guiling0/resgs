const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { ServerConfig } from '../config';
import { GameCard } from '../core/card/card';
import { CardSuit, CardColor } from '../core/card/card.types';
import { Skill } from '../core/skill/skill';
import { AssetsUrlMapping } from '../urlmap';
import { UIEquipSelfBase } from './UIEquipSelf.generated';

@regClass()
export class UIEquipSelf extends UIEquipSelfBase {
    public skill: Skill;
    public card: GameCard;

    public item: ChooseItemComp;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);
        this.item.setCanClick(false);
    }

    public set(card: GameCard) {
        if (card === undefined) {
            this.card = undefined;
            this.visible = false;
            return;
        }
        this.card = card;
        this.img.loadImage(
            `${ServerConfig.res_url}/image/equips/self/${card.name}.png`
        );
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
