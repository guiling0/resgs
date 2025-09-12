"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const jwt = __importStar(require("jsonwebtoken"));
class UserManager {
    constructor() {
        this.onlinePlayers = {};
        this.DISCONNECT_GRACE_PERIOD = 30000; // 30秒
    }
    static { this._inst = new UserManager(); }
    static get inst() {
        return this._inst;
    }
    /** 生成token */
    generateToken(user) {
        return jwt.sign({ userId: user._id, username: user.username }, 'resgs.PrivateKey', { expiresIn: '7d' });
    }
    login(user) {
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
    joinLobby(username, lobbyClient) {
        const player = this.onlinePlayers[username];
        if (player) {
            // throw new Error('Not Login');
            player.lobbyClient = lobbyClient;
            player.lastActive = new Date();
        }
    }
    leaveLobby(client) {
        const player = this.findPlayerByClinet(client.sessionId);
        if (player && player.lobbyClient) {
            player.lobbyClient = undefined;
        }
    }
    joinRoom(username, room, client) {
        const player = this.onlinePlayers[username];
        if (player) {
            // throw new Error('Not Login');
            player.rooms[room.roomId] = {
                room,
                client,
            };
        }
    }
    leaveRoom(username, roomId, reconnectToken) {
        const player = this.onlinePlayers[username];
        if (player && player.rooms[roomId]) {
            if (reconnectToken) {
                player.rooms[roomId].reconnectToken = reconnectToken;
            }
            else {
                delete player.rooms[roomId];
            }
        }
    }
    getPlayerRooms(username) {
        const player = this.onlinePlayers[username];
        if (!player)
            return [];
        return Object.entries(player.rooms).map(([roomId, data]) => ({
            roomId,
            ...data,
        }));
    }
    findPlayerByClinet(sessionId) {
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
    broadcast(message) {
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
exports.UserManager = UserManager;
