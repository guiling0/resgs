/**
 * EventManager 测试 — 事件创建、历史记录、复活队列、refreshs 注册
 * 运行: npx tsx shared/test/event-manager.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';
import { DamageEvent } from '../core/event/DamageEvent';
import { DamageType } from '../core/event/EventTypes';

async function test_create(): Promise<void> {
    console.log('\n  ▶ create: 泛型工厂 + 元数据注入');

    const room = createRoom({ roomId: 'e1' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const ev = await room.event.create(DamageEvent, {
        player: pA,
        target: pB,
        damageType: DamageType.None,
        number: 1,
    }, { reason: 'test', source: undefined });

    assert(ev.isComplete, '事件执行完成');
    assert(ev.data.reason === 'test', 'reason 正确注入');
    assert(pB.hp === 2, `pB hp=2, 实际=${pB.hp}`);
}

async function test_insertHistory(): Promise<void> {
    console.log('\n  ▶ insertHistory: stub 不抛异常');

    const room = createRoom({ roomId: 'e2' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const ev = new DamageEvent(room, {
        player: pA, target: pB,
        damageType: DamageType.None, number: 1,
    } as any);

    // 直接调用应不抛异常
    room.event.insertHistory(ev);
    assert(true, 'insertHistory 不抛异常');  // 到达这里即通过
}

async function test_drainFuhuos_empty(): Promise<void> {
    console.log('\n  ▶ drainFuhuos: 空队列不抛异常');

    const room = createRoom({ roomId: 'e3' });
    await room.event.drainFuhuos();
    assert(true, '空队列 drain 不抛异常');
}

async function test_drainFuhuos_withCallbacks(): Promise<void> {
    console.log('\n  ▶ drainFuhuos: 执行回调');

    const room = createRoom({ roomId: 'e4' });
    let called = false;
    room.fuhuos.push(async () => { called = true; });

    await room.event.drainFuhuos();
    assert(called, '回调被执行');
    assert(room.fuhuos.length === 0, '队列已清空');
}

async function test_registerRefreshs(): Promise<void> {
    console.log('\n  ▶ registerRefreshs / unregisterRefreshs');

    const room = createRoom({ roomId: 'e5' });
    const fakeSource = { id: 1, name: 'test' } as any;

    // 注册
    room.event.registerRefreshs(fakeSource, [
        { trigger: 'damage_start', fn: async () => {}, position: 'before' },
    ] as any);

    const entry = room.refreshsByTiming.get('damage_start' as any);
    assert(entry !== undefined, 'refreshs 已注册');
    assert(entry!.before.length === 1, 'before 有1条');

    // 注销
    room.event.unregisterRefreshs(fakeSource, [
        { trigger: 'damage_start', fn: async () => {}, position: 'before' },
    ] as any);

    assert(entry!.before.length === 0, 'before 已清空');
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║              EventManager 测试套件                    ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: 'create 泛型工厂', fn: test_create },
        { name: 'insertHistory stub', fn: test_insertHistory },
        { name: 'drainFuhuos 空队列', fn: test_drainFuhuos_empty },
        { name: 'drainFuhuos 执行回调', fn: test_drainFuhuos_withCallbacks },
        { name: 'register/unregister refreshs', fn: test_registerRefreshs },
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
