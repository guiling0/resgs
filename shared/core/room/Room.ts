import type { RoomOptions } from './RoomOptions';
import { sync, syncMap } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateStore } from '../state/StateStore';
import { Player } from '../player/Player';

/**
 * 房间——持有 StateStore 作为状态宿主。
 * - path 以 Room 为根（无 roomId 前缀），如 `turnCount`、`player/p1/hp`
 * - 状态同步方法集中在 `room.store`（flush/beginBatch/endBatch/startTicking/onFlush）
 */
export class Room {
    /** 实体段 → 集合字段与实体构造器（镜像端 path 解析与实体创建用；调用约定传 id 与 room） */
    static entitySegments: Record<string, { field: string; ctor?: new (...args: any[]) => object }> = {
        player: { field: 'players', ctor: Player },
    };

    roomId: string;
    options: RoomOptions;
    mode: string = 'default';

    /** 状态存储宿主（所有同步方法经它） */
    readonly store: StateStore;

    // ===== 根节点字段（供装饰器 setter 定位 path）=====

    /** 宿主引用（构造体指向 store） */
    _store?: StateStore;
    /** 根 path 为空串（字段 path 直接为字段名） */
    _path: string | undefined;

    /** 总回合数 */
    @sync() turnCount: number = 0;

    /** 玩家集合（实体段名 player，条目值 Player 实体） */
    @syncMap('player') players: StateMap<string, Player> = new StateMap();

    constructor(roomId: string, options: RoomOptions) {
        this.store = new StateStore();
        this._store = this.store;
        this._path = '';
        this.roomId = roomId;
        this.options = options;
    }
}
