"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCard = void 0;
const skill_types_1 = require("../skill/skill.types");
class GameCard {
    constructor(room, data) {
        this.data = data;
        /** 可见角色 */
        this._visibles = [];
        this.broadcastCustom = (data) => {
            this.room.markChanges.push({
                objType: 'card',
                objId: this.id,
                key: data.key,
                value: data.value,
                options: data.options,
            });
        };
        this.room = room;
        this.id = data.id;
        this.sourceData = {
            name: data.name,
            suit: data.suit,
            color: data.color === undefined
                ? sgs.utils.getColorBySuit(data.suit)
                : data.color,
            number: data.number,
            attr: data.attr.slice(),
        };
    }
    get name() {
        const name = this.room
            .getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'name',
            this.sourceData.name,
        ])
            .at(-1);
        if (this.room.hasMark('wars.aozhan') &&
            this.sourceData.name === 'tao' &&
            !name) {
            return 'aozhan';
        }
        return name ? name : this.sourceData.name;
    }
    get suit() {
        return (this.room
            .getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'suit',
            this.sourceData.suit,
        ])
            .at(-1) ?? this.sourceData.suit);
    }
    get number() {
        let number = this.room
            .getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'number',
            this.sourceData.number,
        ])
            .at(-1) ?? this.sourceData.number;
        return number;
    }
    get color() {
        return (this.room
            .getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'color',
            this.sourceData.color,
        ])
            .at(-1) ?? sgs.utils.getColorBySuit(this.suit));
    }
    get attr() {
        const attrs = this.sourceData.attr.slice();
        const states = this.room.getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'attrs',
            attrs,
        ]);
        attrs.push(...states);
        return attrs;
    }
    get put() {
        return (this.room
            .getStates(skill_types_1.StateEffectType.Regard_CardData, [
            this,
            'put',
            this._put,
        ])
            .at(-1) ?? this._put);
    }
    set put(value) {
        this._put = value;
    }
    get type() {
        return sgs.utils.getCardType(this.name);
    }
    get subtype() {
        return sgs.utils.getCardSubtype(this.name);
    }
    /** 是否为衍生牌 */
    get derived() {
        return this.data.derived;
    }
    /** 将此牌翻转朝向 */
    turnTo(put) {
        this._put = put;
        this.room.propertyChanges.push(['card', this.id, 'put', put]);
    }
    set clear_visible(value) {
        this.visibles.length = 0;
        this.room.propertyChanges.push([
            'card',
            this.id,
            'clear_visible',
            value,
        ]);
    }
    /** 设置卡牌对某些角色可见 */
    setVisible(...args) {
        args.forEach((v) => {
            if (!v.includes('@reduce:')) {
                this._visibles.push(v);
            }
            else {
                lodash.remove(this._visibles, (c) => c === v.slice(8));
            }
        });
        this.room.propertyChanges.push(['card', this.id, 'visibles', args]);
    }
    set visibles(value) {
        this.setVisible(...value);
    }
    get visibles() {
        return this._visibles.slice();
    }
    /** 检测该卡牌是否对某角色可见
     * @param player 检测玩家
     */
    canVisible(player) {
        // if (player.playerId === 'alone') return true;
        if (this.put === 1 /* CardPut.Up */)
            return true;
        if (this.area && this.area.visibles.includes(player))
            return true;
        const v = !!this.visibles.find((v) => v.includes(player.playerId));
        if (v)
            return true;
        return this.room
            .getStates(skill_types_1.StateEffectType.FieldCardEyes, [player, this])
            .some((v) => v);
    }
    setLabel(label, only_process = true) {
        this.room.propertyChanges.push([
            'card',
            this.id,
            'label',
            JSON.stringify({
                label,
                only_process,
            }),
        ]);
    }
    /** 将此牌直接转化成虚拟牌数据
     * @param use_source 使用原始数据
     */
    formatVdata(use_source = false) {
        return {
            id: '',
            name: use_source ? this.sourceData.name : this.name,
            suit: use_source ? this.sourceData.suit : this.suit,
            color: use_source ? this.sourceData.color : this.color,
            number: use_source ? this.sourceData.number : this.number,
            attr: use_source ? this.sourceData.attr : this.attr,
            subcards: [this.id],
            custom: {},
        };
    }
}
exports.GameCard = GameCard;
