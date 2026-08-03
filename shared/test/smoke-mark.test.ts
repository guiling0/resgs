import { Room } from '../core/entity/Room';
import { LocalTransport } from '../core/transport/LocalTransport';
import { Mark, parseMarkKey } from '../core/entity/Mark';
import { applyPatches } from '../core/state/applyPatches';
import type { StatePatch } from '../core/state/StateTypes';

/** 冒烟测试：通用标记抽象类 Mark（key 编码协议 + 标记语义 + 生命周期 + 可见性） */

/** 测试实体：继承 Mark 验证标记能力（room 由实体自行持有） */
class TestEntity extends Mark {
    readonly id: string;
    readonly room: Room;

    constructor(room: Room, id: string) {
        super();
        this.room = room;
        this.id = id;
    }
}

let failed = 0;
function check(cond: boolean, msg: string): void {
    if (cond) console.log(`✓ ${msg}`);
    else {
        failed++;
        console.error(`✗ ${msg}`);
    }
}

function newRoom(): Room {
    return new Room('r1', { responseTime: 1000 }, new LocalTransport());
}

// ===== 1. key 解析协议 =====

{
    const p = parseMarkKey('sha@src:caocao@show-turn');
    check(p.originalKey === 'sha', 'originalKey 解析');
    check(p.tags.length === 2 && p.tags[0].name === 'src' && p.tags[0].data === 'caocao', '带值标签 @src:caocao 解析');
    check(p.tags[1].name === 'show', '布尔标签 @show 解析');
    check(p.life !== undefined && p.life.when === 'turn' && !p.life.before, '生命周期 -turn 解析（时机后清理）');

    const p2 = parseMarkKey('x@--round');
    check(p2.life !== undefined && p2.life.when === 'round' && p2.life.before, '生命周期 --round 解析（时机前清理）');

    const p3 = parseMarkKey('only@show');
    check(p3.originalKey === 'only' && p3.tags.length === 1 && !p3.life, '无生命周期解析');
}

// ===== 2. 基础语义：set/get/has/remove =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    ent.setMark('sha@show', 1);
    check(ent.getMark<number>('sha@show') === 1, 'setMark/getMark 基础读写');
    check(ent.hasMark('sha@show'), 'hasMark 判定（忽略标签）');
    check(ent.hasTag('sha@show', 'show'), 'hasTag 标签判定');
    ent.setMark('sha@show', 2);
    check(ent.getMark<number>('sha@show') === 2, '同原始键覆盖写');
    ent.removeMark('sha@show');
    check(!ent.hasMark('sha@show'), 'removeMark 删除');
}

// ===== 3. countMark / pushMark / unpushMark =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    ent.countMark('n', 2);
    ent.countMark('n', 3);
    check(ent.getMark<number>('n') === 5, 'countMark 数值累加');
    ent.pushMark('list', 'a');
    ent.pushMark('list', 'a');
    ent.pushMark('list', 'b');
    check(JSON.stringify(ent.getMark<string[]>('list')) === '["a","b"]', 'pushMark 数组去重');
    ent.unpushMark('list', 'a');
    check(JSON.stringify(ent.getMark<string[]>('list')) === '["b"]', 'unpushMark 数组移除');
}

// ===== 4. @card 值转换：对象转 id 存储，原对象备份 data =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    const cardObj = { id: 'card_1', name: '杀' };
    ent.setMark('cards@card', cardObj);
    check(ent.marks.get('cards@card') === 'card_1', '@card 单对象转 id 存储');
    check(ent.data['cards'] === cardObj, '原对象备份至 data');
    ent.setMark('cards@card', [{ id: 'a' }, { id: 'b' }]);
    check(JSON.stringify(ent.marks.get('cards@card')) === '["a","b"]', '@card 数组转 id 列表');
}

// ===== 5. 普通对象值（无值解析标签） =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    room.store.attach(ent, 'test/t1');
    ent.setMark('obj', { a: 1, b: '2' });
    const p = room.store.flush()[0] as { kind: string; path: string; key: string; value: unknown };
    check(p.kind === 'map.add' && p.path === 'test/t1/marks' && p.key === 'obj', '对象标记产生 map.add patch');
    check(JSON.stringify(p.value) === '{"a":1,"b":"2"}', 'map.add value 为对象快照');
}

// ===== 6. @never 豁免默认清理 =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    ent.setMark('keep@never', 1);
    ent.setMark('drop', 2);
    ent.clearMark();
    check(ent.hasMark('keep@never') && !ent.hasMark('drop'), 'clearMark() 保留 @never、清理其余');
}

// ===== 7. 生命周期清理（优先级高于 @never） =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    ent.setMark('after@-turn', 1);
    ent.setMark('before@--round', 2);
    ent.setMark('plain', 3);
    ent.setMark('both@never-turn', 4);

    ent.clearMarkByLife('turn', false);
    check(!ent.hasMark('after@-turn'), '-turn 在时机结束后清理');
    check(!ent.hasMark('both@never-turn'), '生命周期清理优先于 @never');
    check(ent.hasMark('before@--round'), '其他生命周期不受影响');

    ent.clearMarkByLife('round', true);
    check(!ent.hasMark('before@--round'), '--round 在时机开始前清理');
    check(ent.hasMark('plain'), '无生命周期标记不受清理');
}

// ===== 8. 部分可见（权威端记录） =====

{
    const room = newRoom();
    const ent = new TestEntity(room, 't1');
    ent.setMark('hand_count', 5, ['p1', 'p2']);
    check(JSON.stringify(ent.getVisible('hand_count')) === '["p1","p2"]', 'setMark 第三参设置部分可见');
    ent.setVisible('hand_count', ['p1']);
    check(JSON.stringify(ent.getVisible('hand_count')) === '["p1"]', 'setVisible 动态调整');
    ent.clearVisible('hand_count');
    check(ent.getVisible('hand_count') === undefined, 'clearVisible 清除部分可见');
}

// ===== 9. 同步链路：批次内多标记变化 =====

{
    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const room = new Room('r1', { responseTime: 1000 }, a);
    const ent = new TestEntity(room, 't1');
    room.store.attach(ent, 'test/t1');

    const patches: StatePatch[] = [];
    b.onMessage((m) => {
        if (m.kind === 'patches' || m.kind === 'batch') {
            patches.push(...(m.patches ?? []));
        }
    });

    a.beginBatch();
    ent.setMark('m1@show', 5);
    ent.setMark('m2', { a: 1 });
    a.endBatch();

    check(patches.length === 2, '批次内两个标记变化合成一条消息');
    check(
        patches.some((p) => p.kind === 'map.add' && p.path === 'test/t1/marks' && p.key === 'm1@show' && p.value === 5),
        '标记全键（含标签）同步发出',
    );
}

// ===== 10. Room 继承 Mark：marks 自动同步（path=marks + 镜像回放） =====

{
    const room = newRoom();
    room.setMark('tick', 1);
    const patches = room.store.flush();
    check(patches.length === 1, 'Room marks 变化产出 1 条 patch');
    const p0 = patches[0] as { kind: string; path: string; key: string; value: number };
    check(
        p0.kind === 'map.add' && p0.path === 'marks' && p0.key === 'tick' && p0.value === 1,
        'Room marks：map.add path=marks key=tick',
    );

    const a = new LocalTransport();
    const b = new LocalTransport();
    a.connect(b);
    const src = new Room('r1', { responseTime: 1000 }, a);
    const mirror = new Room('r1', { responseTime: 1000 }, b);
    b.onMessage((m) => {
        if (m.kind === 'patches' || m.kind === 'batch') applyPatches(mirror, m.patches ?? []);
    });
    src.setMark('tick@show', 2);
    a.flush();
    check(mirror.marks.get('tick@show') === 2, '镜像端 Room.marks 回放一致（含标签全键）');
}

console.log(`\n失败: ${failed}`);
