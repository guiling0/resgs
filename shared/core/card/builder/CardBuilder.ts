import {
    CardAttr,
    CardColor,
    CardData,
    CardNumber,
    CardSubType,
    CardSuit,
    CardType,
    GameCardData,
    getColorBySuit,
} from '../CardTypes';

/** 全局自增卡牌 ID */
let _nextCardId = 100000;

export class CardBuilder {
    readonly name: string;

    private _type: CardType = CardType.Basic;
    private _subtype: CardSubType = CardSubType.Basic;
    private _suit?: CardSuit;
    private _number?: CardNumber;
    private _damage: boolean = false;
    private _recover: boolean = false;
    private _attr: CardAttr[] = [];
    private _derived: boolean = false;
    private _registered: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    /** 卡牌类别（默认 Basic） */
    type(t: CardType): this {
        this._type = t;
        return this;
    }

    /** 卡牌副类别 */
    subtype(s: CardSubType): this {
        this._subtype = s;
        return this;
    }

    /** 花色（仅实体牌实例需要） */
    suit(s: CardSuit): this {
        this._suit = s;
        return this;
    }

    /** 点数（仅实体牌实例需要） */
    number(n: CardNumber): this {
        this._number = n;
        return this;
    }

    /** 是否为伤害类卡牌 */
    damage(d: boolean = true): this {
        this._damage = d;
        return this;
    }

    /** 是否为回复类卡牌 */
    recover(r: boolean = true): this {
        this._recover = r;
        return this;
    }

    /** 卡牌属性 */
    attr(a: CardAttr[]): this {
        this._attr = a;
        return this;
    }

    /** 是否为衍生牌 */
    derived(d: boolean = true): this {
        this._derived = d;
        return this;
    }

    /**
     * 写入 sgs.carddatas（类型定义）+ sgs.cards（实体牌实例，如有花色点数）。
     * 幂等——重复调用不重复注册。
     */
    register(): { carddata: CardData; card?: GameCardData } {
        if (this._registered) {
            return {
                carddata: sgs.carddatas.get(this.name)!,
                card: this._suit !== undefined
                    ? Array.from(sgs.cards.values()).find(
                          (c) => c.name === this.name && c.suit === this._suit && c.number === this._number,
                      )
                    : undefined,
            };
        }

        // ===== 1. 卡牌类型定义 → sgs.carddatas =====
        const carddata: CardData = {
            name: this.name,
            type: this._type,
            subtype: this._subtype,
            damage: this._damage,
            recover: this._recover,
            length: this.name.length,
            rhyme: '',
            score: [0, 0, 0],
            acronym: this.name[0] || '',
            equiptip: '',
        };
        sgs.carddatas.set(this.name, carddata);

        // ===== 2. 实体牌实例 → sgs.cards =====
        let card: GameCardData | undefined;
        if (this._suit !== undefined && this._number !== undefined) {
            const id = _nextCardId++;
            card = {
                id,
                name: this.name,
                suit: this._suit,
                color: getColorBySuit(this._suit),
                number: this._number,
                attr: this._attr,
                derived: this._derived,
            };
            sgs.cards.set(id, card);
        }

        this._registered = true;
        return { carddata, card };
    }
}
