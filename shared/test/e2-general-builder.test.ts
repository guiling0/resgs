/**
 * E2 验收测试：GeneralBuilder + 最简扩展验证
 *
 * 验证：
 * 1. GeneralBuilder chainable API 正确构建 GeneralData
 * 2. .register() 写入 sgs.generals（幂等——重复调用不重复注册）
 * 3. GeneralBuilder 通过 sgs.GeneralBuilder 全局可用
 * 4. 导入扩展后 sgs.generals.has('caocao') 为 true
 */

import { assert, describe, summary } from './setup';
import { registerCore } from '../core/register';

// ===== 模拟 sgs 环境（与 M1 测试一致） =====

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
};

const sgs = (globalThis as any).sgs;
registerCore(sgs);

// ===== 测试 1: GeneralBuilder 基础 API =====

async function test_generalBuilder_basicAPI(): Promise<void> {
    const data = sgs.GeneralBuilder('test.lubu')
        .kingdom('qun')
        .hp(4)
        .gender(sgs.Gender.Male)
        .skills(['wushuang'])
        .lord(false)
        .register();

    assert(data.name === 'test.lubu', 'name 正确');
    assert(data.kingdom === 'qun', 'kingdom 正确');
    assert(data.hp === 4, 'hp 正确');
    assert(data.gender === sgs.Gender.Male, 'gender 正确');
    assert(data.skills.length === 1 && data.skills[0] === 'wushuang', 'skills 正确');
    assert(data.lord === false, 'lord 正确');

    console.log('  ✅ GeneralBuilder 基础 API 正确');
}

// ===== 测试 2: .register() 写入 sgs.generals =====

async function test_generalBuilder_registersToSgs(): Promise<void> {
    sgs.GeneralBuilder('test.guanyu')
        .kingdom('shu')
        .hp(4)
        .gender(sgs.Gender.Male)
        .skills(['wusheng'])
        .register();

    assert(sgs.generals.has('test.guanyu'), 'sgs.generals 包含 test.guanyu');

    const data = sgs.generals.get('test.guanyu');
    assert(data.name === 'test.guanyu', '注册数据 name 正确');
    assert(data.kingdom === 'shu', '注册数据 kingdom 正确');

    console.log('  ✅ .register() 正确写入 sgs.generals');
}

// ===== 测试 3: .register() 幂等——重复调用不重复注册 =====

async function test_generalBuilder_idempotent(): Promise<void> {
    const b = sgs.GeneralBuilder('test.zhaoyun')
        .kingdom('shu')
        .hp(3)
        .gender(sgs.Gender.Male)
        .skills(['longdan']);

    const d1 = b.register();
    const d2 = b.register();

    assert(d1 === d2, '重复调用 register() 返回同一对象');
    assert(sgs.generals.get('test.zhaoyun') === d1, 'sgs.generals 中仍是首次注册的数据');

    // 尝试修改后重新 register——应被幂等拦截，返回旧数据
    b.kingdom('wei');
    const d3 = b.register();
    assert(d3.kingdom === 'shu', '幂等拦截：kingdom 仍为首批注册的 "shu"');

    console.log('  ✅ .register() 幂等正确');
}

// ===== 测试 4: sgs.GeneralBuilder 全局可用 =====

async function test_sgs_GeneralBuilder_available(): Promise<void> {
    assert(typeof sgs.GeneralBuilder === 'function', 'sgs.GeneralBuilder 是构造函数');

    const b = sgs.GeneralBuilder('test.zhangfei');
    assert(b.name === 'test.zhangfei', '通过 sgs.GeneralBuilder 创建的实例 name 正确');

    console.log('  ✅ sgs.GeneralBuilder 全局可用');
}

// ===== 测试 5: 可选字段默认值 =====

async function test_generalBuilder_defaults(): Promise<void> {
    // 最简调用——仅 name + register
    const data = sgs.GeneralBuilder('test.minimal').register();

    assert(data.kingdom === 'qun', '默认 kingdom = qun');
    assert(data.hp === 3, '默认 hp = 3');
    assert(data.gender === sgs.Gender.Male, '默认 gender = Male');
    assert(data.skills.length === 0, '默认 skills = []');
    assert(data.lord === false, '默认 lord = false');
    assert(data.enable === true, '默认 enable = true');
    assert(data.hidden === false, '默认 hidden = false');
    assert(data.isWars === false, '默认 isWars = false');

    console.log('  ✅ 可选字段默认值正确');
}

// ===== 测试 6: HP 数组形式（[初始,上限] 和 [初始,上限,护盾]） =====

async function test_generalBuilder_hpArray(): Promise<void> {
    const d1 = sgs.GeneralBuilder('test.hp1')
        .hp([3, 4])
        .register();

    assert(Array.isArray(d1.hp) && d1.hp[0] === 3 && d1.hp[1] === 4,
        'hp [3,4] 正确存储');

    const d2 = sgs.GeneralBuilder('test.hp2')
        .hp([3, 4, 1])
        .register();

    assert(Array.isArray(d2.hp) && d2.hp[0] === 3 && d2.hp[1] === 4 && d2.hp[2] === 1,
        'hp [3,4,1] 正确存储');

    console.log('  ✅ HP 数组形式正确');
}

// ===== 测试 7: 端到端——导入扩展后 caocao 可用 =====

async function test_e2e_extension_import(): Promise<void> {
    // 导入扩展（副作用：注册 caocao 到 sgs.generals）
    await import('../../extension/resgs-ext-temp/index');

    assert(sgs.generals.has('caocao'), '导入扩展后 sgs.generals 包含 caocao');

    const caocao = sgs.generals.get('caocao');
    assert(caocao.name === 'caocao', 'caocao name 正确');
    assert(caocao.kingdom === 'wei', 'caocao kingdom = wei');
    assert(caocao.hp === 4, 'caocao hp = 4');
    assert(caocao.lord === true, 'caocao lord = true');
    assert(caocao.skills.includes('jianxiong'), 'caocao 拥有 jianxiong 技能');

    console.log('  ✅ 端到端扩展导入验证通过');
}

// ===== 运行全部测试 =====

async function main(): Promise<void> {
    describe('E2 — GeneralBuilder + 最简扩展验证');

    await test_generalBuilder_basicAPI();
    await test_generalBuilder_registersToSgs();
    await test_generalBuilder_idempotent();
    await test_sgs_GeneralBuilder_available();
    await test_generalBuilder_defaults();
    await test_generalBuilder_hpArray();
    await test_e2e_extension_import();

    summary();
}

main().catch((err) => {
    console.error('测试执行失败:', err);
    process.exit(1);
});
