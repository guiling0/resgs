/**
 * DyingEvent / DeathEvent 测试
 * 运行: npx tsx shared/test/dying-death.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';
import { DyingEvent, DeathEvent } from '../core/event/DyingEvent';
import { DamageType } from '../core/event/EventTypes';

async function test_dying_noRescue(): Promise<void> {
    console.log('\n  ▶ 濒死无人救 → 死亡');

    const room = createRoom({ roomId: 'd1' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 3, seat: 2 });

    console.log(`    初始: pB hp=${pB.hp} death=${pB.death}`);

    await room.event.damage({
        player: pA,
        target: pB,
        damageType: DamageType.None,
        number: 2,
    });

    console.log(`    结果: pB hp=${pB.hp} death=${pB.death}`);
    assert(pB.death, 'pB 死亡');
    assert(pB.hp <= 0, `pB hp<=0, 实际=${pB.hp}`);
}

async function test_dying_eventCreated(): Promise<void> {
    console.log('\n  ▶ DyingEvent: triggers 结构正确');

    const room = createRoom({ roomId: 'd2' });
    const pB = createPlayer(room, 'pB', { hp: 0, maxhp: 3, seat: 2 });

    const ev = new DyingEvent(room, { player: pB } as any);
    assert(ev.player === pB, 'player 正确');
    assert(ev.eventTriggers.length === 3, `3个eventTriggers, 实际=${ev.eventTriggers.length}`);
    assert(ev.endTriggers.length === 1, `1个endTrigger, 实际=${ev.endTriggers.length}`);
}

async function test_dying_check(): Promise<void> {
    console.log('\n  ▶ DyingEvent.check(): 已死亡角色不触发濒死');

    const room = createRoom({ roomId: 'd3' });
    const pA = createPlayer(room, 'pA', { hp: 0, maxhp: 4, death: true, seat: 1 });

    const ev = new DyingEvent(room, { player: pA } as any);
    assert(!ev.check(), '已死亡 → check()=false');
}

async function test_dying_checkEvent(): Promise<void> {
    console.log('\n  ▶ DyingEvent.checkEvent(): hp>0 时清除 indying 并返回 false');

    const room = createRoom({ roomId: 'd4' });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 3, seat: 2 });

    const ev = new DyingEvent(room, { player: pB } as any);
    // 手动设置 indying 标记模拟濒死中状态
    pB.setMark('indying', ev.id);

    const result = ev.checkEvent();
    assert(!result, 'hp>0 → checkEvent()=false(濒死结束)');
    assert(pB.getMark('indying') === -ev.id, 'indying 标记已清除(设为负数)');
}

async function test_death_chainSkipCleared(): Promise<void> {
    console.log('\n  ▶ 死亡时清除连环和翻面状态');

    const room = createRoom({ roomId: 'd5' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 3, chained: true, skip: true, seat: 2 });

    await room.event.damage({
        player: pA,
        target: pB,
        damageType: DamageType.None,
        number: 2,
    });

    assert(pB.death, 'pB 死亡');
    assert(!pB.chained, '连环状态已清除');
    assert(!pB.skip, '翻面状态已清除');
}

async function test_fullChain(): Promise<void> {
    console.log('\n  ▶ 完整链: Damage → ReduceHp → Dying → Death');

    const room = createRoom({ roomId: 'd6' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 3, seat: 2 });

    console.log(`    初始: pB hp=${pB.hp}/${pB.maxhp} death=${pB.death}`);

    await room.event.damage({
        player: pA,
        target: pB,
        damageType: DamageType.None,
        number: 2,
    });

    console.log(`    结果: pB hp=${pB.hp}/${pB.maxhp} death=${pB.death}`);
    assert(pB.death, '完整链路 → 死亡');
    assert(room.eventStack.length === 0, `事件栈清空, 实际=${room.eventStack.length}`);
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║         DyingEvent / DeathEvent 测试套件              ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: '濒死无人救→死亡', fn: test_dying_noRescue },
        { name: 'triggers 结构', fn: test_dying_eventCreated },
        { name: '已死亡不触发 check', fn: test_dying_check },
        { name: 'hp>0 清除 indying', fn: test_dying_checkEvent },
        { name: '死亡清除连环翻面', fn: test_death_chainSkipCleared },
        { name: '完整链 Damage→Death', fn: test_fullChain },
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
