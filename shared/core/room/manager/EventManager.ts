import { RefreshEntry, Room } from '../Room';
import { PriorityType, TimingCallback } from '../../skill/SkillTypes';
import { Skill } from '../../skill/Skill';
import { Effect } from '../../skill/Effect';
import { TimingName } from '../../event/EventTypes';
import { EventProcess } from '../../event/EventProcess';

/**
 * 事件管理器 — refreshs 注册、时机触发调度。
 */
export class EventManager {
    constructor(readonly room: Room) {}

    // ===== refreshs 注册（SkillManager 调用） =====

    /** 注册技能/效果的 refreshs 到房间索引 */
    registerRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<any, T>> | undefined,
    ) {
        if (!refreshs) return;
        for (const r of refreshs) {
            const timing = r.trigger as TimingName;
            let entry = this.room.refreshsByTiming.get(timing);
            if (!entry) {
                entry = { before: [], after: [] };
                this.room.refreshsByTiming.set(timing, entry);
            }
            const item: RefreshEntry = {
                source,
                fn: r.fn.bind(source),
            };
            entry[r.position].push(item);
        }
    }

    /** 注销技能/效果的 refreshs */
    unregisterRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<any, T>> | undefined,
    ) {
        if (!refreshs) return;
        for (const r of refreshs) {
            const entry = this.room.refreshsByTiming.get(
                r.trigger as TimingName,
            );
            if (!entry) continue;
            entry[r.position] = entry[r.position].filter(
                (item) => item.source !== source,
            );
        }
    }

    // ===== 核心触发 =====

    /**
     * 触发一个时机。
     * @param timingName 时机名
     * @param data 事件数据（EventProcess 实例或独立 TimingData）
     * @param skipRefreshs 为 true 时跳过 refreshs（事件流程已在 triggerFunc 中注入）
     */
    async trigger(
        timingName: TimingName,
        data: EventProcess | Record<string, any>,
        skipRefreshs: boolean = false,
    ) {
        if (!skipRefreshs) {
            const entry = this.room.refreshsByTiming.get(timingName);
            if (entry) {
                for (const item of entry.before) {
                    try { await item.fn(this.room, data); } catch (e) { console.error('[refresh before]', e); }
                }
            }
        }

        const timingMap = this.room.triggerEffects.get(timingName);
        if (timingMap) {
            const players = this.room.player.sortResponse(this.room.alives);
            const times: Record<string, Record<number, number>> = {};

            for (const player of players) {
                let order = 1;
                while (order <= 6) {
                    if (order === 4 || order === 5) { order++; continue; }

                    const priority = this.orderToPriority(order);
                    const entry = timingMap.get(priority);
                    const effects = entry
                        ? [
                              ...(entry.byPlayer.get(player.playerId) ?? []),
                              ...entry.global,
                          ]
                        : [];

                    const available = effects.filter((e) => {
                        if (!e.check(data)) return false;
                        const t = times[player.playerId]?.[e.id] ?? 0;
                        const max = e._jsonData.context
                            ? ((e._jsonData.context.call(e, this.room, player, data) as any)?.maxTimes ?? 1)
                            : 1;
                        return max === -1 || t < max;
                    });

                    if (available.length > 0) {
                    }
                    order++;
                }
            }
        }

        if (!skipRefreshs) {
            const entry = this.room.refreshsByTiming.get(timingName);
            if (entry) {
                for (const item of entry.after) {
                    try { await item.fn(this.room, data); } catch (e) { console.error('[refresh after]', e); }
                }
            }
        }
    }

    private orderToPriority(order: number): PriorityType {
        switch (order) {
            case 1: return PriorityType.General;
            case 2: return PriorityType.Equip;
            case 3: return PriorityType.Card;
            case 6: return PriorityType.Rule;
            default: return PriorityType.General;
        }
    }
}
