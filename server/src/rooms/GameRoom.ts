import { ChatMessage, ChatSource } from '@shared/core/message';
import { generateRoomId } from '@shared/core/room';
import { RoomOption } from '@shared/core/room/RoomTypes';
import {
    RoomOptionsState,
    RoomState,
    SeatState,
    TableState,
} from '@shared/core/schema';
import { AuthContext, type Client, Room, ServerError } from 'colyseus';
import { TokenPayload, verifyToken } from 'src/auth/jwt';
import {
    broadcastChatMessageToAll,
    generateChatMessage,
    registerRoom,
    unregisterRoom,
} from 'src/chat/ChatService';
import { DbUser } from 'src/db/models/user';
import { UserService } from 'src/db/services/UserService';
import { logger } from 'src/logger';

type GameClient = Client<{
    userData: {
        userinfo: DbUser;
    };
    auth: TokenPayload;
}>;

type RoomMetaData = {
    roomId: string;
    roomName: string;
    mode: string;
    players: number;
    maxPlayers: number;
    owner: '';
    hasPassword: boolean;
    state: 'waiting' | 'playing';
};

export class GameRoom extends Room<{
    state: RoomState;
    client: GameClient;
    metaData: RoomMetaData;
}> {
    state: RoomState = new RoomState();
    messages = {
        ready: this._onReady,
        kick: this._onKick,
        chat: this._onChat,
        start: this._onStartGame,
    };

    onCreate(options: RoomOption) {
        this.roomId = generateRoomId();
        const state = this.state;
        state.roomId = this.roomId;
        state.roomName = options.name;

        state.options = new RoomOptionsState(options);
        state.options.password = options.password || '';
        state.options.mode = options.mode;
        state.options.playerCountMax = options.playerCountMax || 8;
        state.options.responseTime = options.responseTime || 15;
        state.options.chooseGeneralTime = options.chooseGeneralTime || 15;
        state.options.chooseGeneralCount = options.chooseGeneralCount || 5;
        state.options.luckyCardCount = options.luckyCardCount || 0;
        state.options.cards = options.cards || [];
        state.options.generals = options.generals || [];
        for (const key in options.settings) {
            state.options.settings.set(key, options.settings[key]);
        }

        state.table = new TableState();
        state.table.ownerId = '';
        //TODO seatTags 实现 - 从模式的默认设置中赋值seatTags

        this.setMetadata({
            roomId: this.roomId,
            roomName: state.roomName,
            mode: state.options.mode,
            players: 0,
            maxPlayers: state.options.playerCountMax,
            owner: '',
            hasPassword: state.options.password !== '',
            state: 'waiting',
        });

        registerRoom(this.roomId, this);
        logger.info(`GameRoom  created`, {
            roomId: this.roomId,
            event: 'create',
        });
    }

    async onAuth(
        client: GameClient,
        options: { accessToken: string },
        context: AuthContext,
    ) {
        const token = options.accessToken;
        if (!token) throw new ServerError(401, 'accessToken is required');
        const payload = verifyToken(token);
        if (!payload)
            throw new ServerError(401, 'accessToken is invalid or expired');
        const user = await UserService.findById(payload.userId);
        if (!user) throw new ServerError(401, 'user not found');
        client.userData = { userinfo: user };
        return payload;
    }

    async onJoin(client: GameClient) {
        const auth = client.auth;
        if (!auth) throw new ServerError(401, 'auth is required');
        const user = client.userData?.userinfo;
        if (!user) throw new ServerError(401, 'user not found');

        const seat = new SeatState();
        seat.sessionId = client.sessionId;
        seat.username = auth.username;
        seat.nickname = user.nickname;
        seat.avatar = user.avatar;
        seat.seat = this._pickSeat();
        seat.ready = false;
        seat.online = true;

        this.state.table.seats.set(seat.sessionId, seat);

        if (this.state.table.seats.size === 1) {
            this.state.table.ownerId = seat.sessionId;
            this.setMetadata({
                owner: seat.username,
            });
        }

        this.setMetadata({ players: this.state.table.seats.size });
        this._chat(
            generateChatMessage(
                'room',
                'system',
                `[b][color=#00FF00]${seat.nickname}[/color][/b] 加入了房间`,
                this.roomId,
            ),
        );
        logger.info(`player ${seat.nickname}(${seat.username}) joined`, {
            roomId: this.roomId,
            playerId: client.sessionId,
        });
    }

    onLeave(client: GameClient, code?: number): void | Promise<any> {
        const seat = this.state.table.seats.get(client.sessionId);
        if (!seat) {
            logger.warn('leave without seat', {
                roomId: this.roomId,
                playerId: client.sessionId,
            });
            return;
        }
        this.state.table.seats.delete(client.sessionId);
        if (seat.sessionId === this.state.table.ownerId) {
            const next = this.state.table.seats.values().next();
            this.state.table.ownerId = next.value?.sessionId ?? '';
            if (next.value) {
                this.setMetadata({ owner: next.value.username });
            }
        }
        this.setMetadata({ players: this.state.table.seats.size });
        this._chat(
            generateChatMessage(
                'room',
                'system',
                `[b][color=#FF0000]${seat.username}[/color][/b] 退出房间`,
                this.roomId,
            ),
        );
        logger.info(`player ${seat.username} left`, {
            roomId: this.roomId,
            playerId: client.sessionId,
        });
    }

    onDispose() {
        unregisterRoom(this.roomId);
        logger.info(`GameRoom  disposed`, {
            roomId: this.roomId,
            event: 'dispose',
        });
    }

    private _onReady(client: GameClient, _message: {}) {
        if (client.sessionId === this.state.table.ownerId) {
            client.send('toast', {
                message: '房主不能改变准备状态',
            });
            return;
        }
        const seat = this.state.table.seats.get(client.sessionId);
        if (!seat) return;
        seat.ready = !seat.ready;
    }

    private _onKick(client: GameClient, _message: { username: string }) {
        if (client.sessionId !== this.state.table.ownerId) return;

        const seat = this.state.table.seats
            .values()
            .find((s) => s.username === _message.username);
        if (!seat) {
            logger.warn('kick target not found', {
                roomId: this.roomId,
                playerId: client.sessionId,
            });
            return;
        }
        const target = this.clients.find((c) => c.sessionId === seat.sessionId);
        if (target) {
            target.send('kicked', { reason: '你被房主踢出了房间' });
            target.leave();
        }
        this._chat(
            generateChatMessage(
                'room',
                'system',
                `[b][color=#FF0000]${_message.username}[/color][/b] 被踢出了房间`,
                this.roomId,
            ),
        );
        logger.info(`player ${_message.username} kicked`, {
            roomId: this.roomId,
            playerId: seat.sessionId,
        });
    }

    private _onChat(
        client: GameClient,
        _message: { source: ChatSource; message: string },
    ) {
        const user = client.userData?.userinfo;
        if (!user) throw new ServerError(401, 'user not found');
        const nickname = user.nickname ?? '未知';
        const chatMessage = generateChatMessage(
            _message.source,
            nickname,
            _message.message,
            this.roomId,
        );
        switch (_message.source) {
            case 'lobby':
                broadcastChatMessageToAll(chatMessage);
                break;
            case 'room':
                this.broadcast('chat', chatMessage);
                break;
            case 'team':
                //TODO 按照游戏逻辑寻找队友广播
                break;
            default:
                throw new ServerError(400, 'invalid chat source');
        }

        const seat = this.state.table.seats.get(client.sessionId);
        this._chat(chatMessage);
    }

    private _onStartGame(client: Client, _message: {}) {
        if (client.sessionId !== this.state.table.ownerId) {
            client.send('toast', {
                message: '只有房主可以开始游戏',
            });
            logger.warn('non-owner tried to start', {
                roomId: this.roomId,
                playerId: client.sessionId,
            });
            return;
        }

        let allReady = true;
        this.state.table.seats.forEach((s) => {
            if (!s.ready) allReady = false;
        });
        if (!allReady) {
            client.send('toast', { message: '还有玩家未准备' });
            return;
        }

        if (this.state.table.seats.size < 2) {
            client.send('toast', {
                message: '至少需要 2 名玩家',
            });
            return;
        }

        this.broadcast('game_start');
        logger.info('game started', {
            roomId: this.roomId,
            event: 'game_start',
        });
    }

    private _chat(message: ChatMessage) {
        this.broadcast('chat', message);
    }

    private _pickSeat(): number {
        const taken = new Set<number>();
        this.state.table.seats.forEach((s) => taken.add(s.seat));
        for (let i = 1; i <= this.state.options.playerCountMax; i++) {
            if (!taken.has(i)) return i;
        }
        return -1;
    }
}
