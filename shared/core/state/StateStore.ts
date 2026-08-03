import { StateNode } from './StateNode';
import { collectSyncMeta, isSyncNode, joinPath } from './StateTypes';
import type { StateStoreHost, StatePatch } from './StateTypes';

/**
 * 状态存储：挂载、补丁收集、帧级 flush、事务批次。
 * 由 Room 持有（`room.store`），节点挂载后 `_store` 指向本实例。
 */
export class StateStore implements StateStoreHost {
    private _pending: StatePatch[] = [];
    private _inBatch = 0;
    private _timer: ReturnType<typeof setInterval> | null = null;

    /** flush 回调（后续 LocalTransport 订阅即发送；无变化不发空消息） */
    onFlush?: (patches: StatePatch[]) => void;

    // ===== StateStoreHost =====

    /** 挂载节点：注入宿主与 path，递归挂载已有容器字段 */
    attach(node: StateNode, path: string): void {
        node._store = this;
        node._path = path;
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

    // ===== flush 与事务 =====

    /** 产出并清空待发补丁（批次开启中不产出；无变化返回空数组） */
    flush(): StatePatch[] {
        if (this._inBatch > 0) return [];
        if (this._pending.length === 0) return [];
        const patches = this._pending;
        this._pending = [];
        this.onFlush?.(patches);
        return patches;
    }

    /** 开启事务批次（帧 tick 期间遇批次跳过，批内全部变化最终合并为一条消息） */
    beginBatch(): void {
        this._inBatch++;
    }

    /** 结束事务批次：归零时强制产出（批内多字段变化 = 一条消息多补丁） */
    endBatch(): void {
        if (this._inBatch > 0) {
            this._inBatch--;
            if (this._inBatch === 0) this.flush();
        }
    }

    /** 启动帧级 flush（默认 16ms tick，遇批次跳过） */
    startTicking(intervalMs: number = 16): void {
        if (this._timer) return;
        this._timer = setInterval(() => {
            if (this._inBatch === 0) this.flush();
        }, intervalMs);
    }

    /** 停止帧级 flush */
    stopTicking(): void {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }
}
