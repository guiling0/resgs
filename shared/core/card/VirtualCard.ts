import { ICard, CardMethods } from './CardMethods';
import {
    VirtualSourceData,
    SourceData,
    CardSuit,
    CardColor,
    CardNumber,
    CardAttr,
    getCardType,
    getCardSubType,
    getColorBySuit,
    VirtualCardData,
} from './CardTypes';
import { GameCard } from './GameCard';

export class VirtualCard implements ICard {
    readonly name: string = 'sha';
    readonly sourceData: VirtualSourceData;
    readonly subcards: GameCard[] = [];
    readonly data: Record<string, any> = {};

    /** 是否已销毁 */
    destroyed: boolean = false;
    /** 通过转化使用或打出的技能效果 */
    transform: any = null;
    /** 使用或打出的来源 */
    usefrom: any = null;

    constructor(
        name: string,
        cards: GameCard[] = [],
        overrides?: Partial<SourceData>,
        record: boolean = true,
    ) {
        this.sourceData = {
            name,
            suit: CardSuit.None,
            color: CardColor.None,
            number: -1 as CardNumber,
            attr: [],
        };

        // 添加实体牌
        if (record) {
            this.addSubCards(cards);
        } else {
            for (const c of cards) {
                this.subcards.push(c);
                c.vcard = this;
            }
        }

        // 计算默认属性 + 应用覆盖
        this.refresh(overrides, !overrides);
    }

    addSubCards(cards: GameCard[]) {
        for (const card of cards) {
            if (card.vcard === this) continue;
            if (card.vcard) {
                card.vcard.delSubCard(card);
            }
            this.subcards.push(card);
            card.vcard = this;
        }
    }

    delSubCard(card: GameCard) {
        const idx = this.subcards.indexOf(card);
        if (idx >= 0) {
            this.subcards.splice(idx, 1);
            card.vcard = undefined;
        }
    }

    clearSubCards() {
        for (const card of this.subcards) {
            card.vcard = undefined;
        }
        this.subcards.length = 0;
    }

    hasSubCards(): boolean {
        return this.subcards.length > 0;
    }

    /** 实体牌 ID 列表 */
    get cardIds(): number[] {
        return this.subcards.map((c) => c.id);
    }

    get suit(): CardSuit {
        return this.sourceData.suit;
    }
    get color(): CardColor {
        return this.sourceData.color;
    }
    get number(): CardNumber {
        return this.sourceData.number;
    }
    get attr(): CardAttr[] {
        return [...this.sourceData.attr];
    }
    get type() {
        return getCardType(this.name);
    }
    get subtype() {
        return getCardSubType(this.name);
    }

    /**
     * 设置虚拟牌属性
     * @param param0 需要修改的属性
     * @param update 未提供的属性是否更新默认属性
     */
    public refresh(
        { suit, color, number, attr }: Omit<Partial<SourceData>, 'name'> = {},
        update: boolean = true,
    ) {
        this.sourceData.suit =
            suit !== undefined
                ? suit
                : update
                  ? this.defaultSuit()
                  : this.sourceData.suit;
        this.sourceData.color =
            color !== undefined
                ? color
                : update
                  ? this.defaultColor()
                  : this.sourceData.color;
        this.sourceData.number =
            number !== undefined
                ? number
                : update
                  ? this.defaultNumber()
                  : this.sourceData.number;
        if (attr) {
            this.sourceData.attr = attr;
        } else if (update) {
            this.sourceData.attr.length = 0;
            if (this.subcards.length === 1) {
                this.sourceData.attr.push(...this.subcards[0].attr);
            }
        }
    }

    protected defaultSuit() {
        if (this.subcards.length === 1) return this.subcards[0].suit;
        else return CardSuit.None;
    }

    protected defaultColor() {
        if (this.subcards.length === 0)
            return getColorBySuit(this.sourceData.suit);
        else if (this.subcards.length === 1) return this.subcards[0].color;
        else {
            if (
                this.subcards.every(
                    (v) =>
                        v.suit === CardSuit.Club || v.suit === CardSuit.Spade,
                )
            ) {
                return CardColor.Black;
            } else if (
                this.subcards.every(
                    (v) =>
                        v.suit === CardSuit.Diamond ||
                        v.suit === CardSuit.Heart,
                )
            ) {
                return CardColor.Red;
            } else {
                return CardColor.None;
            }
        }
    }

    protected defaultNumber() {
        if (this.subcards.length === 1) return this.subcards[0].number;
        else return -1;
    }

    hasAttr = CardMethods.hasAttr;
    isCommonSha = CardMethods.isCommonSha;
    isDamageCard = CardMethods.isDamageCard;
    isRecoverCard = CardMethods.isRecoverCard;
    isBasic = CardMethods.isBasic;
    isScroll = CardMethods.isScroll;
    isEquip = CardMethods.isEquip;
    isDelayedScroll = CardMethods.isDelayedScroll;
    isInstantScroll = CardMethods.isInstantScroll;
    isWeapon = CardMethods.isWeapon;
    isArmor = CardMethods.isArmor;
    isDefensiveMount = CardMethods.isDefensiveMount;
    isOffensiveMount = CardMethods.isOffensiveMount;
    isSpecialMount = CardMethods.isSpecialMount;
    isTreasure = CardMethods.isTreasure;
    isMount = CardMethods.isMount;

    toData(): VirtualCardData {
        return {
            name: this.name,
            suit: this.suit,
            color: this.color,
            number: this.number,
            attr: this.attr,
            subcards: this.cardIds,
            data: { ...this.data },
        };
    }
}
