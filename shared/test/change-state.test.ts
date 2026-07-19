/**
 * ChangeStateEvent 测试案例
 *
 * 测试场景：
 *   1. detectChangeStateType 检测
 *   2. Chain 横置/重置
 *   3. Skip 翻面/翻回
 *   4. Open 明置武将
 *   5. Close 暗置武将
 *   6. prevent 防止状态改变
 *   7. EventManager 工厂
 */

(globalThis as any).sgs = {
    carddatas: new Map<string, any>(),
    getTranslation: (s: string) => s,
};

import { createRoom, createPlayer, assert } from './setup';
import { General } from '../core/general/General';
import { GeneralState } from '../core/schema/GeneralState';
import { detectChangeStateType, ChangeStateEvent } from '../core/event/ChangeStateEvent';
import {
    EventType,
    DamageType,
    TimingName,
    OpenEventData,
    CloseEventData,
    ChainEventData,
    SkipEventData,
    ChangeEventData,
    RemoveEventData,
} from '../core/event/EventTypes';

function createGeneral(room: any, id: string, name: string, put: boolean = false): General {
    const state = new GeneralState();
    state.id = id;
    state.put = put;
    const data: any = {
        name: id,
        kingdom: 'shu',
        hp: [2, 2],
        gender: 1,
        skills: [],
        lord: false,
        isWars: false,
        enable: true,
    };
    return new General(data, room, state);
}

// ===== 测试 1: detectChangeStateType =====

async function test_detect(): Promise<void> {
    console.log('\n  ▶ 测试 1: detectChangeStateType');

    assert(
        detectChangeStateType({ player: null!, generals: [], toState: true } as OpenEventData) === EventType.Open,
        'Open detected'
    );
    assert(
        detectChangeStateType({ player: null!, generals: [], toState: false } as CloseEventData) === EventType.Close,
        'Close detected'
    );
    assert(
        detectChangeStateType({ player: null!, toState: true, damageType: DamageType.None } as ChainEventData) === EventType.Chain,
        'Chain detected'
    );
    assert(
        detectChangeStateType({ player: null!, toState: true } as SkipEventData) === EventType.Skip,
        'Skip detected'
    );
    assert(
        detectChangeStateType({ player: null!, general: 'head', toGeneral: null! } as ChangeEventData) === EventType.Change,
        'Change detected'
    );
    assert(
        detectChangeStateType({ player: null!, general: null! } as RemoveEventData) === EventType.Remove,
        'Remove detected'
    );
}

// ===== 测试 2: Chain 横置 =====

async function test_chain(): Promise<void> {
    console.log('\n  ▶ 测试 2: Chain 横置/重置');

    const room = createRoom({ roomId: 'cs1' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1, chained: false });

    const event = new ChangeStateEvent(room, {
        player: playerA,
        toState: true,
        damageType: DamageType.Fire,
    } as ChainEventData);

    await event.exec();

    console.log(`    chained=${playerA.chained}`);
    assert(playerA.chained === true, '横置成功');
    assert(event.isComplete, '事件已完成');
}

// ===== 测试 3: Skip 翻面 =====

async function test_skip(): Promise<void> {
    console.log('\n  ▶ 测试 3: Skip 翻面');

    const room = createRoom({ roomId: 'cs2' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1, skip: false });

    const event = new ChangeStateEvent(room, {
        player: playerA,
        toState: true,
    } as SkipEventData);

    await event.exec();

    console.log(`    skip=${playerA.skip}`);
    assert(playerA.skip === true, '翻面成功');
}

// ===== 测试 4: Open 明置武将 =====

async function test_open(): Promise<void> {
    console.log('\n  ▶ 测试 4: Open 明置武将');

    const room = createRoom({ roomId: 'cs3' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const g = createGeneral(room, 'g1', 'zhaoyun', false);
    room.generals.set(g.id, g);
    playerA.head = g;

    const event = new ChangeStateEvent(room, {
        player: playerA,
        generals: [g],
        toState: true as const,
    });

    await event.exec();

    console.log(`    g.put=${g.put}`);
    assert(g.put === true, '明置成功');
    // 应推入 deferredOpens
}

// ===== 测试 5: Close 暗置武将 =====

async function test_close(): Promise<void> {
    console.log('\n  ▶ 测试 5: Close 暗置武将');

    const room = createRoom({ roomId: 'cs4' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const g = createGeneral(room, 'g2', 'zhaoyun', true);
    room.generals.set(g.id, g);
    playerA.head = g;

    const event = new ChangeStateEvent(room, {
        player: playerA,
        generals: [g],
        toState: false as const,
    });

    await event.exec();

    console.log(`    g.put=${g.put}`);
    assert(g.put === false, '暗置成功');
}

// ===== 测试 6: prevent 防止状态改变 =====

async function test_prevent(): Promise<void> {
    console.log('\n  ▶ 测试 6: prevent 防止状态改变');

    const room = createRoom({ roomId: 'cs5' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1, chained: false });

    const event = new ChangeStateEvent(room, {
        player: playerA,
        toState: true,
        damageType: DamageType.None,
    } as ChainEventData);

    event.registerBefore(TimingName.ChangeState, async () => {
        console.log('    [技能] 防止横置');
        await event.prevent();
    });

    await event.exec();

    console.log(`    chained=${playerA.chained} (应为 false)`);
    assert(playerA.chained === false, '横置被防止');
}

// ===== 测试 7: EventManager 工厂 =====

async function test_factory(): Promise<void> {
    console.log('\n  ▶ 测试 7: EventManager 工厂');

    const room = createRoom({ roomId: 'cs6' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1, skip: true });

    const event = await room.event.changeState({
        player: playerA,
        toState: false, // 翻回
    });

    console.log(`    type=${event.type} skip=${playerA.skip}`);
    assert(event.type === EventType.Skip, '自动检测为 Skip');
    assert(playerA.skip === false, '翻回成功');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('  ChangeStateEvent 测试套件');
    console.log('═'.repeat(60));

    const tests: { name: string; fn: () => Promise<void> }[] = [
        { name: 'detectChangeStateType', fn: test_detect },
        { name: 'Chain 横置', fn: test_chain },
        { name: 'Skip 翻面', fn: test_skip },
        { name: 'Open 明置', fn: test_open },
        { name: 'Close 暗置', fn: test_close },
        { name: 'prevent 防止', fn: test_prevent },
        { name: 'EventManager 工厂', fn: test_factory },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            await test.fn();
            console.log(`  ✅ ${test.name}`);
            passed++;
        } catch (e: any) {
            console.error(`  ❌ ${test.name}: ${e.message}`);
            failed++;
        }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  结果: ${passed} 通过, ${failed} 失败`);
    console.log(`${'═'.repeat(60)}\n`);

    if (failed > 0) (globalThis as any).process?.exit?.(1);
}

main();
