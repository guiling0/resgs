/**
 * 通用对象池，封装 Laya.Pool 并提供类型安全。
 */
export class ObjectPool<T> {
    private _sign: string;
    private _create: () => T;
    private _reset: ((item: T) => void) | null;

    /**
     * @param sign  池标识（全局唯一，用于 Laya.Pool 内部索引）
     * @param create  工厂函数
     * @param reset   回收前重置（可选）
     */
    constructor(sign: string, create: () => T, reset?: (item: T) => void) {
        this._sign = sign;
        this._create = create;
        this._reset = reset ?? null;
    }

    /** 从池中获取一个实例 */
    acquire(): T {
        return Laya.Pool.getItemByCreateFun(this._sign, this._create);
    }

    /** 回收到池 */
    release(item: T): void {
        if (this._reset) {
            this._reset(item);
        }
        Laya.Pool.recover(this._sign, item);
    }

    /** 预创建若干实例放入池 */
    preload(count: number): void {
        for (let i = 0; i < count; i++) {
            const item = this._create();
            Laya.Pool.recover(this._sign, item);
        }
    }
}
