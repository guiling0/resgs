/**
 * Room 游戏流程 测试
 * 运行: npx tsx shared/test/game-flow.test.ts
 */

(globalThis as any).sgs = {
    carddatas: new Map<string, any>(),
    modes: new Map<string, any>(),
    getTranslation: (s: string) => s,
};

import { createRoom, createPlayer, assert } from './setup';
import { Room } from '../core/room/Room';
import { Phase } from '../core/player/PlayerTypes';
import { TurnEvent } from '../core/event/TurnEvent';

// ===== 测试 1: 初始状态 =====

async function test_initialState(): Promise<void> {
    console.log('\n  ▶ 测试 1: 初始状态');
    const room = createRoom({ roomId: 'gf1' });
    assert(room.state.turnCount === 0, 'state.turnCount=0');
    assert(room.state.roundCount === 0, 'state.roundCount=0');
    assert(!room.isGaming, '未开始游戏');
    assert(room.extraTurns.length === 0, 'extraTurns 为空');
}

// ===== 测试 2: 初始状态 =====

async function test_stateDefaults(): Promise<void> {
    console.log('\n  ▶ 测试 2: state 初始值');
    const room = createRoom({ roomId: 'gf2' });
    createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    assert(room.state.turnCount === 0, 'state.turnCount=0');
    assert(room.state.roundCount === 0, 'state.roundCount=0');
}

// ===== 测试 3: 额定阶段 =====

async function test_ratedPhases(): Promise<void> {
    console.log('\n  ▶ 测试 3: 6 个额定阶段');
    const phases = Room.getRatedPhases();
    assert(phases.length === 6, '6 个阶段');
    assert(phases[0] === Phase.Ready, 'Ready');
    assert(phases[5] === Phase.End, 'End');
}

// ===== 测试 4: 历史记录 =====

async function test_history(): Promise<void> {
    console.log('\n  ▶ 测试 4: 历史记录');
    const room = createRoom({ roomId: 'gf4' });
    room.insertHistory({ type: 'Test', id: 1 } as any);
    const found = room.getLastOneHistory('Test');
    assert(found !== undefined, '查询到刚记录的事件');
    const notFound = room.getLastOneHistory('Nonexistent');
    assert(notFound === undefined, '未找到不存在的事件');
}

// ===== 测试 5: 单玩家回合 =====

async function test_singlePlayerTurn(): Promise<void> {
    console.log('\n  ▶ 测试 5: 单玩家回合执行');
    const room = createRoom({ roomId: 'gf5' });
    const player = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const turn = new TurnEvent(room, {
        turnId: 1,
        player,
        isExtraTurn: false,
        isSkipped: false,
        phases: Room.getRatedPhases().map((p) => ({
            player, phase: p, isExtraPhase: false,
        })),
        skippedPhases: [],
        isRoundStart: true,
        isRoundEnd: false,
    });
    await turn.exec();
    assert(turn.isComplete, 'TurnEvent 执行完成');
}

// ===== 测试 6: mode_not_found → 平局 =====

async function test_modeNotFound(): Promise<void> {
    console.log('\n  ▶ 测试 6: mode 不存在 → 平局');
    const room = createRoom({ roomId: 'gf6' });
    createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    await room.startGame();
    assert(!room.isGaming, '游戏已结束');
    assert(room.state.roundCount === 0, '未进入主循环');
}

// ===== 测试 7: startGame 正常流程 =====

async function test_startGame(): Promise<void> {
    console.log('\n  ▶ 测试 7: startGame 正常流程');
    const room = createRoom({ roomId: 'gf7' });
    // 注册 mock mode
    (globalThis as any).sgs.modes.set('test', { name: 'test', beforeStart: async () => {} });
    room.options.mode = 'test';
    createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    await room.startGame();
    assert(room.mode?.name === 'test', 'mode 已缓存');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('  Room 游戏流程 测试套件');
    console.log('═'.repeat(60));

    const tests = [
        { name: '初始状态', fn: test_initialState },
        { name: 'state 默认值', fn: test_stateDefaults },
        { name: '额定阶段', fn: test_ratedPhases },
        { name: '历史记录', fn: test_history },
        { name: '单玩家回合', fn: test_singlePlayerTurn },
        { name: 'mode 不存在→平局', fn: test_modeNotFound },
        { name: 'startGame 正常流程', fn: test_startGame },
    ];

    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); console.log(`  ✅ ${t.name}`); passed++; }
        catch (e: any) { console.error(`  ❌ ${t.name}: ${e.message}`); failed++; }
    }
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  结果: ${passed} 通过, ${failed} 失败`);
    console.log(`${'═'.repeat(60)}\n`);
    if (failed > 0) (globalThis as any).process?.exit?.(1);
}

main();
