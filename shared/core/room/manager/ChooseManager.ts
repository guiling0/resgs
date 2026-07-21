import type { Room } from '../Room';
import type { SelectSession, SelectResult, SelectorConfig } from '../../select/SelectTypes';

/** 等待中的选择项 */
interface PendingChoice {
    session: SelectSession;
    resolve: (result: SelectResult) => void;
    timer?: ReturnType<typeof setTimeout>;
}

/**
 * 选择管理器 — 玩家交互选择的运行时。
 *
 * 管理选择会话的完整生命周期：发起 → 等待 → 响应/超时/取消。
 * 同一玩家同一时间只能有一个进行中的选择，新请求会自动取消旧会话。
 */
export class ChooseManager {
    constructor(readonly room: Room) {}

    /** sessionId → 等待中的选择 */
    private _pending = new Map<string, PendingChoice>();
    /** playerId → sessionId（同一玩家同时只有一个会话） */
    private _byPlayer = new Map<string, string>();

    // ===== 核心方法 =====

    /**
     * 发起选择请求，返回 Promise 在玩家响应/超时/取消时 resolve。
     * 同一玩家已有进行中会话时自动取消旧会话。
     *
     * @param session 选择会话配置（timeout 单位为秒）
     */
    async request(session: SelectSession): Promise<SelectResult> {
        const playerId = session.player;

        // 同一玩家新请求 → 取消旧会话
        const oldId = this._byPlayer.get(playerId);
        if (oldId) this.cancel(oldId);

        this._byPlayer.set(playerId, session.id);

        // 超时：秒 → 毫秒，默认值链：session.timeout → room.options.responseTime → 15
        const timeoutSec = session.timeout
            ?? this.room.options.responseTime
            ?? 15;
        const timeoutMs = timeoutSec * 1000;

        const promise = new Promise<SelectResult>((resolve) => {
            const pending: PendingChoice = { session, resolve };

            pending.timer = setTimeout(() => {
                this._handleTimeout(session.id);
            }, timeoutMs);

            this._pending.set(session.id, pending);
        });

        try {
            await this.room.input.requestChoice(playerId, session);
        } catch {
            this.cancel(session.id);
        }

        return promise;
    }

    /**
     * 多段选择：依次发送多个会话，共享总超时。
     * 任一会话取消则终止后续所有会话。
     * 后续会话可通过 ctx.results 访问已完成会话的所有选择结果。
     *
     * @param playerId 目标玩家 ID
     * @param sessions 选择会话列表（每个 timeout 单位为秒）
     * @param totalTimeoutSec 总超时（秒），默认取自 room.options.responseTime ?? 15
     * @returns 按顺序排列的选择结果数组
     */
    async multiStep(
        playerId: string,
        sessions: SelectSession[],
        totalTimeoutSec?: number,
    ): Promise<SelectResult[]> {
        const totalSec = totalTimeoutSec
            ?? this.room.options.responseTime
            ?? 15;
        const totalMs = totalSec * 1000;
        const startedAt = Date.now();
        const results: SelectResult[] = [];

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            const elapsedMs = Date.now() - startedAt;
            const remainingMs = Math.max(0, totalMs - elapsedMs);

            // 总时间已耗尽
            if (remainingMs <= 0) {
                results.push({
                    id: session.id,
                    cancelled: true,
                    timeout: true,
                    results: {},
                });
                break;
            }

            // 设置当前会话的剩余时间（秒，供客户端显示倒计时）
            session.remaining = Math.ceil(remainingMs / 1000);

            // 将已完成的结果合并注入 ctx（数组级联，不覆盖同名 key）
            const ctx = session.context;
            if (!ctx.results) ctx.results = {};
            if (!ctx.windowResults) ctx.windowResults = {};
            for (const r of results) {
                for (const [key, values] of Object.entries(r.results)) {
                    if (!ctx.results[key]) ctx.results[key] = [];
                    ctx.results[key].push(...values);
                }
                if (r.windowResult) {
                    for (const [key, values] of Object.entries(r.windowResult)) {
                        if (!ctx.windowResults[key]) ctx.windowResults[key] = [];
                        ctx.windowResults[key].push(...values);
                    }
                }
            }

            const result = await this.request(session);
            results.push(result);

            if (result.cancelled) break;
        }

        return results;
    }

    /**
     * 玩家响应选择结果。
     * 将结果写入 ctx.results / ctx.windowResults，通常在网络层收到客户端消息时调用。
     */
    respond(sessionId: string, result: SelectResult): void {
        const pending = this._pending.get(sessionId);
        if (!pending) return;

        // 将响应结果合并写入 ctx（数组合并，不覆盖同名 key）
        const ctx = pending.session.context;
        if (ctx) {
            if (!ctx.results) ctx.results = {};
            for (const [key, values] of Object.entries(result.results)) {
                if (!ctx.results[key]) ctx.results[key] = [];
                ctx.results[key].push(...values);
            }
            if (result.windowResult) {
                if (!ctx.windowResults) ctx.windowResults = {};
                for (const [key, values] of Object.entries(result.windowResult)) {
                    if (!ctx.windowResults[key]) ctx.windowResults[key] = [];
                    ctx.windowResults[key].push(...values);
                }
            }
        }

        this._cleanup(sessionId, pending);
        result.id = sessionId;
        pending.resolve(result);
    }

    /**
     * 取消指定会话。
     */
    cancel(sessionId: string): void {
        const pending = this._pending.get(sessionId);
        if (!pending) return;

        this._cleanup(sessionId, pending);
        pending.resolve({
            id: sessionId,
            cancelled: true,
            results: {},
        });
    }

    /**
     * 取消某玩家当前等待中的选择。
     */
    cancelAll(playerId: string): void {
        const sid = this._byPlayer.get(playerId);
        if (sid) this.cancel(sid);
    }

    /**
     * 玩家是否有等待中的选择。
     */
    isPending(playerId: string): boolean {
        return this._byPlayer.has(playerId);
    }

    /**
     * 获取玩家当前等待中的会话 ID。
     */
    getPendingSessionIds(playerId: string): string[] {
        const sid = this._byPlayer.get(playerId);
        return sid ? [sid] : [];
    }

    // ===== 内部方法 =====

    /** 超时处理：自动选择或标记取消 */
    private _handleTimeout(sessionId: string): void {
        const pending = this._pending.get(sessionId);
        if (!pending) return;

        const session = pending.session;

        if (session.autoSelectFirst) {
            const result = this._autoSelect(session);
            result.id = sessionId;
            this._cleanup(sessionId, pending);
            pending.resolve(result);
        } else {
            this._cleanup(sessionId, pending);
            pending.resolve({
                id: sessionId,
                cancelled: true,
                timeout: true,
                results: {},
            });
        }
    }

    /**
     * 自动选择每个步骤的第一个可选项。
     * 通过 step.name 查询 sgs.selectors 预设，step 中 name 以外的字段覆盖预设。
     */
    private _autoSelect(session: SelectSession): SelectResult {
        const result: SelectResult = {
            id: session.id,
            cancelled: false,
            results: {},
        };
        const ctx = session.context;

        for (const step of session.steps) {
            const preset = sgs.selectors.get(step.name);
            const config: SelectorConfig = preset
                ? { ...preset, ...step, name: step.name }
                : step;

            if (typeof config.selectable !== 'function') continue;

            const candidates: any[] = config.selectable(ctx);
            const selected: any[] = [];
            const count = config.count ?? 1;

            for (const item of candidates) {
                if (config.filter && !config.filter(item, selected, ctx)) continue;
                selected.push(item);
                if (!this._canSelectMore(count, selected)) break;
            }

            result.results[step.name] = selected;
        }
        return result;
    }

    /** 判断是否还能继续选择更多项 */
    private _canSelectMore(
        count: number | [number, number],
        selected: any[],
    ): boolean {
        if (typeof count === 'number') return selected.length < count;
        // 负数 max 表示无上限
        return count[1] < 0 || selected.length < count[1];
    }

    /** 清理等待队列和定时器 */
    private _cleanup(sessionId: string, pending: PendingChoice): void {
        if (pending.timer) clearTimeout(pending.timer);
        this._pending.delete(sessionId);
        this._byPlayer.delete(pending.session.player);
    }
}
