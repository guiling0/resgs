import type { Room } from '../entity/Room';
import type { TurnEvent } from '../logic/event/TurnEvent';
import type { GameModeData } from '../types/ModeTypes';

/** ModeBuilder 实例接口——链式构建游戏模式数据，不负责注册；name 为必传构造参数 */
export interface ModeBuilder {
    readonly name: string;
    /** 设置最大玩家数 */
    maxPlayer(n: number): this;
    /** 标记为团队模式 */
    isTeamMode(v?: boolean): this;
    /** 设置额外设置项（键→设置 key，值→选项列表，空数组表示 checkbox） */
    settings(s: Record<string, string[]>): this;
    /** 设置非通用规则技能 */
    rules(r: string): this;
    /** 设置游戏开始前回调 */
    beforeStart(fn: (room: Room) => Promise<void>): this;
    /** 设置主流程逻辑（决定回合交替顺序） */
    mainProcess(fn: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>): this;
    /** 构建模式数据 */
    build(): GameModeData;
    /** 注册到 sgs.modes（幂等） */
    register(): GameModeData;
}

/** ModeBuilder 工厂（sgs.ModeBuilder）——无需 new */
export function ModeBuilder(name: string): ModeBuilder {
    return new _ModeBuilder(name);
}

class _ModeBuilder implements ModeBuilder {
    readonly name: string;
    /** 最大玩家数 */
    private _maxPlayer: number = 8;
    /** 是否为团队模式 */
    private _isTeamMode: boolean = false;
    /** 额外设置项 */
    private _settings: Record<string, string[]> = {};
    /** 非通用规则技能 */
    private _rules: string = '';
    /** 游戏开始前回调 */
    private _beforeStart?: (room: Room) => Promise<void>;
    /** 主流程逻辑 */
    private _mainProcess?: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>;

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

    build(): GameModeData {
        return {
            name: this.name,
            maxPlayer: this._maxPlayer,
            isTeamMode: this._isTeamMode,
            settings: { ...this._settings },
            rules: this._rules,
            beforeStart: this._beforeStart,
            mainProcess: this._mainProcess,
        };
    }

    register(): GameModeData {
        if (sgs.modes.has(this.name)) {
            return sgs.modes.get(this.name)!;
        }
        const data = this.build();
        sgs.modes.set(data.name, data);
        return data;
    }
}

/** 构建并注册模式数据（sgs.createMode）——name 必传，内部经 ModeBuilder 复用默认值；已注册则直接返回已有数据 */
export function Mode(input: Pick<GameModeData, 'name'> & Partial<GameModeData>): GameModeData {
    if (sgs.modes.has(input.name)) {
        return sgs.modes.get(input.name)!;
    }
    const b = ModeBuilder(input.name);
    if (input.maxPlayer !== undefined) b.maxPlayer(input.maxPlayer);
    if (input.isTeamMode !== undefined) b.isTeamMode(input.isTeamMode);
    if (input.settings !== undefined) b.settings(input.settings);
    if (input.rules !== undefined) b.rules(input.rules);
    if (input.beforeStart !== undefined) b.beforeStart(input.beforeStart);
    if (input.mainProcess !== undefined) b.mainProcess(input.mainProcess);
    const data = b.build();
    sgs.modes.set(data.name, data);
    return data;
}
