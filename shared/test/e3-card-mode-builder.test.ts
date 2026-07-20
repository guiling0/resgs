/**
 * E3 验收测试：CardBuilder + ModeBuilder
 *
 * 验证：
 * 1. CardBuilder 写入 sgs.carddatas（类型定义）
 * 2. CardBuilder 写入 sgs.cards（实体牌实例，含花色点数）
 * 3. CardBuilder .register() 幂等
 * 4. ModeBuilder 写入 sgs.modes
 * 5. ModeBuilder .register() 幂等
 * 6. sgs.CardBuilder / sgs.ModeBuilder 全局可用
 */

import { assert, describe, summary } from './setup';
import { registerCore } from '../core/register';

// ===== 模拟 sgs 环境 =====

(globalThis as any).sgs = (globalThis as any).sgs ?? {
    skills: new Map(),
    effects: new Map(),
    skillsAssets: new Map(),
    selectors: new Map(),
    modes: new Map(),
    cards: new Map(),
    carddatas: new Map(),
    generals: new Map(),
    generalAssets: new Map(),
    translations: new Map(),
    carduses: new Map(),
};

const sgs = (globalThis as any).sgs;
registerCore(sgs);

// ===== 测试 1: CardBuilder 注册卡牌类型定义 =====

async function test_cardBuilder_typeOnly(): Promise<void> {
    const { carddata, card } = new sgs.CardBuilder('sha')
        .type(sgs.CardType.Basic)
        .subtype(sgs.CardSubType.Basic)
        .damage(true)
        .register();

    assert(carddata.name === 'sha', 'carddata name 正确');
    assert(carddata.type === sgs.CardType.Basic, 'carddata type = Basic');
    assert(carddata.subtype === sgs.CardSubType.Basic, 'carddata subtype = Basic');
    assert(carddata.damage === true, 'carddata damage = true');
    assert(carddata.recover === false, 'carddata recover 默认 false');
    assert(sgs.carddatas.has('sha'), 'sgs.carddatas 包含 sha');

    // 无花色点数 → 不生成实体牌实例
    assert(card === undefined, '无花色点数时不生成实体牌实例');

    console.log('  ✅ CardBuilder 类型定义注册正确');
}

// ===== 测试 2: CardBuilder 含花色点数——同时注册实体牌实例 =====

async function test_cardBuilder_withSuitNumber(): Promise<void> {
    const { carddata, card } = new sgs.CardBuilder('sha.spade.a')
        .type(sgs.CardType.Basic)
        .subtype(sgs.CardSubType.Basic)
        .suit(sgs.CardSuit.Spade)
        .number(sgs.CardNumber.A)
        .damage(true)
        .register();

    assert(carddata.name === 'sha.spade.a', 'carddata name 正确');
    assert(sgs.carddatas.has('sha.spade.a'), 'sgs.carddatas 包含 sha.spade.a');

    // 含花色点数 → 同时生成实体牌实例
    assert(card !== undefined, '含花色点数时生成实体牌实例');
    assert(card!.suit === sgs.CardSuit.Spade, '实体牌 suit = Spade');
    assert(card!.number === sgs.CardNumber.A, '实体牌 number = A');
    assert(card!.color === sgs.CardColor.Black, '黑桃花色 → 颜色 Black');
    assert(typeof card!.id === 'number', '实体牌 id 为数字');
    assert(sgs.cards.has(card!.id), 'sgs.cards 包含实体牌');

    console.log('  ✅ CardBuilder 实体牌实例注册正确');
}

// ===== 测试 3: CardBuilder 幂等 =====

async function test_cardBuilder_idempotent(): Promise<void> {
    const b = new sgs.CardBuilder('tao')
        .type(sgs.CardType.Basic)
        .subtype(sgs.CardSubType.Basic)
        .recover(true)
        .suit(sgs.CardSuit.Heart)
        .number(sgs.CardNumber.Number2);

    const r1 = b.register();
    const r2 = b.register();

    assert(r1.carddata === r2.carddata, '重复 register 返回同一 carddata');
    assert(sgs.carddatas.has('tao'), 'sgs.carddatas 包含 tao');

    console.log('  ✅ CardBuilder 幂等正确');
}

// ===== 测试 4: ModeBuilder 注册游戏模式 =====

async function test_modeBuilder_register(): Promise<void> {
    const mode = new sgs.ModeBuilder('test.standard')
        .maxPlayer(8)
        .isTeamMode(false)
        .settings({ enableLuckyCard: [] })
        .rules('standard_rules')
        .beforeStart(async (_room: any) => { /* 标准初始化 */ })
        .register();

    assert(mode.name === 'test.standard', 'mode name 正确');
    assert(mode.maxPlayer === 8, 'mode maxPlayer = 8');
    assert(mode.isTeamMode === false, 'mode isTeamMode = false');
    assert(mode.rules === 'standard_rules', 'mode rules 正确');
    assert(typeof mode.beforeStart === 'function', 'mode beforeStart 是函数');
    assert(sgs.modes.has('test.standard'), 'sgs.modes 包含 test.standard');

    console.log('  ✅ ModeBuilder 注册正确');
}

// ===== 测试 5: ModeBuilder 幂等 =====

async function test_modeBuilder_idempotent(): Promise<void> {
    const b = new sgs.ModeBuilder('test.idempotent')
        .maxPlayer(4);

    const m1 = b.register();
    b.maxPlayer(6);
    const m2 = b.register();

    assert(m1 === m2, '重复 register 返回同一对象');
    assert(m2.maxPlayer === 4, '幂等拦截：maxPlayer 仍为 4');

    console.log('  ✅ ModeBuilder 幂等正确');
}

// ===== 测试 6: sgs 全局可用 =====

async function test_sgs_Builders_available(): Promise<void> {
    assert(typeof sgs.CardBuilder === 'function', 'sgs.CardBuilder 是构造函数');
    assert(typeof sgs.ModeBuilder === 'function', 'sgs.ModeBuilder 是构造函数');

    const cb = new sgs.CardBuilder('shan');
    assert(cb.name === 'shan', 'CardBuilder 实例正确');

    const mb = new sgs.ModeBuilder('test.mode');
    assert(mb.name === 'test.mode', 'ModeBuilder 实例正确');

    console.log('  ✅ sgs.CardBuilder / sgs.ModeBuilder 全局可用');
}

// ===== 运行全部测试 =====

async function main(): Promise<void> {
    describe('E3 — CardBuilder + ModeBuilder');

    await test_cardBuilder_typeOnly();
    await test_cardBuilder_withSuitNumber();
    await test_cardBuilder_idempotent();
    await test_modeBuilder_register();
    await test_modeBuilder_idempotent();
    await test_sgs_Builders_available();

    summary();
}

main().catch((err) => {
    console.error('测试执行失败:', err);
    process.exit(1);
});
