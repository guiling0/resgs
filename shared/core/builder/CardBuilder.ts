import { CardAttr, CardNumber, CardSuit, type GameCardData } from '../types/CardTypes';
import type { CardColor } from '../types/CardTypes';
import { getColorBySuit } from '../utils/CardUtils';

/** CardBuilder 实例接口——链式构建实体牌数据，不负责注册 */
export interface CardBuilder {
    readonly name: string;
    /** 设置花色 */
    suit(s: CardSuit): this;
    /** 设置点数 */
    number(n: CardNumber): this;
    /** 设置属性列表 */
    attr(a: CardAttr[]): this;
    /** 设置颜色（未设置时按花色推断） */
    color(c: CardColor): this;
    /** 标记为衍生牌 */
    derived(d?: boolean): this;
    /** 构建实体牌数据（id 留空，由注册扩展包时分配） */
    build(): GameCardData;
}

/** CardBuilder 工厂（sgs.CardBuilder）——无需 new */
export function CardBuilder(name: string): CardBuilder {
    return new _CardBuilder(name);
}

class _CardBuilder implements CardBuilder {
    readonly name: string;
    /** 花色 */
    private _suit: CardSuit = CardSuit.None;
    /** 点数 */
    private _number: CardNumber = CardNumber.None;
    /** 属性列表 */
    private _attr: CardAttr[] = [];
    /** 颜色（undefined 表示按花色推断） */
    private _color?: CardColor;
    /** 是否衍生牌 */
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

    color(c: CardColor): this {
        this._color = c;
        return this;
    }

    derived(d: boolean = true): this {
        this._derived = d;
        return this;
    }

    build(): GameCardData {
        return {
            id: '',
            name: this.name,
            suit: this._suit,
            color: this._color ?? getColorBySuit(this._suit),
            number: this._number,
            attr: [...this._attr],
            derived: this._derived,
        };
    }
}

/** 全可选字段构建实体牌数据（sgs.createCard）——内部经 CardBuilder 复用默认值与派生逻辑 */
export function Card(input: Partial<GameCardData> = {}): GameCardData {
    const b = CardBuilder(input.name ?? '');
    if (input.suit !== undefined) b.suit(input.suit);
    if (input.color !== undefined) b.color(input.color);
    if (input.number !== undefined) b.number(input.number);
    if (input.attr !== undefined) b.attr(input.attr);
    if (input.derived !== undefined) b.derived(input.derived);
    return b.build();
}
