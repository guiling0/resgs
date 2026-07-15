import { Client, Room } from 'colyseus';
import { RoomState } from '../core/schema/RoomState';
import { IPlayerInput } from '../core/logic/IPlayerInput';
import { GameLogic } from '../core/logic/GameLogic';

export class GameRoom
    extends Room<{ state: RoomState }>
    implements IPlayerInput
{
    private logic!: GameLogic;
    private resolvers = new Map<string, (data: any) => void>();

    async onCreate(options: any) {
        const state = new RoomState();
        this.state = state;
        this.logic = new GameLogic(state, this);
    }

    async requestChoice(playerId: string, options: any) {
        const client = this.clients.find((c) => c.sessionId === playerId);
        if (!client) return {};

        client.send('choice_request', options);
    }

    onMessage(
        messageType: unknown,
        validationSchema: unknown,
        callback?: unknown,
    ): any {}
}
