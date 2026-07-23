import { CardAttr, CardNumber, CardSuit, GameCardData, getColorBySuit } from '../CardTypes';

/** CardBuilder 实例接口——构建实体牌数据，不负责注册 */
export interface CardBuilder {
    readonly name: string;
    suit(s: CardSuit): this;
    number(n: CardNumber): this;
    attr(a: CardAttr[]): this;
    derived(d?: boolean): this;
    /** 构建 GameCardData（id 由 registerCards 分配） */
    build(): GameCardData;
}

/** CardBuilder 工厂——无需 new */
export function CardBuilder(name: string): CardBuilder {
    return new _CardBuilder(name);
}

class _CardBuilder implements CardBuilder {
    readonly name: string;

    private _suit: CardSuit = CardSuit.None;
    private _number: CardNumber = CardNumber.None;
    private _attr: CardAttr[] = [];
    private _derived: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    suit(s: CardSuit): this {
        this._suit = s;
        return this;
    }

    number(n: CardNumber): this {
        this._number = n;
        return this;
    }

    attr(a: CardAttr[]): this {
        this._attr = a;
        return this;
    }

    derived(d: boolean = true): this {
        this._derived = d;
        return this;
    }

    build(): GameCardData {
        return {
            id: '', // 由 registerCards 分配
            name: this.name,
            suit: this._suit,
            color: getColorBySuit(this._suit),
            number: this._number,
            attr: this._attr,
            derived: this._derived,
        };
    }
}
