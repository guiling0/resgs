import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import { EventProcess, createTiming } from './EventProcess';
import { DamageEvent, ReduceHpEvent } from './DamageEvent';
import { EventType, TimingName } from '../../types/EventTypes';
import type { DeathEventData, DyingEventData } from '../../types/EventTypes';

// ===== 濒死事件 =====

/**
 * 濒死事件。
 * 执行流程：DyingEntry → DyingEntryAfter → Dying（求桃）→ DyingEnd
 *   → 若 hp 仍 ≤0 则创建 DeathEvent（含 killer 追溯）
 */
export class DyingEvent extends EventProcess<EventType.Dying> {
    constructor(room: Room, data: DyingEventData) {
        super(room, EventType.Dying, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    /** 造成濒死的角色 */
    get killer(): Player | undefined {
        return this.eventData.killer;
    }
    set killer(v: Player | undefined) {
        this.eventData.killer = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.DyingEntry),
            createTiming(TimingName.DyingEntryAfter),
            createTiming(TimingName.Dying, [
                this.bindWithMark(this._onDying),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.DyingEnd, undefined, [
                this.bindWithMark(this._onDyingEnd),
            ]),
        ];
    }

    // ===== 生命周期 =====

    protected async init(): Promise<void> {
        await super.init();
        this.player.setMark('indying', this.id);
        this.room.logger.info(
            `dying player=${this.player.playerId} hp=${this.player.hp}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `Dying:${this.id}.init` },
        );
        this.room.event.insertHistory(this);
    }

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    checkEvent(): boolean {
        if (this.player.hp > 0 && this.player.getMark('indying') === this.id) {
            this.player.setMark('indying', -this.id);
        }
        return this.player.hp <= 0;
    }

    // ===== 回调 =====

    /** Dying 之前：求桃阶段，显式触发 Dying 时机 */
    private async _onDying(_room: Room, _data: DyingEventData): Promise<void> {
        this.triggerNot = true;
        this.room.logger.debug(
            `dying: asking for peach player=${this.player.playerId}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `Dying:${this.id}._onDying` },
        );
        await this.room.event.trigger(TimingName.Dying, this);
    }

    /** DyingEnd 之后：若未救活则追溯 killer 并进入死亡 */
    private async _onDyingEnd(_room: Room, _data: DyingEventData): Promise<void> {
        if (this.player.hp <= 0) {
            if (!this.killer) {
                this.killer = this._findKiller();
            }
            this.room.logger.info(
                `dying: → death player=${this.player.playerId} killer=${this.killer?.playerId ?? 'none'}`,
                { roomId: this.room.roomId, playerId: this.player.playerId, event: `Dying:${this.id}._onDyingEnd` },
            );
            await this.room.event.die({
                player: this.player,
                killer: this.killer,
                source: this,
                reason: 'die_dying',
            });
        }
        this.player.setMark('indying', -this.id);
        this.triggerNot = false;
    }

    // ===== 辅助 =====

    /**
     * 从事件链追溯造成濒死的角色：
     *   DyingEvent.source(reason=dying_reducehp) → ReduceHp(reason=reducehp) → DamageEvent.player
     */
    private _findKiller(): Player | undefined {
        const reduceHp = this.source;
        if (!(reduceHp instanceof ReduceHpEvent) || reduceHp.data.reason !== 'reducehp') return undefined;
        const damage = reduceHp.source;
        return damage instanceof DamageEvent ? damage.player : undefined;
    }
}

// ===== 死亡事件 =====

/**
 * 死亡事件。
 * 执行流程：DeathBefore → DeathConfirmRole（确认死亡）→ Death → DeathAfter（弃牌清标记）→ DeathEnd（移除技能效果）
 */
export class DeathEvent extends EventProcess<EventType.Death> {
    constructor(room: Room, data: DeathEventData) {
        super(room, EventType.Death, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    /** 击杀者（优先使用 DyingEvent 传入的值） */
    get killer(): Player | undefined {
        return this.eventData.killer;
    }
    set killer(v: Player | undefined) {
        this.eventData.killer = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.DeathBefore),
            createTiming(TimingName.DeathConfirmRole, [
                this.bindWithMark(this._onConfirmRole),
            ]),
            createTiming(TimingName.Death),
            createTiming(TimingName.DeathAfter, undefined, [
                this.bindWithMark(this._onDeathAfter),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.DeathEnd, undefined, [
                this.bindWithMark(this._onDeathEnd),
            ]),
        ];
    }

    // ===== 生命周期 =====

    protected async init(): Promise<void> {
        await super.init();
        // TODO(R8): 明置主副将武将牌（玩家主副将数据就绪后：player.head/deputy 明置）

        if (this.room.currentTurn?.player === this.player) {
            await this.room.currentTurn.end();
        }

        this.room.logger.info(
            `death player=${this.player.playerId}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `Death:${this.id}.init` },
        );
        this.room.event.insertHistory(this);
    }

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    // ===== 回调 =====

    /** DeathConfirmRole 之前：确认死亡、确定击杀者 */
    private async _onConfirmRole(_room: Room, _data: DeathEventData): Promise<void> {
        if (this.data.buqu) return;
        this.player.death = true;

        // killer 未传入时从 source 追溯
        if (!this.killer && this.source instanceof DyingEvent) {
            this.killer = this.source.killer;
        }
        this.room.logger.info(
            `death confirmed player=${this.player.playerId} killer=${this.killer?.playerId ?? 'none'}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `Death:${this.id}._onConfirmRole` },
        );
        // TODO(R9): 死亡动画/战报广播
    }

    /** DeathAfter 之后：弃置所有牌、清除标记 */
    private async _onDeathAfter(_room: Room, _data: DeathEventData): Promise<void> {
        // TODO(R1): 弃置死亡角色全部手牌/装备/判定区牌
        if (this.player.rest === 0) {
            this.player.clearMark();
        }
        if (this.player.chained) this.player.chained = false;
        if (this.player.skip) this.player.skip = false;
    }

    /** DeathEnd 之后：移除该角色所有技能和效果 */
    private async _onDeathEnd(_room: Room, _data: DeathEventData): Promise<void> {
        if (!this.player.death || this.player.rest !== 0) return;
        // TODO(R3): 经技能管理器移除该玩家全部技能/效果（removeSelf 实现后接线）
        for (const skill of this.room.getSkillsByPlayer(this.player)) {
            await skill.removeSelf();
        }
        for (const effect of this.room.getEffectsByPlayer(this.player)) {
            await effect.removeSelf();
        }
    }
}
