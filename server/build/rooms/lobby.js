"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLobbyRoom = void 0;
const colyseus_1 = require("colyseus");
const LobbyState_1 = require("../models/LobbyState");
const UserManager_1 = require("../UserManager");
class CustomLobbyRoom extends colyseus_1.LobbyRoom {
    async onCreate(options) {
        super.onCreate(options);
        this.state = new LobbyState_1.LobbyState();
        this.setMetadata({ name: 'Main Lobby' });
        this.autoDispose = false;
    }
    onAuth(client, options, context) {
        const { username, token } = options;
        const user = UserManager_1.UserManager.inst.onlinePlayers[username];
        if (!user) {
            throw new colyseus_1.ServerError(503 /* ServerCode.AuthError */);
        }
        if (user.token !== token) {
            throw new colyseus_1.ServerError(503 /* ServerCode.AuthError */);
        }
        return true;
    }
    onJoin(client, options, auth) {
        super.onJoin(client, options);
        // console.log(`${client.sessionId} joined lobby`);
        this.state.playerCount++;
        const username = options.username;
        UserManager_1.UserManager.inst.joinLobby(username, client);
        //检测重连
        const player = UserManager_1.UserManager.inst.onlinePlayers[username];
        if (player) {
            const room = Object.values(player.rooms).find((v) => !!v.reconnectToken);
            if (room) {
                client.send('reconnectToken', room.room.roomId);
            }
        }
    }
    onLeave(client, consented) {
        super.onLeave(client);
        // console.log(`${client.sessionId} left lobby`);
        UserManager_1.UserManager.inst.leaveLobby(client);
        this.state.playerCount--;
    }
    onDispose() {
        super.onDispose();
        // console.log(`LobbyRoom is Disposed`);
    }
}
exports.CustomLobbyRoom = CustomLobbyRoom;
