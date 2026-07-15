/**
 * 共享工具函数。
 */

/**
 * Fisher-Yates 原地洗牌，返回原数组引用。
 */
export function shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * 从数组中随机采样 count 个不重复元素（部分 Fisher-Yates，不修改原数组）。
 * count >= arr.length 时返回全量打乱副本。
 */
export function sampleRandom<T>(arr: readonly T[], count: number): T[] {
    const n = arr.length;
    if (count <= 0) return [];
    if (count >= n) {
        const copy = [...arr];
        shuffleArray(copy);
        return copy;
    }
    // 只洗前 count 个位置即可
    const result = [...arr];
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (n - i));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, count);
}
