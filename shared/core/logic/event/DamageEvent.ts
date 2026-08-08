import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { VirtualCard } from '../../entity/VirtualCard';
import type { Effect } from '../../entity/Effect';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type { DamageEventData, LoseHpEventData, ReduceHpEventData } from '../../types/EventTypes';
import { DamageType } from '../../types/EventTypes';

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
 * 伤害事件
 * @rules events/damage
 * @description 执行流程：DamageStart → Cause1 → Cause2 → Inflict1 → Inflict2 → Inflict3 → CauseAfter（扣减体力）→ InflictAfter → DamageEnd（复活队列 + 连环传导）
 */
export class DamageEvent extends EventProcess<EventType.Damage> {
    /** 是否触发连环伤害（默认 false；ReduceHpEvent 连环处理时标记） */
    triggerChain: boolean = false;

    constructor(room: Room, data: DamageEventData) {
        super(room, EventType.Damage, data);
        data.damageType = data.damageType ?? DamageType.None;
        data.number = data.number ?? 1;
        data.isChain = data.isChain ?? false;
        this._buildTriggers();
    }

    // ===== 便捷访问器（委托到 eventData） =====

    /**
     * 来源（造成伤害的角色）
     * @rules terms/description-terms/source
     * @description 来源是造成伤害的角色；伤害结算中若来源已死亡则视为此伤害没有来源
     */
    get player(): Player | undefined {
        return this.eventData.player;
    }
    set player(v: Player | undefined) {
        this.eventData.player = v;
    }

    /** 受到伤害的角色 */
    get target(): Player {
        return this.eventData.target;
    }
    set target(v: Player) {
        this.eventData.target = v;
    }

    /**
     * 伤害类型（普通/属性伤害）
     * @rules terms/description-terms/shuxingshanghai
     * @description 属性伤害分为具有火焰属性的火焰伤害和具有雷电属性的雷电伤害；普通伤害不具有属性
     */
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

    /**
     * 渠道（造成伤害的牌/技能）
     * @rules terms/description-terms/channel
     * @description 因执行技能/牌的效果而造成伤害，此牌/技能可称为造成此伤害的渠道
     */
    get channel(): VirtualCard | string | undefined {
        return this.eventData.channel;
    }
    set channel(v: VirtualCard | string | undefined) {
        this.eventData.channel = v;
    }

    /**
     * 是否为连环伤害
     * @rules terms/description-terms/lianhuanshanghai
     * @description 连环伤害是不会触发连环传导的属性伤害；因连环传导或转移连环伤害而造成的伤害是连环伤害
     */
    get isChain(): boolean {
        return this.eventData.isChain ?? false;
    }
    set isChain(v: boolean) {
        this.eventData.isChain = v;
    }

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

    /** DamageCauseAfter 之前：执行扣减体力 */
    private async _onCauseDamaged(_room: Room, _data: DamageEventData): Promise<void> {
        this.room.logger.debug(
            `damage: hp reduce target=${this.target.playerId} n=${this.number}`,
            { roomId: this.room.roomId, playerId: this.target.playerId, event: 'DamageEvent._onCauseDamaged' },
        );
        await this.room.event.reduceHp({
            player: this.target,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.event.insertHistory(this);
    }

    /**
     * DamageEnd 之后：处理复活队列 + 连环伤害传导
     * @rules terms/resolution-terms/origin
     * @description 起点是「受到不为连环伤害的属性伤害的处于连环状态的角色即此伤害的起点」；本事件作为起点，伤害结算结束后从当前回合角色开始按逆时针方向向其余处于连环状态的角色传导
     */
    private async _onDamageEnd(_room: Room, _data: DamageEventData): Promise<void> {
        await this.room.event.drainFuhuos();
        if (!this.triggerChain) return;
        // 从当前回合角色开始按逆时针方向，处于连环状态的存活角色依次受到同来源、同渠道、同属性、同伤害值的连环伤害
        for (const p of this.room.sortResponse([...this.room.players.values()])) {
            if (!p.alive || !p.chained) continue;
            await this.room.event.damage({
                player: this.player,
                target: p,
                damageType: this.damageType,
                channel: this.channel,
                number: this.number,
                isChain: true,
                source: this.source,
                reason: this.reason,
                effect: this.effect,
            });
        }
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
     * 防止伤害（仅在防止时机内可调用）
     * @rules terms/resolution-terms/prevent
     * @description 防止是「终止此伤害流程」的操作，防止后来源未造成过此伤害、目标也未受到过此伤害
     */
    async prevent(): Promise<this> {
        if (this.trigger && PREVENT_TIMINGS.has(this.trigger)) {
            this.room.logger.info(
                `damage: prevented target=${this.target.playerId}`,
                { roomId: this.room.roomId, playerId: this.target.playerId, event: 'DamageEvent.prevent' },
            );
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    /**
     * 转移伤害（仅在防止时机内可调用，目标不能是自身）
     * @rules terms/description-terms/zhuanyi
     * @description 转移是先将承受角色 A 受到的伤害防止，然后对另一名角色 B 造成同来源、同渠道、同属性、同伤害值的伤害
     * @param to 承受伤害的新角色
     */
    async transfer(to: Player): Promise<this> {
        if (!this.trigger || !PREVENT_TIMINGS.has(this.trigger)) return this;
        if (to === this.target) return this;
        this.room.logger.info(
            `damage: transfer from=${this.target.playerId} to=${to.playerId}`,
            { roomId: this.room.roomId, playerId: this.target.playerId, event: 'DamageEvent.transfer' },
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
            reason: this.reason,
            effect: this.effect,
        });
        return this;
    }
}

// ===== 失去体力事件 =====

/**
 * 失去体力事件
 * @rules events/lose-hp
 * @description 执行流程：LoseHpStart → LoseHp（扣减体力）→ LoseHpEnd（复活队列）
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

    /** 失去的体力数值 */
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
    private async _onLoseHp(_room: Room, _data: LoseHpEventData): Promise<void> {
        await this.room.event.reduceHp({
            player: this.player,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.event.insertHistory(this);
    }

    /** LoseHpEnd 之后：处理复活队列 */
    private async _onLoseHpEnd(_room: Room, _data: LoseHpEventData): Promise<void> {
        await this.room.event.drainFuhuos();
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.player && this.player.alive && this.player.inthp >= this.number;
    }

    checkEvent(): boolean {
        return this.player.alive;
    }

    /**
     * 防止失去体力（仅在 LoseHpStart 时机可调用）
     * @rules terms/resolution-terms/prevent
     * @description 防止是「终止此失去体力流程」的操作
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
 * 扣减体力事件
 * @rules events/reduce-hp
 * @description 执行流程：ReduceHpStart → ReduceHp → ReduceHpAfter（实际扣减）→ ReduceHpEnd（濒死检查）；连环处理在 init() 中早于所有时机执行
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

    // ===== 连环处理（必须在事件最初执行，早于所有时机） =====

    protected async init(): Promise<void> {
        await super.init();
        this._handleChain();
    }

    /** 处理连环状态的解除与传导标记 */
    private _handleChain(): void {
        const damage = this._getDamage();
        if (!damage) return;
        if (!this.player.chained) return;
        if (damage.damageType === DamageType.None) return;
        // TODO(R5): 调用 ChangeStateEvent 解除连环（当前直接复位状态）
        this.player.chained = false;
        if (!damage.isChain) {
            const hasChained = [...this.room.players.values()].some(
                (p) => p.alive && p.chained,
            );
            if (hasChained) damage.triggerChain = true;
        }
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.ReduceHpStart),
            createTiming(TimingName.ReduceHp),
            createTiming(TimingName.ReduceHpAfter, [
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

    /** ReduceHpAfter 之后：实际修改 hp（护盾优先吸收） */
    private async _onReduceHpAfter(_room: Room, _data: ReduceHpEventData): Promise<void> {
        if (this.player.shield > 0) {
            const remaining = this.player.shield - this.number;
            this.player.shield = Math.max(0, remaining);
            if (remaining < 0) {
                this.player.hp = this.player.hp + remaining;
            }
        } else {
            this.player.hp = this.player.hp - this.number;
        }
        this.room.logger.info(
            `reduceHp player=${this.player.playerId} -${this.number} → hp=${this.player.hp}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `ReduceHp:${this.id}._onReduceHpAfter` },
        );
        this.room.event.insertHistory(this);
    }

    /** ReduceHpEnd 之后：检查是否需要进入濒死 */
    private async _onReduceHpEnd(_room: Room, _data: ReduceHpEventData): Promise<void> {
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
        if (this.source instanceof DamageEvent && this.reason === 'reducehp') {
            return this.source;
        }
        return undefined;
    }

    /** 获取关联的失去体力事件 */
    private _getLoseHp(): LoseHpEvent | undefined {
        if (this.source instanceof LoseHpEvent && this.reason === 'reducehp') {
            return this.source;
        }
        return undefined;
    }
}
