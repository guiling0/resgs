import { Room } from '../core/room/Room';
import { Player } from '../core/player/Player';
import { applyPatches } from '../core/state/applyPatches';
import type { StatePatch } from '../core/state/StateTypes';

/** 冒烟测试：Room 基础 StateStore（装饰器 + flush + 事务 + path + apply 回放） */

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

function newRoom(): Room {
    return new Room('r1', { responseTime: 1000 });
}

// ===== 1. @sync 字段 set → flush 产 set patch（Room 根字段） =====

{
    const room = newRoom();
    room.turnCount = 5;
    const patches = room.store.flush();
    const p0 = patches[0] as { kind: string; path: string; value: number };
    check(patches.length === 1, '根字段变化 flush 产出 1 条 patch');
    check(p0.kind === 'set' && p0.path === 'turnCount' && p0.value === 5, 'set patch：path=turnCount value=5');
    check(room.store.flush().length === 0, '无变化时 flush 返回空（不发空消息）');
}

// ===== 2. 玩家加入 + 字段变化 → 实体段 path =====

{
    const room = newRoom();
    const p1 = new Player('p1', room);
    room.players.set('p1', p1);
    const m = room.store.flush()[0] as { kind: string; path: string; key: string };
    check(m.kind === 'map.add' && m.path === 'player' && m.key === 'p1', '玩家加入：map.add path=player key=p1');

    p1.hp = 3;
    p1.seat = 2;
    const patches = room.store.flush();
    check(patches.length === 2, '两个字段变化产 2 条 patch');
    check(
        patches.some((p) => (p as { kind: string }).kind === 'set' && p.path === 'player/p1/hp' && (p as { value: number }).value === 3),
        'hp 变化：set patch path=player/p1/hp value=3',
    );
    check(
        patches.some((p) => (p as { kind: string }).kind === 'set' && p.path === 'player/p1/seat' && (p as { value: number }).value === 2),
        'seat 变化：set patch path=player/p1/seat value=2',
    );
}

// ===== 3. 事务批次：批内多字段 = 一条消息多 patch；批中 flush 不产出 =====

{
    const room = newRoom();
    const p3 = new Player('p3', room);
    room.players.set('p3', p3);
    room.store.flush();

    let messages: StatePatch[][] = [];
    room.store.onFlush = (ps) => messages.push(ps);

    room.store.beginBatch();
    p3.hp = 2;
    p3.maxhp = 3;
    room.turnCount = 1;
    check(room.store.flush().length === 0, '批次开启中 flush 不产出');
    room.store.endBatch();
    check(messages.length === 1, 'endBatch 强制产出一条消息');
    check(messages[0].length === 3, '批内 3 个变化合并为一条消息 3 个 patch');
    room.store.onFlush = undefined;
}

// ===== 4. @syncMap / @syncArray 容器补丁 =====

{
    const room = newRoom();
    const p4 = new Player('p4', room);
    room.players.set('p4', p4);
    room.store.flush();

    p4.marks.set('sha_times', 1);
    const m = room.store.flush()[0] as { kind: string; path: string; key: string; value: number };
    check(m.kind === 'map.add' && m.path === 'player/p4/marks' && m.key === 'sha_times' && m.value === 1, 'marks：map.add path=player/p4/marks');

    p4.hand.push('card_1');
    p4.hand.push('card_2');
    const arr = room.store.flush();
    const a0 = arr[0] as { kind: string; path: string; index: number; value: string };
    const a1 = arr[1] as { kind: string; path: string; index: number; value: string };
    check(a0.kind === 'arr.insert' && a0.path === 'player/p4/hand' && a0.index === 0 && a0.value === 'card_1', 'hand：arr.insert index=0 card_1');
    check(a1.kind === 'arr.insert' && a1.index === 1 && a1.value === 'card_2', 'hand：arr.insert index=1 card_2');

    p4.hand.replace(0, 'card_9');
    const r = room.store.flush()[0] as { kind: string; index: number; value: string };
    check(r.kind === 'arr.replace' && r.index === 0 && r.value === 'card_9', 'hand：arr.replace index=0 card_9');

    p4.marks.delete('sha_times');
    const d = room.store.flush()[0] as { kind: string; key: string };
    check(d.kind === 'map.remove' && d.key === 'sha_times', 'marks：map.remove key=sha_times');
}

// ===== 5. 镜像端 apply 回放一致 =====

{
    const src = newRoom();
    const mirror = newRoom();
    const collected: StatePatch[] = [];
    src.store.onFlush = (ps) => {
        collected.push(...ps);
        applyPatches(mirror, ps);
    };

    const pa = new Player('pa', src);
    src.players.set('pa', pa);
    src.store.flush();
    pa.hp = 3;
    pa.seat = 1;
    src.store.flush();
    pa.marks.set('m1', 5);
    src.store.flush();
    pa.hand.push('c1');
    pa.hand.push('c2');
    src.store.flush();
    src.store.beginBatch();
    pa.maxhp = 2;
    pa.hp = 4;
    src.store.endBatch();

    const mp = mirror.players.get('pa') as unknown as {
        hp: number; seat: number; maxhp: number;
        marks: { get: (k: string) => number | undefined };
        hand: { toArray: () => string[] };
    };
    check(mp !== undefined, '镜像端实体已创建');
    check(mp.hp === 4, `镜像 hp=4（事务内变化回放一致）`);
    check(mp.seat === 1, '镜像 seat=1');
    check(mp.maxhp === 2, '镜像 maxhp=2');
    check(mp.marks.get('m1') === 5, '镜像 marks.m1=5');
    check(mp.hand.toArray().join(',') === 'c1,c2', '镜像 hand=[c1,c2]');
    check(mirror.turnCount === 0, '镜像 turnCount=0（无未应用变化）');
    check(collected.length > 0, 'host 端全部变化均已通过 onFlush 送达');
}

// ===== 6. 嵌套挂载：容器字段随实体自动挂载 =====

{
    const room = newRoom();
    const p6 = new Player('p6', room);
    room.players.set('p6', p6);
    room.store.flush();
    p6.hand.push('x');
    const h = room.store.flush()[0] as { kind: string; path: string };
    check(h.kind === 'arr.insert' && h.path === 'player/p6/hand', '容器字段挂载正确（path=player/p6/hand）');
}

console.log(`\n失败: ${failed}`);
