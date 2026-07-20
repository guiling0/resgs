import { GameMode, RoomOption } from '../GameMode';
import { Room } from '../Room';
import { TurnEvent } from '../../event/TurnEvent';

export class ModeBuilder {
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

    /** 最大玩家数（默认 8） */
    maxPlayer(n: number): this {
        this._maxPlayer = n;
        return this;
    }

    /** 是否为团队模式（默认 false） */
    isTeamMode(v: boolean = true): this {
        this._isTeamMode = v;
        return this;
    }

    /** 额外设置项——客户端据此构建 UI（键→选项列表） */
    settings(s: Record<string, string[]>): this {
        this._settings = s;
        return this;
    }

    /** 不通用的规则技能名 */
    rules(r: string): this {
        this._rules = r;
        return this;
    }

    /** 游戏开始前调用（必须提供） */
    beforeStart(fn: (room: Room) => Promise<void>): this {
        this._beforeStart = fn;
        return this;
    }

    /** 主流程逻辑——回合交替。不实现则按默认流程（顺时针轮流） */
    mainProcess(fn: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>): this {
        this._mainProcess = fn;
        return this;
    }

    /**
     * 构建 GameMode 并写入 sgs.modes。
     * 幂等——重复调用不重复注册。
     */
    register(): GameMode {
        const existing = sgs.modes.get(this.name);
        if (existing) {
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
