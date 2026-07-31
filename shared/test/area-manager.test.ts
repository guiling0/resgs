/**
 * AreaManager 测试 — 卡牌区域 + 武将区域操作
 * 运行: npx tsx shared/test/area-manager.test.ts
 */

import { createRoom, createPlayer, assert } from './setup';
// 注：AreaType 是 const enum，tsx 无法解析，测试中直接使用字符串值

async function test_cardAreas(): Promise<void> {
    console.log('\n  ▶ 卡牌区域: add / get / getCards / remove');

    const room = createRoom({ roomId: 'a1' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const area = p.getAreaId('hand' as any);

    // add
    room.area.add(area, [1, 2, 3], 'bottom');
    let cards = room.area.get(area);
    assert(cards !== undefined, '区域存在');
    assert(cards!.length === 3, `3张牌, 实际=${cards!.length}`);

    // getCards top
    const top = room.area.getCards(area, 2, 'top');
    assert(top[0] === 1 && top[1] === 2, `top2=[1,2], 实际=[${top}]`);

    // getCards bottom
    const bottom = room.area.getCards(area, 1, 'bottom');
    assert(bottom[0] === 3, `bottom1=[3], 实际=${bottom[0]}`);

    // getOne
    const one = room.area.getOne(area, 'top');
    assert(one === 1, `top=1, 实际=${one}`);

    // remove
    room.area.remove(area, [1, 3]);
    cards = room.area.get(area);
    assert(cards!.length === 1, `remove后剩1张, 实际=${cards!.length}`);
    assert(cards![0] === 2, `剩下的是[2], 实际=${cards![0]}`);
}

async function test_generalAreas(): Promise<void> {
    console.log('\n  ▶ 武将区域: add / get / getOne');

    const room = createRoom({ roomId: 'a2' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const area = p.getAreaId('hand' as any);

    // 添加武将 ID（string 类型自动路由到 generalAreas）
    room.area.add(area, ['g_caocao', 'g_liubei'], 'bottom');

    // 用 isGeneral=true 读取
    const cards = room.area.get(area, true);
    assert(cards !== undefined, '武将区域存在');
    assert(cards!.length === 2, `2张武将, 实际=${cards!.length}`);

    // getOne
    const one = room.area.getOne(area, 'top', true);
    assert(one === 'g_caocao', `top=g_caocao, 实际=${one}`);

    // remove
    room.area.remove(area, ['g_caocao']);
    const after = room.area.get(area, true);
    assert(after!.length === 1, `remove后1张, 实际=${after!.length}`);
    assert(after![0] === 'g_liubei', `剩下g_liubei, 实际=${after![0]}`);
}

async function test_addPositions(): Promise<void> {
    console.log('\n  ▶ add 位置: top / bottom / random / 精确索引');

    const room = createRoom({ roomId: 'a3' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const area = p.getAreaId('hand' as any);

    room.area.add(area, [1, 2], 'bottom');
    room.area.add(area, [3], 'top');       // → [3, 1, 2]
    room.area.add(area, [4], 1);           // → [3, 4, 1, 2]

    const all = [...room.area.get(area)!];
    assert(all[1] === 4, `索引1=4, 实际=${all[1]}`);
    assert(all.length === 4, `共4张, 实际=${all.length}`);
}

async function test_move(): Promise<void> {
    console.log('\n  ▶ move: 卡牌区域间移动');

    const room = createRoom({ roomId: 'a4' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const hand = p.getAreaId('hand' as any);
    const equip = p.getAreaId('equip' as any);

    room.area.add(hand, [1, 2, 3]);
    room.area.move([2], hand, equip, 'bottom');

    assert(room.area.get(hand)!.length === 2, `手牌剩2张`);
    assert(room.area.get(equip)!.length === 1, `装备区1张`);
}

async function test_shuffle(): Promise<void> {
    console.log('\n  ▶ shuffle: 全量洗牌');

    const room = createRoom({ roomId: 'a5' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const area = p.getAreaId('hand' as any);

    room.area.add(area, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const before = [...room.area.get(area)!];
    room.area.shuffle(area);
    const after = [...room.area.get(area)!];

    // 洗牌后长度不变，但顺序大概率变化（极小概率完全相同）
    assert(after.length === before.length, `长度不变=${after.length}`);
    // 内容集合不变
    const sortedBefore = [...before].sort((a, b) => a - b).join(',');
    const sortedAfter = [...after].sort((a, b) => a - b).join(',');
    assert(sortedBefore === sortedAfter, '内容集合不变');
}

async function test_shuffleTargets(): Promise<void> {
    console.log('\n  ▶ shuffle: 指定牌重插入');

    const room = createRoom({ roomId: 'a6' });
    const p = createPlayer(room, 'p1', { seat: 1 });
    const area = p.getAreaId('hand' as any);

    room.area.add(area, [1, 2, 3, 4, 5]);
    room.area.shuffle(area, [3]);

    const after = [...room.area.get(area)!];
    assert(after.length === 5, `长度不变=${after.length}`);
    assert(after.includes(3), '3仍在区域中');
}

async function main(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║              AreaManager 测试套件                     ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    const tests = [
        { name: '卡牌区域增删查', fn: test_cardAreas },
        { name: '武将区域增删查', fn: test_generalAreas },
        { name: 'add 位置参数', fn: test_addPositions },
        { name: '区域间移动', fn: test_move },
        { name: '全量洗牌', fn: test_shuffle },
        { name: '指定牌重插入', fn: test_shuffleTargets },
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
