import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { VirtualCard } from '../card/VirtualCard';
import { EventProcess, createTiming } from './EventProcess';
import {
    DamageEventData,
    DamageType,
    EventType,
    LoseHpEventData,
    ReduceHpEventData,
    TimingName,
} from './EventTypes';

// ===== 伤害事件 =====

/** 可以防止伤害的时机（prevent 和 transfer 仅在此时机可调用） */
const PREVENT_TIMINGS = new Set<TimingName>([
    TimingName.DamageStart,
    TimingName.DamageCause1,
    TimingName.DamageCause2,
    TimingName.DamageInflict1,
    TimingName.DamageInflict2,
    TimingName.DamageInflict3,
]);

/**
 * 伤害事件。
 *
 * 执行流程：
 *   DamageStart → DamageCause1 → DamageCause2 → DamageInflict1 → DamageInflict2
 *   → DamageInflict3 → DamageCauseAfter（扣减体力）→ DamageInflictAfter → DamageEnd
 */
export class DamageEvent extends EventProcess<EventType.Damage> {
    constructor(room: Room, data: DamageEventData) {
        super(room, EventType.Damage, data);
        data.damageType = data.damageType ?? DamageType.None;
        data.number = data.number ?? 1;
        data.isChain = data.isChain ?? false;
        this._buildTriggers();
    }

    // ===== 便捷访问器（委托到 eventData，名称与 data 属性一致）=====

    /** 伤害来源 */
    get player(): Player {
        return this.eventData.player as Player;
    }
    set player(v: Player) {
        this.eventData.player = v;
    }

    /** 受到伤害的角色 */
    get target(): Player {
        return this.eventData.target;
    }
    set target(v: Player) {
        this.eventData.target = v;
    }

    get damageType(): DamageType {
        return this.eventData.damageType;
    }
    set damageType(v: DamageType) {
        this.eventData.damageType = v;
    }

    /** 伤害值 */
    get number(): number {
        return this.eventData.number;
    }
    set number(v: number) {
        this.eventData.number = v;
    }

    /** 伤害渠道（卡牌或效果名） */
    get channel(): VirtualCard | string | undefined {
        return this.eventData.channel;
    }
    set channel(v: VirtualCard | string | undefined) {
        this.eventData.channel = v;
    }

    /** 是否为连环伤害 */
    get isChain(): boolean {
        return this.eventData.isChain ?? false;
    }
    set isChain(v: boolean) {
        this.eventData.isChain = v;
    }

    //是否触发连环伤害 默认为false
    triggerChain?: boolean = false;

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.DamageStart),
            createTiming(TimingName.DamageCause1),
            createTiming(TimingName.DamageCause2),
            createTiming(TimingName.DamageInflict1),
            createTiming(TimingName.DamageInflict2),
            createTiming(TimingName.DamageInflict3),
            createTiming(TimingName.DamageCauseAfter, [
                this.bindWithMark(this._onCauseDamaged),
            ]),
            createTiming(TimingName.DamageInflictAfter),
        ];
        this.endTriggers = [
            createTiming(TimingName.DamageEnd, undefined, [
                this.bindWithMark(this._onDamageEnd),
            ]),
        ];
    }

    // ===== 回调 =====

    /** CauseDamaged 之前：执行扣减体力 */
    private async _onCauseDamaged(
        _room: Room,
        _data: DamageEventData,
    ): Promise<void> {
        this.room.logger.debug(
            `damage: hp reduce target=${this.target.playerId} n=${this.number}`,
            {
                roomId: this.room.state.roomId,
                playerId: this.target.playerId,
                event: 'DamageEvent._onCauseDamaged',
            },
        );
        await this.room.event.reduceHp({
            player: this.target,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.event.insertHistory(this);
    }

    /** DamageEnd 之后：处理复活队列 + 连环传导 */
    private async _onDamageEnd(
        _room: Room,
        _data: DamageEventData,
    ): Promise<void> {
        await this.room.event.drainFuhuos();

        if (!this.triggerChain) return;

        this.room.logger.debug(
            `damage: triggerChain target=${this.target.playerId}`,
            {
                roomId: this.room.state.roomId,
                playerId: this.target.playerId,
                event: 'DamageEvent._onDamageEnd',
            },
        );
        // TODO Phase 5: 连环伤害传导 — 遍历 chained 玩家，逐一创建新的 DamageEvent
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.target && this.target.alive && this.number > 0;
    }

    checkEvent(): boolean {
        return this.number > 0;
    }

    // ===== 操作方法 =====

    /**
     * 防止伤害。
     * 仅在 DamageStart / Cause1-2 / Inflict1-3 期间可调用。
     */
    async prevent(): Promise<this> {
        if (this.trigger && PREVENT_TIMINGS.has(this.trigger)) {
            this.room.logger.info(
                `damage: prevented target=${this.target.playerId}`,
                {
                    roomId: this.room.state.roomId,
                    playerId: this.target.playerId,
                    event: 'DamageEvent.prevent',
                },
            );
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    /**
     * 转移伤害。
     * 仅在防止伤害时机内可调用，且目标不能是自身。
     */
    async transfer(to: Player): Promise<this> {
        if (!this.trigger || !PREVENT_TIMINGS.has(this.trigger)) return this;
        if (to === this.target) return this;
        this.room.logger.info(
            `damage: transfer from=${this.target.playerId} to=${to.playerId}`,
            {
                roomId: this.room.state.roomId,
                playerId: this.target.playerId,
                event: 'DamageEvent.transfer',
            },
        );
        await this.prevent();
        await this.room.event.damage({
            player: this.player,
            target: to,
            damageType: this.damageType,
            channel: this.channel,
            number: this.number,
            isChain: this.isChain,
            source: this.source,
            reason: this.data.reason,
            effect: this.data.effect,
        });
        return this;
    }
}

// ===== 失去体力事件 =====

/**
 * 失去体力事件。
 *
 * 执行流程：
 *   LoseHpStart → LoseHp → LoseHpEnd
 */
export class LoseHpEvent extends EventProcess<EventType.LoseHp> {
    constructor(room: Room, data: LoseHpEventData) {
        super(room, EventType.LoseHp, data);
        data.number = data.number ?? 1;
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    /** 失去体力的角色 */
    get player(): Player {
        return this.eventData.player;
    }
    set player(v: Player) {
        this.eventData.player = v;
    }

    /** 失去体力的数值 */
    get number(): number {
        return this.eventData.number;
    }
    set number(v: number) {
        this.eventData.number = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.LoseHpStart),
            createTiming(TimingName.LoseHp, [
                this.bindWithMark(this._onLoseHp),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.LoseHpEnd, undefined, [
                this.bindWithMark(this._onLoseHpEnd),
            ]),
        ];
    }

    // ===== 回调 =====

    /** LoseHp 之前：执行扣减体力 */
    private async _onLoseHp(
        _room: Room,
        _data: LoseHpEventData,
    ): Promise<void> {
        await this.room.event.reduceHp({
            player: this.player,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.event.insertHistory(this);
    }

    /** LoseHpEnd 之后：处理复活队列 */
    private async _onLoseHpEnd(
        _room: Room,
        _data: LoseHpEventData,
    ): Promise<void> {
        await this.room.event.drainFuhuos();
    }

    // ===== 生命周期 =====

    check(): boolean {
        return this.player && this.player.inthp >= this.number;
    }

    checkEvent(): boolean {
        return this.player.alive;
    }

    /**
     * 防止失去体力。
     * 仅在 LoseHpStart 期间可调用。
     */
    async prevent(): Promise<this> {
        if (this.trigger === TimingName.LoseHpStart) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}

// ===== 扣减体力事件 =====

/**
 * 扣减体力事件。
 *
 * 执行流程：
 *   ReduceHpStart → ReduceHp → ReduceHpAfter → ReduceHpEnd
 *
 * 在 ReduceHpStart 阶段处理连环状态的解除与传导标记。
 * ReduceHpAfter 中实际修改 HP、护盾，并向客户端广播动画。
 * 扣减后若 inthp ≤ 0，触发濒死事件。
 */
export class ReduceHpEvent extends EventProcess<EventType.ReduceHp> {
    constructor(room: Room, data: ReduceHpEventData) {
        super(room, EventType.ReduceHp, data);
        data.number = data.number ?? 1;
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    /** 扣减体力的角色 */
    get player(): Player {
        return this.eventData.player;
    }
    set player(v: Player) {
        this.eventData.player = v;
    }

    /** 扣减数值 */
    get number(): number {
        return this.eventData.number;
    }
    set number(v: number) {
        this.eventData.number = v;
    }

    // ===== 连环处理（游戏规则：必须在事件最初执行，早于所有时机）=====

    /**
     * 覆写 init() 以确保连环处理在 source 赋值之后、所有 timing 之前执行。
     */
    protected async init(): Promise<void> {
        await super.init();
        this._handleChain();
    }

    /** 处理连环状态的解除与传导标记。必须在 init() 中调用，早于所有时机。 */
    private _handleChain(): void {
        const damage = this._getDamage();
        if (!damage) return;
        if (!this.player.chained) return;
        if (damage.damageType === DamageType.None) return;

        // 解除自身连环状态
        // TODO Phase 5: 调用 ChainEvent 解除连环（待移植）
        // this.player.chained = false;

        // 若还有其它连环角色，标记触发传导
        if (!damage.isChain) {
            const hasChained = this.room.players.some(
                (p) => p.alive && p.chained,
            );
            if (hasChained) {
                damage.triggerChain = true;
            }
        }
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.ReduceHpStart),
            createTiming(TimingName.ReduceHp),
            createTiming(TimingName.ReduceHpAfter, undefined, [
                this.bindWithMark(this._onReduceHpAfter),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.ReduceHpEnd, undefined, [
                this.bindWithMark(this._onReduceHpEnd),
            ]),
        ];
    }

    // ===== 回调 =====

    /**
     * ReduceHpAfter 之后：实际修改 HP、护盾，广播动画，记录历史。
     */
    private async _onReduceHpAfter(
        _room: Room,
        _data: ReduceHpEventData,
    ): Promise<void> {
        const damage = this._getDamage();
        const losehp = this._getLoseHp();

        if (damage) {
            // 护盾吸收
            if (this.player.shield > 0) {
                const remaining = this.player.shield - this.number;
                this.player.shield = Math.max(0, remaining);
                if (remaining < 0) {
                    this.player.hp = this.player.hp + remaining; // remaining 为负，即扣减
                }
            } else {
                this.player.hp = this.player.hp - this.number;
            }

            // TODO Phase 9: 通过 BroadcastManager 播放伤害动画 + 战报
        } else if (losehp) {
            this.player.hp = this.player.hp - this.number;

            // TODO Phase 9: 通过 BroadcastManager 播放失去体力动画 + 战报
        }

        this.room.event.insertHistory(this);
    }

    /**
     * ReduceHpEnd 之后：检查是否需要进入濒死。
     */
    private async _onReduceHpEnd(
        _room: Room,
        _data: ReduceHpEventData,
    ): Promise<void> {
        // 不屈标记跳过濒死
        if (this.data.buqu) return;

        if (this.player.inthp <= 0) {
            await this.room.event.dying({
                player: this.player,
                source: this,
                reason: 'dying_reducehp',
            });
        }
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    checkEvent(): boolean {
        return this.player.alive;
    }

    // ===== 辅助方法 =====

    /** 获取关联的伤害事件 */
    private _getDamage(): DamageEvent | undefined {
        if (
            this.source instanceof DamageEvent &&
            this.data.reason === 'reducehp'
        ) {
            return this.source;
        }
        return undefined;
    }

    /** 获取关联的失去体力事件 */
    private _getLoseHp(): LoseHpEvent | undefined {
        if (
            this.source instanceof LoseHpEvent &&
            this.data.reason === 'reducehp'
        ) {
            return this.source;
        }
        return undefined;
    }
}
