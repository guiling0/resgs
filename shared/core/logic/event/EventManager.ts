import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { Effect } from '../../entity/Effect';
import type { TriggerEffect } from '../../entity/TriggerEffect';
import type { Skill } from '../../entity/Skill';
import type { RichString } from '../../types/RichText';
import { PriorityType } from '../../types/SkillTypes';
import type { TimingCallback } from '../../types/SkillTypes';
import { TimingName } from '../../types/EventTypes';
import type { EventData, EventType } from '../../types/EventTypes';
import type {
    ChangeMaxHpEventData,
    ChangeStateData,
    DamageEventData,
    DeathEventData,
    DyingEventData,
    JudgeEventData,
    LoseHpEventData,
    MoveCardData,
    PindianEventData,
    RecoverHpEventData,
    ReduceHpEventData,
} from '../../types/EventTypes';
import { EventProcess } from './EventProcess';
import { UseSkillEvent } from './UseSkillEvent';
import { DamageEvent, LoseHpEvent, ReduceHpEvent } from './DamageEvent';
import { DyingEvent, DeathEvent } from './DyingEvent';
import { RecoverHpEvent, ChangeMaxHpEvent } from './HpEvent';
import { MoveCardEvent } from './MoveCardEvent';
import { JudgeEvent } from './JudgeEvent';
import { ChangeStateEvent } from './ChangeStateEvent';
import { PindianEvent } from './PindianEvent';

/** refreshs 回调条目（fn 已 bind，this 指向 source） */
export interface RefreshEntry {
    source: Skill | Effect;
    fn: (room: Room, data: unknown) => Promise<unknown>;
}

/**
 * 事件管理器——事件创建、触发调度、refreshs 注册、复活队列（logic 层，RoomHost 持有）。
 * 权威端经 room.event 访问（host 注入后可用）。
 */
export class EventManager {
    constructor(readonly room: Room) {}

    /** 当前正在执行的 Effect（UseSkillEvent 执行 cost/effect 期间设置，嵌套栈） */
    _currentEffect?: Effect;

    /** refreshs 回调索引（时机 → before/after，事件触发前注入） */
    readonly refreshsByTiming: Map<
        TimingName,
        { before: RefreshEntry[]; after: RefreshEntry[] }
    > = new Map();

    // ===== 事件创建 =====

    /**
     * 泛型事件工厂：创建事件 → 补全元数据（effect/reason 未显式传入时取当前技能上下文）→ 执行 → 返回。
     * source/effect/reason 经事件数据携带，不单独注入。
     */
    create<T extends EventProcess, D>(
        EventClass: new (room: Room, data: D) => T,
        eventData: D,
    ): Promise<T> {
        const event = new EventClass(this.room, eventData);
        const eff = event.effect ?? this._currentEffect;
        if (eff) event.effect = eff;
        if (!event.reason) event.reason = eff?.skill?.name;
        // 自由扩展字段 _data 写入事件自定义数据
        const raw = eventData as EventData<EventType> & { _data?: Record<string, unknown> };
        if (raw._data) Object.assign(event.data, raw._data);

        this.room.logger.debug(
            `event:${event.type} id=${event.id} created`,
            { roomId: this.room.roomId, event: 'create' },
        );
        return event.exec().then(() => event);
    }

    /** 创建并执行伤害事件 */
    damage(opts: DamageEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DamageEvent> {
        this.room.logger.info(
            `damage from=${opts.player?.playerId ?? 'none'} to=${opts.target?.playerId} n=${opts.number}`,
            { roomId: this.room.roomId, playerId: opts.target?.playerId, event: 'damage' },
        );
        return this.create(DamageEvent, opts);
    }

    /** 创建并执行失去体力事件 */
    loseHp(opts: LoseHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<LoseHpEvent> {
        this.room.logger.info(
            `loseHp player=${opts.player?.playerId} n=${opts.number}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'loseHp' },
        );
        return this.create(LoseHpEvent, opts);
    }

    /** 创建并执行扣减体力事件 */
    reduceHp(opts: ReduceHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ReduceHpEvent> {
        this.room.logger.info(
            `reduceHp player=${opts.player?.playerId} n=${opts.number}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'reduceHp' },
        );
        return this.create(ReduceHpEvent, opts);
    }

    /** 创建并执行濒死事件 */
    dying(opts: DyingEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DyingEvent> {
        this.room.logger.info(
            `dying player=${opts.player?.playerId}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'dying' },
        );
        return this.create(DyingEvent, opts);
    }

    /** 创建并执行死亡事件 */
    die(opts: DeathEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<DeathEvent> {
        this.room.logger.info(
            `die player=${opts.player?.playerId} killer=${opts.killer?.playerId ?? 'none'}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'die' },
        );
        return this.create(DeathEvent, opts);
    }

    /** 创建并执行回复体力事件 */
    recover(opts: RecoverHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<RecoverHpEvent> {
        this.room.logger.info(
            `recover player=${opts.player?.playerId} n=${opts.number}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'recover' },
        );
        return this.create(RecoverHpEvent, opts);
    }

    /** 创建并执行体力上限改变事件 */
    changeMaxHp(opts: ChangeMaxHpEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeMaxHpEvent> {
        this.room.logger.info(
            `changeMaxHp player=${opts.player?.playerId} n=${opts.number}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'changeMaxHp' },
        );
        return this.create(ChangeMaxHpEvent, opts);
    }

    /** 创建并执行状态改变事件（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<ChangeStateEvent> {
        this.room.logger.info(
            `changeState player=${(opts as unknown as { player?: Player }).player?.playerId ?? 'none'}`,
            { roomId: this.room.roomId, event: 'changeState' },
        );
        return this.create(ChangeStateEvent, opts);
    }

    /** 创建并执行判定事件 */
    judge(opts: JudgeEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<JudgeEvent> {
        this.room.logger.info(
            `judge player=${opts.player?.playerId}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'judge' },
        );
        return this.create(JudgeEvent, opts);
    }

    /** 创建并执行拼点事件 */
    pindian(opts: PindianEventData & { source?: EventProcess; reason?: string; effect?: Effect }): Promise<PindianEvent> {
        this.room.logger.info(
            `pindian player=${opts.player?.playerId} targets=${opts.targets?.length ?? 0}`,
            { roomId: this.room.roomId, playerId: opts.player?.playerId, event: 'pindian' },
        );
        return this.create(PindianEvent, opts);
    }

    /** 创建并执行移动卡牌事件 */
    moveCards(
        datas: MoveCardData[],
        opts: {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
            getMoveLabel?: (data: MoveCardData) => RichString;
            log?: (data: MoveCardData) => RichString;
        } = {},
    ): Promise<MoveCardEvent> {
        const { source, reason, effect, getMoveLabel, log } = opts;
        const cardsTotal = datas.reduce((s, d) => s + d.cards.length, 0);
        this.room.logger.info(
            `moveCards datas=${datas.length} cards=${cardsTotal}`,
            { roomId: this.room.roomId, event: 'moveCards' },
        );
        return this.create(MoveCardEvent, { datas, getMoveLabel, log, source, reason, effect });
    }

    // ===== 历史记录 =====

    /** 将事件记录到历史（委托 room.insertHistory → host） */
    insertHistory(event: EventProcess): void {
        this.room.insertHistory(event);
    }

    // ===== 复活队列 =====

    /** 异步处理所有待执行的复活回调 */
    async drainFuhuos(): Promise<void> {
        if (this.room.fuhuos.length === 0) return;
        this.room.logger.debug(
            `drainFuhuos count=${this.room.fuhuos.length}`,
            { roomId: this.room.roomId, event: 'drainFuhuos' },
        );
        while (this.room.fuhuos.length > 0) {
            const fn = this.room.fuhuos.shift()!;
            await fn();
        }
    }

    // ===== refreshs 注册 =====

    /** 注册技能/效果的 refreshs 到时机索引 */
    registerRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<never, T>> | undefined,
    ): void {
        if (!refreshs) return;
        for (const r of refreshs) {
            const timing = r.trigger as TimingName;
            let entry = this.refreshsByTiming.get(timing);
            if (!entry) {
                entry = { before: [], after: [] };
                this.refreshsByTiming.set(timing, entry);
            }
            entry[r.position].push({ source, fn: r.fn.bind(source) as unknown as (room: Room, data: unknown) => Promise<unknown> });
        }
    }

    /** 注销技能/效果的 refreshs */
    unregisterRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<never, T>> | undefined,
    ): void {
        if (!refreshs) return;
        for (const r of refreshs) {
            const entry = this.refreshsByTiming.get(r.trigger as TimingName);
            if (!entry) continue;
            entry[r.position] = entry[r.position].filter((item) => item.source !== source);
        }
    }

    // ===== 核心触发 =====

    /**
     * 触发一个时机——按优先级调度触发效果。
     * 顺序：当前回合角色逆时针，每名角色从武将技→装备技→卡牌技→规则技，
     * 每发动一个技能后同玩家同优先级重新扫描。
     *
     * @param skipRefreshs 事件流程中已注入 refreshs 时传 true 避免重复分发；独立调用传默认 false。
     */
    async trigger(
        timingName: TimingName,
        data: EventProcess | Record<string, unknown>,
        skipRefreshs: boolean = false,
    ): Promise<void> {
        const dataType = data instanceof EventProcess ? `${data.type}:${data.id}` : 'raw';
        this.room.logger.debug(
            `[trigger] ${timingName} data=${dataType} skipRefreshs=${skipRefreshs}`,
            { roomId: this.room.roomId, event: `trigger:${timingName}` },
        );

        // ===== 1. refreshs before（独立调用时） =====
        if (!skipRefreshs) {
            const entry = this.refreshsByTiming.get(timingName);
            if (entry && entry.before.length > 0) {
                for (const item of entry.before) {
                    await item.fn(this.room, data);
                }
            }
        }

        const players = this.room.sortResponse(this.room.alives);
        const times: Record<string, Record<number, number>> = {};

        for (const player of players) {
            for (let order = 1; order <= 6; order++) {
                // order 4 = 使用/打出牌响应（needUseCard，R2 接线），order 5 = 预留
                if (order === 5) continue;

                if (order === 4) {
                    // TODO(R2): needUseCard 响应牌询问（carduses 数据 + 选择系统就绪后接线）
                    order++;
                    continue;
                }

                const priority = this._orderToPriority(order);

                // 同玩家同优先级内循环重试（发动后重扫描）
                while (true) {
                    const available = this._getAvailable(timingName, priority, player, data, times);
                    if (available.length === 0) break;

                    // 唯一效果且可自动发动 → 直接执行
                    if (available.length === 1 && available[0].canAutoExecute()) {
                        const shouldContinue = await this._invokeSkill(available[0], player, data, timingName, times);
                        if (!shouldContinue) return; // 时机结束信号
                        continue;
                    }

                    // TODO(R2): 多个效果经选择系统询问玩家（choose 落地前暂取第一个）
                    const shouldContinue = await this._invokeSkill(available[0], player, data, timingName, times);
                    if (!shouldContinue) return;
                    continue;
                }
            }
        }

        // ===== 4. refreshs after（独立调用时） =====
        if (!skipRefreshs) {
            const entry = this.refreshsByTiming.get(timingName);
            if (entry && entry.after.length > 0) {
                for (const item of entry.after) {
                    await item.fn(this.room, data);
                }
            }
        }
    }

    /** 取某时机某优先级下玩家的可发动效果（过滤 check/canTrigger/次数限制） */
    private _getAvailable(
        timingName: TimingName,
        priority: PriorityType,
        player: Player,
        data: EventProcess | Record<string, unknown>,
        times: Record<string, Record<number, number>>,
    ): TriggerEffect[] {
        const entry = this.room.triggerEffectsByTiming.get(timingName)?.get(priority);
        if (!entry) return [];
        const effects = [...(entry.player.get(player.playerId) ?? []), ...entry.global];
        // 技能回调统一接收事件数据对象（EventProcess 取 eventData）
        const evData = data instanceof EventProcess ? (data.eventData as Record<string, unknown>) : data;
        return effects.filter((e) => {
            if (!e.check()) return false;
            if (!e.canTrigger(player, evData)) return false;
            const t = times[player.playerId]?.[e.id] ?? 0;
            const max = e.getMaxTimes(player, evData);
            return max === -1 || t < max;
        });
    }

    /** 创建 UseSkillEvent 并执行。返回 false 表示「时机结束」信号（ctx.endTiming） */
    private async _invokeSkill(
        effect: TriggerEffect,
        player: Player,
        data: EventProcess | Record<string, unknown>,
        timingName: string,
        times: Record<string, Record<number, number>>,
    ): Promise<boolean> {
        const evData = data instanceof EventProcess ? (data.eventData as Record<string, unknown>) : data;
        const ctx = effect.buildContext(player, evData);

        this.room.logger.info(
            `[trigger] ${timingName} → invoke ${effect.skill?.name}.${effect.name}`,
            { roomId: this.room.roomId, playerId: player.playerId, event: `trigger:${timingName}` },
        );

        const useSkill = new UseSkillEvent(this.room, { effect, context: ctx });
        await useSkill.exec();

        if (!times[player.playerId]) times[player.playerId] = {};
        times[player.playerId][effect.id] = (times[player.playerId][effect.id] ?? 0) + 1;

        if (useSkill.context.endTiming) return false;
        return true;
    }

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
}
