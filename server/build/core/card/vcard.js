"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualCard = void 0;
class VirtualCard {
    constructor(id, room, name, cards, record = true) {
        this.record = record;
        /** 所有实体牌 */
        this.subcards = [];
        /** 是否已删除 */
        this.destroyed = false;
        /** 自定义属性 */
        this.custom = {};
        this.id = id;
        this.room = room;
        this.addSubCard(cards);
        this.sourceData = {
            name,
            suit: 0 /* CardSuit.None */,
            color: 0 /* CardColor.None */,
            number: -1 /* CardNumber.None */,
            attr: [],
        };
        this.set();
    }
    /** 增加实体牌 */
    addSubCard(cards) {
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
        }
        else {
            cards.forEach((v) => {
                if (!this.subcards.includes(v)) {
                    this.subcards.push(v);
                }
            });
        }
    }
    /** 删除实体牌 */
    delSubCard(cards) {
        cards = Array.isArray(cards) ? cards : [cards];
        if (this.record) {
            cards.forEach((v) => {
                lodash.remove(this.subcards, (c) => c === v);
                v.vcard = undefined;
            });
        }
        else {
            cards.forEach((v) => {
                lodash.remove(this.subcards, (c) => c === v);
            });
        }
    }
    /** 清除实体牌 */
    clearSubCard() {
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
    set({ suit, color, number, attr } = {}, update = true) {
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
        }
        else if (update) {
            this.sourceData.attr.length = 0;
            if (this.subcards.length === 1) {
                this.sourceData.attr.push(...this.subcards[0].attr);
            }
        }
    }
    defaultSuit() {
        if (this.subcards.length === 1)
            return this.subcards[0].suit;
        else
            return 0 /* CardSuit.None */;
    }
    defaultColor() {
        if (this.subcards.length === 0)
            return sgs.utils.getColorBySuit(this.sourceData.suit);
        else if (this.subcards.length === 1)
            return this.subcards[0].color;
        else {
            if (this.subcards.every((v) => v.suit === 3 /* CardSuit.Club */ || v.suit === 1 /* CardSuit.Spade */)) {
                return 2 /* CardColor.Black */;
            }
            else if (this.subcards.every((v) => v.suit === 4 /* CardSuit.Diamond */ || v.suit === 2 /* CardSuit.Heart */)) {
                return 1 /* CardColor.Red */;
            }
            else {
                return 0 /* CardColor.None */;
            }
        }
    }
    defaultNumber() {
        if (this.subcards.length === 1)
            return this.subcards[0].number;
        else
            return -1;
    }
    get name() {
        return this.sourceData.name;
    }
    get suit() {
        return this.sourceData.suit;
    }
    get number() {
        return this.sourceData.number;
    }
    get color() {
        return this.sourceData.color;
    }
    get attr() {
        return this.sourceData.attr.slice();
    }
    get type() {
        return sgs.utils.getCardType(this.name);
    }
    get subtype() {
        return sgs.utils.getCardSubtype(this.name);
    }
    get cardIds() {
        return this.room.getCardIds(this.subcards);
    }
    hasSubCards() {
        return this.subcards.length > 0;
    }
    get vdata() {
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
exports.VirtualCard = VirtualCard;
