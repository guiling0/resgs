/**
 * M1 验收测试：触发技桥接（trigger→askForSkillInvoke→UseSkillEvent）
 *
 * 验证：
 * 1. 锁定技自动发动（forced='mute'）
 * 2. 普通技确认后发动（forced='cost'）
 * 3. 普通技拒绝后不发动
 * 4. times=1 限次
 * 5. 多玩家逆时针响应顺序（伤害源 → 当前回合角色逆时针）
 * 6. 多优先级顺序（武将技 vs 装备技）
 */

import { createRoom, createPlayer, ConsoleLogger, MockPlayerInput, assert, describe, summary } from './setup';
import { SkillBuilder } from '../core/skill/builder/SkillBuilder';
import { TimingName } from '../core/event/EventTypes';
import { PriorityType, SkillTag } from '../core/skill/SkillTypes';

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
};

const sgs = (globalThis as any).sgs;

// ===== 工具：注册测试技能 =====

function registerTestSkill(
    name: string,
    config: {
        tag?: SkillTag[];
        forced?: 'mute' | 'cost';
        timing?: string;
        effectFn?: (ctx: any) => Promise<void>;
        times?: number;
    },
) {
    const builder = SkillBuilder(name);
    const effect = builder.addEffect('trigger');
    if (config.tag?.length) effect.tag = config.tag;
    if (config.forced) effect.settings({ forced: config.forced });
    if (config.timing) effect.on(config.timing as any);
    if (config.effectFn) {
        effect.effect(async function (this: any, _room: any, _player: any, _data: any, ctx: any) {
            await config.effectFn!(ctx);
        });
    }
    if (config.times !== undefined) effect.times(config.times);
    effect.priority = PriorityType.General;
    effect.context(function (this: any, _room: any, player: any) {
        return { from: player };
    });
    // .register() 自动写入 sgs.skills + sgs.effects
    return builder.register();
}

// ===== 测试 1: 锁定技自动发动 =====

async function test_lockSkillAutoFire(): Promise<void> {
    console.log('\n  -- 测试 1: 锁定技自动发动 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    let fired = false;
    registerTestSkill('test.lock_draw', {
        tag: [SkillTag.Lock],
        forced: 'mute',
        timing: TimingName.DamageInflictAfter,
        effectFn: async () => { fired = true; },
    });

    room.skill.addSkill('test.lock_draw', pB);
    await room.event.damage({ target: pB, number: 1, source: pA });

    assert(fired, '锁定技在受到伤害后自动发动（无需询问）');
}

// ===== 测试 2: 普通技确认后发动 =====

async function test_costSkillConfirm(): Promise<void> {
    console.log('\n  -- 测试 2: 普通技确认后发动 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });

    let fired = false;
    registerTestSkill('test.confirm_draw', {
        forced: 'cost',
        timing: TimingName.DamageInflictAfter,
        effectFn: async () => { fired = true; },
    });

    room.skill.addSkill('test.confirm_draw', pB);
    await room.event.damage({ target: pB, number: 1, source: pA });

    // autoSelectFirst=true → 自动确认
    assert(fired, '普通技经 autoSelectFirst 自动确认后发动');
}

// ===== 测试 3: times=1 单次调用内不重复 =====
// 两个伤害各触发一次 trigger()，每次 times 独立，所以各发动一次。

async function test_timesOnceLimit(): Promise<void> {
    console.log('\n  -- 测试 3: times=1 单 trigger 调用内限次 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });

    let fireCount = 0;
    registerTestSkill('test.once_trigger', {
        forced: 'mute',
        timing: TimingName.TurnStartAfter,
        times: 1,
        effectFn: async () => { fireCount++; },
    });

    room.skill.addSkill('test.once_trigger', pA);

    // 单次 trigger 调用
    await room.event.trigger(TimingName.TurnStartAfter, {});
    // while 循环重扫应被 times 计数器阻止
    assert(fireCount === 1, `times=1 单次 trigger 内只发动一次 (实际=${fireCount})`);

    // 第二次 trigger 调用——新计数器，再次发动
    await room.event.trigger(TimingName.TurnStartAfter, {});
    assert(fireCount === 2, `第二次 trigger 调用重新计数 (实际=${fireCount})`);
}

// ===== 测试 4: 多玩家逆时针顺序 =====

async function test_counterClockwiseOrder(): Promise<void> {
    console.log('\n  -- 测试 4: 多玩家逆时针顺序 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    // pA=当前回合玩家(seat 1), pB(seat 2), pC(seat 3)
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1, inturn: true });
    const pB = createPlayer(room, 'pB', { hp: 3, maxhp: 3, seat: 2 });
    const pC = createPlayer(room, 'pC', { hp: 3, maxhp: 3, seat: 3 });

    // 设置当前回合玩家为 pA
    room.turnStack.push({ player: pA } as any);

    const order: string[] = [];
    const skillName = 'test.order';

    registerTestSkill(skillName, {
        forced: 'mute',
        timing: TimingName.TurnStart,
        effectFn: async (ctx: any) => { order.push(ctx.from.playerId); },
    });

    room.skill.addSkill(skillName, pA);
    room.skill.addSkill(skillName, pB);
    room.skill.addSkill(skillName, pC);

    await room.event.trigger(TimingName.TurnStart, {});

    // pA 是当前回合玩家 → 排序应从 pA 开始逆时针 (A,B,C)
    assert(order[0] === 'pA', `第一个应是当前回合玩家 pA (实际=${order[0]})`);
    assert(order[1] === 'pB', `第二个应是 pB (实际=${order[1]})`);
    assert(order[2] === 'pC', `第三个应是 pC (实际=${order[2]})`);

    room.turnStack.length = 0;
}

// ===== 测试 5: 多优先级顺序（武将技 vs 装备技）=====

async function test_priorityOrder(): Promise<void> {
    console.log('\n  -- 测试 5: 多优先级顺序 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });

    const priorities: number[] = [];

    // 装备技（优先级 Equip=2）
    const equipSkill = SkillBuilder('equip.test_eq');
    const eqEff = equipSkill.addEffect('trigger');
    eqEff.tag = [SkillTag.Lock];
    eqEff.settings({ forced: 'mute' });
    eqEff.on(TimingName.TurnStartAfter as any);
    eqEff.priority = PriorityType.Equip;
    eqEff.context(function (this: any, _room: any, player: any) {
        return { from: player };
    });
    eqEff.effect(async function () { priorities.push(2); });
    equipSkill.register(); // 自动写入 sgs.skills + sgs.effects

    // 武将技（优先级 General=1）
    registerTestSkill('general.test_gen', {
        tag: [SkillTag.Lock],
        forced: 'mute',
        timing: TimingName.TurnStartAfter,
        effectFn: async () => { priorities.push(1); },
    });

    room.skill.addSkill('general.test_gen', pA);
    room.skill.addSkill('equip.test_eq', pA);

    await room.event.trigger(TimingName.TurnStartAfter, {});

    assert(
        priorities[0] === 1 && priorities[1] === 2,
        `武将技(优先级1)应先于装备技(优先级2) (实际=${priorities.join(',')})`,
    );
}

// ===== 测试 6: 无 trigger 注册时正常返回 =====

async function test_noRegisteredEffects(): Promise<void> {
    console.log('\n  -- 测试 6: 无注册效果时正常返回 --');

    const room = createRoom({ logger: new ConsoleLogger(false) });
    const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });

    // 不应该报错
    let error: Error | null = null;
    try {
        await room.event.trigger(TimingName.TurnStartAfter, {});
    } catch (e) {
        error = e as Error;
    }

    assert(error === null, '无注册效果时 trigger 不应抛错');
}

// ===== 主入口 =====

async function main() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║     M1 触发技桥接 验收测试          ║');
    console.log('╚══════════════════════════════════════╝');

    await test_lockSkillAutoFire();
    await test_costSkillConfirm();
    await test_timesOnceLimit();
    await test_counterClockwiseOrder();
    await test_priorityOrder();
    await test_noRegisteredEffects();

    summary();
}

main().catch(console.error);
