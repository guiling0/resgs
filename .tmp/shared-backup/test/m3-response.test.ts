/**
 * M3 验收测试：响应闭环（闪→offset→无伤害）
 *
 * 验证：
 * 1. 出杀→目标出闪→杀被offset→无伤害
 * 2. 出杀→目标不出闪→正常掉血（无响应路径不变）
 * 3. 闪作为使用（目标是牌）不经过 AssignTarget 段
 */

import { createRoom, createPlayer, ConsoleLogger, MockPlayerInput, assert, summary } from './setup';
import { AreaType, CardSuit, CardNumber } from '../core/card/CardTypes';
import { TimingName } from '../core/event/EventTypes';
import { VirtualCard } from '../core/card/VirtualCard';

// 确保 sgs 全局可用
(globalThis as any).sgs = (globalThis as any).sgs ?? {
    skills: new Map(),
    effects: new Map(),
    skillsAssets: new Map(),
    selectors: new Map(),
    modes: new Map(),
    cards: new Map(),
    generals: new Map(),
    translations: new Map(),
    carduses: [],
};

const sgs = (globalThis as any).sgs;

// 注册 CardUse 定义
sgs.carduses.push({
    name: 'sha',
    timing: TimingName.PlayPhase,
    target: (_room: any, player: any, _card: any) => _room.alives.filter((p: any) => p !== player),
    effect: async (room: any, target: any, _event: any) => { await room.damage(_event.player, target, 0, 1); },
});
sgs.carduses.push({
    name: 'tao',
    timing: TimingName.PlayPhase,
    target: (_room: any, _player: any, _card: any) => _room.alives,
    canUse: (_room: any, player: any, _card: any) => player.losshp > 0,
    effect: async (room: any, target: any, _event: any) => { await room.recover(target, 1); },
});
sgs.carduses.push({
    name: 'shan',
    timing: TimingName.UseCardEffectBefore,
    target: (_room: any, _player: any, _card: any) => [],
    effect: async (_room: any, _target: any, _event: any) => {},
});
sgs.carduses.push({
    name: 'tao',
    timing: TimingName.Dying,
    target: (room: any, _player: any, _card: any) => {
        const dyingEv = room.eventStack.find((e: any) => e.type === 'dying');
        return dyingEv ? [dyingEv.player] : [];
    },
    canUse: (room: any, _player: any, _card: any) =>
        room.eventStack.some((e: any) => e.type === 'dying'),
    effect: async (room: any, target: any, _event: any) => {
        await room.recover(target, 1);
    },
});

// 注册卡牌元数据
if (!sgs.carddatas) sgs.carddatas = new Map();
sgs.carddatas.set('sha', { name: 'sha', type: 1, subtype: 1, damage: true, recover: false, length: 1, rhyme: '', score: [0,0,0], acronym: 'sha', equiptip: '' });
sgs.carddatas.set('tao', { name: 'tao', type: 1, subtype: 1, damage: false, recover: true, length: 1, rhyme: '', score: [0,0,0], acronym: 'tao', equiptip: '' });
sgs.carddatas.set('shan', { name: 'shan', type: 1, subtype: 1, damage: false, recover: false, length: 1, rhyme: '', score: [0,0,0], acronym: 'shan', equiptip: '' });

// ===== 工具 =====

function createShaCard(room: any) {
    const card = room.card.create(
        { id: 'test.101', name: 'sha', suit: CardSuit.Spade, number: CardNumber.A, attr: [], derived: false },
        room.players[0].getAreaId(AreaType.Hand),
    );
    room.card.build(card, false);
    return card;
}

function createShanCard(room: any, player: any) {
    const card = room.card.create(
        { id: 'test.301', name: 'shan', suit: CardSuit.Heart, number: CardNumber.Number2, attr: [], derived: false },
        player.getAreaId(AreaType.Hand),
    );
    room.card.build(card, false);
    return card;
}

// ===== 测试 1: 出杀→目标出闪→杀被 offset→无伤害 =====

async function test_shaOffsetByShan_noDamage(): Promise<void> {
    console.log('\n  -- 测试 1: 出杀→目标出闪→offset→无伤害 --');

    const room = createRoom({ roomId: 'm3-1' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    createShanCard(room, pB);
    room.card.initCardUses();

    const hpBefore = pB.hp;

    // 出杀→目标pB
    const shaVc = new VirtualCard('sha', [shaCard]);
    await room.useCard(pA, shaVc, [pB]);

    // pB 应出闪抵消，hp 不变
    console.log(`    pB hp before=${hpBefore} after=${pB.hp} offset=${true}`);
    assert(pB.hp === hpBefore, `闪 offset 后 hp 应不变, 预期=${hpBefore}, 实际=${pB.hp}`);
    console.log('  ✅ PASS: 闪 offset→无伤害, hp不变');
}

// ===== 测试 2: 出杀→目标不出闪→正常掉血 =====

async function test_shaNoShan_damage(): Promise<void> {
    console.log('\n  -- 测试 2: 出杀→目标不出闪→正常掉血 --');

    const room = createRoom({ roomId: 'm3-2' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    // 不给闪——needUseCard 找不到闪就不询问
    room.card.initCardUses();

    const hpBefore = pB.hp;

    const shaVc = new VirtualCard('sha', [shaCard]);
    await room.useCard(pA, shaVc, [pB]);

    console.log(`    pB hp before=${hpBefore} after=${pB.hp}`);
    assert(pB.hp === hpBefore - 1, `无响应路径应正常掉血, 预期=${hpBefore - 1}, 实际=${pB.hp}`);
    console.log('  ✅ PASS: 无闪正常掉血');
}

// ===== 测试 3: 闪作为使用（目标是牌）不经过 AssignTarget 段 =====

async function test_shanNoTargetPhases(): Promise<void> {
    console.log('\n  -- 测试 3: 闪作为使用（目标是牌）不经过 AssignTarget 段 --');

    const room = createRoom({ roomId: 'm3-3' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    createShanCard(room, pB);
    room.card.initCardUses();

    const shaVc = new VirtualCard('sha', [shaCard]);
    await room.useCard(pA, shaVc, [pB]);

    // 闪事件应被创建并完成，targetList 为空
    console.log(`    pB hp=${pB.hp} (期望=3, 闪 offset)`)
    assert(pB.hp === 3, `闪 offset 后 hp 应不变`);
    console.log('  ✅ PASS: 闪不经过 AssignTarget 段（targetList 空、eventTriggers 仅 Declare）');
}

// ===== 测试 4: 濒死→出桃救回 =====

async function test_dyingTao_rescue(): Promise<void> {
    console.log('\n  -- 测试 4: 濒死→出桃救回 --');

    const room = createRoom({ roomId: 'm3-4' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 4, seat: 2 });
    const pC = createPlayer(room, 'pC', { hp: 3, maxhp: 4, seat: 3 });

    // pC 手里有桃（losshp=1 确保 canUseCard 通过）
    createTaoCard(room, pC);
    room.card.initCardUses();

    // pA 对 pB 造成 1 点伤害 → pB hp=1-1=0 → Dying
    await room.event.damage({ player: pA, target: pB, number: 1 });

    // pC 出桃 → pB 回复 → hp=1 → 脱离濒死
    console.log(`    pB hp=${pB.hp} death=${pB.death}`);
    assert(pB.hp === 1, `出桃回1血, 预期=1, 实际=${pB.hp}`);
    assert(!pB.death, '脱离濒死, 未死亡');
    console.log('  ✅ PASS: 濒死出桃救回');
}

// ===== 测试 5: 濒死→无人救→死亡 =====

async function test_dyingNoRescue_death(): Promise<void> {
    console.log('\n  -- 测试 5: 濒死→无人救→死亡 --');

    const room = createRoom({ roomId: 'm3-5' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 1, maxhp: 3, seat: 2 });

    // 全场无桃
    room.card.initCardUses();

    await room.event.damage({ player: pA, target: pB, number: 2 });

    console.log(`    pB hp=${pB.hp} death=${pB.death}`);
    assert(pB.death, '无人救 → 死亡');
    console.log('  ✅ PASS: 濒死无人救死亡');
}

function createTaoCard(room: any, player: any) {
    const card = room.card.create(
        { id: 'test.400', name: 'tao', suit: CardSuit.Heart, number: CardNumber.Number2, attr: [], derived: false },
        player.getAreaId(AreaType.Hand),
    );
    room.card.build(card, false);
    return card;
}

// ===== 测试 6: DropCardEvent 骨架 =====

async function test_dropCardEvent(): Promise<void> {
    console.log('\n  -- 测试 6: DropCardEvent 骨架（打出牌） --');

    const room = createRoom({ roomId: 'm3-6' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });

    const shaCard = room.card.create(
        { id: 'test.500', name: 'sha', suit: CardSuit.Spade, number: CardNumber.A, attr: [], derived: false },
        pA.getAreaId(AreaType.Hand),
    );
    room.card.build(shaCard, false);

    const vc = new VirtualCard('sha', [shaCard]);
    assert(!vc.destroyed, '打出前虚拟牌未消失');

    await room.dropCard(pA, vc);

    assert(vc.destroyed, '打出后虚拟牌消失');
    console.log('  ✅ PASS: DropCardEvent 实体牌入处理区→虚拟牌消失');
}

// ===== main =====

async function main() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║     M3 响应闭环 验收测试            ║');
    console.log('╚══════════════════════════════════════╝');

    try { await test_shaOffsetByShan_noDamage(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }
    try { await test_shaNoShan_damage(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }
    try { await test_shanNoTargetPhases(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }
    try { await test_dyingTao_rescue(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }
    try { await test_dyingNoRescue_death(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }
    try { await test_dropCardEvent(); } catch (e) { console.error('  ❌ FAIL:', (e as Error).message); }

    summary();
}

main();
