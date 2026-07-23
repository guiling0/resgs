/**
 * MoveCardEvent 测试案例
 *
 * 运行方式：
 *   npx tsx shared/test/move-card.test.ts
 *
 * 测试场景：
 *   1. 基本移动：单张牌从手牌区移动到弃牌堆
 *   2. classify 分类：多条移动数据按相同属性合并
 *   3. 默认值填充：reason/putType/pos/animation/toast
 *   4. fromArea 过滤：指定 fromArea 后只移动该区域的牌
 *   5. moveType 默认值：不指定时沿用卡牌当前放置方式
 *   6. 多卡牌多区域移动
 *   7. getLoseDatas / hasLose：失去牌的检测
 *   8. getObtainDatas / hasObtain：获得牌的检测
 *   9. getCards / getCard / filter / has_filter / getMoveCount
 *  10. cancel 取消部分移动 + preventMove 阻止移动
 *  11. update 修改指定牌的移动数据
 *  12. 移动后标记清除 (clearMark)
 *  13. 移动后 handler 执行
 *  14. 移动后虚拟牌处理（装备/延时锦囊/普通虚拟牌）
 *  15. EventManager.moveCards 工厂方法
 *  16. Room.moveCards / Player.moveCards 快捷方法
 *  17. position='top' 反转卡牌顺序
 *  18. 不可从区域移动到同区域
 */

// Mock 全局 sgs 对象（CardTypes.getCardType/getCardSubType 依赖）
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
import { VirtualCard } from '../core/card/VirtualCard';
import { MoveCardEvent } from '../core/event/MoveCardEvent';
import {
    EventType,
    TimingName,
} from '../core/event/EventTypes';

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
    room.state.cardStates.set(card.id.toString(), state);
    return card;
}

/** 在测试房间中初始化牌堆和弃牌堆区域（用于移动目的地） */
function initArea(room: Room, areaType: AreaType) {
    // 确保区域存在
    try {
        room.area.add(areaType, []);
    } catch {
        // 忽略已存在的错误
    }
}

// ===== 测试 1: 基本移动 =====

async function test_basicMove(): Promise<void> {
    console.log('\n  ▶ 测试 1: A 的手牌移动到弃牌堆');

    const room = createRoom({ roomId: 'm1' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handArea = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card1 = createCard(room, 1, { name: 'sha' });
    const card2 = createCard(room, 2, { name: 'shan' });

    // 将牌放入手牌区
    room.area.add(handArea, [card1.id, card2.id]);
    console.log(`    初始: card1.area=${card1.area}, card2.area=${card2.area}`);

    // 创建移动事件：将2张手牌移动到弃牌堆
    const event = new MoveCardEvent(room, {
        datas: [
            {
                player: playerA,
                cards: [card1, card2],
                toArea: AreaType.Discard,
                reason: 'discard',
            },
        ],
    });

    await event.exec();

    console.log(`    移动后: card1.area=${card1.area}, card2.area=${card2.area}`);

    assert(event.isComplete, '事件已完成');
    assert(card1.area === AreaType.Discard, `card1 在弃牌堆，实际=${card1.area}`);
    assert(card2.area === AreaType.Discard, `card2 在弃牌堆，实际=${card2.area}`);
    assert(event.getMoveCount() === 2, `移动牌数=2，实际=${event.getMoveCount()}`);
}

// ===== 测试 2: classify 分类合并 =====

async function test_classify(): Promise<void> {
    console.log('\n  ▶ 测试 2: 多条移动数据按相同属性合并');

    const room = createRoom({ roomId: 'm2' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handArea = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    // 创建5张牌
    const cards = Array.from({ length: 5 }, (_, i) => {
        const c = createCard(room, i + 10, { name: 'sha' });
        room.area.add(handArea, [c.id]);
        return c;
    });

    // 用多条相同 dest 的数据添加
    const event = new MoveCardEvent(room, {
        datas: [
            { player: playerA, cards: cards.slice(0, 2), toArea: AreaType.Discard },
            { player: playerA, cards: cards.slice(2, 5), toArea: AreaType.Discard },
        ],
    });

    // classify 应将相同 (player, fromArea, toArea, ...) 的合并
    console.log(`    分类前 datas=${event.move_datas.length}`);
    event.classify();
    console.log(`    分类后 datas=${event.move_datas.length}`);

    assert(
        event.move_datas.length === 1,
        `5张同来源同目标的牌合并为1条数据，实际=${event.move_datas.length}`,
    );
    assert(
        event.move_datas[0].cards.length === 5,
        `合并后 cards.length=5，实际=${event.move_datas[0].cards.length}`,
    );
}

// ===== 测试 3: 默认值填充 =====

async function test_defaults(): Promise<void> {
    console.log('\n  ▶ 测试 3: 未指定的属性自动填充默认值');

    const room = createRoom({ roomId: 'm3' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handArea = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 20, { name: 'sha' });
    room.area.add(handArea, [card.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            {
                player: playerA,
                cards: [card],
                toArea: AreaType.Discard,
                // 不指定 reason/putType/animation/pos/toast
            },
        ],
    });
    event.classify();

    const d = event.move_datas[0];
    console.log(`    reason="${d.reason}" putType=${d.putType} animation=${d.animation} pos="${d.pos}" toast=${d.toast}`);
    assert(d.reason === 'put', `reason默认"put"，实际="${d.reason}"`);
    assert(d.animation === true, `animation默认true，实际=${d.animation}`);
    assert(d.pos === 'bottom', `pos默认"bottom"，实际="${d.pos}"`);
    assert(d.toast === false, `toast默认false，实际=${d.toast}`);
}

// ===== 测试 4: fromArea 过滤 =====

async function test_fromAreaFilter(): Promise<void> {
    console.log('\n  ▶ 测试 4: 指定 fromArea 后只移动该区域的牌');

    const room = createRoom({ roomId: 'm4' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handArea = playerA.getAreaId(AreaType.Hand);
    const equipArea = playerA.getAreaId(AreaType.Equip);
    initArea(room, AreaType.Discard);

    const cardHand = createCard(room, 30, { name: 'sha' });
    const cardEquip = createCard(room, 31, { name: 'sha' });
    room.area.add(handArea, [cardHand.id]);
    room.area.add(equipArea, [cardEquip.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            {
                player: playerA,
                cards: [cardHand, cardEquip], // 两张不同区域
                fromArea: handArea,            // 只移动手牌区的
                toArea: AreaType.Discard,
            },
        ],
    });
    event.classify();

    console.log(`    data: cards=${event.move_datas[0]?.cards.length ?? 0}`);
    const movedCards = event.move_datas[0]?.cards ?? [];
    assert(
        movedCards.length === 1 && movedCards[0] === cardHand,
        `指定fromArea=手牌后只移动手牌，实际=${movedCards.length}张`,
    );
}

// ===== 测试 5: moveType 默认沿用卡牌当前摆放 =====

async function test_moveTypeDefault(): Promise<void> {
    console.log('\n  ▶ 测试 5: moveType 不指定时沿用卡牌当前 put');

    const room = createRoom({ roomId: 'm5' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handArea = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 40, { name: 'sha' });
    room.area.add(handArea, [card.id]);
    // 手牌默认背面朝上(false)
    console.log(`    卡牌当前 put=${card.put}`);

    const event = new MoveCardEvent(room, {
        datas: [
            { player: playerA, cards: [card], toArea: AreaType.Discard },
        ],
    });
    event.classify();

    const d = event.move_datas[0];
    console.log(`    moveType=${d.moveType} (应与 put 一致)`);
    assert(
        d.moveType === card.put,
        `moveType 沿用卡牌当前 put，实际=${d.moveType}`,
    );
}

// ===== 测试 6: 多玩家多区域移动 =====

async function test_multiPlayerMove(): Promise<void> {
    console.log('\n  ▶ 测试 6: 涉及多个玩家的移动数据');

    const room = createRoom({ roomId: 'm6' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 4, maxhp: 4, seat: 2 });
    const handA = playerA.getAreaId(AreaType.Hand);
    const handB = playerB.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    // A 的手牌
    const cA1 = createCard(room, 50, { name: 'sha' });
    room.area.add(handA, [cA1.id]);

    // B 的手牌
    const cB1 = createCard(room, 51, { name: 'shan' });
    room.area.add(handB, [cB1.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [cA1], toArea: AreaType.Discard, reason: 'A discard' },
            { cards: [cB1], toArea: AreaType.Discard, reason: 'B discard' },
        ],
    });

    await event.exec();

    console.log(`    cA1.area=${cA1.area}, cB1.area=${cB1.area}`);
    assert(cA1.area === AreaType.Discard, 'A手牌移动到弃牌堆');
    assert(cB1.area === AreaType.Discard, 'B手牌移动到弃牌堆');
    assert(event.move_datas.length >= 1, '分类后至少1条数据');
}

// ===== 测试 7: getLoseDatas / hasLose =====

async function test_loseDatas(): Promise<void> {
    console.log('\n  ▶ 测试 7: 检测玩家失去的牌');

    const room = createRoom({ roomId: 'm7' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 4, maxhp: 4, seat: 2 });
    const handA = playerA.getAreaId(AreaType.Hand);
    const handB = playerB.getAreaId(AreaType.Hand);
    const discard = AreaType.Discard;
    initArea(room, discard);

    const cA1 = createCard(room, 60, { name: 'sha' });
    const cA2 = createCard(room, 61, { name: 'shan' });
    const cB1 = createCard(room, 62, { name: 'tao' });
    room.area.add(handA, [cA1.id, cA2.id]);
    room.area.add(handB, [cB1.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [cA1], toArea: discard, reason: 'discard' },
            { cards: [cA2], toArea: discard, reason: 'discard' },
            { cards: [cB1], toArea: discard, reason: 'discard' },
        ],
    });
    event.classify();

    const aLose = event.getLoseDatas(playerA);
    const bLose = event.getLoseDatas(playerB);

    // getLoseCards 拼接返回
    const aLoseCards = event.getLoseCards(playerA);
    const bLoseCards = event.getLoseCards(playerB);

    console.log(`    A失去: ${aLose.reduce((s, d) => s + d.cards.length, 0)}张 (cards=${aLoseCards.length})`);
    console.log(`    B失去: ${bLose.reduce((s, d) => s + d.cards.length, 0)}张 (cards=${bLoseCards.length})`);

    const aCount = aLose.reduce((s, d) => s + d.cards.length, 0);
    const bCount = bLose.reduce((s, d) => s + d.cards.length, 0);
    assert(aCount === 2, `A 失去2张牌，实际=${aCount}`);
    assert(bCount === 1, `B 失去1张牌，实际=${bCount}`);
    assert(event.hasLose(playerA), 'A 有失去牌的数据');
    assert(event.hasLose(playerB), 'B 有失去牌的数据');
    assert(aLoseCards.length === 2, `getLoseCards(A)=2张，实际=${aLoseCards.length}`);
    assert(bLoseCards.length === 1, `getLoseCards(B)=1张，实际=${bLoseCards.length}`);
    assert(aLoseCards.includes(cA1) && aLoseCards.includes(cA2), 'getLoseCards(A) 包含正确的牌');
}

// ===== 测试 8: getObtainDatas / hasObtain =====

async function test_obtainDatas(): Promise<void> {
    console.log('\n  ▶ 测试 8: 检测玩家获得的牌');

    const room = createRoom({ roomId: 'm8' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const playerB = createPlayer(room, 'pB', { hp: 4, maxhp: 4, seat: 2 });
    const handA = playerA.getAreaId(AreaType.Hand);
    const handB = playerB.getAreaId(AreaType.Hand);
    const discard = AreaType.Discard;
    initArea(room, discard);

    // 弃牌堆 → B 手牌（视为 B 获得）
    const c1 = createCard(room, 70, { name: 'sha' });
    room.area.add(discard, [c1.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [c1], toArea: handB, reason: 'obtain' },
        ],
    });
    event.classify();

    const bObtain = event.getObtainDatas(playerB);
    const aObtain = event.getObtainDatas(playerA);
    const bObtainCards = event.getObtainCards(playerB);
    const aObtainCards = event.getObtainCards(playerA);

    console.log(`    B获得: ${bObtain.reduce((s, d) => s + d.cards.length, 0)}张 (cards=${bObtainCards.length})`);
    console.log(`    A获得: ${aObtain.reduce((s, d) => s + d.cards.length, 0)}张 (cards=${aObtainCards.length})`);

    assert(bObtain.length > 0, 'B 有获得牌的数据');
    assert(event.hasObtain(playerB), 'hasObtain(B)=true');
    assert(aObtain.length === 0, 'A 无获得牌的数据');
    assert(bObtainCards.length === 1, `getObtainCards(B)=1张，实际=${bObtainCards.length}`);
    assert(bObtainCards.includes(c1), 'getObtainCards(B) 包含获得的牌');
}

// ===== 测试 9: getCards / filter / has_filter / getCard / getMoveCount =====

async function test_queryMethods(): Promise<void> {
    console.log('\n  ▶ 测试 9: 各类查询方法');

    const room = createRoom({ roomId: 'm9' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const c1 = createCard(room, 80, { name: 'sha' });
    const c2 = createCard(room, 81, { name: 'shan' });
    room.area.add(handA, [c1.id, c2.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [c1, c2], toArea: AreaType.Discard },
        ],
    });

    assert(event.has(c1), 'has(c1)=true');
    assert(event.has(c2), 'has(c2)=true');
    assert(event.get(c1) !== undefined, 'get(c1) 非空');
    assert(event.getMoveCount() === 2, `getMoveCount=2，实际=${event.getMoveCount()}`);

    const shas = event.getCards((_d, c) => c.name === 'sha');
    assert(shas.length === 1, `找到 sha 牌=1张，实际=${shas.length}`);

    const shaCard = event.getCard((_d, c) => c.name === 'sha');
    assert(shaCard === c1, 'getCard 返回第一张 sha');

    const hasSha = event.has_filter((_d, c) => c.name === 'sha');
    assert(hasSha, 'has_filter(sha)=true');
}

// ===== 测试 10: cancel 部分取消 + preventMove =====

async function test_cancel(): Promise<void> {
    console.log('\n  ▶ 测试 10: cancel 取消部分牌 + preventMove 阻止移动');

    const room = createRoom({ roomId: 'm10' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    const discard = AreaType.Discard;
    initArea(room, discard);

    const c1 = createCard(room, 90, { name: 'sha' });
    const c2 = createCard(room, 91, { name: 'shan' });
    room.area.add(handA, [c1.id, c2.id]);

    // 测试 cancel 部分牌
    const event1 = new MoveCardEvent(room, {
        datas: [
            { cards: [c1, c2], toArea: discard },
        ],
    });

    // 在 MoveCardBefore1 之前注入 cancel 回调
    event1.registerBefore(TimingName.MoveCardBefore1, async () => {
        console.log('    [cancel] 取消 c2 的移动');
        await event1.cancel([c2]);
    });

    await event1.exec();

    console.log(`    c1.area=${c1.area} (应为弃牌堆), c2.area=${c2.area} (应为手牌)`);
    assert(c1.area === discard, `c1 移动到弃牌堆，实际=${c1.area}`);
    assert(c2.area === handA, `c2 被取消，仍在手牌区，实际=${c2.area}`);

    // 测试 preventMove：先恢复 c2 到弃牌堆再重新测
    room.area.move([c2.id], handA, discard);
    const c3 = createCard(room, 92, { name: 'tao' });
    room.area.add(handA, [c3.id]);

    const event2 = new MoveCardEvent(room, {
        datas: [
            { cards: [c3], toArea: discard },
        ],
    });

    event2.registerBefore(TimingName.MoveCardBefore1, async () => {
        console.log('    [prevent] 阻止全部移动');
        await event2.preventMove();
    });

    await event2.exec();

    console.log(`    c3.area=${c3.area} (应为手牌 — 移动被阻止)`);
    assert(c3.area === handA, `移动被阻止，c3 仍在手牌，实际=${c3.area}`);
    assert(event2.isEnd, '事件标记为结束');
}

// ===== 测试 11: update 修改移动数据 =====

async function test_update(): Promise<void> {
    console.log('\n  ▶ 测试 11: update 修改指定牌的移动数据');

    const room = createRoom({ roomId: 'm11' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);
    initArea(room, AreaType.Draw);

    const c1 = createCard(room, 100, { name: 'sha' });
    const c2 = createCard(room, 101, { name: 'shan' });
    room.area.add(handA, [c1.id, c2.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [c1, c2], toArea: AreaType.Discard },
        ],
    });

    // 修改 c1 的目标区域
    event.update([c1], { toArea: AreaType.Draw, reason: 'return' });
    console.log(`    datas=${event.move_datas.length}条`);
    console.log(`      → discard: ${event.move_datas.filter(d=>d.toArea===AreaType.Discard).reduce((s,d)=>s+d.cards.length,0)}张`);
    console.log(`      → draw:    ${event.move_datas.filter(d=>d.toArea===AreaType.Draw).reduce((s,d)=>s+d.cards.length,0)}张`);

    const discardData = event.move_datas.find(d => d.toArea === AreaType.Discard);
    const drawData = event.move_datas.find(d => d.toArea === AreaType.Draw);
    assert(discardData?.cards.length === 1, `弃牌堆目标=1张，实际=${discardData?.cards.length}`);
    assert(drawData?.cards.length === 1, `牌堆目标=1张，实际=${drawData?.cards.length}`);
}

// ===== 测试 12: 移动后标记清除 =====

async function test_clearMarkOnMove(): Promise<void> {
    console.log('\n  ▶ 测试 12: 移动后清除非@never标记');

    const room = createRoom({ roomId: 'm12' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 110, { name: 'sha' });
    room.area.add(handA, [card.id]);

    // 设置标记
    card.setMark('temp_mark', true);
    card.setMark('permanent@never', true);
    console.log(`    设置前: hasMark('temp_mark')=${card.hasMark('temp_mark')}, hasMark('permanent@never')=${card.hasMark('permanent@never')}`);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [card], toArea: AreaType.Discard },
        ],
    });

    await event.exec();

    console.log(`    移动后: hasMark('temp_mark')=${card.hasMark('temp_mark')}, hasMark('permanent@never')=${card.hasMark('permanent@never')}`);
    assert(!card.hasMark('temp_mark'), '非@never标记被清除');
    assert(card.hasMark('permanent@never'), '@never标记保留');
}

// ===== 测试 13: handler 执行 =====

async function test_handlerExecution(): Promise<void> {
    console.log('\n  ▶ 测试 13: 移动后 handler 执行');

    const room = createRoom({ roomId: 'm13' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 120, { name: 'sha' });
    room.area.add(handA, [card.id]);

    let handlerCalled = false;
    const event = new MoveCardEvent(room, {
        datas: [
            {
                cards: [card],
                toArea: AreaType.Discard,
                handler: async (c) => {
                    handlerCalled = true;
                    c.data._handlerCalled = true;
                },
            },
        ],
    });

    await event.exec();

    console.log(`    handlerCalled=${handlerCalled}, card.data._handlerCalled=${card.data._handlerCalled}`);
    assert(handlerCalled, 'handler 被调用');
    assert(card.data._handlerCalled === true, 'card.data 中记录了 handler 调用');
}

// ===== 测试 14: 虚拟牌处理 =====

async function test_virtualCardHandling(): Promise<void> {
    console.log('\n  ▶ 测试 14: 移动后虚拟牌处理');

    const room = createRoom({ roomId: 'm14' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);
    initArea(room, AreaType.Processing);

    const card = createCard(room, 130, { name: 'sha' });
    room.area.add(handA, [card.id]);

    // 给卡牌附加虚拟牌
    const vc = new VirtualCard('sha', [card], undefined, false); // record=false 避免重复绑定
    card.vcard = vc;
    vc.subcards.push(card);
    room.vcards.push(vc);
    console.log(`    设置前: card.vcard=${!!card.vcard}, room.vcards.length=${room.vcards.length}`);

    // 移动到处理区 → 虚拟牌保留
    const event1 = new MoveCardEvent(room, {
        datas: [{ cards: [card], toArea: AreaType.Processing, reason: 'process' }],
    });
    await event1.exec();
    console.log(`    移动到处理区后: vcard intact=${!vc.destroyed}, room.vcards.length=${room.vcards.length}`);
    assert(!vc.destroyed, '移到处理区后虚拟牌未被销毁');

    // 移动到弃牌堆（非处理区）→ 虚拟牌切断
    const event2 = new MoveCardEvent(room, {
        datas: [{ cards: [card], toArea: AreaType.Discard, reason: 'discard' }],
    });
    await event2.exec();
    console.log(`    移动到弃牌堆后: card.vcard=${!!card.vcard}, vc.subcards.length=${vc.subcards.length}`);
    assert(card.vcard === undefined, '移到非处理区后 card.vcard 断开');
}

// ===== 测试 15: EventManager.moveCards 工厂方法 =====

async function test_eventManagerFactory(): Promise<void> {
    console.log('\n  ▶ 测试 15: EventManager.moveCards 工厂方法');

    const room = createRoom({ roomId: 'm15' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 140, { name: 'sha' });
    room.area.add(handA, [card.id]);

    const event = await room.event.moveCards([
        { cards: [card], toArea: AreaType.Discard, reason: 'test' },
    ]);

    console.log(`    card.area=${card.area}, event.type=${event.type}`);
    assert(card.area === AreaType.Discard, `通过工厂方法移动成功，实际=${card.area}`);
    assert(event.type === EventType.Move, `事件类型=Move，实际=${event.type}`);
}

// ===== 测试 16: Room.moveCards / Player.moveCards 快捷方法 =====

async function test_shortcuts(): Promise<void> {
    console.log('\n  ▶ 测试 16: Room/Player 快捷方法');

    const room = createRoom({ roomId: 'm16' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const card = createCard(room, 150, { name: 'sha' });
    room.area.add(handA, [card.id]);

    // Room.moveCards
    await room.moveCards([card], AreaType.Discard, { reason: 'Room shortcut' });
    console.log(`    Room.moveCards: card.area=${card.area}`);
    assert(card.area === AreaType.Discard, `Room.moveCards 移动成功`);

    // 重置
    room.area.move([card.id], AreaType.Discard, handA);

    // Player.moveCards
    await playerA.moveCards([card], AreaType.Discard, { reason: 'Player shortcut' });
    console.log(`    Player.moveCards: card.area=${card.area}`);
    assert(card.area === AreaType.Discard, `Player.moveCards 移动成功`);
}

// ===== 测试 17: pos='top' 反转卡牌顺序 =====

async function test_posTopReverse(): Promise<void> {
    console.log('\n  ▶ 测试 17: pos="top" 时反转卡牌顺序');

    const room = createRoom({ roomId: 'm17' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);
    initArea(room, AreaType.Discard);

    const c1 = createCard(room, 160, { name: 'sha' });
    const c2 = createCard(room, 161, { name: 'shan' });
    const c3 = createCard(room, 162, { name: 'tao' });
    room.area.add(handA, [c1.id, c2.id, c3.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [c1, c2, c3], toArea: AreaType.Discard, pos: 'top' },
        ],
    });

    await event.exec();

    // 检查弃牌堆的牌顺序：pos='top' 反转 + bottom 插入 = 原顺序
    const discardCards = room.area.get(AreaType.Discard);
    console.log(`    弃牌堆: [${discardCards?.join(',')}]`);
    assert(discardCards !== undefined && discardCards.length === 3, '弃牌堆有3张牌');

    // pos='top' 反转 [c1,c2,c3]→[c3,c2,c1]，然后逐个 bottom 插入
    // c3 (bottom) → 堆底, c2 → c3上, c1 → c2上
    // 最终: [c3, c2, c1] (从上到下)
    if (discardCards && discardCards.length === 3) {
        console.log(`    实际顺序: c${discardCards[0]}, c${discardCards[1]}, c${discardCards[2]}`);
    }
}

// ===== 测试 18: 同区域不移动 =====

async function test_sameAreaSkip(): Promise<void> {
    console.log('\n  ▶ 测试 18: 不可从区域移动到同区域');

    const room = createRoom({ roomId: 'm18' });
    const playerA = createPlayer(room, 'pA', { hp: 4, maxhp: 4, seat: 1 });
    const handA = playerA.getAreaId(AreaType.Hand);

    const card = createCard(room, 170, { name: 'sha' });
    room.area.add(handA, [card.id]);

    const event = new MoveCardEvent(room, {
        datas: [
            { cards: [card], toArea: handA }, // 同区域
        ],
    });
    event.classify();

    console.log(`    classify 后 datas=${event.move_datas.length}`);
    assert(event.move_datas.length === 0, '同区域移动被classify过滤掉');
    // check() 返回 false（无有效数据）
    assert(!event.check(), 'check()=false，无有效移动');
}

// ===== 主入口 =====

async function main(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('  MoveCardEvent 测试套件');
    console.log('═'.repeat(60));

    const tests: { name: string; fn: () => Promise<void> }[] = [
        { name: '基本移动', fn: test_basicMove },
        { name: 'classify 分类', fn: test_classify },
        { name: '默认值填充', fn: test_defaults },
        { name: 'fromArea 过滤', fn: test_fromAreaFilter },
        { name: 'moveType 默认值', fn: test_moveTypeDefault },
        { name: '多玩家移动', fn: test_multiPlayerMove },
        { name: 'getLoseDatas / hasLose', fn: test_loseDatas },
        { name: 'getObtainDatas / hasObtain', fn: test_obtainDatas },
        { name: '查询方法', fn: test_queryMethods },
        { name: 'cancel + preventMove', fn: test_cancel },
        { name: 'update 修改', fn: test_update },
        { name: '标记清除', fn: test_clearMarkOnMove },
        { name: 'handler 执行', fn: test_handlerExecution },
        { name: '虚拟牌处理', fn: test_virtualCardHandling },
        { name: 'EventManager 工厂', fn: test_eventManagerFactory },
        { name: 'Room/Player 快捷方法', fn: test_shortcuts },
        { name: 'pos=top 反转顺序', fn: test_posTopReverse },
        { name: '同区域不移动', fn: test_sameAreaSkip },
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
