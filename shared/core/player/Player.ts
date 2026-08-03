import type { Room } from '../room/Room';
import { StateNode } from '../state/StateNode';
import { sync, syncMap, syncArray } from '../state/decorators';
import { StateMap } from '../state/StateMap';
import { StateArray } from '../state/StateArray';

/** 玩家实体（挂载到 Room.players，path = `player/{playerId}`） */
export class Player extends StateNode {
    readonly room: Room;
    /** 玩家 id（path 段用，不同步） */
    playerId: string;

    @sync() username: string = '';
    @sync() seat: number = 0;
    @sync() hp: number = 4;
    @sync() maxhp: number = 4;

    /** 标记（key-value，后续 MarkState 承接富标记） */
    @syncMap() marks: StateMap<string, number> = new StateMap();
    /** 手牌（元素仅简单类型：牌 id） */
    @syncArray() hand: StateArray<string> = new StateArray();

    constructor(playerId: string, room: Room) {
        super();
        this.playerId = playerId;
        this.room = room;
    }
}
