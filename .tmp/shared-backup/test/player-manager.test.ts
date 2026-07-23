/**
 * PlayerManager 测试 — 玩家查询/排序/筛选
 * 运行: npx tsx shared/test/player-manager.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';

async function test_getAndGets(): Promise<void> {
    console.log('\n  ▶ get / gets / getIds');

    const room = createRoom({ roomId: 'p1' });
    createPlayer(room, 'pA', { seat: 1 });
    createPlayer(room, 'pB', { seat: 2 });
    createPlayer(room, 'pC', { seat: 3, death: true });

    const a = room.player.get('pA');
    assert(a !== undefined && a.playerId === 'pA', 'get(pA) 正确');

    const arr = room.player.gets(['pA', 'pC', 'pX']);
    assert(arr[0]?.playerId === 'pA', 'gets[0]=pA');
    assert(arr[2] === undefined, 'gets[2]=undefined(不存在)');

    const ids = room.player.getIds();
    assert(ids.length === 3, `共3名玩家, 实际=${ids.length}`);
}

async function test_filter(): Promise<void> {
    console.log('\n  ▶ filter / count');

    const room = createRoom({ roomId: 'p2' });
    createPlayer(room, 'pA', { seat: 1, hp: 3 });
    createPlayer(room, 'pB', { seat: 2, hp: 0, death: true });
    createPlayer(room, 'pC', { seat: 3, hp: 4 });

    // 默认不包含死亡
    const alive = room.player.filter(() => true);
    assert(alive.length === 2, `存活玩家=2, 实际=${alive.length}`);

    // 包含死亡
    const all = room.player.filter(() => true, true);
    assert(all.length === 3, `包含死亡=3, 实际=${all.length}`);

    // 按条件筛选
    const highHp = room.player.filter((p) => p.hp >= 4);
    assert(highHp.length === 1 && highHp[0].playerId === 'pC', 'hp>=4 只有pC');

    const cnt = room.player.count((p) => p.hp >= 3);
    assert(cnt === 2, `hp>=3 共2人, 实际=${cnt}`);
}

async function test_sort(): Promise<void> {
    console.log('\n  ▶ sort / sortResponse / sortClockwise');

    const room = createRoom({ roomId: 'p3' });
    const pA = createPlayer(room, 'pA', { seat: 1 });
    const pB = createPlayer(room, 'pB', { seat: 2 });
    const pC = createPlayer(room, 'pC', { seat: 3 });
    const pD = createPlayer(room, 'pD', { seat: 4 });

    // sortResponse — 从当前回合玩家开始逆时针排序
    const sorted = room.player.sortResponse([pA, pB, pC, pD]);
    assert(sorted.length === 4, 'sortResponse 长度不变');

    // sortClockwise
    const cw = room.player.sortClockwise([pA, pB, pC, pD]);
    assert(cw.length === 4, 'sortClockwise 长度不变');
}

async function test_sortWithStart(): Promise<void> {
    console.log('\n  ▶ sort: 指定起始玩家');

    const room = createRoom({ roomId: 'p4' });
    const pA = createPlayer(room, 'pA', { seat: 1 });
    const pB = createPlayer(room, 'pB', { seat: 2 });
    const pC = createPlayer(room, 'pC', { seat: 3 });

    // 从 pB 开始顺时针
    const sorted = room.player.sort([pA, pB, pC], pB, true);
    assert(sorted[0].playerId === 'pB', `起始=pB, 实际=${sorted[0].playerId}`);
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║             PlayerManager 测试套件                    ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: 'get/gets/getIds', fn: test_getAndGets },
        { name: 'filter/count', fn: test_filter },
        { name: 'sort/sortResponse/sortClockwise', fn: test_sort },
        { name: 'sort 指定起始玩家', fn: test_sortWithStart },
    ];

    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); passed++; }
        catch (e: any) {
            failed++;
            console.error(`\n  ❌ ${t.name}: ${e.message}`);
        }
    }
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  总计: ${passed + failed}  通过: ${passed}  失败: ${failed}`);
    console.log(`${'═'.repeat(60)}\n`);
}

main();
