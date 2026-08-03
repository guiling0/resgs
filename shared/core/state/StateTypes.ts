/**
 * 状态同步基础类型：补丁联合、宿主接口、path 工具、快照序列化。
 * path 以 Room 为根，如 `player/p1/hp`、`player/p1/marks/guanxing`。
 */

import type { StateNode } from './StateNode';

/** 简单值：number / string / boolean */
export type Primitive = number | string | boolean;

/** 可同步值（可 JSON 序列化） */
export type SyncValue = Primitive | null | SyncValue[] | { [key: string]: SyncValue };

/** 状态变更补丁（六种） */
export type StatePatch =
    | { kind: 'set'; path: string; value: SyncValue }
    | { kind: 'map.add'; path: string; key: string; value: SyncValue }
    | { kind: 'map.remove'; path: string; key: string }
    | { kind: 'arr.insert'; path: string; index: number; value: Primitive }
    | { kind: 'arr.remove'; path: string; index: number }
    | { kind: 'arr.replace'; path: string; index: number; value: Primitive };

/** 同步字段元信息（装饰器挂载到原型） */
export interface SyncFieldMeta {
    /** 字段名 */
    key: string;
    /** path 段名（容器可自定义段名，如玩家集合段为 player） */
    segment: string;
}

/** 状态存储宿主（Room 内嵌实现） */
export interface StateStoreHost {
    /** 挂载节点：注入宿主与 path，递归挂载已有容器字段 */
    attach(node: StateNode, path: string): void;
    /** 收集脏补丁 */
    markDirty(patch: StatePatch): void;
}

/** 拼接 path 段（根 path 为空时直接返回段名） */
export function joinPath(base: string | undefined, seg: string): string {
    return base ? `${base}/${seg}` : seg;
}

/** 节点标记：可挂载/可同步 */
export function isSyncNode(v: unknown): boolean {
    return !!v && typeof v === 'object' && (v as { __isSyncNode?: boolean }).__isSyncNode === true;
}

/** 收集原型链上的同步字段元信息 */
export function collectSyncMeta(instance: unknown): SyncFieldMeta[] {
    const metas: SyncFieldMeta[] = [];
    let proto = Object.getPrototypeOf(instance) as Record<string, unknown> | null;
    while (proto && proto !== Object.prototype) {
        const ms = proto.__syncMeta as SyncFieldMeta[] | undefined;
        if (ms) for (const m of ms) metas.push(m);
        proto = Object.getPrototypeOf(proto) as Record<string, unknown> | null;
    }
    return metas;
}

/** 节点 → 可同步值（快照；容器走 snapshot()，实体走同步字段） */
export function toSyncValue(v: unknown): SyncValue {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.map(toSyncValue);
    if (typeof v !== 'object') return v as Primitive;
    const obj = v as { __isSyncNode?: boolean; snapshot?: () => unknown };
    if (obj.__isSyncNode && typeof obj.snapshot === 'function') {
        return toSyncValue(obj.snapshot());
    }
    if (obj.__isSyncNode) {
        const out: Record<string, SyncValue> = {};
        for (const { key } of collectSyncMeta(v)) out[key] = toSyncValue((v as Record<string, unknown>)[key]);
        return out;
    }
    const out: Record<string, SyncValue> = {};
    for (const k of Object.keys(v as object)) out[k] = toSyncValue((v as Record<string, unknown>)[k]);
    return out;
}
