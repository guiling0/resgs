import { GameRoom } from '../room/room';
import { TriggerEffect } from '../skill/effect';
import { GameCard } from './card';
import {
    CardAttr,
    CardColor,
    CardNumber,
    CardSuit,
    SourceData,
    VirtualCardData,
    VirtualCardId,
} from './card.types';
import { ICard } from './icard';

export class VirtualCard {
    public constructor(
        id: VirtualCardId,
        room: GameRoom,
        name: string,
        cards: GameCard[],
        protected record: boolean = true
    ) {
        this.id = id;
        this.room = room;
        this.addSubCard(cards);
        this.sourceData = {
            name,
            suit: CardSuit.None,
            color: CardColor.None,
            number: CardNumber.None,
            attr: [],
        };
        this.set();
    }

    /** 所属房间 */
    public readonly room: GameRoom;

    /** DataID */
    public readonly id: VirtualCardId;

    /** 所有实体牌 */
    public readonly subcards: GameCard[] = [];

    /** 是否已删除 */
    public destroyed: boolean = false;

    /** 自定义属性 */
    public custom: { [key: string]: any } = {};

    /** 通过转化使用或打出的 */
    public transform: TriggerEffect;

    public sourceData: SourceData;

    /** 增加实体牌 */
    public addSubCard(cards: GameCard[] | GameCard) {
        cards = Array.isArray(cards) ? cards : [cards];
        if (this.record) {
            cards.forEach((v) => {
                if (!this.subcards.includes(v)) {
                    if (v.vcard) {
                        v.vcard.delSubCard(v);
                    }
                    this.subcards.push(v);
                    v.vcard = this;
                }
            });
        } else {
            cards.forEach((v) => {
                if (!this.subcards.includes(v)) {
                    this.subcards.push(v);
                }
            });
        }
    }

    /** 删除实体牌 */
    public delSubCard(cards: GameCard[] | GameCard) {
        cards = Array.isArray(cards) ? cards : [cards];
        if (this.record) {
            cards.forEach((v) => {
                lodash.remove(this.subcards, (c) => c === v);
                v.vcard = undefined;
            });
        } else {
            cards.forEach((v) => {
                lodash.remove(this.subcards, (c) => c === v);
            });
        }
    }

    /** 清除实体牌 */
    public clearSubCard() {
        if (this.record) {
            this.subcards.forEach((v) => {
                v.vcard = undefined;
            });
        }
        this.subcards.length = 0;
    }

    /**
     * 设置虚拟牌属性
     * @param param0 需要修改的属性
     * @param update 未提供的属性是否更新默认属性
     */
    public set(
        { suit, color, number, attr }: Omit<Partial<SourceData>, 'name'> = {},
        update: boolean = true
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
            return sgs.utils.getColorBySuit(this.sourceData.suit);
        else if (this.subcards.length === 1) return this.subcards[0].color;
        else {
            if (
                this.subcards.every(
                    (v) => v.suit === CardSuit.Club || v.suit === CardSuit.Spade
                )
            ) {
                return CardColor.Black;
            } else if (
                this.subcards.every(
                    (v) =>
                        v.suit === CardSuit.Diamond || v.suit === CardSuit.Heart
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

    public get name() {
        return this.sourceData.name;
    }

    public get suit() {
        return this.sourceData.suit;
    }

    public get number() {
        return this.sourceData.number;
    }

    public get color() {
        return this.sourceData.color;
    }

    public get attr() {
        return this.sourceData.attr.slice();
    }

    public get type() {
        return sgs.utils.getCardType(this.name);
    }

    public get subtype() {
        return sgs.utils.getCardSubtype(this.name);
    }

    public get cardIds() {
        return this.room.getCardIds(this.subcards);
    }

    public hasSubCards() {
        return this.subcards.length > 0;
    }

    public get vdata(): VirtualCardData {
        return {
            id: this.id,
            name: this.name,
            suit: this.suit,
            color: this.color,
            number: this.number,
            attr: this.attr,
            subcards: this.cardIds,
            custom: this.custom,
        };
    }
}

export interface VirtualCard extends ICard {}
