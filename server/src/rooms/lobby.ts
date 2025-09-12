import { AuthContext, Client, LobbyRoom, Room, ServerError } from 'colyseus';
import { LobbyState } from '../models/LobbyState';
import { UserManager } from '../UserManager';
import { ServerCode } from '../core/enums';

export class CustomLobbyRoom extends LobbyRoom {
    declare state: LobbyState;

    async onCreate(options: any): Promise<any> {
        super.onCreate(options);
        this.state = new LobbyState();
        this.setMetadata({ name: 'Main Lobby' });
        this.autoDispose = false;
    }

    onAuth(client: Client<any, any>, options: any, context: AuthContext) {
        const { username, token } = options;
        const user = UserManager.inst.onlinePlayers[username];
        if (!user) {
            throw new ServerError(ServerCode.AuthError);
        }
        if (user.token !== token) {
            throw new ServerError(ServerCode.AuthError);
        }
        return true;
    }

    onJoin(client: Client, options?: any, auth?: any): void {
        super.onJoin(client, options);
        // console.log(`${client.sessionId} joined lobby`);
        this.state.playerCount++;
        const username = options.username;
        UserManager.inst.joinLobby(username, client);

        //检测重连
        const player = UserManager.inst.onlinePlayers[username];
        if (player) {
            const room = Object.values(player.rooms).find(
                (v) => !!v.reconnectToken
            );
            if (room) {
                client.send('reconnectToken', room.room.roomId);
            }
        }
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        super.onLeave(client);
        // console.log(`${client.sessionId} left lobby`);
        UserManager.inst.leaveLobby(client);
        this.state.playerCount--;
    }

    onDispose(): void {
        super.onDispose();
        // console.log(`LobbyRoom is Disposed`);
    }
}
