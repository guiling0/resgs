import { ColyseusSDK } from '@colyseus/sdk';
import { SERVER_CONFIG } from 'src/config';
import { RoomOption } from '@shared/core/room/RoomTypes';
import { SchemaConstructor } from 'node_modules/@colyseus/sdk/build/serializer/SchemaSerializer';

export interface LoginResult {
    token: string;
    user: {
        userId: string;
        username: string;
        nickname: string;
        role: string;
        avatar: string;
    };
}

export interface StatusResult {
    onlinePlayers: number;
    roomCount: number;
}

const TOKEN_KEY = 'resgs_token';
const USER_KEY = 'resgs_user';

class ApiClient {
    private _sdk: ColyseusSDK;
    private _token: string | null = null;

    constructor() {
        this._sdk = new ColyseusSDK(SERVER_CONFIG.wsUrl);
    }

    get token() {
        if (this._token) return this._token;
        this._token = Laya.LocalStorage.getJSON(TOKEN_KEY) ?? null;
        return this._token;
    }

    get isLoggedIn() {
        return this._token !== null;
    }

    // ===== Auth =====
    async login(username: string, password: string): Promise<LoginResult> {
        const res = await this._sdk.http.post('/auth/login', {
            body: {
                username,
                password,
            },
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.status !== 200) {
            throw new Error(res.data?.error || `请求失败 (${res.status})`);
        }
        this._token = res.data.token;
        Laya.LocalStorage.setJSON(TOKEN_KEY, res.data.token);
        Laya.LocalStorage.setJSON(USER_KEY, res.data.user);
        return res.data;
    }

    logout() {
        this._token = null;
        Laya.LocalStorage.setJSON(TOKEN_KEY, null);
        Laya.LocalStorage.setJSON(USER_KEY, null);
    }

    // ===== Status =====

    async getStatus(): Promise<StatusResult> {
        const res = await this._sdk.http.get('/status');
        return res.data;
    }

    // ===== Room =====

    joinLobby() {
        const token = this.token;
        return this._sdk.joinOrCreate('lobby', {
            accessToken: token,
        });
    }

    create<State>(
        roomType: string,
        options?: RoomOption,
        rootSchema?: SchemaConstructor<State>,
    ) {
        const token = this.token;
        return this._sdk.create(
            roomType,
            {
                accessToken: token,
                ...options,
            },
            rootSchema,
        );
    }

    join<State>(roomId: string, rootSchema?: SchemaConstructor<State>) {
        const token = this.token;
        return this._sdk.joinById(
            roomId,
            {
                accessToken: token,
            },
            rootSchema,
        );
    }
}

export const apiClient = new ApiClient();
