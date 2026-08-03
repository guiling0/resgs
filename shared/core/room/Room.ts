import type { RoomOptions } from './RoomOptions';
import { sync, syncMap } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateStore } from '../state/StateStore';
import type { ITransport } from '../transport/ITransport';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';
import { Player } from '../player/Player';

/**
 * 房间——状态宿主（StateStore）与传输层（ITransport）的组合根。
 * path 以 Room 为根，如 `turnCount`、`player/p1/hp`。
 */
export class Room {
    /** 实体段 → 集合字段与实体构造器（镜像端 path 解析与实体创建用） */
    static entitySegments: Record<string, { field: string; ctor?: new (...args: any[]) => object }> = {
        player: { field: 'players', ctor: Player },
    };

    roomId: string;
    options: RoomOptions;
    mode: string = 'default';

    /** 状态存储（补丁收集） */
    readonly store: StateStore;
    /** 传输层（发送控制 + 通道） */
    readonly transport: ITransport;
    /** 日志接口（Room 级日志统一经此输出） */
    readonly logger: ILogger;

    // ===== 根节点字段（供装饰器 setter 定位 path）=====

    /** 宿主引用（构造体指向 store） */
    _store?: StateStore;
    /** 根节点 path（空串） */
    _path: string | undefined;

    /** 总回合数 */
    @sync() turnCount: number = 0;

    /** 玩家集合（实体段名 player，条目值 Player 实体） */
    @syncMap('player') players: StateMap<string, Player> = new StateMap();

    constructor(
        roomId: string,
        options: RoomOptions,
        transport: ITransport,
        logger: ILogger = consoleLogger,
    ) {
        this.store = new StateStore(logger);
        this.transport = transport;
        this.logger = logger;
        transport.attachLogger(logger);
        transport.attachStore(this.store);
        this._store = this.store;
        this._path = '';
        this.roomId = roomId;
        this.options = options;
        this.logger.info('房间创建', { roomId });
    }
}
