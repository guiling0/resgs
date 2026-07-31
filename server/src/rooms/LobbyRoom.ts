import { AuthContext, Client, LobbyRoom, ServerError } from '@colyseus/core';
import { verifyToken } from 'src/auth/jwt';
import {
    broadcastChatMessageToAll,
    generateChatMessage,
    registrLobby,
    unregisterLobby,
} from 'src/chat/ChatService';
import { UserService } from 'src/db/services/UserService';
import { logger } from 'src/logger';

export class CustomLobbyRoom extends LobbyRoom {
    async onCreate(options: any) {
        super.onCreate(options);

        this.onMessage('chat', this._onChat);

        registrLobby(this);
        logger.info(`Lobby  created`, {
            roomId: this.roomId,
            event: 'create',
        });
    }

    async onAuth(
        client: Client,
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

    onDispose() {
        unregisterLobby();
        logger.info(`Lobby  disposed`, {
            roomId: this.roomId,
            event: 'dispose',
        });
    }

    private _onChat(client: Client, message: { message: string }) {
        const user = client.userData?.userinfo;
        if (!user) throw new ServerError(401, 'user not found');
        const nickname = user.nickname ?? '未知';
        const chatMessage = generateChatMessage(
            'lobby',
            nickname,
            message.message,
        );
        broadcastChatMessageToAll(chatMessage);
    }
}
