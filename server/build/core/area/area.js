"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Area = void 0;
const card_1 = require("../card/card");
class Area {
    constructor() {
        /** 默认放置方式 */
        this.defaultPut = 2 /* CardPut.Down */;
        /** 默认可见角色 */
        this.visibles = [];
        /** 区域所有牌 */
        this._cards = [];
        /** 区域所有武将牌 */
        this._generals = [];
        /** 是否废除 */
        this.disable = false;
    }
    init(type, room, player, defaultPut = 2 /* CardPut.Down */, visibles = []) {
        this.type = type;
        this.room = room;
        this.player = player;
        this.defaultPut = defaultPut;
        this.visibles.push(...visibles);
        this.room.areas.set(this.areaId, this);
    }
    get cards() {
        return this._cards.slice();
    }
    get generals() {
        return this._generals.slice();
    }
    /** 区域ID */
    get areaId() {
        if (this.player) {
            return `${this.player.playerId}.${this.type}`;
        }
        else {
            return `${this.type}`;
        }
    }
    /** 此区域中牌的数量 */
    get count() {
        return this._cards.length;
    }
    /** 此区域中武将牌的数量 */
    get generalCount() {
        return this._generals.length;
    }
    /** 是否为公共区域 */
    get isPublic() {
        return !this.player;
    }
    /** 是否为私有区域 */
    get isPrivate() {
        return !this.isPublic;
    }
    /** 是否为一名角色的区域 */
    get isPlayer() {
        return (this.isPrivate &&
            [91 /* AreaType.Hand */, 92 /* AreaType.Equip */, 93 /* AreaType.Judge */].includes(this.type));
    }
    /** 向区域中增加牌 */
    add(cards, pos = 'bottom') {
        cards.forEach((v) => {
            v.area = this;
            if (v instanceof card_1.GameCard) {
                if (!this._cards.includes(v)) {
                    if (pos === 'bottom') {
                        this._cards.push(v);
                    }
                    if (pos === 'top') {
                        this._cards.unshift(v);
                    }
                }
            }
            else {
                if (!this._generals.includes(v)) {
                    if (pos === 'bottom') {
                        this._generals.push(v);
                    }
                    if (pos === 'top') {
                        this._generals.unshift(v);
                    }
                }
            }
        });
    }
    /** 从区域中移除牌 */
    remove(cards) {
        cards.forEach((v) => {
            v.area = undefined;
            if (v instanceof card_1.GameCard) {
                lodash.remove(this._cards, (c) => c === v);
            }
            else {
                lodash.remove(this._generals, (c) => c === v);
            }
        });
    }
    /** 判断区域中是否有指定的牌 */
    has(card) {
        if (card instanceof card_1.GameCard) {
            this._cards.includes(card);
        }
        else {
            this._generals.includes(card);
        }
    }
    /** 将此区域内的牌洗混 */
    shuffle() {
        sgs.utils.shuffle(this._cards);
        sgs.utils.shuffle(this._generals);
    }
    /**
     * 从区域中获取指定的牌
     * @param num 获取的数量
     * @param pos 获取的位置：top-从顶部开始；bottom-从底部开始；random-随机
     * @param rule 获取的卡牌需要满足的条件。如果提供此项，pos的random设置会改为top
     * @description 如果是牌堆，此方法不会触发洗牌。如果区域中的牌的数量不足，则返回区域剩余的全部卡牌。如满足条件的卡牌不足需要获取的数量，则只会返回满足数量的部分，也可能没有。
     * @returns 获取到的牌的数组
     */
    get(count, type, pos = 'top', filter) {
        const result = [];
        if (filter) {
            const arr = type === card_1.GameCard ? this.cards : this.generals;
            if (pos === 'bottom')
                arr.reverse();
            const _count = type === card_1.GameCard ? this.count : this.generalCount;
            for (let i = 0; i < _count; i++) {
                const card = arr[i];
                if (card instanceof type && filter(card)) {
                    result.push(card);
                    if (result.length === count)
                        break;
                }
            }
        }
        else {
            if (type === card_1.GameCard) {
                if (this.count <= count)
                    return this.cards;
                if (pos === 'top')
                    return this._cards.slice(0, count);
                if (pos === 'bottom')
                    return this._cards.slice(-count);
                for (let i = 0; i < count; i++) {
                    const random = sgs.utils.randomInt(0, this.count - 1);
                    if (result.includes(this._cards[random])) {
                        i--;
                    }
                    else {
                        result.push(this._cards[random]);
                    }
                }
            }
            else {
                if (this.generalCount <= count)
                    return this.generals;
                if (pos === 'top')
                    return this._generals.slice(0, count);
                if (pos === 'bottom')
                    return this._generals.slice(-count);
                for (let i = 0; i < count; i++) {
                    const random = sgs.utils.randomInt(0, this.generalCount - 1);
                    if (result.includes(this._generals[random])) {
                        i--;
                    }
                    else {
                        result.push(this._generals[random]);
                    }
                }
            }
        }
        return result;
    }
}
exports.Area = Area;
