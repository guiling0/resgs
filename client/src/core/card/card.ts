import { Area } from '../area/area';
import { SetMark } from '../custom/custom';
import { CustomString } from '../custom/custom.type';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { StateEffectType } from '../skill/skill.types';
import {
    CardPut,
    CardSuit,
    GameCardData,
    GameCardId,
    VirtualCardData,
} from './card.types';
import { ICard } from './icard';
import { VirtualCard } from './vcard';

export class GameCard {
    public constructor(room: GameRoom, protected data: GameCardData) {
        this.room = room;
        this.id = data.id;
        this.sourceData = {
            name: data.name,
            suit: data.suit,
            color:
                data.color === undefined
                    ? sgs.utils.getColorBySuit(data.suit)
                    : data.color,
            number: data.number,
            attr: data.attr.slice(),
        };
    }

    /** 所属房间 */
    public readonly room: GameRoom;

    /** DataID */
    public readonly id: GameCardId;

    /** 所处区域 */
    public area: Area;

    /** 放置方式 */
    protected _put: CardPut;

    /** 可见角色 */
    public _visibles: string[] = [];

    /** 有对应关系的虚拟牌 */
    public vcard: VirtualCard;

    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void = (data) => {
        this.room.markChanges.push({
            objType: 'card',
            objId: this.id,
            key: data.key,
            value: data.value,
            options: data.options,
        });
    };

    public get name() {
        const name = this.room
            .getStates(StateEffectType.Regard_CardData, [
                this,
                'name',
                this.sourceData.name,
            ])
            .at(-1) as string;
        if (
            this.room.hasMark('wars.aozhan') &&
            this.sourceData.name === 'tao' &&
            !name
        ) {
            return 'aozhan';
        }
        return name ? name : this.sourceData.name;
    }

    public get suit(): CardSuit {
        return (
            this.room
                .getStates(StateEffectType.Regard_CardData, [
                    this,
                    'suit',
                    this.sourceData.suit,
                ])
                .at(-1) ?? this.sourceData.suit
        );
    }

    public get number() {
        let number =
            this.room
                .getStates(StateEffectType.Regard_CardData, [
                    this,
                    'number',
                    this.sourceData.number,
                ])
                .at(-1) ?? this.sourceData.number;
        return number;
    }

    public get color() {
        return (
            this.room
                .getStates(StateEffectType.Regard_CardData, [
                    this,
                    'color',
                    this.sourceData.color,
                ])
                .at(-1) ?? sgs.utils.getColorBySuit(this.suit)
        );
    }

    public get attr() {
        const attrs = this.sourceData.attr.slice();
        const states = this.room.getStates(StateEffectType.Regard_CardData, [
            this,
            'attrs',
            attrs,
        ]);
        attrs.push(...states);
        return attrs;
    }

    public get put() {
        return (
            this.room
                .getStates(StateEffectType.Regard_CardData, [
                    this,
                    'put',
                    this._put,
                ])
                .at(-1) ?? this._put
        );
    }

    public set put(value: CardPut) {
        this._put = value;
    }

    public get type() {
        return sgs.utils.getCardType(this.name);
    }

    public get subtype() {
        return sgs.utils.getCardSubtype(this.name);
    }

    /** 是否为衍生牌 */
    public get derived() {
        return this.data.derived;
    }

    /** 将此牌翻转朝向 */
    public turnTo(put: CardPut) {
        this._put = put;
        this.room.propertyChanges.push(['card', this.id, 'put', put]);
    }

    public set clear_visible(value: boolean) {
        this.visibles.length = 0;
        this.room.propertyChanges.push([
            'card',
            this.id,
            'clear_visible',
            value,
        ]);
    }

    /** 设置卡牌对某些角色可见 */
    public setVisible(...args: string[]) {
        args.forEach((v) => {
            if (!v.includes('@reduce:')) {
                this._visibles.push(v);
            } else {
                lodash.remove(this._visibles, (c) => c === v.slice(8));
            }
        });
        this.room.propertyChanges.push(['card', this.id, 'visibles', args]);
    }

    public set visibles(value: string[]) {
        this.setVisible(...value);
    }

    public get visibles() {
        return this._visibles.slice();
    }

    /** 检测该卡牌是否对某角色可见
     * @param player 检测玩家
     */
    public canVisible(player: GamePlayer) {
        // if (player.playerId === 'alone') return true;
        if (this.put === CardPut.Up) return true;
        if (this.area && this.area.visibles.includes(player)) return true;
        const v = !!this.visibles.find((v) => v.includes(player.playerId));
        if (v) return true;
        return this.room
            .getStates(StateEffectType.FieldCardEyes, [player, this])
            .some((v) => v);
    }

    public setLabel(label: CustomString, only_process: boolean = true) {
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
    public formatVdata(use_source: boolean = false): VirtualCardData {
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

export interface GameCard extends ICard {}
