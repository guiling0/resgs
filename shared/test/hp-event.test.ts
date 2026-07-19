/**
 * RecoverHpEvent / ChangeMaxHpEvent 测试
 * 运行: npx tsx shared/test/hp-event.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';
import { RecoverHpEvent } from '../core/event/HpEvent';

async function test_recover(): Promise<void> {
    console.log('\n  ▶ 回复 2 点体力');

    const room = createRoom({ roomId: 'h1' });
    const p = createPlayer(room, 'p1', { hp: 1, maxhp: 4, seat: 1 });

    console.log(`    初始: hp=${p.hp}/${p.maxhp}`);
    await room.event.recover({ player: p, number: 2 });

    console.log(`    结果: hp=${p.hp}/${p.maxhp}`);
    assert(p.hp === 3, `hp=3, 实际=${p.hp}`);
}

async function test_recover_clamp(): Promise<void> {
    console.log('\n  ▶ 回复量超过已损失体力 → 自动钳制');

    const room = createRoom({ roomId: 'h2' });
    const p = createPlayer(room, 'p1', { hp: 3, maxhp: 4, seat: 1 });

    console.log(`    初始: hp=${p.hp}/${p.maxhp} (已损失1)`);
    // 请求回复5点，实际最多回复1点
    await room.event.recover({ player: p, number: 5 });

    console.log(`    结果: hp=${p.hp}/${p.maxhp}`);
    assert(p.hp === 4, `hp=4(钳制), 实际=${p.hp}`);
}

async function test_recover_fullHp(): Promise<void> {
    console.log('\n  ▶ 满血时回复 → check()=false，不执行');

    const room = createRoom({ roomId: 'h3' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    // check() 返回 false（已满血），exec() 直接返回
    const ev = new RecoverHpEvent(room, { player: p, number: 1 } as any);
    assert(!ev.check(), '满血 → check()=false');
}

async function test_changeMaxHp_increase(): Promise<void> {
    console.log('\n  ▶ 体力上限 +1（从 4→5）');

    const room = createRoom({ roomId: 'h4' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    console.log(`    初始: hp=${p.hp}/${p.maxhp}`);
    await room.event.changeMaxHp({ player: p, number: 1 });

    console.log(`    结果: hp=${p.hp}/${p.maxhp}`);
    assert(p.maxhp === 5, `maxhp=5, 实际=${p.maxhp}`);
    assert(p.hp === 4, `hp 不变=4, 实际=${p.hp}`);
}

async function test_changeMaxHp_decrease(): Promise<void> {
    console.log('\n  ▶ 体力上限 -2，hp 超过时钳制');

    const room = createRoom({ roomId: 'h5' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    console.log(`    初始: hp=${p.hp}/${p.maxhp}`);
    await room.event.changeMaxHp({ player: p, number: -2 });

    console.log(`    结果: hp=${p.hp}/${p.maxhp}`);
    assert(p.maxhp === 2, `maxhp=2, 实际=${p.maxhp}`);
    assert(p.hp === 2, `hp 钳制到 2, 实际=${p.hp}`);
}

async function test_changeMaxHp_toZero(): Promise<void> {
    console.log('\n  ▶ 体力上限降到 0 → 死亡');

    const room = createRoom({ roomId: 'h6' });
    const p = createPlayer(room, 'p1', { hp: 1, maxhp: 1, seat: 1 });

    console.log(`    初始: hp=${p.hp}/${p.maxhp} death=${p.death}`);
    await room.event.changeMaxHp({ player: p, number: -1 });

    console.log(`    结果: hp=${p.hp}/${p.maxhp} death=${p.death}`);
    assert(p.death, 'maxhp≤0 → 死亡');
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║        RecoverHp / ChangeMaxHp 测试套件               ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: '回复体力', fn: test_recover },
        { name: '回复钳制', fn: test_recover_clamp },
        { name: '满血不回复', fn: test_recover_fullHp },
        { name: '上限增加', fn: test_changeMaxHp_increase },
        { name: '上限减少', fn: test_changeMaxHp_decrease },
        { name: '上限归零死亡', fn: test_changeMaxHp_toZero },
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
