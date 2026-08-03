import type { AreaId } from '../types/AreaTypes';
import { AreaType } from '../types/AreaTypes';

/** 解析区域 ID：返回区域类型与所属玩家 id（公共区域无玩家） */
export function parseAreaId(areaId: AreaId): { type: AreaType; playerId?: string } {
    const dot = areaId.indexOf('.');
    if (dot === -1) return { type: areaId as AreaType };
    return {
        type: areaId.slice(dot + 1) as AreaType,
        playerId: areaId.slice(0, dot),
    };
}
