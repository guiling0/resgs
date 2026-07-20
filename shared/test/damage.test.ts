/**
 * DamageEvent 测试案例
 *
 * 运行方式：
 *   cd shared && npx ts-node -r tsconfig-paths/register test/damage.test.ts
 *
 * 测试场景：
 *   1. 基本伤害流程：A 对 B 造成 1 点伤害
 *   2. 伤害防止：在 DamageStart 时机 prevent
 *   3. 护盾吸收：B 有护盾时受伤害
 *   4. 失去体力：LoseHpEvent 流程
 */

import { createRoom, createPlayer, assert } from './setup';
import { DamageEvent, LoseHpEvent, ReduceHpEvent } from '../core/event/DamageEvent';
import { DamageType, EventType, TimingName } from '../core/event/EventTypes';
import { DamageEventData, LoseHpEventData } from '../core/event/EventTypes';

// ===== 测试 1: 基本伤害流程 =====

async function test_basicDamage(): Promise<void> {
    console.log('\n  ▶ 测试 1: A 对 B 造成 1 点普通伤害');

    const room = createRoom({ roomId: 'r1' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    console.log('    初始状态:');
    console.log(`      pA hp=${playerA.hp}/${playerA.maxhp}`);
    console.log(`      pB hp=${playerB.hp}/${playerB.maxhp}`);

    // 执行伤害
    const event = new DamageEvent(room, {
        player: playerA,
        target: playerB,
        damageType: DamageType.None,
        number: 1,
    } as DamageEventData);

    await event.exec();

    console.log('    伤害后:');
    console.log(`      pA hp=${playerA.hp}/${playerA.maxhp}`);
    console.log(`      pB hp=${playerB.hp}/${playerB.maxhp}`);

    assert(event.isComplete, '事件已完成');
    assert(playerB.hp === 2, `B 体力从3降到2，实际=${playerB.hp}`);
    assert(playerA.hp === 4, `A 体力不变，实际=${playerA.hp}`);
}

// ===== 测试 2: 伤害防止 =====

async function test_preventDamage(): Promise<void> {
    console.log('\n  ▶ 测试 2: 在 DamageStart 时机防止伤害');

    const room = createRoom({ roomId: 'r2' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const event = new DamageEvent(room, {
        player: playerA,
        target: playerB,
        damageType: DamageType.None,
        number: 1,
    } as DamageEventData);

    // 模拟：在 DamageStart 时机，B 的技能防止伤害
    // 注意：防止必须在 triggerFunc 的 before 回调中执行
    // 这里我们直接调用 exec()，然后在事件开始时通过 insert 注入逻辑
    event.registerBefore(TimingName.DamageStart, async (_room, _data) => {
        console.log('    [技能] 防止伤害！');
        await event.prevent();
    });

    await event.exec();

    console.log(`    pB 体力: ${playerB.hp} (应为3) → 伤害被防止`);

    assert(event.isComplete, '事件已完成');
    assert(playerB.hp === 3, `B 体力不变，实际=${playerB.hp}`);
}

// ===== 测试 3: 护盾吸收 =====

async function test_shieldAbsorb(): Promise<void> {
    console.log('\n  ▶ 测试 3: B 有 1 护盾，受到 2 点伤害 → 护盾吸收 1 + HP 扣 1');

    const room = createRoom({ roomId: 'r3' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, shield: 1, seat: 2 });

    console.log(`    初始: pB hp=${playerB.hp} shield=${playerB.shield}`);

    const event = new DamageEvent(room, {
        player: playerA,
        target: playerB,
        damageType: DamageType.None,
        number: 2,
    } as DamageEventData);

    await event.exec();

    console.log(`    结果: pB hp=${playerB.hp} shield=${playerB.shield}`);

    assert(playerB.shield === 0, `护盾耗尽，实际=${playerB.shield}`);
    assert(playerB.hp === 2, `hp 从3降到2(shield吸收1,hp扣1)，实际=${playerB.hp}`);
}

// ===== 测试 4: 失去体力 =====

async function test_loseHp(): Promise<void> {
    console.log('\n  ▶ 测试 4: 失去体力事件（不受护盾影响）');

    const room = createRoom({ roomId: 'r4' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, shield: 2, seat: 1 });

    console.log(`    初始: pA hp=${playerA.hp} shield=${playerA.shield}`);
    console.log('    失去 2 点体力...');

    await room.event.loseHp({
        player: playerA,
        number: 2,
    });

    console.log(`    结果: pA hp=${playerA.hp} shield=${playerA.shield}`);

    assert(playerA.hp === 2, `hp 从4降到2(失去体力无视护盾)，实际=${playerA.hp}`);
    assert(playerA.shield === 2, `护盾不受影响，实际=${playerA.shield}`);
}

// ===== 测试 5: 事件栈与 source 追踪 =====

async function test_eventStack(): Promise<void> {
    console.log('\n  ▶ 测试 5: 嵌套事件 source 追踪');

    const room = createRoom({ roomId: 'r5' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const damageEvent = new DamageEvent(room, {
        player: playerA,
        target: playerB,
        damageType: DamageType.None,
        number: 1,
    } as DamageEventData);

    console.log(`    事件栈初始: ${room.eventStack.length}`);

    await damageEvent.exec();

    console.log(`    事件栈结束: ${room.eventStack.length}`);

    assert(room.eventStack.length === 0, '事件栈已清空');
    assert(damageEvent.source === undefined, '顶事件 source 为 undefined');
}

// ===== 测试 6: check() 合法性校验 =====

async function test_check(): Promise<void> {
    console.log('\n  ▶ 测试 6: 目标初始已死亡 → check()=false，不启动事件（checkEvent 只检查 number>0）');

    const room = createRoom({ roomId: 'r6' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 0, maxhp: 3, death: true, seat: 2 });

    const event = new DamageEvent(room, {
        player: playerA,
        target: playerB,
        damageType: DamageType.None,
        number: 1,
    } as DamageEventData);

    const checkResult = event.check();
    console.log(`    check() = ${checkResult}`);
    assert(!checkResult, '死亡目标 → check() 返回 false');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║        Damage / LoseHp / ReduceHp 测试套件           ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests: Array<{ name: string; fn: () => Promise<void> }> = [
        { name: '基本伤害流程', fn: test_basicDamage },
        { name: '伤害防止', fn: test_preventDamage },
        { name: '护盾吸收', fn: test_shieldAbsorb },
        { name: '失去体力', fn: test_loseHp },
        { name: '事件栈追踪', fn: test_eventStack },
        { name: '合法性校验', fn: test_check },
    ];

    let passed = 0;
    let failed = 0;

    for (const t of tests) {
        try {
            await t.fn();
            passed++;
        } catch (e: any) {
            failed++;
            console.error(`\n  ❌ ${t.name} 抛出异常:`);
            console.error(`     ${e.message}`);
            if (e.stack) {
                const trace = e.stack.split('\n').slice(1, 4).join('\n');
                console.error(`     ${trace}`);
            }
        }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  总计: ${passed + failed}  通过: ${passed}  失败: ${failed}`);
    console.log(`${'═'.repeat(60)}\n`);
}

main().catch((e) => {
    console.error('测试套件异常:', e);
});
