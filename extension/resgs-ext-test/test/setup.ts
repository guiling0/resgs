/**
 * 扩展测试工具——完全不依赖 core 引擎，纯 mock。
 * 类型由 types/global.d.ts 提供，无需 import。
 * 未实现的方法通过 Proxy 兜底——调用不存在的属性/方法不抛错。
 */

// ===== 通用 mock——未定义属性 → async no-op =====

function mock<T>(obj: T): T {
    return new Proxy(obj as any, {
        get(target, prop) {
            if (prop in target) return (target as any)[prop];
            if (prop === 'then') return undefined; // 防止被当成 Promise

            // 返回可链式调用的 async no-op
            const noop = (async () => {}) as any;
            return new Proxy(noop, {
                get(_, p) {
                    if (p === 'then' || p === 'catch') return undefined;
                    return mock(noop);
                },
            });
        },
    }) as T;
}

// ===== Mock Room =====

export function createRoom(opts: { roomId?: string } = {}) {
    const id = opts.roomId ?? 'test-room';
    return mock({
        id,
        cards: new Map<string, any>(),
        players: new Map<string, any>(),
        generals: new Map<string, any>(),
        turn: 0,
        round: 0,
    });
}

// ===== Mock Player =====

export function createPlayer(
    room: ReturnType<typeof createRoom>,
    playerId: string,
    state: {
        hp?: number; maxhp?: number; seat?: number;
        username?: string; handCards?: any[]; equipCards?: any[];
    } = {},
) {
    const p = mock({
        id: playerId,
        playerId,
        name: state.username ?? playerId,
        hp: state.hp ?? 3,
        maxhp: state.maxhp ?? 3,
        shield: 0,
        seat: state.seat ?? 1,
        alive: true,
        handCards: state.handCards ?? [],
        equipCards: state.equipCards ?? [],
        room,

        drawCards: async (n: number) => { p.handCards.push(...Array(n).fill({})); },
        loseHp: async (n: number) => { p.hp = Math.max(0, p.hp - n); },
        recoverHp: async (n: number) => { p.hp = Math.min(p.maxhp, p.hp + n); },
        isAlive: () => p.alive,
        getCardCount: (area: string) => area === 'h' ? p.handCards.length : 0,
        getCards: (area: string) => (area === 'h' ? [...p.handCards] : []),
    });

    room.players.set(playerId, p);
    return p;
}

// ===== 断言 =====

export function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`  ❌ FAIL: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  ✅ PASS: ${message}`);
}

// ===== 测试分组 =====

export function describe(name: string): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${name}`);
    console.log(`${'═'.repeat(60)}`);
}

export function summary(): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  完成`);
    console.log(`${'═'.repeat(60)}\n`);
}
