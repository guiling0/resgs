import { GameMode } from './GameMode';
import { Room } from './Room';
import { TurnEvent } from '../event/TurnEvent';

/** ModeBuilder 实例接口 */
export interface ModeBuilder {
    readonly name: string;
    maxPlayer(n: number): this;
    isTeamMode(v?: boolean): this;
    settings(s: Record<string, string[]>): this;
    rules(r: string): this;
    beforeStart(fn: (room: Room) => Promise<void>): this;
    mainProcess(fn: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>): this;
    register(): GameMode;
}

/** ModeBuilder 工厂——无需 new */
export function ModeBuilder(name: string): ModeBuilder {
    return new _ModeBuilder(name);
}

class _ModeBuilder implements ModeBuilder {
    readonly name: string;

    private _maxPlayer: number = 8;
    private _isTeamMode: boolean = false;
    private _settings: Record<string, string[]> = {};
    private _rules: string = '';
    private _beforeStart?: (room: Room) => Promise<void>;
    private _mainProcess?: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>;
    private _registered: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    maxPlayer(n: number): this {
        this._maxPlayer = n;
        return this;
    }

    isTeamMode(v: boolean = true): this {
        this._isTeamMode = v;
        return this;
    }

    settings(s: Record<string, string[]>): this {
        this._settings = s;
        return this;
    }

    rules(r: string): this {
        this._rules = r;
        return this;
    }

    beforeStart(fn: (room: Room) => Promise<void>): this {
        this._beforeStart = fn;
        return this;
    }

    mainProcess(fn: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>): this {
        this._mainProcess = fn;
        return this;
    }

    register(): GameMode {
        const existing = sgs.modes.get(this.name);
        if (existing) {
            console.warn(`[ModeBuilder] 模式 "${this.name}" 已存在——跳过重复注册`);
            return existing;
        }
        const data: GameMode = {
            name: this.name,
            maxPlayer: this._maxPlayer,
            isTeamMode: this._isTeamMode,
            settings: this._settings,
            rules: this._rules,
            beforeStart: this._beforeStart ?? (async () => {}),
            mainProcess: this._mainProcess,
        };
        sgs.modes.set(this.name, data);
        this._registered = true;
        return data;
    }
}
