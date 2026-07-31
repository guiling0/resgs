import { RefreshEntry, Room } from './Room';
import { Player } from '../player/Player';
import {
    PriorityType,
    TimingCallback,
} from '../skill/SkillTypes';
import { Skill } from '../skill/Skill';
import { Effect } from '../skill/Effect';
import { TimingName, CardUseData } from '../event/EventTypes';
import { EventProcess } from '../event/EventProcess';
import { UseCardEvent } from '../event/UseCardEvent';
import { VirtualCard } from '../card/VirtualCard';
import {
    DamageEvent,
    LoseHpEvent,
    ReduceHpEvent,
} from '../event/DamageEvent';
import { DyingEvent, DeathEvent } from '../event/DyingEvent';
import { RecoverHpEvent, ChangeMaxHpEvent } from '../event/HpEvent';
import { MoveCardEvent } from '../event/MoveCardEvent';
import { JudgeEvent } from '../event/JudgeEvent';
import { ChangeStateEvent } from '../event/ChangeStateEvent';
import { UseSkillEvent } from '../event/UseSkillEvent';
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
} from '../event/EventTypes';
import { LogMeta } from '../ILogger';

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

        // 顺序：当前回合角色逆时针，每名角色从武将技→装备技→卡牌技→规则技，
        // 每发动一个技能后同玩家同优先级重新扫描（技能可能改变其他效果的条件）。
        const players = this.room.player.sortResponse(this.room.alives);

        // ===== 3. 逐玩家 → 逐优先级 → 同优先级重试 =====
        // 即使无注册技能也进入循环——玩家使用牌后可能触发后续技能
        const times: Record<string, Record<number, number>> = {};
        let totalAvailable = 0;

        this.room.logger.debug(
            `[trigger] scanning ${players.length} players`,
            this._meta(`trigger:${timingName}`),
        );

        for (const player of players) {
            for (let order = 1; order <= 6; order++) {
                // order 4 = 能使用的卡牌, order 5 = 同时使用的卡牌（M4）
                if (order === 5) continue;

                if (order === 4) {
                    const used = await this._needUseCard(timingName, data, [player]);
                    // Dying 用了牌 → 留在 order=4 继续询问（可能多人出桃）
                    if (used && timingName === TimingName.Dying) continue;
                    // 无论是否使用，进入下一 order
                    order++;
                    continue;
                }

                const priority = this._orderToPriority(order);

                // 同玩家同优先级内循环重试
                while (true) {
                    const entry = this.room.triggerEffects.get(timingName)?.get(priority);
                    const effects = entry
                        ? [
                              ...(entry.byPlayer.get(player.playerId) ?? []),
                              ...entry.global,
                          ]
                        : [];

                    const available = effects.filter((e) => {
                        if (!e.check(data)) return false;
                        const t = times[player.playerId]?.[e.id] ?? 0;
                        const max = e.getMaxTimes(this.room, player, data);
                        return max === -1 || t < max;
                    });

                    if (available.length === 0) break;

                    totalAvailable += available.length;
                    this.room.logger.debug(
                        `[trigger]   ${player.playerId}: [${available.map((e) => `${e.skill?.name}.${e._jsonData.name}(${this._priorityLabel(priority)})`).join(', ')}]`,
                        {
                            roomId: this.room.state.roomId,
                            playerId: player.playerId,
                            event: `EventManager.trigger:${timingName}`,
                        },
                    );

                    // ===== 唯一效果且可自动发动 → 直接执行 =====
                    if (
                        available.length === 1 &&
                        available[0].canAutoExecute()
                    ) {
                        await this._invokeSkill(
                            available[0],
                            player,
                            data,
                            timingName,
                            times,
                        );
                        continue; // 重扫描
                    }

                    // ===== 多个效果或需询问 → 全部发送给客户端选择 =====
                    const chosen = await this._askForSkillInvoke(
                        player,
                        available,
                        timingName,
                    );
                    if (chosen) {
                        const shouldContinue = await this._invokeSkill(
                            chosen,
                            player,
                            data,
                            timingName,
                            times,
                        );
                        if (!shouldContinue) break; // 时机结束信号
                        continue; // 重扫描
                    }

                    // 玩家取消 → 所有效果计数设为最大值（防止死循环）
                    if (!times[player.playerId]) times[player.playerId] = {};
                    for (const e of available) {
                        const max = e.getMaxTimes(this.room, player, data);
                        times[player.playerId][e.id] = max === -1 ? 999 : max;
                    }

                    break; // 无可选 → 下一个优先级
                }
            }
        }

        if (totalAvailable > 0) {
            this.room.logger.info(
                `[trigger] ${timingName} → ${totalAvailable} effect(s) available across players`,
                this._meta(`trigger:${timingName}`),
            );
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

    // ===== needUseCard：响应牌检测 =====

    /**
     * 检测当前时机可用的卡牌，询问玩家是否使用。
     * 从 room.carduses 查找匹配 timing 的卡牌 → canUseCard 过滤 → 单次多步会话。
     * @returns true 如果有牌被使用
     */
    private async _needUseCard(
        timingName: TimingName,
        data: EventProcess | Record<string, any>,
        players: Player[],
    ): Promise<boolean> {
        const candidates = this.room.cardusesByTiming.get(timingName);
        if (!candidates || candidates.length === 0) return false;

        for (const player of players) {
            // trigger need1 → 响应技询问（护驾/激将等，M4 激活）
            await this.trigger(TimingName.UseCardNeed1, data, true);

            const vc = await this._askForCardUse(player, candidates, data);
            if (!vc) continue;

            // 创建并执行 UseCardEvent
            const cardUse = this.room.carduses.get(vc.name);
            const validTargets = cardUse?.target(this.room, player, vc) ?? [];
            const responseTo =
                validTargets.length === 0 && data instanceof UseCardEvent
                    ? data.card
                    : undefined;
            const useCardEv = new UseCardEvent(this.room, {
                player,
                targets: validTargets,
                card: vc,
                responseTo,
            });
            await useCardEv.exec();
            return true;
        }
        return false;
    }

    /**
     * 单次多步会话：选牌 → 选目标 → 确定使用 / 取消不用。
     * 后续出牌阶段复用同一流程。
     */
    private async _askForCardUse(
        player: Player,
        candidates: CardUseData[],
        _data: EventProcess | Record<string, any>,
    ): Promise<VirtualCard | null> {
        // 过滤：canUseCard 通过
        const available = candidates.filter((c) =>
            this.room.canUseCard(player, c.name),
        );
        if (available.length === 0) return null;

        // 构建多步会话：Step 1 选牌 → Step 2 选目标
        const steps: any[] = [];

        // Step 1: 选牌（从手牌中选出同名实体牌组成虚拟牌）
        const handCards = player.getHandCards();
        const selectableCards = handCards.filter((c) =>
            available.some((a) => a.name === c.name),
        );
        if (selectableCards.length === 0) return null;
        steps.push({
            name: 'card',
            type: 'card' as any,
            count: 1,
            selectable: () => selectableCards.map((c) => c.id),
        });

        // Step 2: 选目标（若卡牌需要目标）
        // 在客户端选择完牌后，服务端根据 cardUse.target 确定合法目标
        // M3 阶段简化：headless 自动通过

        const session = await this.room.choose.request({
            id: `carduse_${player.playerId}_${Date.now()}`,
            player: player.playerId,
            steps,
            context: {
                player,
                room: this.room,
                cardNames: available.map((a) => a.name),
            } as any,
            canCancel: true,
            autoSelectFirst: true,
            timeout: 0.5,
        });
        if (session.cancelled || !session.results?.card?.length) return null;

        const chosenCards = this.room.card.gets(session.results.card);
        if (!chosenCards.length) return null;

        const cardName = chosenCards[0].name;
        const cardUse = this.room.carduses.get(cardName);
        if (!cardUse) return null;

        const vc = this.room.vcard.createByName(cardName, chosenCards);

        // Step 2: 选目标（M4 出牌阶段复用此流程时激活）
        // responseTo 路径 target=[]，跳过目标选择

        return vc;
    }

    // ===== 技能发动桥接 =====

    /**
     * 创建 UseSkillEvent 并执行。返回 false 表示"时机结束"信号。
     */
    private async _invokeSkill(
        effect: Effect,
        player: Player,
        data: EventProcess | Record<string, any>,
        timingName: string,
        times: Record<string, Record<number, number>>,
    ): Promise<boolean> {
        const ctx = effect.buildContext(this.room, player, data);

        const useSkill = new UseSkillEvent(this.room, {
            effect,
            context: ctx,
        });

        this.room.logger.info(
            `[trigger] ${timingName} → invoke ${effect.skill?.name}.${effect._jsonData.name}`,
            this._meta(`trigger:${timingName}`, player.playerId),
        );

        await useSkill.exec();

        // 计数
        if (!times[player.playerId]) times[player.playerId] = {};
        times[player.playerId][effect.id] =
            (times[player.playerId][effect.id] ?? 0) + 1;

        // 时机结束信号
        if (useSkill.context.endTiming) return false;
        return true;
    }

    /**
     * 询问玩家选择要发动的技能。
     * 若包含可自动发动的技能 → 客户端不能取消（canCancel=false）。
     * headless 模式通过 autoSelectFirst+短超时自动确认第一个。
     */
    private async _askForSkillInvoke(
        player: Player,
        effects: Effect[],
        timingName: string,
    ): Promise<Effect | null> {
        const hasAuto = effects.some((e) => e.canAutoExecute());

        const session = await this.room.choose.request({
            id: `skill_${player.playerId}_${timingName}_${Date.now()}`,
            player: player.playerId,
            steps: [],
            context: {
                player,
                room: this.room,
                effects: effects.map((e) => e._jsonData.name),
                hasAutoExecute: hasAuto,
            } as any,
            canCancel: !hasAuto, // 有可自动发动的技能时不能取消
            isSkillSelect: true,
            autoSelectFirst: true,
            timeout: 0.5,
        });
        if (session.cancelled) return null;
        return effects[0];
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
