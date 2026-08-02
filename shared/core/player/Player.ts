import type { Room } from '../room/Room';

export class Player {
    readonly room: Room;
    playerId: string;
    username: string = '';
    seat: number = 0;

    constructor(playerId: string, room: Room) {
        this.playerId = playerId;
        this.room = room;
    }
}
