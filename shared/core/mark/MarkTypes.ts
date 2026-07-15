import { RichStringValue } from '../RichText';
import { MapSchema } from '@colyseus/schema';
import { MarkState } from '../schema/MarkState';
import { Room } from '../room/Room';

export interface MarkOptions {
    /** 来源 */
    source?: string;
    /** 是否可见 */
    visible?: boolean | string[];
    /** 仅针对string类型标记，动态显示内容会根据此对象进行解析 */
    values?: Record<string, RichStringValue>;
    /** 解析类型 */
    parseType?:
        | 'img'
        | 'card'
        | 'general'
        | 'command'
        | 'prompt'
        | 'suit'
        | 'color'
        | 'card_number'
        | 'area';
    ref?: {
        area: string; // 区域标识，如 "hand_p1"
        mark: string; // 标记名，如 "&red"
    };
}

export interface MarkHost {
    room: Room;
    data: Record<string, any>;
    marksMap: MapSchema<MarkState>;
    _markKeyMap: Map<string, Set<string>>;
}

function parseKey(rawKey: string): {
    originalKey: string;
    tags: string[];
} {
    const parts = rawKey.split('@');
    return {
        originalKey: parts[0],
        tags: parts.slice(1),
    };
}

function setMark<T>(
    this: MarkHost,
    rawKey: string,
    value: T,
    options?: MarkOptions,
) {
    const { originalKey } = parseKey(rawKey);
    if (!this._markKeyMap.has(originalKey)) {
        this._markKeyMap.set(originalKey, new Set());
    }
    this._markKeyMap.get(originalKey)!.add(rawKey);

    let mk = this.marksMap.get(rawKey);
    if (!mk) {
        mk = new MarkState();
        mk.key = rawKey;
        this.marksMap.set(rawKey, mk);
    }
    mk.value = JSON.stringify(value);
    if (options?.source) {
        mk.source = options.source;
    }
    if (options?.visible !== undefined) {
        const arr = Array.isArray(options.visible)
            ? options.visible
            : options.visible
              ? this.room.players.map((player) => player.playerId)
              : [];
        mk.visible.splice(0, mk.visible.length, ...arr);
    }
    if (options?.values) {
        mk.values = JSON.stringify(options.values);
    }
    if (options?.parseType) {
        mk.parseType = options.parseType;
    }
    if (options?.ref) {
        mk.refType = 'area';
        mk.refArea = options.ref.area;
        mk.refMark = options.ref.mark;
        mk.value = ''; // 动态引用的 value 由客户端维护
    }
    this.data[originalKey] = value;
}

function getMark<T>(this: MarkHost, rawKey: string): T | undefined {
    const { originalKey } = parseKey(rawKey);
    return this.data[originalKey] as T;
}

function removeMark(this: MarkHost, rawKey: string) {
    const { originalKey } = parseKey(rawKey);
    const fullKeys = this._markKeyMap.get(originalKey);
    if (fullKeys) {
        for (const fk of fullKeys) this.marksMap.delete(fk);
        this._markKeyMap.delete(originalKey);
    }
    delete this.data[originalKey];
}

function hasMark(this: MarkHost, rawKey: string): boolean {
    return parseKey(rawKey).originalKey in this.data;
}

function countMark(
    this: MarkHost,
    rawKey: string,
    value: number,
    options?: MarkOptions,
) {
    const val = ((getMark.call(this, rawKey) as number) ?? 0) + value;
    setMark.call(this, rawKey, val, options);
}

function pushMark<T>(
    this: MarkHost,
    rawKey: string,
    item: T,
    options?: MarkOptions,
) {
    const arr = ((getMark.call(this, rawKey) as T[]) ?? []) as T[];
    if (!arr.includes(item)) {
        arr.push(item);
        setMark.call(this, rawKey, arr, options);
    }
}

function unpushMark<T>(
    this: MarkHost,
    rawKey: string,
    item: T,
    options?: MarkOptions,
) {
    const arr = ((getMark.call(this, rawKey) as T[]) ?? []) as T[];
    const idx = arr.indexOf(item);
    if (idx >= 0) {
        arr.splice(idx, 1);
        setMark.call(this, rawKey, arr);
    }
}

function clearMark(this: MarkHost, tag?: string) {
    const keysToRemove: string[] = [];
    for (const [originalKey, fullKeys] of this._markKeyMap.entries()) {
        if (!tag) {
            // 清理所有没有 'never' 标签的标记
            let hasNever = false;
            for (const fullKey of fullKeys) {
                const { tags } = parseKey(fullKey);
                if (tags.includes('never')) {
                    hasNever = true;
                    break;
                }
            }
            if (!hasNever) {
                keysToRemove.push(originalKey);
            }
        } else {
            // 清理所有带指定 tag 的标记
            for (const fullKey of fullKeys) {
                const { tags } = parseKey(fullKey);
                if (tags.includes(tag)) {
                    keysToRemove.push(originalKey);
                    break;
                }
            }
        }
    }
    for (const key of keysToRemove) removeMark.call(this, key);
}

export const MarkMethods = {
    parseKey,
    setMark,
    getMark,
    removeMark,
    hasMark,
    countMark,
    pushMark,
    unpushMark,
    clearMark,
};
