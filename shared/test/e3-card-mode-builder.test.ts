/**
 * E3 验收测试：CardBuilder + ModeBuilder + sgs.CardConfig + registerCards
 *
 * 验证：
 * 1. sgs.CardConfig() 写入 sgs.carddatas（卡牌类型信息，增量覆盖）
 * 2. CardBuilder.build() 构建实体牌数据（不负责注册）
 * 3. sgs.GameCard() 构建单张实体牌（全部可选，不注册）
 * 4. sgs.registerCards() 批量分配 ID（扩展名自动注入）
 * 5. ModeBuilder 写入 sgs.modes，幂等
 */

import { assert, describe, summary } from './setup';
import { registerCore } from '../core/register';

// ===== 模拟 sgs 环境 =====

(globalThis as any).sgs = (globalThis as any).sgs ?? {
    skills: new Map(), effects: new Map(), skillsAssets: new Map(),
    selectors: new Map(), modes: new Map(), cards: new Map(),
    carddatas: new Map(), generals: new Map(), generalAssets: new Map(),
    translations: new Map(), carduses: new Map(),
};

const sgs = (globalThis as any).sgs;
registerCore(sgs);

// ===== 测试 1: sgs.CardConfig() → sgs.carddatas，增量覆盖 =====

async function test_cardConfig(): Promise<void> {
    // 首次注册
    sgs.CardConfig({ name: 'sha', type: sgs.CardType.Basic, damage: true });
    assert(sgs.carddatas.get('sha').damage === true, 'damage = true');
    assert(sgs.carddatas.get('sha').recover === false, 'recover 默认 false');

    // 增量覆盖
    sgs.CardConfig({ name: 'sha', recover: true, damage: false });
    assert(sgs.carddatas.get('sha').recover === true, '增量覆盖：recover → true');
    assert(sgs.carddatas.get('sha').damage === false, '增量覆盖：damage → false');
    assert(sgs.carddatas.get('sha').type === sgs.CardType.Basic, '未传入字段保留');

    console.log('  ✅ sgs.CardConfig 增量覆盖正确');
}

// ===== 测试 2: CardBuilder.build() + registerCards =====

async function test_builder_and_registerCards(): Promise<void> {
    sgs.setExtensionContext('standard');

    const cards = [
        sgs.CardBuilder('sha').suit(sgs.CardSuit.Spade).number(sgs.CardNumber.A).build(),
        sgs.CardBuilder('sha').suit(sgs.CardSuit.Heart).number(sgs.CardNumber.Number2).build(),
    ];

    sgs.registerCards(cards);

    assert(cards[0].id === 'standard.1', 'ID = standard.1');
    assert(cards[1].id === 'standard.2', 'ID = standard.2');
    assert(sgs.cards.has('standard.1'), 'sgs.cards 包含 standard.1');

    // 不同扩展独立计数
    sgs.setExtensionContext('promo');
    const promo = [sgs.CardBuilder('sha').suit(sgs.CardSuit.Club).number(sgs.CardNumber.Number3).build()];
    sgs.registerCards(promo);
    assert(promo[0].id === 'promo.1', '独立计数：promo.1');

    console.log('  ✅ CardBuilder.build() + registerCards 正确');
}

// ===== 测试 3: sgs.GameCard() 构建不注册 =====

async function test_gameCard_noRegister(): Promise<void> {
    const card = sgs.GameCard({ name: 'shan', suit: sgs.CardSuit.Diamond, number: sgs.CardNumber.K });
    assert(card.name === 'shan', 'name 正确');
    assert(card.suit === sgs.CardSuit.Diamond, 'suit 正确');
    assert(card.id === '', '不分配 id（由 registerCards 分配）');
    assert(!sgs.cards.has(''), '未注册到 sgs.cards');

    // 全部可选，默认 name = 'sha'
    const card2 = sgs.GameCard();
    assert(card2.name === 'sha', '默认 name = sha');

    console.log('  ✅ sgs.GameCard 构建不注册');
}

// ===== 测试 4: ModeBuilder =====

async function test_modeBuilder(): Promise<void> {
    const mode = sgs.ModeBuilder('test.standard')
        .maxPlayer(8).beforeStart(async (_r: any) => {}).register();
    assert(mode.name === 'test.standard', 'mode name 正确');
    assert(sgs.modes.has('test.standard'), 'sgs.modes 包含');

    // 幂等
    const m2 = sgs.ModeBuilder('test.standard').maxPlayer(4).register();
    assert(m2.maxPlayer === 8, '幂等：仍为 8');

    console.log('  ✅ ModeBuilder 正确');
}

// ===== 运行 =====

async function main(): Promise<void> {
    describe('E3 — CardBuilder + ModeBuilder + sgs.CardConfig + registerCards');
    await test_cardConfig();
    await test_builder_and_registerCards();
    await test_gameCard_noRegister();
    await test_modeBuilder();
    summary();
}

main().catch((err) => { console.error('测试失败:', err); process.exit(1); });
