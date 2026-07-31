/**
 * JudgeEvent 测试案例
 *
 * 运行方式：
 *   npx tsx shared/test/judge.test.ts
 *
 * 测试场景：
 *   1. 基本判定流程：从牌堆取牌 → 处理区 → 创建虚拟牌 → 结束移回弃牌堆
 *   2. setCard 改判：旧牌移入弃牌堆 → 新牌设为判定牌
 *   3. isSuccess 判定成功/失败
 *   4. resetSuccess 重新评估
 *   5. EventManager.judge 工厂方法
 *   6. Room.judge / Player.judge 快捷方法
 *   7. check() 玩家死亡时不可判定
 */

(globalThis as any).sgs = {
    carddatas: new Map<string, any>(),
};

import {
    createRoom,
    createPlayer,
    assert,
} from './setup';
import { Room } from '../core/room/Room';
import { GameCard } from '../core/card/GameCard';
import { CardState } from '../core/schema/CardState';
import {
    GameCardData,
    CardSuit,
    CardNumber,
    CardColor,
    AreaType,
} from '../core/card/CardTypes';
import { VirtualCardData } from '../core/card/CardTypes';
import { JudgeEvent } from '../core/event/JudgeEvent';
import { EventType, TimingName } from '../core/event/EventTypes';

// ===== 卡牌工厂 =====

function createCard(
    room: Room,
    id: number,
    overrides: Partial<GameCardData> = {},
): GameCard {
    const data: GameCardData = {
        id,
        name: overrides.name ?? 'sha',
        suit: overrides.suit ?? CardSuit.Spade,
        color: overrides.color ?? CardColor.Black,
        number: overrides.number ?? CardNumber.A,
        attr: overrides.attr ?? [],
        derived: overrides.derived ?? false,
    };
    const state = new CardState();
    const card = new GameCard(data, room, state);
    room.cards.set(card.id, card);
    room.state.game.cardStates.set(card.id.toString(), state);
    return card;
}

// ===== 测试 1: 基本判定流程 =====

async function test_basicJudge(): Promise<void> {
    console.log('\n  ▶ 测试 1: 基本判定流程');

    const room = createRoom({ roomId: 'j1' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    // 在牌堆放几张牌
    const c1 = createCard(room, 1, { name: 'sha', suit: CardSuit.Heart, number: CardNumber.K });
    const c2 = createCard(room, 2, { name: 'shan' });
    room.area.add(AreaType.Draw, [c1.id, c2.id]);

    // 判定：红桃 K → isSuccess 检查是否为红桃
    const event = new JudgeEvent(room, {
        player: playerA,
        isSuccess: (r: VirtualCardData) => r.suit === CardSuit.Heart,
    });

    await event.exec();

    console.log(`    card=${event.card?.id} result suit=${event.result?.suit} success=${event.success}`);
    assert(event.isComplete, '事件已完成');
    assert(event.card !== undefined, '判定牌已设置');
    assert(event.result !== undefined, '判定结果已设置');
    assert(event.success === true, '红桃K → 判定成功');
    // 判定牌应在 JudgeEnd 后被移入弃牌堆
    if (event.card) {
        console.log(`    判定牌最终区域: ${event.card.area}`);
    }
}

// ===== 测试 2: setCard 改判 =====

async function test_setCard(): Promise<void> {
    console.log('\n  ▶ 测试 2: setCard 改判');

    const room = createRoom({ roomId: 'j2' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const oldCard = createCard(room, 10, { name: 'sha', suit: CardSuit.Spade, number: CardNumber.Number2 });
    const newCard = createCard(room, 11, { name: 'sha', suit: CardSuit.Heart, number: CardNumber.A });
    room.area.add(AreaType.Draw, [oldCard.id, newCard.id]);

    const event = new JudgeEvent(room, {
        player: playerA,
        isSuccess: (r) => r.suit === CardSuit.Heart,
    });

    // 注册改判回调：在 JudgeCard 时机替换判定牌
    event.registerAfter(TimingName.JudgeCard, async () => {
        console.log('    [改判] 黑桃2 → 红桃A');
        await event.setCard(newCard);
    });

    await event.exec();

    console.log(`    card=${event.card?.id} suit=${event.result?.suit} success=${event.success}`);
    assert(event.card === newCard, '改判后判定牌应为红桃A');
    assert(event.success === true, '红桃 → 判定成功');
    // 旧牌应在 setCard 时移入弃牌堆
    console.log(`    旧牌区域: ${oldCard.area}`);
}

// ===== 测试 3: isSuccess 失败 =====

async function test_judgeFail(): Promise<void> {
    console.log('\n  ▶ 测试 3: 判定失败');

    const room = createRoom({ roomId: 'j3' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const card = createCard(room, 20, { name: 'sha', suit: CardSuit.Club, number: CardNumber.Number7 });
    room.area.add(AreaType.Draw, [card.id]);

    const event = new JudgeEvent(room, {
        player: playerA,
        isSuccess: (r) => r.suit === CardSuit.Heart, // 只有红桃成功
    });

    await event.exec();

    console.log(`    card suit=${event.result?.suit} success=${event.success}`);
    assert(event.success === false, '梅花7 → 判定失败');
}

// ===== 测试 4: resetSuccess =====

async function test_resetSuccess(): Promise<void> {
    console.log('\n  ▶ 测试 4: resetSuccess 重新评估');

    const room = createRoom({ roomId: 'j4' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const card = createCard(room, 30, { name: 'sha', suit: CardSuit.Heart, number: CardNumber.Number3 });
    room.area.add(AreaType.Draw, [card.id]);

    const event = new JudgeEvent(room, {
        player: playerA,
        isSuccess: (r) => r.number >= CardNumber.Number5, // K 才成功
    });

    // 在 evaluate 之前改结果
    event.registerBefore(TimingName.JudgeResultAfter1, async () => {
        console.log('    [改判结果] 设为红桃K');
        if (event.result) {
            (event.result as any).number = CardNumber.K;
            event.resetSuccess();
        }
    });

    await event.exec();

    console.log(`    result number=${event.result?.number} success=${event.success}`);
    assert(event.success === true, '改为红桃K后 → 判定成功');
}

// ===== 测试 5: EventManager 工厂 =====

async function test_factory(): Promise<void> {
    console.log('\n  ▶ 测试 5: EventManager.judge 工厂方法');

    const room = createRoom({ roomId: 'j5' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const card = createCard(room, 40, { name: 'sha', suit: CardSuit.Heart });
    room.area.add(AreaType.Draw, [card.id]);

    const event = await room.event.judge({
        player: playerA,
        isSuccess: () => true,
    });

    console.log(`    event.type=${event.type} isComplete=${event.isComplete}`);
    assert(event.type === EventType.Judge, '事件类型=Judge');
    assert(event.isComplete, '事件已完成');
}

// ===== 测试 6: Room/Player 快捷方法 =====

async function test_shortcuts(): Promise<void> {
    console.log('\n  ▶ 测试 6: Room.judge / Player.judge 快捷方法');

    const room = createRoom({ roomId: 'j6' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const card = createCard(room, 50, { name: 'sha', suit: CardSuit.Spade });
    room.area.add(AreaType.Draw, [card.id]);

    // Room.judge
    const ev1 = await room.judge(playerA, (r) => r.suit === CardSuit.Spade);
    console.log(`    Room.judge: success=${ev1.success}`);
    assert(ev1.success === true, 'Room.judge 黑桃 → 成功');

    // Player.judge
    const card2 = createCard(room, 51, { name: 'shan', suit: CardSuit.Club });
    room.area.add(AreaType.Draw, [card2.id]);

    const ev2 = await playerA.judge((r) => r.suit === CardSuit.Heart);
    console.log(`    Player.judge: success=${ev2.success}`);
    assert(ev2.success === false, 'Player.judge 梅花 → 失败');
}

// ===== 测试 7: check() 死亡不可判定 =====

async function test_deadPlayer(): Promise<void> {
    console.log('\n  ▶ 测试 7: 死亡玩家不可判定');

    const room = createRoom({ roomId: 'j7' });
    const playerA = createPlayer(room, 'pA', { hp: 0, maxhp: 4, seat: 1, death: true });

    const event = new JudgeEvent(room, {
        player: playerA,
        isSuccess: () => true,
    });

    const valid = event.check();
    console.log(`    check()=${valid}`);
    assert(!valid, '死亡玩家 check()=false');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('  JudgeEvent 测试套件');
    console.log('═'.repeat(60));

    const tests: { name: string; fn: () => Promise<void> }[] = [
        { name: '基本判定', fn: test_basicJudge },
        { name: 'setCard 改判', fn: test_setCard },
        { name: '判定失败', fn: test_judgeFail },
        { name: 'resetSuccess', fn: test_resetSuccess },
        { name: 'EventManager 工厂', fn: test_factory },
        { name: 'Room/Player 快捷', fn: test_shortcuts },
        { name: '死亡不可判定', fn: test_deadPlayer },
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

    if (failed > 0) {
        (globalThis as any).process?.exit?.(1);
    }
}

main();
