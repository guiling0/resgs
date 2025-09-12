import { Schema, type } from '@colyseus/schema';

export class LobbyState extends Schema {
    @type('number')
    playerCount: number = 0;
}
