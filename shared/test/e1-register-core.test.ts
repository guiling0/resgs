/**
 * E1 验收测试：registerCore 将枚举和 Builder 挂载到 sgs 全局对象
 *
 * 验证：
 * 1. registerCore 将所有枚举挂载到目标对象
 * 2. 枚举值运行时可用——sgs.TimingName.DamageStart === 'damage_start'
 * 3. Builder 类挂载到目标对象——sgs.SkillBuilder / sgs.EffectBuilder
 * 4. TypeScript 类型检查通过（编译期验证，见 tsc --noEmit）
 * 5. sgs.init() 自动调用 registerCore（见 sgs.ts init() 实现）
 */

import { assert, describe, summary } from './setup';
import { registerCore } from '../core/register';
import { TimingName } from '../core/event/EventTypes';
import { PriorityType } from '../core/skill/SkillTypes';
import { CardType } from '../core/card/CardTypes';

/** registerCore 应挂载的全部属性名 */
const EXPECTED_KEYS = [
    // 事件
    'TimingName', 'EventType', 'DamageType',
    // 技能
    'PriorityType', 'SkillTag', 'StateEffectType',
    // 卡牌
    'CardAttr', 'CardSuit', 'CardNumber', 'CardColor',
    'CardType', 'CardSubType', 'EquipSubType', 'AreaType',
    // 玩家
    'Phase',
    // 选择
    'SelectorType', 'PlayPhaseResult',
    // 武将
    'Gender',
    // Builder
    'SkillBuilder', 'EffectBuilder',
];

// ===== 共享目标——registerCore 是纯函数，可安全复用 =====
const target: Record<string, any> = {};
registerCore(target);

// ===== 测试：全部枚举和 Builder 已挂载 =====

async function test_allKeysMounted(): Promise<void> {
    for (const key of EXPECTED_KEYS) {
        assert(target[key] !== undefined, `${key} 已挂载`);
    }
    console.log(`  ✅ 全部 ${EXPECTED_KEYS.length} 个属性已挂载`);
}

// ===== 测试：关键枚举值正确 =====

async function test_keyEnumValues(): Promise<void> {
    assert(
        target.TimingName.DamageStart === 'damage_start',
        'TimingName.DamageStart === "damage_start"',
    );
    assert(target.DamageType.Fire === 1, 'DamageType.Fire === 1');
    assert(target.PriorityType.General === 1, 'PriorityType.General === 1');
    assert(target.CardType.Basic === 1, 'CardType.Basic === 1');
    assert(target.AreaType.Hand === 'hand', 'AreaType.Hand === "hand"');
    assert(target.Phase.Draw === 3, 'Phase.Draw === 3');
    assert(target.SelectorType.Card === 'Card', 'SelectorType.Card === "Card"');
    assert(target.Gender.Male === 1, 'Gender.Male === 1');
    console.log('  ✅ 关键枚举值正确');
}

// ===== 测试：Builder 类是构造函数 =====

async function test_buildersAreConstructors(): Promise<void> {
    assert(typeof target.SkillBuilder === 'function', 'SkillBuilder 是构造函数');
    assert(typeof target.EffectBuilder === 'function', 'EffectBuilder 是构造函数');

    const builder = new target.SkillBuilder('test.skill');
    assert(builder.name === 'test.skill', '通过挂载的 SkillBuilder 创建实例');
    console.log('  ✅ Builder 类可正常使用');
}

// ===== 测试：挂载值与直接 import 一致 =====

async function test_mountedMatchesImport(): Promise<void> {
    assert(
        target.TimingName.DamageStart === TimingName.DamageStart,
        'TimingName 值与直接 import 一致',
    );
    assert(
        target.PriorityType.General === PriorityType.General,
        'PriorityType 值与直接 import 一致',
    );
    assert(
        target.CardType.Basic === CardType.Basic,
        'CardType 值与直接 import 一致',
    );
    console.log('  ✅ 挂载值与直接 import 完全一致');
}

// ===== 运行全部测试 =====

async function main(): Promise<void> {
    describe('E1 — registerCore + sgs 全局暴露');

    await test_allKeysMounted();
    await test_keyEnumValues();
    await test_buildersAreConstructors();
    await test_mountedMatchesImport();

    summary();
}

main().catch((err) => {
    console.error('测试执行失败:', err);
    process.exit(1);
});
