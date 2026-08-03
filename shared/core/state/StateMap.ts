import { StateNode } from './StateNode';
import { isSyncNode, joinPath, toSyncValue } from './StateTypes';

/**
 * key-value 同步容器（@syncMap 的运行时形态）。
 * set/delete/clear 产生 map.add / map.remove 补丁；值为同步节点时自动挂载（注入宿主与 path）。
 */
export class StateMap<K extends string, V> extends StateNode {
    private _map = new Map<K, V>();

    get size(): number {
        return this._map.size;
    }

    has(key: K): boolean {
        return this._map.has(key);
    }

    get(key: K): V | undefined {
        return this._map.get(key);
    }

    keys(): IterableIterator<K> {
        return this._map.keys();
    }

    values(): IterableIterator<V> {
        return this._map.values();
    }

    entries(): IterableIterator<[K, V]> {
        return this._map.entries();
    }

    forEach(fn: (value: V, key: K) => void): void {
        this._map.forEach(fn);
    }

    /** 快照（序列化用） */
    snapshot(): Record<string, unknown> {
        const out: Record<string, unknown> = {};
        this.forEach((v, k) => {
            out[k] = toSyncValue(v);
        });
        return out;
    }

    /** 设置条目：同步节点自动挂载；产生 map.add 补丁 */
    set(key: K, value: V): this {
        this._map.set(key, value);
        if (isSyncNode(value) && this._store && this._path !== undefined) {
            this._store.attach(value as unknown as StateNode, joinPath(this._path, key));
        }
        this._store?.markDirty({ kind: 'map.add', path: this._path ?? '', key, value: toSyncValue(value) });
        return this;
    }

    /** 删除条目：产生 map.remove 补丁 */
    delete(key: K): boolean {
        const existed = this._map.delete(key);
        if (existed) {
            this._store?.markDirty({ kind: 'map.remove', path: this._path ?? '', key });
        }
        return existed;
    }

    /** 清空全部条目 */
    clear(): void {
        for (const k of [...this._map.keys()]) this.delete(k);
    }
}
