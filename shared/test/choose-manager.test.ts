/**
 * ChooseManager 测试
 * 运行: npx tsx shared/test/choose-manager.test.ts
 */

(globalThis as any).sgs = {
    carddatas: new Map<string, any>(),
    cardpacks: new Map<string, any>(),
    modes: new Map<string, any>(),
    generals: new Map<string, any>(),
    selectors: new Map<string, any>(),
    getTranslation: (s: string) => s,
};
const sgsSelectors = (globalThis as any).sgs.selectors;
sgsSelectors.set('option', { name: 'option', type: 'Option', count: 1, selectable: () => [] });

import { createRoom, createPlayer, MockPlayerInput, assert } from './setup';
import { SelectorType } from '../core/select/SelectTypes';
import type { SelectSession, SelectResult } from '../core/select/SelectTypes';
import { GameCard } from '../core/card/GameCard';

// ===== 辅助 =====

function makeCtx(player: any, room: any) {
    return { player, room, results: undefined };
}

function makeSession(
    player: any,
    id: string,
    steps: any[],
    opts?: Partial<SelectSession>,
): SelectSession {
    return {
        id,
        player: player.playerId,
        steps,
        context: makeCtx(player, (globalThis as any).testRoom),
        ...opts,
    };
}

// ===== 1. 基本请求/响应 =====

async function test_basicRequestResponse(): Promise<void> {
    console.log('\n  ▶ 测试 1: 基本请求/响应');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const session = makeSession(player, 's1', [{ name: 'option' }]);
    const promise = room.choose.request(session);
    room.choose.respond('s1', { id: 's1', cancelled: false, results: { option: ['sha'] } });

    const result = await promise;
    assert(!result.cancelled, '未取消');
    assert(result.results['option']?.[0] === 'sha', '收到响应');
    // respond 应填充 ctx.results
    assert(session.context.results?.['option']?.[0] === 'sha', 'ctx.results 已填充');
}

// ===== 2. 取消选择 =====

async function test_cancel(): Promise<void> {
    console.log('\n  ▶ 测试 2: 取消选择');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pB', { hp: 4, maxhp: 4, seat: 1 });

    const session = makeSession(player, 's2', [{ name: 'option' }]);
    const promise = room.choose.request(session);
    room.choose.cancel('s2');
    const result = await promise;
    assert(result.cancelled === true, '已取消');
}

// ===== 3. 超时 =====

async function test_timeout(): Promise<void> {
    console.log('\n  ▶ 测试 3: 超时');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pC', { hp: 4, maxhp: 4, seat: 1 });

    const session = makeSession(player, 's3', [{ name: 'option' }], { timeout: 0.05 });
    const result = await room.choose.request(session);
    assert(result.cancelled === true, '超时取消');
    assert(result.timeout === true, '标记超时');
}

// ===== 4. autoSelectFirst + SelectorConfig =====

async function test_autoSelectFirst(): Promise<void> {
    console.log('\n  ▶ 测试 4: autoSelectFirst + SelectorConfig');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pD', { hp: 4, maxhp: 4, seat: 1 });

    const session = makeSession(player, 's4', [{
        name: 'pick',
        type: SelectorType.Option,
        count: 2,
        selectable: () => ['a', 'b', 'c'],
    }], { timeout: 0.05, autoSelectFirst: true });

    const result = await room.choose.request(session);
    assert(result.timeout === true, '超时');
    assert(!result.cancelled, 'autoSelect 生效');
    assert(result.results['pick']?.length === 2, '2 项');
    assert(result.results['pick'][0] === 'a', 'a');
    assert(result.results['pick'][1] === 'b', 'b');
}

// ===== 5. Room.chooseCard（返回 ID 后还原对象） =====

async function test_roomChooseCard(): Promise<void> {
    console.log('\n  ▶ 测试 5: Room.chooseCard（ID 转换）');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pE', { hp: 4, maxhp: 4, seat: 1 });
    const c1 = { id: 101, name: 'sha' } as any as GameCard;
    const c2 = { id: 102, name: 'shan' } as any as GameCard;
    const c3 = { id: 103, name: 'tao' } as any as GameCard;

    const promise = room.chooseCard(player, [c1, c2, c3], 2);
    const sid = room.choose.getPendingSessionIds(player.playerId)[0];
    // 响应返回的是 ID 列表
    room.choose.respond(sid, { id: sid, cancelled: false, results: { card: [101, 103] } });

    const selected = await promise;
    assert(selected.length === 2, '2 张');
    assert(selected[0] === c1, 'id=101→c1');
    assert(selected[1] === c3, 'id=103→c3');
}

// ===== 6. Room.choosePlayer =====

async function test_roomChoosePlayer(): Promise<void> {
    console.log('\n  ▶ 测试 6: Room.choosePlayer（ID 转换）');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const p1 = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });
    const p2 = createPlayer(room, 'p2', { hp: 4, maxhp: 4, seat: 2 });
    const p3 = createPlayer(room, 'p3', { hp: 4, maxhp: 4, seat: 3 });

    const promise = room.choosePlayer(p1, [p2, p3], 1);
    const sid = room.choose.getPendingSessionIds(p1.playerId)[0];
    room.choose.respond(sid, { id: sid, cancelled: false, results: { player: ['p3'] } });

    const selected = await promise;
    assert(selected.length === 1, '1 名');
    assert(selected[0] === p3, 'p3');
}

// ===== 7. Player 快捷 =====

async function test_playerShortcut(): Promise<void> {
    console.log('\n  ▶ 测试 7: Player.chooseOption');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pF', { hp: 4, maxhp: 4, seat: 1 });

    const promise = player.chooseOption(['yes', 'no'], 1);
    const sid = room.choose.getPendingSessionIds(player.playerId)[0];
    room.choose.respond(sid, { id: sid, cancelled: false, results: { option: ['yes'] } });

    const selected = await promise;
    assert(selected[0] === 'yes', 'yes');
}

// ===== 8. 并发 =====

async function test_concurrent(): Promise<void> {
    console.log('\n  ▶ 测试 8: 不同玩家并发');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const p1 = createPlayer(room, 'x1', { hp: 4, maxhp: 4, seat: 1 });
    const p2 = createPlayer(room, 'x2', { hp: 4, maxhp: 4, seat: 2 });

    const pA = room.choose.request(makeSession(p1, 'c1', [{ name: 'option' }]));
    const pB = room.choose.request(makeSession(p2, 'c2', [{ name: 'option' }]));
    room.choose.respond('c1', { id: 'c1', cancelled: false, results: { option: ['r1'] } });
    room.choose.respond('c2', { id: 'c2', cancelled: false, results: { option: ['r2'] } });

    const [r1, r2] = await Promise.all([pA, pB]);
    assert(r1.results['option']?.[0] === 'r1', 'r1');
    assert(r2.results['option']?.[0] === 'r2', 'r2');
}

// ===== 9. 自动取消旧会话 =====

async function test_autoCancel(): Promise<void> {
    console.log('\n  ▶ 测试 9: 自动取消旧会话');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pG', { hp: 4, maxhp: 4, seat: 1 });

    const p1 = room.choose.request(makeSession(player, 'ca1', [{ name: 'option' }]));
    const p2 = room.choose.request(makeSession(player, 'ca2', [{ name: 'option' }]));

    const r1 = await p1;
    assert(r1.cancelled === true, '旧会话取消');
    room.choose.cancel('ca2');
    await p2;
}

// ===== 10. isPending =====

async function test_isPending(): Promise<void> {
    console.log('\n  ▶ 测试 10: isPending');
    const input = new MockPlayerInput();
    const room = createRoom({ input });
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pH', { hp: 4, maxhp: 4, seat: 1 });

    assert(!room.choose.isPending(player.playerId), '无');
    const p = room.choose.request(makeSession(player, 'ip1', [{ name: 'option' }]));
    assert(room.choose.isPending(player.playerId), '有');
    room.choose.cancel('ip1');
    await p;
}

// ===== 11. respond 不存在 =====

async function test_respondUnknown(): Promise<void> {
    console.log('\n  ▶ 测试 11: respond 不存在');
    const room = createRoom();
    room.choose.respond('x', { id: 'x', cancelled: false, results: {} });
}

// ===== 12. 取消不超时 =====

async function test_noTimeout(): Promise<void> {
    console.log('\n  ▶ 测试 12: 取消后不超时');
    const room = createRoom();
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pI', { hp: 4, maxhp: 4, seat: 1 });

    const p = room.choose.request(makeSession(player, 'nt1', [{ name: 'option' }], { timeout: 2 }));
    room.choose.cancel('nt1');
    const r = await p;
    assert(r.cancelled && !r.timeout, '取消非超时');
}

// ===== 13. multiStep =====

async function test_multiStep(): Promise<void> {
    console.log('\n  ▶ 测试 13: multiStep');
    const room = createRoom();
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pJ', { hp: 4, maxhp: 4, seat: 1 });

    const s1 = makeSession(player, 'ms1', [{ name: 'option' }]);
    const s2 = makeSession(player, 'ms2', [{ name: 'option' }]);
    const s3 = makeSession(player, 'ms3', [{ name: 'option' }]);

    const promise = room.choose.multiStep(player.playerId, [s1, s2, s3], 10);
    setTimeout(() => room.choose.respond('ms1', { id: 'ms1', cancelled: false, results: { option: ['a'] } }), 10);
    setTimeout(() => room.choose.respond('ms2', { id: 'ms2', cancelled: false, results: { option: ['b'] } }), 20);
    setTimeout(() => room.choose.respond('ms3', { id: 'ms3', cancelled: false, results: { option: ['c'] } }), 30);

    const results = await promise;
    assert(results.length === 3, '3');
    assert(results[0].results['option']?.[0] === 'a', 'a');
    assert(results[1].results['option']?.[0] === 'b', 'b');
    assert(results[2].results['option']?.[0] === 'c', 'c');
    // s3 的 ctx 应包含前两步结果
    assert(s3.context.results?.['option']?.length === 3, 'ctx 累计 3 个结果');
}

// ===== 14. multiStep 中途取消 =====

async function test_multiStepCancel(): Promise<void> {
    console.log('\n  ▶ 测试 14: multiStep 中途取消');
    const room = createRoom();
    (globalThis as any).testRoom = room;
    const player = createPlayer(room, 'pK', { hp: 4, maxhp: 4, seat: 1 });

    const s1 = makeSession(player, 'mx1', [{ name: 'option' }]);
    const s2 = makeSession(player, 'mx2', [{ name: 'option' }]);
    const s3 = makeSession(player, 'mx3', [{ name: 'option' }]);

    const promise = room.choose.multiStep(player.playerId, [s1, s2, s3], 10);
    setTimeout(() => room.choose.respond('mx1', { id: 'mx1', cancelled: false, results: { option: ['ok'] } }), 10);
    setTimeout(() => room.choose.cancel('mx2'), 20);

    const results = await promise;
    assert(results.length === 2, '只有 2 个');
    assert(!results[0].cancelled, '第一步正常');
    assert(results[1].cancelled, '第二步取消');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('  ChooseManager 测试');
    console.log('═'.repeat(60));

    const tests: Array<{ name: string; fn: () => Promise<void> }> = [
        { name: '基本请求/响应', fn: test_basicRequestResponse },
        { name: '取消选择', fn: test_cancel },
        { name: '超时', fn: test_timeout },
        { name: 'autoSelectFirst', fn: test_autoSelectFirst },
        { name: 'chooseCard ID转换', fn: test_roomChooseCard },
        { name: 'choosePlayer ID转换', fn: test_roomChoosePlayer },
        { name: 'Player快捷', fn: test_playerShortcut },
        { name: '并发', fn: test_concurrent },
        { name: '自动取消旧会话', fn: test_autoCancel },
        { name: 'isPending', fn: test_isPending },
        { name: 'respond不存在', fn: test_respondUnknown },
        { name: '取消不超时', fn: test_noTimeout },
        { name: 'multiStep', fn: test_multiStep },
        { name: 'multiStep取消', fn: test_multiStepCancel },
    ];

    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); console.log(`  ✅ ${t.name}`); passed++; }
        catch (e: any) { console.error(`  ❌ ${t.name}: ${e.message}`); failed++; }
    }
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  结果: ${passed} 通过, ${failed} 失败`);
    console.log(`${'═'.repeat(60)}\n`);
    if (failed > 0) process.exit(1);
}

main();
