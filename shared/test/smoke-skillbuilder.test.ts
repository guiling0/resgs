import { sgs } from '../core/sgs';
import { TimingName } from '../core/types/EventTypes';
import { PriorityType } from '../core/types/SkillTypes';

/** 冒烟测试：SkillBuilder / EffectBuilder 四种构造方式（data 便捷构建 + 链式 builder）+ 注册与幂等 */

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

// ===== 1. Effect data 方式（无前缀） =====

{
    const e = sgs.Effect({
        name: 'ce_e1',
        data: { x: 1 },
        trigger: {
            priority: 3,
            trigger: TimingName.GameStart,
            effect: async () => {},
        },
    });
    check(sgs.effects.has('ce_e1'), 'Effect(data) 注册无前缀效果名');
    check(e.name === 'ce_e1' && e.trigger?.priority === 3, 'Effect(data) 数据正确（priority 3）');
    check(typeof e.condition === 'function' && e.condition.call(undefined as never, {} as never) === true, 'Effect(data) condition 默认 true');
    check(e.settings?.forced === 'mute', 'Effect(data) settings 默认值生效');
}

// ===== 2. Effect builder 方式（register 带技能名前缀） =====

{
    const e = sgs.EffectBuilder('ce_e2')
        .on(TimingName.DamageInflictAfter)
        .effect(async (room, player, data) => {})
        .register('ce_sk2');
    check(sgs.effects.has('ce_sk2.ce_e2'), 'EffectBuilder.register(skillName) 注册带前缀效果名');
    check(e.name === 'ce_sk2.ce_e2' && e.trigger?.trigger === TimingName.DamageInflictAfter, 'EffectBuilder 前缀与触发时机正确');
    check(e.trigger?.priority === PriorityType.General, 'EffectBuilder priority 默认 General');
}

// ===== 3. EffectBuilder 已含前缀不重复加 =====

{
    const e = sgs.EffectBuilder('ce_sk3.ce_e3')
        .on(TimingName.GameStart)
        .effect(async () => {})
        .register('ce_sk3');
    check(e.name === 'ce_sk3.ce_e3', 'EffectBuilder 已含技能前缀不再叠加');
}

// ===== 4. Effect 幂等：已注册直接返回已有 =====

{
    const e1 = sgs.Effect({
        name: 'ce_e4',
        trigger: { priority: 1, trigger: TimingName.GameStart, effect: async () => {} },
    });
    const e2 = sgs.Effect({
        name: 'ce_e4',
        trigger: { priority: 2, trigger: TimingName.GameStart, effect: async () => {} },
    });
    check(e1 === e2 && e1.trigger?.priority === 1, 'Effect(data) 重复注册返回已有数据');
}

// ===== 5. 至少配置其一：无触发无状态报错 =====

{
    try {
        sgs.Effect({ name: 'ce_empty' });
        check(false, 'Effect(data) 无触发/状态应报错');
    } catch (e) {
        check(String(e).includes('至少其一'), 'Effect(data) 无触发/状态报错');
    }
}

// ===== 6. 触发 + 状态互斥（data 方式） =====

{
    try {
        sgs.Effect({
            name: 'ce_mix',
            trigger: { priority: 1, trigger: TimingName.GameStart, effect: async () => {} },
            state: { dist: () => true },
        });
        check(false, 'Effect(data) 同时配置触发与状态应报错');
    } catch (e) {
        check(String(e).includes('不能同时配置触发与状态回调'), 'Effect(data) 触发与状态互斥报错');
    }
}

// ===== 7. Skill data 方式：effects 前缀补齐与保留 =====

{
    const sk = sgs.Skill({
        name: 'ce_sk6',
        effects: [
            sgs.Effect({
                name: 'e_a',
                trigger: { priority: 1, trigger: TimingName.GameStart, effect: async () => {} },
            }),
            sgs.Effect({
                name: 'ce_sk6.e_b',
                trigger: { priority: 2, trigger: TimingName.GameStart, effect: async () => {} },
            }),
        ],
    });
    check(sgs.skills.has('ce_sk6'), 'Skill(data) 注册技能');
    check(sk.effects[0].name === 'ce_sk6.e_a', 'Skill(data) 短名效果补技能前缀');
    check(sk.effects[1].name === 'ce_sk6.e_b', 'Skill(data) 已含前缀效果保留');
    check(sgs.effects.has('ce_sk6.e_a') && sgs.effects.has('ce_sk6.e_b'), 'Skill(data) 效果连带注册完整名');
}

// ===== 8. Skill builder 方式：addEffect 链式 + register 连带效果 + 幂等 =====

{
    const b = sgs.SkillBuilder('ce_sk8');
    b.addEffect('ce_e8').on(TimingName.DamageInflictAfter).effect(async () => {});
    const sk = b.register();
    check(sgs.skills.has('ce_sk8'), 'SkillBuilder.register() 注册技能');
    check(sgs.effects.has('ce_sk8.ce_e8'), 'SkillBuilder.register() 连带注册效果（完整名）');
    check(sk.effects.length === 1 && sk.effects[0].name === 'ce_sk8.ce_e8', 'SkillBuilder effects 数据正确');

    const sk2 = b.register();
    check(sk === sk2, 'SkillBuilder.register() 重复注册幂等');
}

// ===== 9. SkillBuilder.addEffect 传入已有 builder =====

{
    const eb = sgs.EffectBuilder('ce_e9').on(TimingName.GameStart).effect(async () => {});
    const b = sgs.SkillBuilder('ce_sk9');
    b.addEffect(eb);
    const sk = b.register();
    check(sgs.effects.has('ce_sk9.ce_e9'), 'SkillBuilder.addEffect(builder) 注册效果');
    check(sk.effects[0].name === 'ce_sk9.ce_e9', 'SkillBuilder.addEffect(builder) 效果名带前缀');
}

console.log(`\n失败: ${failed}`);
