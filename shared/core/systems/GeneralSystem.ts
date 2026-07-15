import { ArraySchema, MapSchema } from '@colyseus/schema';
import { General } from '../general/General';
import { GeneralState } from '../schema/GeneralState';
import { CardPut } from '../card/CardTypes';

export class GeneralSystem {
    static add(
        cards: ArraySchema<string>,
        ids: string[],
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ) {
        for (const id of ids) {
            if (cards.includes(id)) continue;
            cards.splice(GeneralSystem.addIndex(pos, cards.length), 0, id);
        }
    }

    static remove(cards: ArraySchema<string>, ids: string[]) {
        for (const id of ids) {
            const i = cards.indexOf(id);
            if (i >= 0) cards.splice(i, 1);
        }
    }

    static get(
        cards: ArraySchema<string>,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
    ): string[] {
        if (typeof pos === 'number') {
            const i = pos < 0 ? cards.length + pos : pos;
            return i >= 0 && i < cards.length ? [cards[i]] : [];
        }
        if (cards.length <= count) return [...cards];
        if (pos === 'top') return cards.slice(0, count);
        if (pos === 'bottom') return cards.slice(-count);
        return GeneralSystem.randomPick([...cards], count);
    }

    static getOne(
        cards: ArraySchema<string>,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
    ): string | undefined {
        return GeneralSystem.get(cards, 1, pos)[0];
    }

    static filter(
        ids: string[],
        cardMap: Map<string, General>,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: General) => boolean,
    ): string[] {
        let matched: string[] = [];
        for (const id of ids) {
            const card = cardMap.get(id);
            if (card && fn(card)) matched.push(id);
        }
        if (pos === 'bottom') matched.reverse();
        if (pos === 'random')
            matched = GeneralSystem.randomPick(matched, matched.length);
        if (typeof pos === 'number') {
            const i = pos < 0 ? matched.length + pos : pos;
            return i >= 0 && i < matched.length ? [matched[i]] : [];
        }
        return matched.slice(0, count);
    }

    static filterOne(
        ids: string[],
        cardMap: Map<string, General>,
        pos: 'top' | 'bottom' | 'random' | number = 'top',
        fn: (card: General) => boolean,
    ) {
        return this.filter(ids, cardMap, 1, pos, fn)[0];
    }

    static move(
        ids: string[],
        from: ArraySchema<string>,
        to: ArraySchema<string>,
        pos: 'top' | 'bottom' | 'random' | number = 'bottom',
    ) {
        GeneralSystem.remove(from, ids);
        GeneralSystem.add(to, ids, pos);
    }

    static shuffle(cards: ArraySchema<string>, targetIds?: string[]) {
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

    static ensureCardState(
        states: MapSchema<GeneralState>,
        cardId: string,
    ): GeneralState {
        const key = String(cardId);
        if (!states.has(key)) {
            const cs = new GeneralState();
            cs.id = cardId;
            states.set(key, cs);
        }
        return states.get(key)!;
    }

    static setArea(
        states: MapSchema<GeneralState>,
        cardId: string,
        area: string,
    ) {
        GeneralSystem.ensureCardState(states, cardId).area = area;
    }

    static setPut(
        states: MapSchema<GeneralState>,
        cardId: string,
        put: CardPut,
    ) {
        GeneralSystem.ensureCardState(states, cardId).put = put;
    }

    static setLabel(
        states: MapSchema<GeneralState>,
        cardId: string,
        label: string,
    ) {
        GeneralSystem.ensureCardState(states, cardId).label = label;
    }

    static removeState(states: MapSchema<GeneralState>, cardId: string) {
        states.delete(String(cardId));
    }

    private static addIndex(
        pos: 'top' | 'bottom' | 'random' | number,
        len: number,
    ): number {
        if (typeof pos === 'number') return Math.max(0, Math.min(pos, len));
        if (pos === 'top') return 0;
        if (pos === 'bottom') return len;
        return Math.floor(Math.random() * (len + 1));
    }

    private static randomPick<T>(arr: T[], count: number): T[] {
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
