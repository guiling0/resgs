import type { Room } from './Room';
import { Mark } from './Mark';
import { sync, syncArray } from '../state/decorators';
import { StateArray } from '../state/StateArray';

/** 玩家实体（挂载到 Room.players，path = `player/{playerId}`） */
export class Player extends Mark {
    readonly room: Room;
    /** 玩家 id（path 段用，不同步） */
    playerId: string;

    @sync() username: string = '';
    @sync() seat: number = 0;
    @sync() hp: number = 4;
    @sync() maxhp: number = 4;

    /** 手牌（元素仅简单类型：牌 id） */
    @syncArray() hand: StateArray<string> = new StateArray();

    constructor(room: Room, playerId: string) {
        super();
        this.playerId = playerId;
        this.room = room;
        this.room.logger.debug('创建玩家', { roomId: room.roomId, playerId });
    }
}
