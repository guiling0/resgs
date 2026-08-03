import type { RoomOptions } from '../types/RoomOptions';
import { Mark } from './Mark';
import { sync, syncMap } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateStore } from '../state/StateStore';
import type { ITransport } from '../transport/ITransport';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';
import { Player } from './Player';
import { randomInt as randomIntUtil, shuffle as shuffleUtil } from '../utils/Random';
import type { Area } from './Area';
import type { AreaId } from '../types/AreaTypes';

/**
 * 房间——状态宿主（StateStore）与传输层（ITransport）的组合根。
 * path 以 Room 为根，如 `turnCount`、`player/p1/hp`。
 */
export class Room extends Mark {
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

    /** 随机数种子（相同初始种子下，房间内所有随机操作结果一致；后续随机方法统一使用） */
    randomSeed: number = 1;

    /** 区域集合（区域内部无可同步属性，仅权威端持有） */
    readonly areas: Map<AreaId, Area> = new Map();

    constructor(
        roomId: string,
        options: RoomOptions,
        transport: ITransport,
        logger: ILogger = consoleLogger,
    ) {
        super();
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

    /** 洗牌（使用房间随机数种子，每次随机操作推进种子） */
    shuffle<T>(arr: T[]): T[] {
        shuffleUtil(arr, this.randomSeed);
        this.randomSeed = (this.randomSeed + 1) >>> 0;
        return arr;
    }

    /** 生成 [min, max] 区间内的随机整数（使用房间随机数种子并推进） */
    randomInt(min: number, max: number): number {
        const value = randomIntUtil(min, max, this.randomSeed);
        this.randomSeed = (this.randomSeed + 1) >>> 0;
        return value;
    }
}
