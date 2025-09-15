import { AreaId, AreaType } from './area.type';
import { GameRoom } from '../room/room';
import { GamePlayer } from '../player/player';
import { CardPut } from '../card/card.types';
import { GameCard } from '../card/card';
import { General } from '../general/general';

export class Area {
    /** 区域类型 */
    public type: AreaType;
    /** 所属房间 */
    public room: GameRoom;
    /** 所属玩家 */
    public player: GamePlayer;
    /** 默认放置方式 */
    public defaultPut: CardPut = CardPut.Down;
    /** 默认可见角色 */
    public visibles: GamePlayer[] = [];

    public init(
        type: AreaType,
        room: GameRoom,
        player?: GamePlayer,
        defaultPut: CardPut = CardPut.Down,
        visibles: GamePlayer[] = []
    ) {
        this.type = type;
        this.room = room;
        this.player = player;
        this.defaultPut = defaultPut;
        this.visibles.push(...visibles);
        this.room.areas.set(this.areaId, this);
    }

    /** 区域所有牌 */
    protected readonly _cards: GameCard[] = [];
    public get cards() {
        return this._cards.slice();
    }
    /** 区域所有武将牌 */
    protected readonly _generals: General[] = [];
    public get generals() {
        return this._generals.slice();
    }

    /** 是否废除 */
    public disable: boolean = false;

    /** 区域ID */
    public get areaId(): AreaId {
        if (this.player) {
            return `${this.player.playerId}.${this.type}`;
        } else {
            return `${this.type}`;
        }
    }

    /** 此区域中牌的数量 */
    public get count() {
        return this._cards.length;
    }

    /** 此区域中武将牌的数量 */
    public get generalCount() {
        return this._generals.length;
    }

    /** 是否为公共区域 */
    public get isPublic() {
        return !this.player;
    }

    /** 是否为私有区域 */
    public get isPrivate() {
        return !this.isPublic;
    }

    /** 是否为一名角色的区域 */
    public get isPlayer() {
        return (
            this.isPrivate &&
            [AreaType.Hand, AreaType.Equip, AreaType.Judge].includes(this.type)
        );
    }

    /** 向区域中增加牌 */
    public add(
        cards: (GameCard | General)[],
        pos: 'top' | 'bottom' = 'bottom'
    ) {
        cards.forEach((v) => {
            v.area = this;
            if (v instanceof GameCard) {
                if (!this._cards.includes(v)) {
                    if (pos === 'bottom') {
                        this._cards.push(v);
                    }
                    if (pos === 'top') {
                        this._cards.unshift(v);
                    }
                }
            } else {
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
    public remove(cards: (GameCard | General)[]) {
        cards.forEach((v) => {
            v.area = undefined;
            if (v instanceof GameCard) {
                lodash.remove(this._cards, (c) => c === v);
            } else {
                lodash.remove(this._generals, (c) => c === v);
            }
        });
    }

    /** 判断区域中是否有指定的牌 */
    public has(card: GameCard | General) {
        if (card instanceof GameCard) {
            this._cards.includes(card);
        } else {
            this._generals.includes(card);
        }
    }

    /** 将此区域内的牌洗混 */
    public shuffle() {
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
    public get<T extends GameCard | General>(
        count: number,
        type: new (...args: any[]) => T,
        pos: 'top' | 'bottom' | 'random' = 'top',
        filter?: (card: T) => boolean
    ): T[] {
        const result: T[] = [];
        if (filter) {
            const arr = type === GameCard ? this.cards : this.generals;
            if (pos === 'bottom') arr.reverse();
            const _count = type === GameCard ? this.count : this.generalCount;
            for (let i = 0; i < _count; i++) {
                const card = arr[i];
                if (card instanceof type && filter(card)) {
                    result.push(card);
                    if (result.length === count) break;
                }
            }
        } else {
            if (type === GameCard) {
                if (this.count <= count) return this.cards as T[];
                if (pos === 'top') return this._cards.slice(0, count) as T[];
                if (pos === 'bottom') return this._cards.slice(-count) as T[];
                for (let i = 0; i < count; i++) {
                    const random = sgs.utils.randomInt(0, this.count - 1);
                    if (result.includes(this._cards[random] as T)) {
                        i--;
                    } else {
                        result.push(this._cards[random] as T);
                    }
                }
            } else {
                if (this.generalCount <= count) return this.generals as T[];
                if (pos === 'top') return this._generals.slice(0, count) as T[];
                if (pos === 'bottom')
                    return this._generals.slice(-count) as T[];
                for (let i = 0; i < count; i++) {
                    const random = sgs.utils.randomInt(
                        0,
                        this.generalCount - 1
                    );
                    if (result.includes(this._generals[random] as T)) {
                        i--;
                    } else {
                        result.push(this._generals[random] as T);
                    }
                }
            }
        }
        return result;
    }
}
