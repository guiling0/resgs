import { ArraySchema, MapSchema } from '@colyseus/schema';
import { AreaId, GameCardId, GameCard } from '../card';
import { Room } from './Room';
import { General, GeneralId } from '../general';
import { sampleRandom, shuffleArray } from '../utils';

/**
 * 区域 ID 联合类型：GameCardId = string, GeneralId = string
 */
type AreaItemId = GameCardId | GeneralId;

/**
 * 区域管理器 — 卡牌区域和武将区域的增删查改、洗牌、移动。
 *
 * 通过泛型自动判断 ID 类型：
 * - number → 操作 room.state.game.cardAreas（游戏牌）
 * - string → 操作 room.state.game.generalAreas（武将牌）
 */
export class AreaManager {
    constructor(readonly room: Room) {}

    /** 初始化区域（若不存在则创建空 ArraySchema）。isGeneral=true 创建武将区域 */
    initArea(areaId: AreaId, isGeneral: boolean = false): void {
        const targetMap = isGeneral
            ? this.room.state.game.generalAreas
            : this.room.state.game.cardAreas;
        if (!targetMap.get(areaId)) {
            const schema = isGeneral
                ? this.room.state.game.createGeneralArea()
                : this.room.state.game.createCardArea();
            (targetMap as any).$items.set(areaId, schema);
            (targetMap as any).$indexes.set(areaId, targetMap['$items'].size - 1);
        }
    }

    // ===== 内部：根据 ID 类型自动选择区域 Map =====

    /** 根据 ID 格式返回对应的区域 MapSchema——卡牌 ID 匹配 {扩展名}.{数字} */
    private _mapFor<T extends AreaItemId>(
        id: T,
    ): MapSchema<ArraySchema<T>> {
        if (typeof id === 'string' && /\.\d+$/.test(id)) {
            return this.room.state.game.cardAreas as unknown as MapSchema<
                ArraySchema<T>
            >;
        }
        return this.room.state.game.generalAreas as unknown as MapSchema<
            ArraySchema<T>
        >;
    }

    // ===== 添加 =====

    /**
     * 向区域添加 ID（卡牌或武将），自动判断区域类型。
     * @param pos 插入位置：'top' | 'bottom' | 'random' | 精确索引
     */
    add<T extends AreaItemId>(
        areaId: AreaId,
        ids: T[],
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ): void {
        if (ids.length === 0) return;
        const areaMap = this._mapFor(ids[0]);
        let cards = areaMap.get(areaId);
        // Colyseus MapSchema.set() 内部做 instanceof 检查，esbuild 环境下可能失败。
        // 绕过方式：首次设置时直接写入底层 $items Map，后续操作读出的实例可正常使用。
        if (!cards) {
            cards = (typeof ids[0] === 'string' && /\.\d+$/.test(ids[0])
                ? this.room.state.game.createCardArea()
                : this.room.state.game.createGeneralArea()) as unknown as ArraySchema<T>;
            (areaMap as any).$items.set(areaId, cards);
            (areaMap as any).$indexes.set(areaId, areaMap['$items'].size - 1);
        }
        for (const id of ids) {
            if (cards.includes(id)) continue;
            const idx = this._addIndex(pos, cards.length);
            const arr = [...cards];
            arr.splice(idx, 0, id);
            cards.splice(0, cards.length);
            for (const item of arr) cards.push(item);
            if (/\.\d+$/.test(id as string)) {
                const card = this.room.cards.get(id as string);
                if (card) card.setArea(areaId);
            } else {
                const general = this.room.generals.get(id as string);
                if (general) general.state.area = areaId;
            }
        }
    }

    // ===== 移除 =====

    /** 从区域移除 ID */
    remove<T extends AreaItemId>(areaId: AreaId, ids: T[]): void {
        const cards = this._mapFor(ids.length > 0 ? ids[0] : ('' as T)).get(areaId);
        if (cards) {
            for (const id of ids) {
                const i = cards.indexOf(id);
                if (i >= 0) cards.splice(i, 1);
            }
        }
    }

    // ===== 获取 =====

    /** 获取卡牌/武将区域的 ID 列表（均为 string[]） */
    get(areaId: AreaId, isGeneral?: boolean): ArraySchema<string> | undefined {
        if (isGeneral) return this.room.state.game.generalAreas.get(areaId);
        return this.room.state.game.cardAreas.get(areaId);
    }

    /**
     * 从区域获取 count 个 ID（不移除）。
     * @param pos 'top' | 'bottom' | 'random' | 精确索引
     */
    getCards(
        areaId: AreaId,
        count: number,
        pos?: 'top' | 'bottom' | 'random' | number,
        isGeneral?: boolean,
    ): string[] {
        const cards = isGeneral
            ? this.room.state.game.generalAreas.get(areaId)
            : this.room.state.game.cardAreas.get(areaId);
        if (!cards) return [];
        const arr = [...cards];
        if (typeof pos === 'number') {
            const i = pos < 0 ? arr.length + pos : pos;
            return i >= 0 && i < arr.length ? [arr[i]] : [];
        }
        if (arr.length <= count) return arr;
        if (pos === 'top') return arr.slice(0, count);
        if (pos === 'bottom') return arr.slice(-count);
        return this._randomPick(arr, count);
    }

    /** 获取单张 ID（卡牌或武将） */
    getOne(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        isGeneral: boolean = false,
    ): number | string | undefined {
        const cards = isGeneral
            ? this.room.state.game.generalAreas.get(areaId)
            : this.room.state.game.cardAreas.get(areaId);
        if (!cards || cards.length === 0) return undefined;
        if (typeof pos === 'number') {
            const i = pos < 0 ? cards.length + pos : pos;
            return i >= 0 && i < cards.length ? cards[i] : undefined;
        }
        if (pos === 'top') return cards[0];
        if (pos === 'bottom') return cards[cards.length - 1];
        return cards[Math.floor(Math.random() * cards.length)];
    }

    // ===== 筛选 =====

    /**
     * 按条件筛选卡牌 ID（仅游戏牌，需要 GameCard 实体）。
     */
    filterCards(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: GameCard) => boolean,
    ): string[] {
        const cards = this.get(areaId);
        let matched: string[] = [];
        if (cards) {
            for (const id of cards) {
                const card = this.room.cards.get(id);
                if (card && fn(card)) matched.push(id);
            }
            matched = this._applyPos(matched, pos);
        }
        return matched.slice(0, count);
    }

    /** 按条件筛选单张卡牌 ID */
    filterOneCard(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: GameCard) => boolean,
    ): string | undefined {
        return this.filterCards(areaId, 1, pos, fn)[0];
    }

    /**
     * 按条件筛选武将 ID。
     */
    filterGenerals(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (general: General) => boolean,
    ): string[] {
        const cards = this.get(areaId, true);
        let matched: string[] = [];
        if (cards) {
            for (const id of cards) {
                const general = this.room.generals.get(id);
                if (general && fn(general)) matched.push(id);
            }
            matched = this._applyPos(matched, pos);
        }
        return matched.slice(0, count);
    }

    /** 按条件筛选单张武将 ID */
    filterOneGeneral(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (general: General) => boolean,
    ): string | undefined {
        return this.filterGenerals(areaId, 1, pos, fn)[0];
    }

    // ===== 移动 =====

    /** 将 ID 从 from 区域移动到 to 区域 */
    move<T extends AreaItemId>(
        ids: T[],
        from: AreaId,
        to: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ): void {
        this.remove(from, ids);
        this.add(to, ids, pos);
    }

    // ===== 洗牌 =====

    /**
     * 洗牌（卡牌或武将）。
     * 不传 targetIds 时全量 Fisher-Yates 洗牌；
     * 传 targetIds 时将这些 ID 随机重插入。
     * @param isGeneral 是否为武将区域
     */
    shuffle(
        areaId: string,
        targetIds?: (number | string)[],
        isGeneral: boolean = false,
    ): void {
        // 通过泛型辅助方法操作具体的 ArraySchema 类型
        if (isGeneral) {
            this._shuffleImpl(this.room.state.game.generalAreas.get(areaId), targetIds as string[]);
        } else {
            this._shuffleImpl(this.room.state.game.cardAreas.get(areaId), targetIds as string[]);
        }
    }

    /** 洗牌实现（泛型，避免 union 类型冲突） */
    private _shuffleImpl<T>(
        cards: ArraySchema<T> | undefined,
        targetIds?: T[],
    ): void {
        if (!cards) return;
        const _rebuild = (arr: T[]) => {
            cards!.splice(0, cards!.length);
            for (const item of arr) cards!.push(item);
        };
        if (targetIds && targetIds.length > 0) {
            for (const id of targetIds) {
                const i = cards.indexOf(id);
                if (i >= 0) {
                    const arr = [...cards];
                    arr.splice(i, 1);
                    arr.splice(
                        Math.floor(Math.random() * (arr.length + 1)),
                        0,
                        id,
                    );
                    _rebuild(arr);
                }
            }
        } else {
            const arr = [...cards];
            shuffleArray(arr);
            _rebuild(arr);
        }
    }

    // ===== 内部辅助 =====

    /** 按位置参数排序/截取 */
    private _applyPos<T>(arr: T[], pos: 'top' | 'bottom' | 'random' | number): T[] {
        if (pos === 'bottom') return arr.reverse();
        if (pos === 'random') return this._randomPick(arr, arr.length);
        if (typeof pos === 'number') {
            const i = pos < 0 ? arr.length + pos : pos;
            return i >= 0 && i < arr.length ? [arr[i]] : [];
        }
        return arr;
    }

    /** 计算插入位置 */
    private _addIndex(
        pos: 'top' | 'bottom' | 'random' | number,
        len: number,
    ): number {
        if (typeof pos === 'number') return Math.max(0, Math.min(pos, len));
        if (pos === 'top') return 0;
        if (pos === 'bottom') return len;
        return Math.floor(Math.random() * (len + 1));
    }

    /** 从数组中随机取 count 个元素（不修改原数组） */
    private _randomPick<T>(arr: T[], count: number): T[] {
        return sampleRandom(arr, count);
    }
}
