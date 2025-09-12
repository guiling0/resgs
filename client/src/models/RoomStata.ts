import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { GameRoom } from '../core/room/room';

export class PlayerState extends Schema {
    token: string;
    /** 唯一id */
    @type('string')
    playerId: string;

    /** 玩家名字 */
    @type('string')
    username: string;

    /** 玩家头像 */
    @type('string')
    avatar: string;

    /** 游戏场次 */
    @type('number')
    total: number = 0;

    /** 胜利场次 */
    @type('number')
    win: number = 0;

    /** 逃跑次数 */
    @type('number')
    escape: number = 0;

    /** 是否为房主 */
    @type('boolean')
    isOwner: boolean = false;

    /** 是否准备 */
    @type('boolean')
    ready: boolean = false;

    /** 预选武将 */
    prechooses: string[];

    public get _ready() {
        return this.ready;
    }
}

export class SpectateState extends Schema {
    token: string;
    /** 唯一id */
    @type('string')
    playerId: string;

    /** 玩家名字 */
    @type('string')
    username: string;

    /** 玩家头像 */
    @type('string')
    avatar: string;

    /** 游戏场次 */
    @type('number')
    total: number = 0;

    /** 胜利场次 */
    @type('number')
    win: number = 0;

    /** 逃跑次数 */
    @type('number')
    escape: number = 0;

    /** 旁观目标 */
    @type('string')
    spectateBy: string;
}

export class RoomOptionState extends Schema {
    @type('string')
    name: string;
    @type('string')
    password: string;
    @type('string')
    mode?: string;
    @type('number')
    playerCountMax: number;
    @type('number')
    responseTime?: number;
    @type('string')
    extensions: string;
    @type('string')
    generals: string;
    @type('number')
    chooseGeneralCount: number;
    @type('number')
    luckyCardCount: number;
    @type('string')
    settings: string;
}

export class RoomState extends Schema {
    @type({ map: PlayerState })
    public players = new MapSchema<PlayerState>();
    @type({ map: SpectateState })
    public spectates = new MapSchema<SpectateState>();
    @type(RoomOptionState)
    public options: RoomOptionState;

    public game: GameRoom;
}
