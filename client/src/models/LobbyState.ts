import { Schema, type } from '@colyseus/schema';

export class LobbyState extends Schema {
    players: Map<string, { username: string; status: string }>;

    @type('number')
    playerCount: number = 0;
}
