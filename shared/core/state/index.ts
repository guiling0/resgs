/** state 层集中导出 */

// 类型（StateTypes 含工具函数，非纯类型文件，类型与函数分开导出）
export type { Primitive, SyncValue, StatePatch, SyncFieldMeta, StateStoreHost } from './StateTypes';
export { collectSyncMeta, isSyncNode, joinPath, toSyncValue } from './StateTypes';

// 节点 / 容器 / 存储
export { StateNode } from './StateNode';
export { StateMap } from './StateMap';
export { StateArray } from './StateArray';
export { StateStore } from './StateStore';

// 装饰器
export { sync, syncMap, syncArray } from './decorators';

// 镜像端补丁应用
export { applyPatches } from './applyPatches';
