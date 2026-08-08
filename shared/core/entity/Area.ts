import type { Room } from './Room';
import type { Player } from './Player';
import { GameCard } from './GameCard';
import { General } from './General';
import { AreaType } from '../types/AreaTypes';
import type { AreaId, CardPut } from '../types/AreaTypes';

/**
 * 区域——放置实体牌与武将牌的场所（公共区域或玩家私有区域）。
 * 无可同步属性，不继承 StateNode。
 */
export class Area {
    /** 区域类型 */
    readonly type: AreaType;
    /** 所属房间 */
    readonly room: Room;
    /** 所属玩家（公共区域为 undefined） */
    readonly player?: Player;
    /** 默认放置方式（牌进入区域时的面朝方向） */
    defaultPut: CardPut = false;
    /** 是否废除（封印） */
    disable: boolean = false;

    private readonly _cards: GameCard[] = [];
    private readonly _generals: General[] = [];

    constructor(room: Room, type: AreaType, player?: Player, defaultPut: CardPut = false) {
        this.room = room;
        this.type = type;
        this.player = player;
        this.defaultPut = defaultPut;
        this.room.areas.set(this.areaId, this);
    }

    /** 区域 id（玩家私有：'{playerId}.{type}'，公共：'{type}'） */
    get areaId(): AreaId {
        return this.player ? `${this.player.playerId}.${this.type}` : this.type;
    }

    /** 区域内的实体牌（副本） */
    get cards(): GameCard[] {
        return [...this._cards];
    }

    /** 区域内的武将牌（副本） */
    get generals(): General[] {
        return [...this._generals];
    }

    /** 实体牌数量 */
    get count(): number {
        return this._cards.length;
    }

    /** 武将牌数量 */
    get generalCount(): number {
        return this._generals.length;
    }

    /** 是否为公共区域 */
    get isPublic(): boolean {
        return !this.player;
    }

    /** 是否为玩家私有区域 */
    get isPrivate(): boolean {
        return !!this.player;
    }

    /** 是否为玩家角色区域（手牌/装备/判定区） */
    get isPlayer(): boolean {
        return this.isPrivate && [AreaType.Hand, AreaType.Equip, AreaType.Judge].includes(this.type);
    }

    /** 向区域加入牌（默认置底；top/bottom/random/指定下标），并记录牌所在区域 */
    add(cards: (GameCard | General)[], pos: 'top' | 'bottom' | 'random' | number = 'bottom'): void {
        for (const card of cards) {
            if (card instanceof GameCard) this.pushOne(this._cards, card, pos);
            else this.pushOne(this._generals, card, pos);
            card.area = this;
        }
    }

    private pushOne<T>(arr: T[], card: T, pos: 'top' | 'bottom' | 'random' | number): void {
        if (arr.includes(card)) return;
        if (typeof pos === 'number') {
            arr.splice(Math.min(Math.max(pos, 0), arr.length), 0, card);
        } else if (pos === 'top') {
            arr.unshift(card);
        } else if (pos === 'random') {
            arr.splice(this.room.randomInt(0, arr.length), 0, card);
        } else {
            arr.push(card);
        }
    }

    /** 从区域移除牌（同时清空牌所在区域记录） */
    remove(cards: (GameCard | General)[]): void {
        for (const card of cards) {
            if (card instanceof GameCard) this.removeOne(this._cards, card);
            else this.removeOne(this._generals, card);
            card.area = undefined;
        }
    }

    private removeOne<T>(arr: T[], card: T): void {
        const idx = arr.indexOf(card);
        if (idx >= 0) arr.splice(idx, 1);
    }

    /** 区域中是否含指定牌 */
    has(card: GameCard | General): boolean {
        return card instanceof GameCard ? this._cards.includes(card) : this._generals.includes(card);
    }

    /** 获取牌：按类型/位置/过滤条件取 count 张（不足时返回已有部分） */
    get<T extends GameCard | General>(
        count: number,
        type: new (...args: never[]) => T,
        pos: 'top' | 'bottom' | 'random' = 'top',
        filter?: (card: T) => boolean,
    ): T[] {
        const source = (type === GameCard ? this.cards : this.generals) as unknown as T[];
        if (pos === 'bottom') source.reverse();
        else if (pos === 'random') this.room.shuffle(source);
        const result: T[] = [];
        for (const card of source) {
            if (filter && !filter(card)) continue;
            result.push(card);
            if (result.length === count) break;
        }
        return result;
    }

    /** 获取一张牌（参数同 get） */
    getOne<T extends GameCard | General>(
        type: new (...args: never[]) => T,
        pos: 'top' | 'bottom' | 'random' = 'top',
        filter?: (card: T) => boolean,
    ): T | undefined {
        return this.get(1, type, pos, filter)[0];
    }

    /** 洗牌：kind 限定仅洗实体牌或仅洗武将牌（不提供洗全部）；cards 提供时仅打乱这些牌 */
    shuffle(kind?: 'cards' | 'generals', cards?: (GameCard | General)[]): void {
        if (cards && cards.length > 0) {
            // 仅打乱指定牌：移出打乱后随机放回
            this.remove(cards);
            this.room.shuffle(cards);
            this.add(cards, 'random');
            return;
        }
        const shuffleCards = !kind || kind === 'cards';
        const shuffleGenerals = !kind || kind === 'generals';
        if (shuffleCards) this.room.shuffle(this._cards);
        if (shuffleGenerals) this.room.shuffle(this._generals);
    }
}
