import { StateNode } from './StateNode';
import { collectSyncMeta, isSyncNode, joinPath } from './StateTypes';
import type { StateStoreHost, StatePatch } from './StateTypes';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';

/**
 * 状态存储：节点挂载与补丁收集。
 * 由 Room 持有（`room.store`），节点挂载后 `_store` 指向本实例。
 */
export class StateStore implements StateStoreHost {
    private _pending: StatePatch[] = [];
    private readonly logger: ILogger;

    constructor(logger: ILogger = consoleLogger) {
        this.logger = logger;
    }

    // ===== StateStoreHost =====

    /** 挂载节点：注入宿主与 path，递归挂载已有容器字段 */
    attach(node: StateNode, path: string): void {
        node._store = this;
        node._path = path;
        this.logger.debug('挂载节点', { path });
        for (const meta of collectSyncMeta(node)) {
            const v = (node as unknown as Record<string, unknown>)[meta.key];
            if (isSyncNode(v) && v !== node && (v as StateNode)._store !== this) {
                this.attach(v as StateNode, joinPath(path, meta.segment));
            }
        }
    }

    /** 收集脏补丁 */
    markDirty(patch: StatePatch): void {
        this._pending.push(patch);
    }

    /** 产出并清空待发补丁（无变化返回空数组） */
    flush(): StatePatch[] {
        if (this._pending.length === 0) return [];
        const patches = this._pending;
        this._pending = [];
        this.logger.debug('产出补丁', { count: patches.length });
        return patches;
    }
}
