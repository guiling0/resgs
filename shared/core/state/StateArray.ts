import { StateNode } from './StateNode';
import { toSyncValue } from './StateTypes';
import type { Primitive } from './StateTypes';

/**
 * 数组同步容器（@syncArray 的运行时形态），元素仅限简单类型（number/string/boolean 或联合类型）。
 * insert/remove/replace 产生 arr.insert / arr.remove / arr.replace 补丁（索引级增量传输）。
 */
export class StateArray<T extends Primitive> extends StateNode {
    private _arr: T[] = [];

    get length(): number {
        return this._arr.length;
    }

    at(index: number): T | undefined {
        return this._arr[index];
    }

    /** 拷贝为普通数组 */
    toArray(): T[] {
        return [...this._arr];
    }

    /** 快照（序列化用） */
    snapshot(): unknown[] {
        return this._arr.map(toSyncValue);
    }

    /** 在 index 处插入元素：产生 arr.insert 补丁 */
    insert(index: number, value: T): void {
        this._arr.splice(index, 0, value);
        this._store?.markDirty({ kind: 'arr.insert', path: this._path ?? '', index, value: toSyncValue(value) as Primitive });
    }

    /** 移除 index 处元素：产生 arr.remove 补丁 */
    remove(index: number): void {
        this._arr.splice(index, 1);
        this._store?.markDirty({ kind: 'arr.remove', path: this._path ?? '', index });
    }

    /** 替换 index 处元素：产生 arr.replace 补丁 */
    replace(index: number, value: T): void {
        this._arr[index] = value;
        this._store?.markDirty({ kind: 'arr.replace', path: this._path ?? '', index, value: toSyncValue(value) as Primitive });
    }

    /** 尾部追加 */
    push(value: T): void {
        this.insert(this._arr.length, value);
    }

    /** 尾部弹出 */
    pop(): T | undefined {
        const v = this._arr[this._arr.length - 1];
        if (v !== undefined) this.remove(this._arr.length - 1);
        return v;
    }

    /** 清空全部元素 */
    clear(): void {
        while (this._arr.length) this.remove(0);
    }
}
