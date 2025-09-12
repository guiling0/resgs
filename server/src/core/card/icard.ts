import { Custom } from '../custom/custom';
import {
    SourceData,
    CardSuit,
    CardNumber,
    CardColor,
    CardAttr,
    CardType,
    CardSubType,
} from './card.types';

export class ICard {
    sourceData: SourceData;
    readonly name: string;
    readonly suit: CardSuit;
    readonly number: CardNumber;
    readonly color: CardColor;
    readonly attr: CardAttr[];
    readonly type: CardType;
    readonly subtype: CardSubType;

    public hasAttr(attr: CardAttr) {
        return this.attr.includes(attr);
    }

    public isCommonSha() {
        return (
            this.name === 'sha' &&
            !this.attr.includes(CardAttr.Fire) &&
            !this.attr.includes(CardAttr.Thunder)
        );
    }

    public isDamageCard() {
        return sgs.utils.isDamageCard(this.name);
    }

    public isHorse() {
        return (
            this.subtype === CardSubType.OffensiveMount ||
            this.subtype === CardSubType.DefensiveMount ||
            this.subtype === CardSubType.SpecialMount
        );
    }
}

export interface ICard extends Custom {}
