import type { StatePatch } from './StateTypes';
import { Room } from '../entity/Room';

/** 实体段配置条目 */
type EntitySegInfo = (typeof Room)['entitySegments'][string];

/** 取 path 首段的实体段配置（命中即实体集合路径） */
function entityInfo(segs: string[]): EntitySegInfo | undefined {
    return Room.entitySegments[segs[0]];
}

/** 定位对象节点（set 补丁的前缀路径，最后一段是属性名） */
function resolveNode(root: unknown, segs: string[]): object | undefined {
    let node = root as Record<string, unknown> | undefined;
    if (!segs.length) return root as object;
    const info = entityInfo(segs);
    let i = 0;
    if (info) {
        const coll = node?.[info.field] as { get?: (k: string) => unknown } | undefined;
        node = coll?.get?.(segs[1]) as Record<string, unknown> | undefined;
        i = 2;
        if (node === undefined) return undefined;
    }
    for (; i < segs.length; i++) {
        node = node?.[segs[i]] as Record<string, unknown> | undefined;
    }
    return node as object | undefined;
}

/** 定位同步容器（map/arr 补丁目标） */
function resolveContainer(root: unknown, segs: string[]): object | undefined {
    let node = root as Record<string, unknown> | undefined;
    if (!segs.length) return undefined;
    const info = entityInfo(segs);
    let i = 0;
    if (info) {
        const coll = node?.[info.field] as { get?: (k: string) => unknown } | undefined;
        if (segs.length === 1) return coll as object | undefined;
        node = coll?.get?.(segs[1]) as Record<string, unknown> | undefined;
        i = 2;
        if (node === undefined) return undefined;
    }
    for (; i < segs.length; i++) {
        node = node?.[segs[i]] as Record<string, unknown> | undefined;
    }
    return node as object | undefined;
}

/**
 * 将补丁应用到镜像端状态树（按 path 定位赋值）。
 * 段0 命中实体段映射 → 集合+id 定位实体；否则视为 Room 字段。
 */
export function applyPatches(root: object, patches: StatePatch[]): void {
    for (const patch of patches) {
        const segs = patch.path.split('/');
        switch (patch.kind) {
            case 'set': {
                const target = resolveNode(root, segs.slice(0, -1)) as Record<string, unknown> | undefined;
                if (target) target[segs[segs.length - 1]] = patch.value;
                break;
            }
            case 'map.add': {
                const container = resolveContainer(root, segs) as
                    | { set: (k: string, v: unknown) => void }
                    | undefined;
                if (!container) break;
                // 仅实体集合本身（path 即实体段）按 id 创建实体实例；嵌套容器存普通值
                const info = entityInfo(segs);
                if (info?.ctor && segs.length === 1) {
                    container.set(patch.key, new info.ctor(root, patch.key));
                } else {
                    container.set(patch.key, patch.value);
                }
                break;
            }
            case 'map.remove': {
                const container = resolveContainer(root, segs) as { delete?: (k: string) => void } | undefined;
                container?.delete?.(patch.key);
                break;
            }
            case 'arr.insert': {
                const container = resolveContainer(root, segs) as
                    | { insert?: (index: number, value: unknown) => void }
                    | undefined;
                container?.insert?.(patch.index, patch.value);
                break;
            }
            case 'arr.remove': {
                const container = resolveContainer(root, segs) as { remove?: (index: number) => void } | undefined;
                container?.remove?.(patch.index);
                break;
            }
            case 'arr.replace': {
                const container = resolveContainer(root, segs) as
                    | { replace?: (index: number, value: unknown) => void }
                    | undefined;
                container?.replace?.(patch.index, patch.value);
                break;
            }
        }
    }
}
