import { LocalTransport } from '../core/transport/LocalTransport';
import { serialize, deserialize } from '../core/transport/codec';
import { MessageType } from '../core/transport/messages';
import { Room } from '../core/entity/Room';
import { Player } from '../core/entity/Player';
import type { Message } from '../core/transport/messages';

/** 冒烟测试：传输层（codec / LocalTransport 通道 / 事务批次混合载荷 / 帧 tick） */

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

// ===== 1. codec 往返一致（batch 混合载荷） =====

{
    const msg: Message = {
        kind: 'batch',
        seq: 1,
        patches: [{ kind: 'set', path: 'player/p1/hp', value: 3 }],
        events: [{ type: MessageType.None, id: 1, data: { type: MessageType.None } }],
    };
    const back = deserialize(serialize(msg));
    check(JSON.stringify(back) === JSON.stringify(msg), 'codec 往返一致（batch 混合载荷）');
    check(back.kind === 'batch' && back.seq === 1, '往返后 kind/seq 正确');
}

// ===== 2. 业务事件发送：sendEvent + flush → 对端收到 event 消息 =====

{
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const received: Message[] = [];
    b.onMessage((m) => received.push(m));

    a.sendEvent(MessageType.None, { type: MessageType.None });
    a.flush();
    check(received.length === 1 && received[0].kind === 'event', 'sendEvent+flush → 对端收到 event 消息');
    const ev = received[0] as { event: { type: string; id: number; data: { type: string } } };
    check(ev.event.type === 'none' && ev.event.id === 1 && ev.event.data.type === 'none', 'event 载荷正确（业务 id 自动递增）');

    a.disconnect();
    a.sendEvent(MessageType.None, { type: MessageType.None });
    a.flush();
    check(received.length === 1, '断开连接后不再送达');
}

// ===== 3. 副本隔离：修改接收端消息不影响 host 状态 =====

{
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const room = new Room('r1', { responseTime: 1000 }, a);
    const received: Message[] = [];
    b.onMessage((m) => received.push(m));

    const p = new Player('p1', room);
    room.players.set('p1', p);
    a.flush();
    p.hp = 3;
    a.flush();

    const last = received[received.length - 1] as { patches: { value: number }[] };
    last.patches[0].value = 999;
    check(p.hp === 3, '副本隔离（修改接收副本不影响 host 状态）');
}

// ===== 4. 事务批次混合载荷：patches + event → 一条 batch 消息 =====

{
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const room = new Room('r1', { responseTime: 1000 }, a);

    const p = new Player('p2', room);
    room.players.set('p2', p);
    a.flush(); // 清空 map.add（注册接收之前）

    const received: Message[] = [];
    b.onMessage((m) => received.push(m));

    a.beginBatch();
    p.hp = 2;
    a.sendEvent(MessageType.None, { type: MessageType.None });
    a.endBatch();

    check(received.length === 1, 'endBatch 产出一条消息');
    const m = received[0] as { kind: string; patches: unknown[]; events: { type: string; data: { type: string } }[] };
    check(m.kind === 'batch', '混合载荷组为 batch 消息');
    check(m.patches.length === 1 && m.events.length === 1, 'batch 同时含 patches 与 events');
    check((m.patches[0] as { path: string }).path === 'player/p2/hp', 'batch 内 patches 正确');
    check(m.events[0].type === 'none' && m.events[0].data.type === 'none', 'batch 内 events 正确');
}

// ===== 5. 反向发送 + handler 取消 =====

{
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const fromA: Message[] = [];
    const fromB: Message[] = [];
    a.onMessage((m) => fromA.push(m));
    const offB = b.onMessage((m) => fromB.push(m));

    b.sendEvent(MessageType.None, { type: MessageType.None });
    b.flush();
    check(fromA.length === 1, 'B→A 反向送达');
    check(fromB.length === 0, '发送方不收到自己消息');

    offB();
    a.sendEvent(MessageType.None, { type: MessageType.None });
    a.flush();
    check(fromB.length === 0, '取消 handler 后不再收到');
}

// ===== 6. 帧 tick 驱动 flush（异步） =====

(async () => {
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const room = new Room('r1', { responseTime: 1000 }, a);
    const received: Message[] = [];
    b.onMessage((m) => received.push(m));

    a.startTicking(5);
    room.turnCount = 7;
    await new Promise((r) => setTimeout(r, 30));
    a.stopTicking();

    check(received.some((m) => (m as { kind: string }).kind === 'patches'), '帧 tick 驱动 flush 发送 patches');
})().then(() => {
    console.log(`\n失败: ${failed}`);
});
