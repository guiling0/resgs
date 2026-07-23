import { ColyseusSDK } from '@colyseus/sdk';
import { SERVER_CONFIG } from 'src/config';

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
}

export const apiClient = new ApiClient();
