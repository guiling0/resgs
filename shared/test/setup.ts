import { Room } from '../core/room/Room';
import { RoomState } from '../core/schema/RoomState';
import { Player } from '../core/player/Player';
import { PlayerState } from '../core/schema/PlayerState';
import { ILogger, LogMeta } from '../core/ILogger';
import { IPlayerInput } from '../core/room/IPlayerInput';
import type { SelectSession, SelectResult } from '../core/select/SelectTypes';

// ===== Mock Logger — 输出到控制台，带格式化前缀 =====

export class ConsoleLogger implements ILogger {
    constructor(private showDebug: boolean = true) {}

    private _fmt(
        level: string,
        message: string,
        extra?: LogMeta,
    ): string {
        const room = extra?.roomId ? `[${extra.roomId}]` : '';
        const player = extra?.playerId ? `[${extra.playerId}]` : '';
        const event = extra?.event ? ` ${extra.event}` : '';
        const ts = new Date().toISOString().slice(11, 23);
        return `${ts} ${level}${room}${player}${event}  ${message}`;
    }

    debug(message: string, extra?: LogMeta): void {
        if (!this.showDebug) return;
        console.log(this._fmt('DEBUG', message, extra));
    }
    info(message: string, extra?: LogMeta): void {
        console.log(this._fmt('INFO ', message, extra));
    }
    warn(message: string, extra?: LogMeta): void {
        console.warn(this._fmt('WARN ', message, extra));
    }
    error(message: string, extra?: LogMeta): void {
        console.error(this._fmt('ERROR', message, extra));
    }
}

// ===== Mock PlayerInput — 自动响应（测试用）=====

export class MockPlayerInput implements IPlayerInput {
    /** 已发起的选择请求（用于测试断言） */
    lastSessions: Map<string, SelectSession> = new Map();

    async requestChoice(
        playerId: string,
        session: SelectSession,
    ): Promise<void> {
        this.lastSessions.set(playerId, session);
    }
}

// ===== Room 工厂 =====

export interface CreateRoomOptions {
    roomId?: string;
    gameId?: string;
    logger?: ILogger;
    input?: IPlayerInput;
}

export function createRoom(opts: CreateRoomOptions = {}): Room {
    const state = new RoomState();
    const logger = opts.logger ?? new ConsoleLogger(true);
    const input = opts.input ?? new MockPlayerInput();
    return new Room(
        opts.roomId ?? 'test-room',
        opts.gameId ?? 'test-game',
        { name: opts.roomId ?? 'test', mode: 'test', cards: [], generals: [], settings: {} },
        state,
        input,
        logger,
    );
}

// ===== Player 工厂 =====

export function createPlayer(
    room: Room,
    playerId: string,
    overrides: Partial<PlayerState> = {},
): Player {
    const player = room.player.createPlayer(playerId, overrides.username ?? playerId);
    Object.assign(player.state, overrides);
    player.state.playerId = playerId;
    return player;
}

// ===== 断言辅助 =====

export function assert(
    condition: boolean,
    message: string,
): void {
    if (!condition) {
        console.error(`  ❌ FAIL: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  ✅ PASS: ${message}`);
}

// ===== 测试分组 =====

let currentSuite = '';
let passed = 0;
let failed = 0;

export function describe(name: string): void {
    currentSuite = name;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${name}`);
    console.log(`${'═'.repeat(60)}`);
}

export function it(name: string, fn: () => Promise<void> | void): void {
    console.log(`\n  ▶ ${name}`);
    // 测试将由调用方手动运行
}

export function summary(): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  结果: ${passed} 通过, ${failed} 失败`);
    console.log(`${'═'.repeat(60)}\n`);
}
