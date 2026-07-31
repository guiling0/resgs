import { Schema, type } from '@colyseus/schema';
import { RoomOptionsState } from './RoomOptionsState';
import { TableState } from './TableState';
import { GameState } from './GameState';

/**
 * 房间状态——房间级元数据 + 子状态引用。
 */
export class RoomState extends Schema {
    @type('string') roomId: string = '';
    @type('string') roomName: string = '';
    @type(RoomOptionsState) options: RoomOptionsState = new RoomOptionsState();
    @type(TableState) table: TableState = new TableState();
    @type(GameState) game: GameState | null = null;
}
