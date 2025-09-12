import { Client } from 'colyseus';
import { DbUser } from './db/models/User';
import { GameRoom } from './rooms/game';
import * as jwt from 'jsonwebtoken';

export class UserManager {
    private static _inst: UserManager = new UserManager();

    public static get inst() {
        return this._inst;
    }

    public onlinePlayers: {
        [username: string]: {
            userdata: DbUser;
            token: string;
            lastActive: Date;
            lobbyClient: Client | null;
            rooms: {
                [roomId: string]: {
                    room: GameRoom;
                    client: Client;
                    reconnectToken?: string;
                };
            };
        };
    } = {};

    private readonly DISCONNECT_GRACE_PERIOD = 30000; // 30秒

    /** 生成token */
    private generateToken(user: DbUser): string {
        return jwt.sign(
            { userId: user._id, username: user.username },
            'resgs.PrivateKey',
            { expiresIn: '7d' }
        );
    }

    login(user: DbUser) {
        const existingSession = this.onlinePlayers[user.username];
        if (!existingSession) {
            const token = this.generateToken(user);
            this.onlinePlayers[user.username] = {
                userdata: user,
                lastActive: new Date(),
                token,
                lobbyClient: null,
                rooms: {},
            };
            return token;
        }

        const newToken = this.generateToken(user);

        existingSession.token = newToken;
        existingSession.userdata = user;

        return newToken;
    }

    joinLobby(username: string, lobbyClient: Client) {
        const player = this.onlinePlayers[username];
        if (player) {
            // throw new Error('Not Login');
            player.lobbyClient = lobbyClient;
            player.lastActive = new Date();
        }
    }

    leaveLobby(client: Client) {
        const player = this.findPlayerByClinet(client.sessionId);
        if (player && player.lobbyClient) {
            player.lobbyClient = undefined;
        }
    }

    joinRoom(username: string, room: GameRoom, client: Client) {
        const player = this.onlinePlayers[username];
        if (player) {
            // throw new Error('Not Login');
            player.rooms[room.roomId] = {
                room,
                client,
            };
        }
    }

    leaveRoom(username: string, roomId: string, reconnectToken?: string) {
        const player = this.onlinePlayers[username];
        if (player && player.rooms[roomId]) {
            if (reconnectToken) {
                player.rooms[roomId].reconnectToken = reconnectToken;
            } else {
                delete player.rooms[roomId];
            }
        }
    }

    getPlayerRooms(
        username: string
    ): Array<{ roomId: string; room: GameRoom; client: Client }> {
        const player = this.onlinePlayers[username];
        if (!player) return [];
        return Object.entries(player.rooms).map(([roomId, data]) => ({
            roomId,
            ...data,
        }));
    }

    findPlayerByClinet(sessionId: string) {
        for (const username in this.onlinePlayers) {
            const player = this.onlinePlayers[username];
            if (player.lobbyClient?.sessionId === sessionId) {
                return player;
            }

            for (const roomId in player.rooms) {
                if (player.rooms[roomId].client.sessionId === sessionId) {
                    return player;
                }
            }
        }
        return null;
    }

    broadcast(message: string) {
        for (const username in this.onlinePlayers) {
            const player = this.onlinePlayers[username];
            if (player.lobbyClient) {
                player.lobbyClient.send('chat', {
                    date: Date.now(),
                    username: '系统',
                    message,
                });
            }

            for (const roomId in player.rooms) {
                if (player.rooms[roomId].client) {
                    player.rooms[roomId].client.send('chat', {
                        date: Date.now(),
                        username: '系统',
                        message,
                    });
                }
            }
        }
    }
}
