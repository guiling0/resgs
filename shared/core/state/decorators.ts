import { StateMap } from './StateMap';
import { StateArray } from './StateArray';
import { joinPath, toSyncValue } from './StateTypes';
import type { SyncFieldMeta, StateStoreHost } from './StateTypes';
import type { StateNode } from './StateNode';

/** 记录同步字段元信息到原型（快照/递归挂载用） */
function recordSyncMeta(target: object, meta: SyncFieldMeta): void {
    const t = target as { __syncMeta?: SyncFieldMeta[] };
    if (!t.__syncMeta) t.__syncMeta = [];
    t.__syncMeta.push(meta);
}

/** 宿主上挂载容器节点（_store/_path 就绪后生效，惰性补挂载） */
function attachToHost(host: object, node: StateNode, segment: string): void {
    const h = host as { _store?: StateStoreHost; _path?: string };
    const store = h?._store;
    if (store && h._path !== undefined) {
        store.attach(node, joinPath(h._path, segment));
    }
}

/**
 * @sync 简单字段（number/string/boolean）。
 * 挂载后赋值产生 `set` 补丁；未挂载时赋值静默（避免字段初始化刷屏）。
 */
export function sync(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const key = String(propertyKey);
        const cache = new WeakMap<object, unknown>();
        recordSyncMeta(target, { key, segment: key });
        Object.defineProperty(target, propertyKey, {
            get(this: object) {
                return cache.get(this);
            },
            set(this: object, v: unknown) {
                cache.set(this, v);
                const t = this as { _store?: { markDirty: (p: unknown) => void }; _path?: string };
                const store = t?._store;
                if (store && t._path !== undefined) {
                    store.markDirty({ kind: 'set', path: joinPath(t._path, key), value: toSyncValue(v) });
                }
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/** 容器字段（@syncMap/@syncArray 共用）：惰性创建 + 自动挂载 */
function containerDecorator(
    segment: string | undefined,
    create: () => StateMap<string, unknown> | StateArray<never>,
): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const key = String(propertyKey);
        const seg = segment ?? key;
        const cache = new WeakMap<object, StateMap<string, unknown> | StateArray<never>>();
        recordSyncMeta(target, { key, segment: seg });
        Object.defineProperty(target, propertyKey, {
            get(this: object) {
                let c = cache.get(this);
                if (!c) {
                    c = create();
                    cache.set(this, c);
                }
                attachToHost(this, c, seg);
                return c;
            },
            set(this: object, v: StateMap<string, unknown> | StateArray<never>) {
                cache.set(this, v);
                attachToHost(this, v, seg);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * @syncMap key-value 容器。
 * @param segment path 段名（默认字段名；实体集合可自定义，如玩家集合段为 `player`）
 */
export function syncMap(segment?: string): PropertyDecorator {
    return containerDecorator(segment, () => new StateMap<string, unknown>());
}

/**
 * @syncArray 数组容器（元素仅限简单类型）。
 * @param segment path 段名（默认字段名）
 */
export function syncArray(segment?: string): PropertyDecorator {
    return containerDecorator(segment, () => new StateArray<never>());
}
