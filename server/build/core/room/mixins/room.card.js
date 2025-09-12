"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCardMixin = void 0;
const card_1 = require("../../card/card");
const vcard_1 = require("../../card/vcard");
class RoomCardMixin {
    /** 获取游戏牌 */
    getCard(id) {
        return this.cards.find((v) => v.id === id);
    }
    /** 获取一组游戏牌 */
    getCards(ids) {
        return ids?.map((v) => this.getCard(v)).filter((v) => v) ?? [];
    }
    /** 获取一组游戏牌的ID数组 */
    getCardIds(cards) {
        return cards?.map((v) => v.id) ?? [];
    }
    /** 获取所有具有指定mark的牌 */
    getCardsByMark(key) {
        return this.cards.filter((v) => v.hasMark(key)) ?? [];
    }
    /** 根据虚拟牌数据创建一张虚拟牌
     * @param data 虚拟牌数据
     * @param resetId 是否重设ID
     */
    createVirtualCardByData(data, resetId = true, record = true) {
        if (!data)
            return;
        const vcard = new vcard_1.VirtualCard(resetId ? `01${this.vcardids++}` : data.id, this, data.name, this.getCards(data.subcards), record);
        vcard.set(data);
        vcard.custom = data.custom;
        if (record)
            this._createVirtualCard(vcard);
        return vcard;
    }
    /** 创建一张实体牌对应的虚拟牌
     * @param card 实体牌
     */
    createVirtualCardByOne(card, record = true) {
        const vcard = new vcard_1.VirtualCard(`01${this.vcardids++}`, this, card.name, [card], record);
        if (record)
            this._createVirtualCard(vcard);
        return vcard;
    }
    /** 创建一张无实体牌的虚拟牌,并指定其默认属性
     * @param name 牌名
     * @param property 牌的属性
     */
    createVirtualCardByNone(name, property = {}, record = true) {
        const vcard = new vcard_1.VirtualCard(`01${this.vcardids++}`, this, name, [], record);
        vcard.set(property);
        if (record)
            this._createVirtualCard(vcard);
        return vcard;
    }
    /** 创建一张虚拟牌，并指定其实体牌和默认属性
     * @param name 牌名
     * @param cards 所有实体牌
     * @param property 牌的属性
     * @param d_property 未提供的属性是否设置为默认属性
     */
    createVirtualCard(name, cards, property = {}, d_property = true, record = true) {
        const vcard = new vcard_1.VirtualCard(`01${this.vcardids++}`, this, name, cards, record);
        vcard.set(property, d_property);
        if (record)
            this._createVirtualCard(vcard);
        return vcard;
    }
    /** 一般不会调用，记录已经创建的虚拟牌 */
    _createVirtualCard(card) {
        const old = this.vcards.find((v) => v.id === card.id);
        if (old)
            this.deleteVirtualCard(old);
        card.destroyed = false;
        this.vcards.push(card);
    }
    /** 删除一张虚拟牌 */
    deleteVirtualCard(card) {
        if (typeof card === 'string') {
            card = this.getVirtualCard(card);
        }
        card.destroyed = true;
        this.breakVirtualCard(card);
        lodash.remove(this.vcards, (c) => c === card);
    }
    /** 获取一张虚拟牌 */
    getVirtualCard(id) {
        return this.vcards.find((v) => v.id === id);
    }
    /** 中断一张虚拟牌与所有实体牌的关系 */
    breakVirtualCard(card) {
        if (typeof card === 'string') {
            card = this.getVirtualCard(card);
        }
        card?.clearSubCard();
    }
    /**
     * 从牌堆中获取牌以准备操作这些牌
     * @param num 获取的数量
     * @param pos 从哪一端开始获取
     * @description 此方法会触发洗牌和平局判定。这些牌被获取后应该立刻操作他们
     */
    async getNCards(num, pos = 'top') {
        if (this.drawArea.count + this.discardArea.count < num) {
            await this.gameOver([], 'getNCards');
            return [];
        }
        if (this.drawArea.count < num) {
            this.discardArea.shuffle();
            await this.moveCards({
                move_datas: [
                    {
                        cards: this.discardArea.cards,
                        toArea: this.drawArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                        animation: false,
                        puttype: 2 /* CardPut.Down */,
                    },
                ],
                source: this.currentTurn,
                reason: 'shuffle',
            });
            this.setProperty('shuffleCount', this.shuffleCount + 1);
        }
        return this.drawArea.get(num, card_1.GameCard, pos);
    }
    /** 创建虚拟牌数据 */
    createVData({ id = '0', name = 'sha', suit = 0 /* CardSuit.None */, color = 0 /* CardColor.None */, number = 0, attr = [], subcards = [], custom = {}, } = {}, checkAttr = true) {
        const data = {
            id,
            name,
            suit,
            color,
            number,
            attr,
            subcards,
            custom,
        };
        if (checkAttr) {
            if (name === 'sha') {
                const lei = Object.assign({}, data);
                lei.attr = [2 /* CardAttr.Thunder */];
                const huo = Object.assign({}, data);
                huo.attr = [1 /* CardAttr.Fire */];
                return [data, lei, huo];
            }
            if (name === 'wuxiekeji') {
                const guo = Object.assign({}, data);
                guo.attr = [3 /* CardAttr.Country */];
                return [data, guo];
            }
        }
        return [data];
    }
    /** 随机获取军令 */
    getCommands(count = 2) {
        if (count > 6)
            count = 6;
        const allCommands = [1, 2, 3, 4, 5, 6];
        if (count === 6)
            return sgs.utils.shuffle(allCommands);
        const shuffled = sgs.utils.shuffle(allCommands);
        return shuffled.slice(0, count);
    }
    /** 随机获取妙计并从妙计牌堆中移除 */
    getMiaoji(count = 1) {
        if (count > 12)
            count = 12;
        const allCommands = this.miaojis.slice();
        if (count === 12) {
            this.miaojis.length = 0;
            return sgs.utils.shuffle(allCommands);
        }
        const shuffled = sgs.utils.shuffle(this.miaojis.slice(0, count));
        shuffled.forEach((v) => {
            lodash.remove(this.miaojis, (m) => m === v);
        });
        return shuffled;
    }
    /** 比较两张牌的花色是否相同 */
    sameAsSuit(card1, card2) {
        if (card1.suit === 0 /* CardSuit.None */ || card2.suit === 0 /* CardSuit.None */)
            return false;
        return card1.suit === card2.suit;
    }
    /** 比较两张牌的花色是否不同 */
    differentAsSuit(card1, card2) {
        if (card1.suit === 0 /* CardSuit.None */ || card2.suit === 0 /* CardSuit.None */)
            return false;
        return card1.suit !== card2.suit;
    }
    /** 获取后备区中明区的牌 */
    getReserveUpCards() {
        return this.reserveArea.cards.filter((v) => v.put === 1 /* CardPut.Up */);
    }
    /** 获取后备区中暗区的牌 */
    getReserveDownCards() {
        return this.reserveArea.cards.filter((v) => v.put === 2 /* CardPut.Down */);
    }
    getReserveRowDatas() {
        const ming_cards = [];
        const an_cards = [];
        this.reserveArea.cards.forEach((v) => {
            if (v.put === 1 /* CardPut.Up */) {
                ming_cards.push(v);
            }
            else {
                an_cards.push(v);
            }
        });
        return [
            {
                title: '#reserve_up',
                cards: ming_cards,
            },
            {
                title: '#reserve_down',
                cards: an_cards,
            },
        ];
    }
}
exports.RoomCardMixin = RoomCardMixin;
