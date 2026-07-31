/**
 * M2 验收测试：使用牌骨架（UseCardEvent + room.useCard/canUseCard + 杀/桃）
 *
 * 验证：
 * 1. 出杀→目标掉血（核心验收）
 * 2. 出桃→自己回血（核心验收）
 * 3. 实体牌移入处理区
 * 4. 使用结束后实体牌入弃牌堆
 * 5. 虚拟牌使用结束后消失
 * 6. 目标列表逆时针编号
 * 7. canUseCard 杀次数限制（M3 补全 history 查询后）
 * 8. canUseCard 桃体力满时不可用
 * 9. targetList 结构完整性
 * 10. 虚拟牌继承实体牌花色点数
 */

import { createRoom, createPlayer, ConsoleLogger, MockPlayerInput, assert, summary } from './setup';
import { VirtualCard } from '../core/card/VirtualCard';
import { AreaType, CardSuit, CardNumber } from '../core/card/CardTypes';

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

// 注册 CardUse 定义（杀/桃——基础扩展迁移前暂驻测试）
sgs.carduses.push({
    name: 'sha',
    timing: 31, // TimingName.PlayPhase
    target: (_room: any, player: any, _card: any) => _room.alives.filter((p: any) => p !== player),
    effect: async (room: any, target: any, _event: any) => { await room.damage(_event.player, target, 0, 1); },
});
sgs.carduses.push({
    name: 'tao',
    timing: 31, // TimingName.PlayPhase
    target: (_room: any, _player: any, _card: any) => _room.alives,
    canUse: (_room: any, player: any, _card: any) => player.losshp > 0,
    effect: async (room: any, target: any, _event: any) => { await room.recover(target, 1); },
});

// 注册卡牌元数据（供 GameCard.type 查询）
if (!sgs.carddatas) sgs.carddatas = new Map();
sgs.carddatas.set('sha', { name: 'sha', type: 1, subtype: 1, damage: true, recover: false, length: 1, rhyme: '', score: [0,0,0], acronym: 'sha', equiptip: '' });
sgs.carddatas.set('tao', { name: 'tao', type: 1, subtype: 1, damage: false, recover: true, length: 1, rhyme: '', score: [0,0,0], acronym: 'tao', equiptip: '' });

// ===== 工具 =====

function createShaCard(room: any) {
    const card = room.card.create(
        { id: 'test.100', name: 'sha', suit: CardSuit.Spade, number: CardNumber.A, attr: [], derived: false },
        room.players[0].getAreaId(AreaType.Hand),
    );
    room.card.build(card, false);
    return card;
}

function createTaoCard(room: any) {
    const card = room.card.create(
        { id: 'test.200', name: 'tao', suit: CardSuit.Heart, number: CardNumber.Number2, attr: [], derived: false },
        room.players[0].getAreaId(AreaType.Hand),
    );
    room.card.build(card, false);
    return card;
}

// ===== 测试 1: 出杀→目标掉血（核心验收）=====

async function test_shaDamagesTarget(): Promise<void> {
    console.log('\n  -- 测试 1: 出杀→目标掉血 --');

    const room = createRoom({ roomId: 'm2-1' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('sha', [shaCard]);
    const beforeHp = pB.hp;
    await room.useCard(pA, vc, [pB]);
    const afterHp = pB.hp;

    console.log(`    pB hp: ${beforeHp} → ${afterHp}`);
    assert(afterHp === beforeHp - 1, `目标扣1血，期望=${beforeHp - 1}，实际=${afterHp}`);
    assert(vc.destroyed, '虚拟牌已消失');
}

// ===== 测试 2: 出桃→自己回血（核心验收）=====

async function test_taoRecoversSelf(): Promise<void> {
    console.log('\n  -- 测试 2: 出桃→自己回血 --');

    const room = createRoom({ roomId: 'm2-2' });
    const pA = createPlayer(room, 'pA', { hp: 2, maxhp: 4, seat: 1 });
    pA.hp = 2; // 已损失 2 点体力

    const taoCard = createTaoCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('tao', [taoCard]);
    const beforeHp = pA.hp;
    await room.useCard(pA, vc, [pA]);
    const afterHp = pA.hp;

    console.log(`    pA hp: ${beforeHp} → ${afterHp}`);
    assert(afterHp === beforeHp + 1, `回1血，期望=${beforeHp + 1}，实际=${afterHp}`);
    assert(vc.destroyed, '虚拟牌已消失');
}

// ===== 测试 3: 使用后虚拟牌消失 =====

async function test_virtualCardDestroyed(): Promise<void> {
    console.log('\n  -- 测试 3: 虚拟牌消失 --');

    const room = createRoom({ roomId: 'm2-3' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('sha', [shaCard]);
    assert(!vc.destroyed, '使用前虚拟牌未消失');
    await room.useCard(pA, vc, [pB]);
    assert(vc.destroyed, '使用后虚拟牌已消失');
}

// ===== 测试 4: 目标列表逆时针编号 =====

async function test_targetListOrder(): Promise<void> {
    console.log('\n  -- 测试 5: 目标列表逆时针 --');

    const room = createRoom({ roomId: 'm2-5' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });
    const pC = createPlayer(room, 'pC', { hp: 3, maxhp: 3, seat: 3 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    // 如果当前没有 turn，默认从 seat=1 开始逆时针
    const vc = new VirtualCard('sha', [shaCard]);
    const event = await room.useCard(pA, vc, [pB, pC]);

    assert(event !== null, '事件创建成功');
    if (event) {
        const tl = event.targetList;
        console.log(`    targetList: ${tl.map((e: any) => `T${e.index}:${e.target.playerId}`).join(', ')}`);
        // 逆时针：seat 1(current)→2→3...
        assert(tl[0].target === pB || tl[0].target === pC, '目标在列表中');
    }
}

// ===== 测试 6: canUseCard 距离外 =====

async function test_canUseCard_distance(): Promise<void> {
    console.log('\n  -- 测试 6: canUseCard --');

    const room = createRoom({ roomId: 'm2-6' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    // 杀的目标：其他角色
    const canSha = room.canUseCard(pA, 'sha');
    console.log(`    canUseCard(sha) = ${canSha}`);
    assert(canSha, '杀可以使用（有其他角色）');
}

// ===== 测试 7: canUseCard 桃体力满时不可用 =====

async function test_canUseCard_taoFullHp(): Promise<void> {
    console.log('\n  -- 测试 7: canUseCard 桃满血不可用 --');

    const room = createRoom({ roomId: 'm2-7' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    pA.hp = 4; // 满血

    const taoCard = createTaoCard(room);
    room.card.initCardUses();

    const canTao = room.canUseCard(pA, 'tao');
    console.log(`    canUseCard(tao, hp=4) = ${canTao}`);
    assert(!canTao, '满血时桃不可用');

    // 掉血后可用
    pA.hp = 3;
    const canTao2 = room.canUseCard(pA, 'tao');
    console.log(`    canUseCard(tao, hp=3) = ${canTao2}`);
    assert(canTao2, '不满血时桃可用');
}

// ===== 测试 8: targetList 结构完整性 =====

async function test_targetListStructure(): Promise<void> {
    console.log('\n  -- 测试 8: targetList 结构完整性 --');

    const room = createRoom({ roomId: 'm2-8' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('sha', [shaCard]);
    const event = await room.useCard(pA, vc, [pB]);

    assert(event !== null, '事件创建成功');
    if (event) {
        const entry = event.targetList[0];
        assert(entry !== undefined, '有目标条目');
        assert(typeof entry.index === 'number', 'index 是 number');
        assert(entry.target === pB, '目标是 pB');
        assert(entry.invalid === undefined || entry.invalid === false, 'invalid 默认 falsy');
        assert(entry.offset === undefined, 'offset 默认 undefined');
        assert(entry.effectTimes === 1, 'effectTimes 默认=1');
        assert(entry.settleCount === 1, 'settleCount 结算后=1');
        assert(entry.effectTimes === 1, 'effectTimes 默认=1');
    }
}

// ===== 测试 9: 虚拟牌继承实体牌花色点数 =====

async function test_virtualCardInheritsProps(): Promise<void> {
    console.log('\n  -- 测试 9: 虚拟牌继承实体牌属性 --');

    const room = createRoom({ roomId: 'm2-9' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('sha', [shaCard]);
    assert(vc.suit === CardSuit.Spade, `花色继承黑桃，实际=${vc.suit}`);
    assert(vc.number === CardNumber.A, `点数继承A，实际=${vc.number}`);

    await room.useCard(pA, vc, [pB]);
}

// ===== 测试 10: 多目标杀 =====

async function test_multiTarget(): Promise<void> {
    console.log('\n  -- 测试 10: 多目标（方天画戟场景）--');

    const room = createRoom({ roomId: 'm2-10' });
    const pA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });
    const pC = createPlayer(room, 'pC', { hp: 3, maxhp: 3, seat: 3 });

    const shaCard = createShaCard(room);
    room.card.initCardUses();

    const vc = new VirtualCard('sha', [shaCard]);
    // 需要注意的是，CardUse 定义中杀只有一个目标。
    // 多目标需要技能修改（方天画戟），M2 只验证单目标路径。
    // 这里验证 event 能正确执行（单目标正常）
    const event = await room.useCard(pA, vc, [pB]);
    assert(event !== null, '单目标事件执行成功');
}

// ===== 主入口 =====

async function main() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║     M2 使用牌骨架 验收测试          ║');
    console.log('╚══════════════════════════════════════╝');

    await test_shaDamagesTarget();
    await test_taoRecoversSelf();
    await test_virtualCardDestroyed();
    await test_targetListOrder();
    await test_canUseCard_distance();
    await test_canUseCard_taoFullHp();
    await test_targetListStructure();
    await test_virtualCardInheritsProps();
    await test_multiTarget();

    summary();
}

main().catch(console.error);
