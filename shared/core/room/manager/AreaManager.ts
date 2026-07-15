import { ArraySchema } from '@colyseus/schema';
import { AreaId, GameCardId } from '@shared/core/card/CardTypes';
import { Room } from '../Room';
import { GameCard } from '@shared/core/card/GameCard';

/**
 * 区域管理器 — 卡牌区域的增删查改、洗牌、移动。
 * 数据存储在 RoomState.cardAreas（MapSchema<ArraySchema<number>>）。
 */
export class AreaManager {
    constructor(readonly room: Room) {}

    /**
     * 向区域添加卡牌 ID 并更新每张牌的 state.area。
     * @param pos 插入位置：'top' | 'bottom' | 'random' | 精确索引
     */
    add(
        areaId: AreaId,
        cardIds: GameCardId[],
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ) {
        const cards = this.get(areaId) || new ArraySchema<number>();
        for (const id of cardIds) {
            if (cards.includes(id)) continue;
            cards.splice(this.addIndex(pos, cards.length), 0, id);
            const card = this.room.cards.get(id);
            if (card) card.setArea(areaId);
        }
        this.room.state.cardAreas.set(areaId, cards);
    }

    /** 从区域移除卡牌 ID */
    remove(areaId: AreaId, cardIds: GameCardId[]) {
        const cards = this.get(areaId);
        if (cards) {
            for (const id of cardIds) {
                const i = cards.indexOf(id);
                if (i >= 0) cards.splice(i, 1);
            }
        }
    }

    /** 获取区域的卡牌 ID 数组 */
    get(areaId: AreaId): ArraySchema<number> | undefined {
        return this.room.state.cardAreas.get(areaId);
    }

    /**
     * 从区域获取 count 张卡牌 ID（不移除）。
     * @param pos 'top' | 'bottom' | 'random' | 精确索引
     */
    getCards(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
    ): number[] {
        const cards = this.get(areaId);
        if (!cards) return [];
        if (typeof pos === 'number') {
            const i = pos < 0 ? cards.length + pos : pos;
            return i >= 0 && i < cards.length ? [cards[i]] : [];
        }
        if (cards.length <= count) return [...cards];
        if (pos === 'top') return cards.slice(0, count);
        if (pos === 'bottom') return cards.slice(-count);
        return this.randomPick([...cards], count);
    }

    /** 获取单张卡牌 ID */
    getOneCard(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
    ): number | undefined {
        return this.getCards(areaId, 1, pos)[0];
    }

    /**
     * 按条件筛选卡牌 ID。
     * @param fn 接收 GameCard 实体，返回是否匹配
     */
    filter(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: GameCard) => boolean,
    ): number[] {
        const cards = this.get(areaId);
        let matched: number[] = [];
        if (cards) {
            for (const id of cards) {
                const card = this.room.cards.get(id);
                if (card && fn(card)) matched.push(id);
            }
            if (pos === 'bottom') matched.reverse();
            if (pos === 'random')
                matched = this.randomPick(matched, matched.length);
            if (typeof pos === 'number') {
                const i = pos < 0 ? matched.length + pos : pos;
                return i >= 0 && i < matched.length ? [matched[i]] : [];
            }
        }
        return matched.slice(0, count);
    }

    /** 按条件筛选单张卡牌 ID */
    filterOne(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: GameCard) => boolean,
    ): number | undefined {
        return this.filter(areaId, 1, pos, fn)[0];
    }

    /** 将卡牌从 from 区域移动到 to 区域 */
    move(
        cardIds: GameCardId[],
        from: AreaId,
        to: AreaId,
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ) {
        this.remove(from, cardIds);
        this.add(to, cardIds, pos);
    }

    /**
     * 洗牌。不传 targetIds 时全量 Fisher-Yates 洗牌；
     * 传 targetIds 时将这些 ID 随机重插入。
     */
    shuffle(areaId: string, targetIds?: number[]) {
        const cards = this.get(areaId);
        if (!cards) return;
        if (targetIds && targetIds.length > 0) {
            for (const id of targetIds) {
                const i = cards.indexOf(id);
                if (i >= 0) {
                    cards.splice(i, 1);
                    cards.splice(
                        Math.floor(Math.random() * cards.length),
                        0,
                        id,
                    );
                }
            }
        } else {
            const arr = [...cards];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            cards.splice(0, cards.length, ...arr);
        }
    }

    /** 计算插入位置 */
    private addIndex(
        pos: 'top' | 'bottom' | 'random' | number,
        len: number,
    ): number {
        if (typeof pos === 'number') return Math.max(0, Math.min(pos, len));
        if (pos === 'top') return 0;
        if (pos === 'bottom') return len;
        return Math.floor(Math.random() * (len + 1));
    }

    /** 从数组中随机取 count 个元素（不修改原数组） */
    private randomPick<T>(arr: T[], count: number): T[] {
        const result: T[] = [];
        const pool = [...arr];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
            result.push(
                pool.splice(Math.floor(Math.random() * pool.length), 1)[0],
            );
        }
        return result;
    }
}
