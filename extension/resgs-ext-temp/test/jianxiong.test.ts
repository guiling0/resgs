/**
 * 奸雄——单元测试示例（纯 mock，不依赖 core）
 * 运行：npx tsx test/jianxiong.test.ts
 */

import { createRoom, createPlayer, assert, describe, summary } from './setup';

async function main(): Promise<void> {
    describe('奸雄');

    const room = createRoom();
    const caocao = createPlayer(room, 'caocao', { hp: 4, maxhp: 4, seat: 1 });

    // 基础状态
    assert(caocao.playerId === 'caocao', '玩家 ID 正确');
    assert(caocao.hp === 4, '体力 = 4');

    // drawCards
    assert(caocao.handCards.length === 0, '初始手牌 = 0');
    await caocao.drawCards(1);
    assert(caocao.handCards.length === 1, '摸 1 张后手牌 = 1');

    // loseHp
    await caocao.loseHp(1);
    assert(caocao.hp === 3, '扣 1 点后体力 = 3');

    summary();
}

main().catch((err) => {
    console.error('测试失败:', err);
    process.exit(1);
});
