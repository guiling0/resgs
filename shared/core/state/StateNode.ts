import type { StateStoreHost } from './StateTypes';

/**
 * 同步节点基类。
 * 挂载（attach）后注入宿主 `_store` 与自身完整 path `_path`，
 * 字段变化经装饰器 setter 委托宿主收集补丁；未挂载时赋值静默（不产生脏记录）。
 */
export class StateNode {
    /** 节点标记（isSyncNode 判定用） */
    readonly __isSyncNode = true;
    /** 宿主状态存储（挂载后注入；未挂载为 undefined） */
    _store?: StateStoreHost;
    /** 自身完整 path（挂载后注入；未挂载为 undefined） */
    _path: string | undefined;
}
