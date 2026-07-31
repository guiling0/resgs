import { Schema, type } from '@colyseus/schema';

/**
 * 等待房间中的玩家
 */
export class SeatState extends Schema {
    @type('string') sessionId: string = '';
    @type('string') username: string = '';
    @type('string') nickname: string = '';
    @type('string') avatar: string = '';
    @type('number') seat: number = -1;
    @type('boolean') ready: boolean = false;
    @type('boolean') online: boolean = true;
}
