import { RefreshEntry, Room } from '../Room';
import { PriorityType, TimingCallback } from '../../skill/SkillTypes';
import { Skill } from '../../skill/Skill';
import { Effect } from '../../skill/Effect';
import { TimingName } from '../../event/EventTypes';
import { EventProcess } from '../../event/EventProcess';
import {
    DamageEvent,
    LoseHpEvent,
    ReduceHpEvent,
} from '../../event/DamageEvent';
import { DyingEvent, DeathEvent } from '../../event/DyingEvent';
import { RecoverHpEvent, ChangeMaxHpEvent } from '../../event/HpEvent';
import { MoveCardEvent } from '../../event/MoveCardEvent';
import { JudgeEvent } from '../../event/JudgeEvent';
import { ChangeStateEvent } from '../../event/ChangeStateEvent';
import type {
    ChangeMaxHpEventData,
    ChangeStateData,
    DamageEventData,
    DeathEventData,
    DyingEventData,
    JudgeEventData,
    LoseHpEventData,
    MoveCardData,
    RecoverHpEventData,
    ReduceHpEventData,
} from '../../event/EventTypes';
import { LogMeta } from '../../ILogger';

/**
 * 事件管理器 — 事件创建、触发调度、历史记录、复活队列。
 */
export class EventManager {
    constructor(readonly room: Room) {}

    // ===== 技能上下文 =====

    /** 当前正在执行的 Effect（UseSkillEvent 执行 cost/effect 期间设置） */
    _currentEffect?: Effect;

    // ===== Logger 辅助 =====

    private _meta(event: string, playerId?: string): LogMeta {
        return { roomId: this.room.state.roomId, playerId, event };
    }

    // ===== 事件创建 =====

    /**
     * 泛型事件工厂：创建事件 → 注入元数据 → 执行 → 返回。
     * 若存在 _currentEffect 且未显式传入 reason/effect，则自动填充。
     */
    create<T extends EventProcess>(
        EventClass: new (room: Room, data: any) => T,
        eventData: Record<string, any>,
        opts: {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        } = {},
    ): Promise<T> {
        const event = new EventClass(this.room, eventData);
        if (opts.source) event.source = opts.source;

        // 自动赋值：当前技能上下文中未显式传入时，使用 _currentEffect
        const eff = opts.effect ?? this._currentEffect;
        if (eff) event.data.effect = eff;
        event.data.reason =
            opts.reason ?? eff?.skill?.name ?? event.data.reason;

        this.room.logger.debug(
            `event:${event.type} id=${event.id} created`,
            this._meta('create', (eventData as any).player?.playerId),
        );

        const execPromise = event.exec().then(() => {
            this.room.logger.debug(
                `event:${event.type} id=${event.id} completed`,
                this._meta('create', (eventData as any).player?.playerId),
            );
            return event;
        });
        return execPromise;
    }

    /** 创建并执行伤害事件。 */
    async damage(
        opts: DamageEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DamageEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `damage from=${data.player?.playerId} to=${data.target?.playerId} n=${data.number} type=${data.damageType}`,
            this._meta('damage', data.target?.playerId),
        );
        return this.create(DamageEvent, data, { source, reason, effect });
    }

    /** 创建并执行失去体力事件。 */
    async loseHp(
        opts: LoseHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<LoseHpEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `loseHp player=${data.player?.playerId} n=${data.number}`,
            this._meta('loseHp', data.player?.playerId),
        );
        return this.create(LoseHpEvent, data, { source, reason, effect });
    }

    /** 创建并执行扣减体力事件。 */
    async reduceHp(
        opts: ReduceHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ReduceHpEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `reduceHp player=${data.player?.playerId} n=${data.number}`,
            this._meta('reduceHp', data.player?.playerId),
        );
        return this.create(ReduceHpEvent, data, { source, reason, effect });
    }

    /** 创建并执行濒死事件。 */
    async dying(
        opts: DyingEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DyingEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `dying player=${data.player?.playerId}`,
            this._meta('dying', data.player?.playerId),
        );
        return this.create(DyingEvent, data, { source, reason, effect });
    }

    /** 创建并执行死亡事件。killer 由 DyingEvent 传入，未传时 DeathEvent 自行追溯。 */
    async die(
        opts: DeathEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DeathEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `die player=${data.player?.playerId} killer=${data.killer?.playerId ?? 'none'}`,
            this._meta('die', data.player?.playerId),
        );
        return this.create(DeathEvent, data, { source, reason, effect });
    }

    /** 创建并执行回复体力事件。 */
    async recover(
        opts: RecoverHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<RecoverHpEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `recover player=${data.player?.playerId} n=${data.number}`,
            this._meta('recover', data.player?.playerId),
        );
        return this.create(RecoverHpEvent, data, { source, reason, effect });
    }

    /** 创建并执行体力上限改变事件。 */
    async changeMaxHp(
        opts: ChangeMaxHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ChangeMaxHpEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `changeMaxHp player=${data.player?.playerId} n=${data.number}`,
            this._meta('changeMaxHp', data.player?.playerId),
        );
        return this.create(ChangeMaxHpEvent, data, { source, reason, effect });
    }

    /** 创建并执行状态改变事件。自动检测子类型。 */
    async changeState(
        opts: ChangeStateData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ChangeStateEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `changeState player=${(data as any).player?.playerId}`,
            this._meta('changeState', (data as any).player?.playerId),
        );
        return this.create(ChangeStateEvent as any, data, {
            source,
            reason,
            effect,
        }) as any;
    }

    /** 创建并执行判定事件。 */
    async judge(
        opts: JudgeEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<JudgeEvent> {
        const { source, reason, effect, ...data } = opts;
        this.room.logger.info(
            `judge player=${data.player?.playerId}`,
            this._meta('judge', data.player?.playerId),
        );
        return this.create(JudgeEvent, data, { source, reason, effect });
    }

    /** 创建并执行移动卡牌事件。 */
    async moveCards(
        datas: MoveCardData[],
        opts: {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
            getMoveLabel?: (data: MoveCardData) => any;
            log?: (data: MoveCardData) => any;
        } = {},
    ): Promise<MoveCardEvent> {
        const { source, reason, effect, getMoveLabel, log } = opts;
        const cardsTotal = datas.reduce((s, d) => s + d.cards.length, 0);
        this.room.logger.info(
            `moveCards datas=${datas.length} cards=${cardsTotal}`,
            this._meta('moveCards'),
        );
        return this.create(
            MoveCardEvent,
            { datas, getMoveLabel, log },
            { source, reason, effect },
        );
    }

    // ===== 历史记录 =====

    /** 将事件记录到历史日志（委托到 Room）。 */
    insertHistory(event: EventProcess): void {
        this.room.insertHistory(event);
    }

    // ===== 复活队列 =====

    /**
     * 异步处理所有待执行的复活回调。
     * 由事件回调内部调用（DamageEnd / LoseHpEnd），确保复活在后续流程前完成。
     */
    async drainFuhuos(): Promise<void> {
        if (this.room.fuhuos.length === 0) return;
        this.room.logger.debug(
            `drainFuhuos count=${this.room.fuhuos.length}`,
            this._meta('drainFuhuos'),
        );
        while (this.room.fuhuos.length > 0) {
            const fn = this.room.fuhuos.shift()!;
            await fn();
        }
    }

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
     * 触发一个时机 — 按优先级调度触发效果。
     *
     * @param skipRefreshs 事件流程中已通过 injectRefreshs 注入到 Timing 中，
     *   触发时传 true 避免重复分发。独立调用（如 processCompleted）传默认值 false。
     */
    async trigger(
        timingName: TimingName,
        data: EventProcess | Record<string, any>,
        skipRefreshs: boolean = false,
    ) {
        const dataType =
            data instanceof EventProcess ? `${data.type}:${data.id}` : 'raw';
        this.room.logger.debug(
            `[trigger] ${timingName} data=${dataType} skipRefreshs=${skipRefreshs}`,
            this._meta(`trigger:${timingName}`),
        );

        // ===== 1. 执行 refreshs before（独立调用时）=====
        if (!skipRefreshs) {
            const entry = this.room.refreshsByTiming.get(timingName);
            if (entry && entry.before.length > 0) {
                this.room.logger.debug(
                    `[trigger] refreshs/before x${entry.before.length}`,
                    this._meta(`trigger:${timingName}`),
                );
                for (const item of entry.before) {
                    try {
                        await item.fn(this.room, data);
                    } catch (e) {
                        console.error('[refresh before]', e);
                    }
                }
            }
        }

        // ===== 2. 检查是否有注册的触发效果 =====
        const timingMap = this.room.triggerEffects.get(timingName);
        if (!timingMap) {
            this.room.logger.debug(
                `[trigger] no registered effects`,
                this._meta(`trigger:${timingName}`),
            );
            if (!skipRefreshs) {
                const entry = this.room.refreshsByTiming.get(timingName);
                if (entry && entry.after.length > 0) {
                    for (const item of entry.after) {
                        try {
                            await item.fn(this.room, data);
                        } catch (e) {
                            console.error('[refresh after]', e);
                        }
                    }
                }
            }
            return;
        }

        // ===== 3. 遍历玩家，按优先级检查可用效果 =====
        const players = this.room.player.sortResponse(this.room.alives);
        const times: Record<string, Record<number, number>> = {};
        let totalAvailable = 0;

        this.room.logger.debug(
            `[trigger] scanning ${players.length} players`,
            this._meta(`trigger:${timingName}`),
        );

        for (const player of players) {
            const playerAvailable: string[] = [];

            for (let order = 1; order <= 6; order++) {
                if (order === 4 || order === 5) continue;

                const priority = this._orderToPriority(order);
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
                    const raw = e._jsonData.times;
                    const max =
                        raw == null ? 1
                        : typeof raw === 'function' ? (raw.call(e, this.room, player, data) ?? 1)
                        : raw;
                    return max === -1 || t < max;
                });

                if (available.length > 0) {
                    totalAvailable += available.length;
                    playerAvailable.push(
                        ...available.map(
                            (e) =>
                                `${e.skill?.name}.${e._jsonData.name}(${this._priorityLabel(priority)})`,
                        ),
                    );
                }
            }

            if (playerAvailable.length > 0) {
                this.room.logger.debug(
                    `[trigger]   ${player.playerId}: [${playerAvailable.join(', ')}]`,
                    {
                        roomId: this.room.state.roomId,
                        playerId: player.playerId,
                        event: `EventManager.trigger:${timingName}`,
                    },
                );
            }
        }

        if (totalAvailable > 0) {
            this.room.logger.info(
                `[trigger] ${timingName} → ${totalAvailable} effect(s) available across players`,
                this._meta(`trigger:${timingName}`),
            );
            // TODO Phase 7: askForSkillInvoke → create UseSkillEvent → exec
        } else {
            this.room.logger.debug(
                `[trigger] ${timingName} → no available effects`,
                this._meta(`trigger:${timingName}`),
            );
        }

        // ===== 4. 执行 refreshs after（独立调用时）=====
        if (!skipRefreshs) {
            const entry = this.room.refreshsByTiming.get(timingName);
            if (entry && entry.after.length > 0) {
                for (const item of entry.after) {
                    try {
                        await item.fn(this.room, data);
                    } catch (e) {
                        console.error('[refresh after]', e);
                    }
                }
            }
        }
    }

    // ===== 内部辅助 =====

    private _orderToPriority(order: number): PriorityType {
        switch (order) {
            case 1:
                return PriorityType.General;
            case 2:
                return PriorityType.Equip;
            case 3:
                return PriorityType.Card;
            case 6:
                return PriorityType.Rule;
            default:
                return PriorityType.General;
        }
    }

    private _priorityLabel(p: PriorityType): string {
        switch (p) {
            case PriorityType.General:
                return 'General';
            case PriorityType.Equip:
                return 'Equip';
            case PriorityType.Card:
                return 'Card';
            case PriorityType.Rule:
                return 'Rule';
            default:
                return '?';
        }
    }
}
