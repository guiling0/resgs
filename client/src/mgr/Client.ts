import * as Colyseus from 'colyseus.js';
import { S } from '../singleton';
import { ServerConfig } from '../config';
import { ServerCode } from '../core/enums';
import {
    RoomMetedata,
    LoginData,
    RoomOption,
    RoomJoinData,
} from '../core/types';
import { getStateCallbacks } from 'colyseus.js';
import { LobbyState } from '../models/LobbyState';
import { RoomState } from '../models/RoomStata';

const codes = {
    [ServerCode.AuthError]: '登录状态失效，请刷新重试',
    [ServerCode.AlreadyJoined]: '您已经在房间中',
    [ServerCode.RoomIsStarted]: '房间已经开始游戏',
    [ServerCode.PasswordError]: '密码错误',
    [ServerCode.PlayerCountMax]: '房间座位已满',
    [ServerCode.ProhibitStand]: '房间禁止旁观',
    [ServerCode.NotTester]: '没有测试资格',
};

export class Client {
    private static instance: Client;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Client();
        }
        return this.instance;
    }

    private constructor() {}

    public url: string;
    public client: Colyseus.Client;
    public username: string;
    public avatar: string = 'general/shibingn/image.png';
    public token: string;
    public reconnectToken: string;

    public lobbyRoom: Colyseus.Room<LobbyState>;
    public gameRooms: { [key: string]: Colyseus.Room[] } = {};
    public allRooms: Colyseus.RoomAvailable<RoomMetedata>[] = [];

    public reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // 1秒初始重连延迟

    public isAdmin: boolean = false;
    public isSuperAdmin: boolean = false;

    connect() {
        if (this.client) return;
        const url = `${ServerConfig.host}:${ServerConfig.port}`;
        let client = new Colyseus.Client(`ws://${url}`);
        this.url = url;
        this.client = client;
    }

    async login(data: LoginData) {
        if (!this.client) {
            S.ui.toast('未连接服务器');
            return;
        }
        S.ui.openModelLoad();
        try {
            //登录
            const authResponse = await this.client.http.post(`/auth/login`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            //
            const authData = authResponse.data;

            if (authData.error) {
                throw new Error(authData.error);
            }
            const { user, token } = authData;
            this.username = user.username;
            this.isAdmin = user.privileges.admin;
            this.isSuperAdmin = this.isAdmin;
            this.avatar = user.profile.avatar;
            this.token = token;

            //连接大厅
            const lobby = await this.client.joinOrCreate('lobby', {
                username: user.username,
                token: token,
            });
            this.lobbyRoom = lobby as any;
            this.bindLobby();
            return lobby;
        } catch (error: any) {
            console.error('Connection error:', error);
            if (error) {
                if (error.message === 'ban') {
                    S.ui.toast(
                        `该账号已被封禁，解封时间还剩${
                            Date.now() - error.time
                        }ms`
                    );
                } else {
                    S.ui.toast(sgs.getTranslation(error?.message));
                }
            }
            this.lobbyRoom = undefined;
        } finally {
            S.ui.closeModelLoad();
        }
    }

    private bindLobby() {
        this.lobbyRoom.onMessage('rooms', (rooms) => {
            this.allRooms = rooms;
            Laya.stage.event('refreshRoomList');
        });
        this.lobbyRoom.onMessage('+', ([roomId, room]) => {
            // console.log(roomId, room);
            const index = this.allRooms.findIndex(
                (room) => room.roomId === roomId
            );
            if (index !== -1) {
                this.allRooms[index] = room;
            } else {
                this.allRooms.push(room);
            }
            Laya.stage.event('refreshRoomList');
        });
        this.lobbyRoom.onMessage('-', (roomId) => {
            // console.log(roomId);
            this.allRooms = this.allRooms.filter(
                (room) => room.roomId !== roomId
            );
            Laya.stage.event('refreshRoomList');
        });
        this.lobbyRoom.onLeave((code: number) => {
            if (code === 3005) {
                return;
            }
            this.lobbyRoom = undefined;
            this.reconnectAttempts = 0;
            this.attempReconnect();
        });

        const $ = getStateCallbacks(this.lobbyRoom);
        $(this.lobbyRoom.state).listen(
            'playerCount',
            (value, previousValue) => {
                Laya.stage.event('refreshPlayerCount');
            }
        );

        this.lobbyRoom.onMessage('reconnectToken', (roomId: string) => {
            this.reconnectToken = roomId;
            Laya.stage.event('onReconnectToken');
        });
    }

    public attempReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            S.ui.toast('网络异常，请刷新重试');
            return;
        }
        this.reconnectAttempts++;
        const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        S.ui.toast(
            `与服务器断开连接，将在${delay / 1000}秒后尝试重连（${
                this.reconnectAttempts
            }/${this.maxReconnectAttempts}）`
        );
        S.ui.openModelLoad();
        setTimeout(async () => {
            try {
                const lobby = await this.client.joinOrCreate('lobby', {
                    username: this.username,
                });
                if (lobby) {
                    this.reconnectAttempts = 0;
                    this.lobbyRoom = lobby as any;
                    this.bindLobby();
                    S.ui.closeModelLoad();
                } else {
                    this.attempReconnect();
                }
            } catch {}
        }, delay);
    }

    async createRoom(options: RoomOption) {
        if (!this.client) {
            S.ui.toast('未连接服务器');
            return;
        }
        S.ui.openModelLoad();
        try {
            const data: RoomJoinData = {
                username: this.username,
                options,
                password: options.password,
                create: true,
                token: this.token,
                spectate: false,
            };
            const room = await this.client.create('game', data, RoomState);
            return room;
        } catch (e: any) {
            this.toastEroor(e);
        } finally {
            S.ui.closeModelLoad();
        }
    }

    async joinRoom(
        roomId: string,
        options: RoomJoinData = {
            username: this.username,
            create: false,
            spectate: false,
            token: this.token,
        }
    ) {
        if (!this.client) {
            S.ui.toast('未连接服务器');
            return;
        }
        S.ui.openModelLoad();
        try {
            const room = await this.client.joinById(roomId, options, RoomState);
            return room;
        } catch (e: any) {
            this.toastEroor(e);
        } finally {
            S.ui.closeModelLoad();
        }
    }

    toastEroor(e: { code: ServerCode }) {
        if (!e || !e.code) return;
        if ((codes as any)[e.code]) {
            S.ui.toast((codes as any)[e.code]);
        }
    }

    async broadcast(message: string) {
        if (!this.client) {
            S.ui.toast('未连接服务器');
            return;
        }
        try {
            await this.client.http.post(`/admin/broadcast`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-name': encodeURIComponent(this.username),
                },
                body: JSON.stringify({
                    message,
                }),
            });
        } catch (error: any) {
            console.error('Connection error:', error);
            S.ui.toast(sgs.getTranslation(error?.message));
        } finally {
            S.ui.closeModelLoad();
        }
    }

    async updateAvatar(avatar: string) {
        if (!this.client) {
            S.ui.toast('未连接服务器');
            return;
        }
        try {
            await this.client.http.post(`/app/update-avatar`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-name': encodeURIComponent(this.username),
                    'x-user-token': encodeURIComponent(this.token),
                },
                body: JSON.stringify({
                    avatar,
                }),
            });
            S.ui.toast('设置成功');
        } catch (error: any) {
            console.error('Connection error:', error);
            S.ui.toast(sgs.getTranslation(error?.message));
        } finally {
            S.ui.closeModelLoad();
        }
    }

    /** 对用户进行封禁操作 */
    async ban(
        username: string,
        data: {
            type: 'ban' | 'muted' | 'game';
            reason: string;
            times: number;
        }
    ) {
        try {
            let routeUrl: string;
            if (data.type === 'ban') {
                routeUrl = '/admin/ban-user';
            }
            if (data.type === 'muted') {
                routeUrl = '/admin/ban-muted';
            }
            if (data.type === 'game') {
                routeUrl = '/admin/ban-game';
            }
            await this.client.http.post(routeUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-name': encodeURIComponent(this.username),
                },
                body: JSON.stringify({
                    username,
                    reason: data.reason,
                    times: data.times,
                    banIp: false,
                }),
            });
        } catch (error: any) {
            console.error('Connection error:', error);
            S.ui.toast(sgs.getTranslation(error?.message));
        } finally {
            S.ui.closeModelLoad();
        }
    }

    /** 对用户进行解封操作 */
    async unban(username: string, type: 'ban' | 'muted' | 'game') {
        try {
            let routeUrl: string;
            if (type === 'ban') {
                routeUrl = '/admin/unban-user';
            }
            if (type === 'muted') {
                routeUrl = '/admin/unban-muted';
            }
            if (type === 'game') {
                routeUrl = '/admin/unban-game';
            }
            await this.client.http.post(routeUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-name': encodeURIComponent(this.username),
                },
                body: JSON.stringify({
                    username,
                }),
            });
        } catch (error: any) {
            console.error('Connection error:', error);
            S.ui.toast(sgs.getTranslation(error?.message));
        } finally {
            S.ui.closeModelLoad();
        }
    }
}
