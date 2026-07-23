/**
 * TurnEvent / PhaseEvent 测试
 * 运行: npx tsx shared/test/turn-event.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';
import { TurnEvent } from '../core/event/TurnEvent';
import { TurnEventData, PhaseEventData, EventType } from '../core/event/EventTypes';
import { Phase } from '../core/player/PlayerTypes';

async function test_turnLifecycle(): Promise<void> {
    console.log('\n  ▶ TurnEvent 基本生命周期');

    const room = createRoom({ roomId: 't1' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    const ev = new TurnEvent(room, {
        turnId: 1,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [],
        skippedPhases: [],
        isRoundStart: true,
        isRoundEnd: false,
    } as TurnEventData);

    assert(ev.turnId === 1, 'turnId=1');
    assert(ev.player === p, 'player 正确');
    assert(!ev.isExtraTurn, '非额外回合');
    assert(ev.isRoundStart, '新轮开始');

    await ev.exec();

    // TurnEvent 即使 phases 为空，也应完成
    assert(ev.isComplete, '事件完成');
}

async function test_turnSkip(): Promise<void> {
    console.log('\n  ▶ TurnEvent: 翻面导致跳过');

    const room = createRoom({ roomId: 't2' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1, skip: true });

    const ev = new TurnEvent(room, {
        turnId: 2,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [],
        skippedPhases: [],
        isRoundStart: false,
        isRoundEnd: false,
    } as TurnEventData);

    await ev.exec();

    // 翻面玩家跳过回合
    assert(ev.isSkipped, '回合被跳过');
    assert(ev.isComplete, '事件完成');
}

async function test_restCountdown(): Promise<void> {
    console.log('\n  ▶ TurnEvent: 休整倒计时');

    const room = createRoom({ roomId: 't3' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1, death: true, rest: 2 });

    const ev = new TurnEvent(room, {
        turnId: 3,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [],
        skippedPhases: [],
        isRoundStart: false,
        isRoundEnd: false,
    } as TurnEventData);

    await ev.exec();

    // rest 从 2 减到 1，回合被跳过
    assert(p.rest === 1, `rest=1(从2减1), 实际=${p.rest}`);
    assert(ev.isSkipped, '休整未完成，回合跳过');
}

async function test_restRevive(): Promise<void> {
    console.log('\n  ▶ TurnEvent: 休整结束复活');

    const room = createRoom({ roomId: 't4' });
    const p = createPlayer(room, 'p1', { hp: 0, maxhp: 4, seat: 1, death: true, rest: 1 });

    const ev = new TurnEvent(room, {
        turnId: 4,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [],
        skippedPhases: [],
        isRoundStart: false,
        isRoundEnd: false,
    } as TurnEventData);

    await ev.exec();

    // rest=1→0: 复活，回合正常执行（inturn 在回合结束后由 _onTurnEnd 置回 false）
    assert(p.rest === 0, 'rest归零');
    assert(!p.death, '复活(death=false)');
}

async function test_skipPhase(): Promise<void> {
    console.log('\n  ▶ TurnEvent.skipPhase()');

    const room = createRoom({ roomId: 't5' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    const ev = new TurnEvent(room, {
        turnId: 5,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [{ player: p, phase: Phase.Draw, isExtraPhase: false }],
        skippedPhases: [],
        isRoundStart: false,
        isRoundEnd: false,
    } as TurnEventData);

    // 在事件开始前标记跳过摸牌阶段
    await ev.skipPhase(Phase.Draw);
    assert(ev.skippedPhases.includes(Phase.Draw), '摸牌阶段被标记跳过');

    await ev.exec();
}

async function test_isNotSkip(): Promise<void> {
    console.log('\n  ▶ TurnEvent.isNotSkip()');

    const room = createRoom({ roomId: 't6' });
    const p = createPlayer(room, 'p1', { hp: 4, maxhp: 4, seat: 1 });

    const ev = new TurnEvent(room, {
        turnId: 6,
        player: p,
        isExtraTurn: false,
        isSkipped: false,
        phases: [],
        skippedPhases: [Phase.Play],
        isRoundStart: false,
        isRoundEnd: false,
    } as TurnEventData);

    assert(ev.isNotSkip(Phase.Draw), 'Draw 未跳过');
    assert(!ev.isNotSkip(Phase.Play), 'Play 已跳过');
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║           TurnEvent / PhaseEvent 测试套件             ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: '基本生命周期', fn: test_turnLifecycle },
        { name: '翻面跳过', fn: test_turnSkip },
        { name: '休整倒计时', fn: test_restCountdown },
        { name: '休整复活', fn: test_restRevive },
        { name: 'skipPhase', fn: test_skipPhase },
        { name: 'isNotSkip', fn: test_isNotSkip },
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
