/**
 * 确定性伪随机数生成器（mulberry32）。
 * 相同种子产生相同序列，用于对局随机可复现。
 */
export function createRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 洗牌（改变原数组）；提供 seed 时使用确定性伪随机，否则 Math.random */
export function shuffle<T>(arr: T[], seed?: number): T[] {
    const rng = seed !== undefined ? createRandom(seed) : Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/** 生成 [min, max] 区间内的随机整数；提供 seed 时使用确定性伪随机，否则 Math.random */
export function randomInt(min: number, max: number, seed?: number): number {
    const rng = seed !== undefined ? createRandom(seed) : Math.random;
    return min + Math.floor(rng() * (max - min + 1));
}
