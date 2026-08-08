import { Room } from '../core/entity/Room';
import { LocalTransport } from '../core/transport/LocalTransport';
import { RoomHost } from '../core/logic/room/RoomHost';
import { EventProcess, createTiming } from '../core/logic/event/EventProcess';
import { Player } from '../core/entity/Player';
import { Skill } from '../core/entity/Skill';
import { TriggerEffect } from '../core/entity/TriggerEffect';
import { GameCard } from '../core/entity/GameCard';
import { Area } from '../core/entity/Area';
import { PriorityType, SkillTag } from '../core/types/SkillTypes';
import type { EffectContext, EffectData, SkillData } from '../core/types/SkillTypes';
import { EventType, TimingName } from '../core/types/EventTypes';
import { DamageType } from '../core/types/EventTypes';
import { CardColor, CardNumber, CardSuit } from '../core/types/CardTypes';
import { AreaType } from '../core/types/AreaTypes';
import { sgs } from '../core/sgs';

/** 冒烟测试：事件流程（EventProcess 触发顺序 + 优先级调度 + 各事件类结算） */

// 挂载全局 sgs（GameCard 构造经 sgs.carddatas 派生牌面类别）
sgs.init('preview');

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

function newRoom(): Room {
    const room = new Room('r1', { responseTime: 1000 }, new LocalTransport());
    room.host = new RoomHost(room);
    return room;
}

function addPlayer(room: Room, id: string, seat: number): Player {
    const player = new Player(room, id);
    player.seat = seat;
    room.players.set(id, player);
    return player;
}

/** 构造技能 + 触发效果（forced=mute 可自动发动） */
function makeEffect(
    room: Room,
    player: Player,
    effectName: string,
    trigger: TimingName,
    priority: PriorityType,
    effectFn: (room: Room, player: Player, data: unknown, ctx: EffectContext) => Promise<unknown>,
    tag: SkillTag[] = [],
): TriggerEffect {
    const skillData: SkillData = {
        name: 'test.skill',
        is_rule: false,
        is_lord: false,
        condition: () => true,
        effects: [],
    };
    const skill = new Skill(room, skillData, player);
    const effectData: EffectData = {
        name: effectName,
        tag,
        settings: { forced: 'mute' },
        condition: () => true,
        trigger: { priority, trigger, effect: effectFn },
    };
    return new TriggerEffect(room, effectData, skill, player);
}

// ===== 1. EventProcess 触发顺序：before → trigger → after =====

async function main(): Promise<void> {
{

    const room = newRoom();
    const trace: string[] = [];

    class TraceEvent extends EventProcess<EventType.Move> {
        constructor(r: Room) {
            super(r, EventType.Move, { datas: [] });
            this.eventTriggers = [
                createTiming(
                    TimingName.GameStart,
                    [async () => { trace.push('before'); }],
                    [async () => { trace.push('after'); }],
                ),
            ];
        }
    }

    await new TraceEvent(room).exec();
    check(trace.length === 2 && trace[0] === 'before' && trace[1] === 'after', 'EventProcess: before → after 顺序执行');
    check(room.eventStack.length === 0, '事件执行后出栈');
}

// ===== 2. 优先级调度：General 先于 Rule =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    room.currentPlayerId = 'p1';
    const order: string[] = [];

    makeEffect(room, p1, 'rule_effect', TimingName.DamageCause1, PriorityType.Rule, async () => { order.push('rule'); });
    makeEffect(room, p1, 'general_effect', TimingName.DamageCause1, PriorityType.General, async () => { order.push('general'); });

    await room.event.trigger(TimingName.DamageCause1, {});
    check(order[0] === 'general' && order[1] === 'rule', `优先级顺序 General→Rule，实际=[${order.join(',')}]`);
}

// ===== 3. 伤害流程：damage → reduceHp → hp 扣减 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    const p2 = addPlayer(room, 'p2', 2);
    p2.hp = 4;

    await room.damage(p1, p2, 1, DamageType.None);
    check(p2.hp === 3, `damage(1) → hp=${p2.hp}（期望 3）`);
}

// ===== 4. 濒死 → 死亡链（killer 追溯） =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    const p2 = addPlayer(room, 'p2', 2);
    p2.hp = 1;

    await room.damage(p1, p2, 2, DamageType.None);
    check(p2.hp === -1, `伤害溢出 → hp=${p2.hp}（期望 -1）`);
    check(p2.death === true, '濒死未救活 → 死亡');
    const death = room.getLastOneHistory<EventProcess & { killer?: Player }>('Death');
    check(death?.killer === p1, `killer 追溯 → ${death?.killer?.playerId ?? 'none'}`);
    const dying = room.getLastOneHistory<EventProcess>('Dying');
    check(p2.getMark('indying') === -(dying?.id ?? 0), 'indying 标记清理');
}

// ===== 5. 回复体力：超出已损失部分裁剪 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    p1.hp = 2;

    await room.recover(p1, 3);
    check(p1.hp === 4, `recover 裁剪 → hp=${p1.hp}（期望 4 = maxhp）`);
}

// ===== 6. 体力上限改变 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    p1.maxhp = 4;

    await room.changeMaxHp(p1, 2);
    check(p1.maxhp === 6, `changeMaxHp(+2) → maxhp=${p1.maxhp}`);
}

// ===== 7. 移动卡牌：区域 add/remove =====

{
    const room = newRoom();
    const draw = new Area(room, AreaType.Draw);
    const discard = new Area(room, AreaType.Discard);
    const card = new GameCard(room, {
        id: 't.c1',
        name: 'test_sha',
        suit: CardSuit.Spade,
        color: CardColor.Black,
        number: CardNumber.Number7,
        attr: [],
        derived: false,
    });
    draw.add([card]);

    await room.moveCards([card], AreaType.Discard);
    check(!draw.has(card) && discard.has(card), 'moveCards：牌堆 → 弃牌堆');
    check(card.put === true, '弃牌堆放置方式为正面朝上');
}

// ===== 8. 状态改变：连环/翻面翻转 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);

    await room.chain(p1);
    check(p1.chained === true, 'chain → chained=true');
    await room.chain(p1);
    check(p1.chained === false, 'chain 再翻转 → chained=false');

    await room.skip(p1);
    check(p1.skip === true, 'skip → skip=true');
}

// ===== 9. 技能发动：effect 执行 + limit 标记限制发动次数 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    room.currentPlayerId = 'p1';
    let invokeCount = 0;

    makeEffect(
        room,
        p1,
        'test.limit_effect',
        TimingName.DamageCause1,
        PriorityType.General,
        async () => { invokeCount++; },
        [SkillTag.Limit],
    );

    await room.event.trigger(TimingName.DamageCause1, {});
    check(invokeCount === 1, `限定技首次发动 effect 执行（count=${invokeCount}）`);
    check(p1.getMark('test.limit_effect') === 1, '限定技发动后标记写入');

    await room.event.trigger(TimingName.DamageCause1, {});
    check(invokeCount === 1, `限定技已发动 → 不再发动（count=${invokeCount}）`);
}

// ===== 10. 卡牌使用方式：注册 → initCardUses 索引 → useCard 端到端 =====

{
    const room = newRoom();
    const p1 = addPlayer(room, 'p1', 1);
    const p2 = addPlayer(room, 'p2', 2);
    let effectTarget: Player | undefined;

    // 同名两方式：PlayPhase 默认方式 + DrawPhase 额外方式
    sgs.CardUse({
        name: 'test_sha',
        timing: TimingName.PlayPhase,
        target: (r, from) => [...r.players.values()].filter((p) => p !== from),
        effect: async (_r, target) => { effectTarget = target; },
    });
    sgs.CardUse({
        name: 'test_sha',
        timing: TimingName.DrawPhase,
        target: () => [],
        effect: async () => {},
    });

    room.initCardUses();
    check(room.carduses.get('test_sha')?.timing === TimingName.PlayPhase, '同名首个方式以 name 索引');
    check(room.carduses.get('test_sha.draw_phase')?.timing === TimingName.DrawPhase, '同名后续方式以 name.timing 索引');
    check(room.cardusesByTiming.get(TimingName.PlayPhase)?.length === 1, 'cardusesByTiming 按时机索引');

    // useCard 端到端：UseCardEvent → EffectAfter → cardUse.effect
    const vc = room.host!.vcard.createByNone('test_sha');
    await room.useCard(p1, vc, [p2]);
    check(effectTarget === p2, 'useCard 结算触发牌面效果');
    check(vc.destroyed === true, 'useCard 结束后虚拟牌销毁');
}

// ===== 汇总 =====

    console.log(failed === 0 ? '\n全部通过' : `\n${failed} 项失败`);
    process.exit(failed === 0 ? 0 : 1);
}

main().then(
    () => { /* process.exit 已由 main 内执行 */ },
    (e) => {
        console.error(e);
        process.exit(1);
    },
);
