import { StateNode } from '../state/StateNode';
import { StateMap } from '../state/StateMap';
import { syncMap } from '../state/decorators';

/** 解析后的标签 */
export interface MarkTag {
    name: string;
    data?: string;
}

/** 生命周期 */
export interface MarkLife {
    // TODO when 待改为时机枚举类型（时机枚举定义后替换）
    when: string;
    before: boolean;
}

/** 标记键解析结果 */
export interface ParsedMarkKey {
    originalKey: string;
    tags: MarkTag[];
    life?: MarkLife;
}

/** 分离段尾生命周期：-when（该时机之后清理）/ --when（该时机之前清理） */
function parseLife(segment: string): { body: string; life?: MarkLife } {
    const m2 = /^(.*?)--([A-Za-z0-9_]+)$/.exec(segment);
    if (m2) return { body: m2[1], life: { when: m2[2], before: true } };
    const m1 = /^(.*?)-([A-Za-z0-9_]+)$/.exec(segment);
    if (m1) return { body: m1[1], life: { when: m1[2], before: false } };
    return { body: segment };
}

/** 拆解标记键：key[@tag[:data]...][-when | --when] */
export function parseMarkKey(rawKey: string): ParsedMarkKey {
    const parts = rawKey.split('@');
    const originalKey = parts[0];
    const tags: MarkTag[] = [];
    let life: MarkLife | undefined;
    for (let i = 1; i < parts.length; i++) {
        const { body, life: segLife } = parseLife(parts[i]);
        if (segLife) life = segLife;
        if (!body) continue;
        const colon = body.indexOf(':');
        if (colon === -1) tags.push({ name: body });
        else tags.push({ name: body.slice(0, colon), data: body.slice(colon + 1) });
    }
    return { originalKey, tags, life };
}

/** @card / @general：值对象转为 id 存储 */
function toStoredValue(parsed: ParsedMarkKey, value: unknown): unknown {
    const isIdTag = parsed.tags.some((t) => t.name === 'card' || t.name === 'general');
    if (!isIdTag) return value;
    const extract = (v: unknown): unknown =>
        v && typeof v === 'object' && 'id' in v ? (v as { id: unknown }).id : v;
    return Array.isArray(value) ? value.map(extract) : extract(value);
}

/**
 * 标记抽象类——需要标记能力的实体继承本类（Room/Player/GameCard/General/Skill/Effect）。
 * 标记键格式：key[@tag[:data]...][-when | --when]，见 docs/develop/mark-key.md。
 * data 为运行时值快照（不序列化），marks 经 @syncMap 自动同步（全量传给镜像端，可见性仅影响 UI 显示）。
 */
export abstract class Mark extends StateNode {
    /** 运行时值快照（原始键 → 值，仅权威端读） */
    data: Record<string, unknown> = {};
    /** 标记容器（key 为含标签全键，value 为可序列化值） */
    @syncMap() marks: StateMap<string, unknown> = new StateMap();
    /** 原始键 → 最新全键（含标签）索引 */
    _markKeyMap = new Map<string, string>();
    /** 部分可见：原始键 → 可见玩家列表（仅权威端，UI 显示过滤用） */
    _visibility = new Map<string, string[]>();

    /** 拆解标记键 */
    parseKey(rawKey: string): ParsedMarkKey {
        return parseMarkKey(rawKey);
    }

    /** 是否存在标签 */
    hasTag(rawKey: string, tagName: string): boolean {
        return this.parseKey(rawKey).tags.some((t) => t.name === tagName);
    }

    /** 读取标签数据 */
    getTagData(rawKey: string, tagName: string): string | undefined {
        return this.parseKey(rawKey).tags.find((t) => t.name === tagName)?.data;
    }

    /** 写入标记：@card/@general 值对象转 id 存储，原对象（数组浅拷贝）备份至 data；@ref 存 true 占位 */
    setMark<T>(rawKey: string, value: T, visible?: string[]): void {
        const parsed = this.parseKey(rawKey);
        const { originalKey } = parsed;
        // 同一原始键仅保留最新变体：先移除旧全键，再注册新全键
        const oldKey = this._markKeyMap.get(originalKey);
        if (oldKey !== undefined && oldKey !== rawKey) {
            this.marks.delete(oldKey);
        }
        this._markKeyMap.set(originalKey, rawKey);

        const hasRef = parsed.tags.some((t) => t.name === 'ref');
        const stored = hasRef ? true : toStoredValue(parsed, value);
        this.marks.set(rawKey, stored);
        const backup = Array.isArray(value) ? (value as unknown[]).slice() : value;
        this.data[originalKey] = hasRef ? true : backup;
        if (visible) this._visibility.set(originalKey, visible);
    }

    /**
     * 读取标记（忽略标签与生命周期，按原始键读取；@ref 依赖区域与卡牌实体，待实现）
     * @param assert 类型/值断言：传构造函数（如 GameCard）仅确定 T；传值则同时作为标记不存在时的默认值
     */
    getMark<T>(rawKey: string, assert?: T | (new (...args: never[]) => T)): T | undefined {
        // TODO @card/@general 标签：marks 已转 id 存储，getMark 应经 id 反查实体对象（依赖区域/注册表实体解析，待就绪后实现）
        const parsed = this.parseKey(rawKey);
        const fullKey = this._markKeyMap.get(parsed.originalKey);
        // ref 由 set 时标签决定，而非 get 时传入的标签
        if (fullKey !== undefined && this.parseKey(fullKey).tags.some((t) => t.name === 'ref')) {
            // TODO 依赖区域与卡牌/武将实体：返回指定区域下带标记的卡牌/武将牌
            return undefined;
        }
        const v = fullKey === undefined ? undefined : this.marks.get(fullKey);
        if (v === undefined) {
            return typeof assert === 'function' ? undefined : (assert as T);
        }
        return v as T;
    }

    /** 是否存在标记（忽略标签） */
    hasMark(rawKey: string): boolean {
        const { originalKey } = this.parseKey(rawKey);
        return originalKey in this.data;
    }

    /**
     * 弃标记：删除指定标记
     * @rules terms/card-op-terms/removeMark
     * @description 弃是失去标记的操作；按原始键删除其全部带标签变体及数据备份
     * @param rawKey 标记原始键（忽略标签与生命周期）
     */
    removeMark(rawKey: string): void {
        const { originalKey } = this.parseKey(rawKey);
        const fullKey = this._markKeyMap.get(originalKey);
        if (fullKey !== undefined) {
            this.marks.delete(fullKey);
            this._markKeyMap.delete(originalKey);
        }
        delete this.data[originalKey];
        this._visibility.delete(originalKey);
    }

    /** 数值加减标记 */
    countMark(rawKey: string, delta: number): void {
        const value = (this.getMark<number>(rawKey) ?? 0) + delta;
        this.setMark(rawKey, value);
    }

    /** 数组去重追加 */
    pushMark<T>(rawKey: string, item: T): void {
        const arr = (this.getMark<T[]>(rawKey) ?? []) as T[];
        if (!arr.includes(item)) {
            arr.push(item);
            this.setMark(rawKey, arr);
        }
    }

    /** 数组移除 */
    unpushMark<T>(rawKey: string, item: T): void {
        const arr = (this.getMark<T[]>(rawKey) ?? []) as T[];
        const idx = arr.indexOf(item);
        if (idx >= 0) {
            arr.splice(idx, 1);
            this.setMark(rawKey, arr);
        }
    }

    /** 按标签清理标记；无标签时清理全部非 @never 标记 */
    clearMark(tag?: string): void {
        const keysToRemove: string[] = [];
        for (const [originalKey, fullKey] of this._markKeyMap.entries()) {
            if (!tag) {
                if (!this.hasTag(fullKey, 'never')) keysToRemove.push(originalKey);
            } else if (this.hasTag(fullKey, tag)) {
                keysToRemove.push(originalKey);
            }
        }
        for (const key of keysToRemove) {
            this.removeMark(key);
        }
    }

    /** 按生命周期时机清理（该时机后 / 该时机前），优先级高于 @never */
    clearMarkByLife(when: string, before: boolean): void {
        const keysToRemove: string[] = [];
        for (const [originalKey, fullKey] of this._markKeyMap.entries()) {
            const life = this.parseKey(fullKey).life;
            if (life && life.when === when && life.before === before) {
                keysToRemove.push(originalKey);
            }
        }
        for (const key of keysToRemove) {
            this.removeMark(key);
        }
    }

    /** 设置部分可见玩家（覆盖 key 默认显示语义，仅权威端） */
    setVisible(rawKey: string, playerIds: string[]): void {
        const { originalKey } = this.parseKey(rawKey);
        this._visibility.set(originalKey, playerIds);
    }

    /** 读取部分可见玩家列表 */
    getVisible(rawKey: string): string[] | undefined {
        const { originalKey } = this.parseKey(rawKey);
        return this._visibility.get(originalKey);
    }

    /** 清除部分可见设置（恢复 key 标签默认显示语义） */
    clearVisible(rawKey: string): void {
        const { originalKey } = this.parseKey(rawKey);
        this._visibility.delete(originalKey);
    }
}
