import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { EventProcess, createTiming } from './EventProcess';
import { DamageEvent, ReduceHpEvent } from './DamageEvent';
import {
    DeathEventData,
    DyingEventData,
    EventType,
    TimingName,
} from './EventTypes';

// ===== 濒死事件 =====

/**
 * 濒死事件。
 *
 * 执行流程：
 *   DyingEntry → DyingEntryAfter → Dying（求桃）→ DyingEnd
 *   → 若 hp 仍 ≤0 则创建 DeathEvent（包含 killer）
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
            { roomId: this.room.state.roomId, playerId: this.player.playerId, event: `Dying:${this.id}.init` },
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

    /** Dying 之前：求桃阶段 */
    private async _onDying(
        _room: Room,
        _data: DyingEventData,
    ): Promise<void> {
        this.triggerNot = true;
        this.room.logger.debug(
            `dying: asking for peach player=${this.player.playerId}`,
            { roomId: this.room.state.roomId, playerId: this.player.playerId, event: `Dying:${this.id}._onDying` },
        );
        await this.room.event.trigger(TimingName.Dying, this);
    }

    /** DyingEnd 之后：若未救活则追溯 killer 并进入死亡 */
    private async _onDyingEnd(
        _room: Room,
        _data: DyingEventData,
    ): Promise<void> {
        if (this.player.hp <= 0) {
            // 追溯造成濒死的角色：DyingEvent → ReduceHpEvent → DamageEvent.player
            if (!this.killer) {
                this.killer = this._findKiller();
            }
            this.room.logger.info(
                `dying: → death player=${this.player.playerId} killer=${this.killer?.playerId ?? 'none'}`,
                { roomId: this.room.state.roomId, playerId: this.player.playerId, event: `Dying:${this.id}._onDyingEnd` },
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
 *
 * 执行流程：
 *   DeathBefore → DeathConfirmRole → Death → DeathAfter → DeathEnd
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

        this.player.head?.turnTo(true);
        this.player.deputy?.turnTo(true);

        if (this.room.currentTurn?.player === this.player) {
            await this.room.currentTurn.end();
        }

        this.room.logger.info(
            `death player=${this.player.playerId}`,
            { roomId: this.room.state.roomId, playerId: this.player.playerId, event: `Death:${this.id}.init` },
        );
        this.room.event.insertHistory(this);
    }

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    // ===== 回调 =====

    /** ConfirmRole 之前：确认身份、确定击杀者、广播死亡 */
    private async _onConfirmRole(
        _room: Room,
        _data: DeathEventData,
    ): Promise<void> {
        if (this.data.buqu) return;
        this.player.death = true;

        // killer 可能由 DyingEvent 传入，未传入时尝试从 source 追溯
        if (!this.killer && this.source instanceof DyingEvent) {
            this.killer = this.source.killer;
        }

        // 通讯模块未完成，死亡动画/战报暂为空
    }

    /** DeathAfter 之后：弃置所有牌、清除标记 */
    private async _onDeathAfter(
        _room: Room,
        _data: DeathEventData,
    ): Promise<void> {
        if (this.player.rest === 0) {
            this.player.clearMark();
        }
        if (this.player.chained) this.player.chained = false;
        if (this.player.skip) this.player.skip = false;
    }

    /** DeathEnd 之后：移除该角色所有技能和效果 */
    private async _onDeathEnd(
        _room: Room,
        _data: DeathEventData,
    ): Promise<void> {
        if (!this.player.death || this.player.rest !== 0) return;

        for (const skill of this.room.skills.filter((v) => v.player === this.player)) {
            await skill.removeSelf();
        }
        for (const effect of this.room.effects.filter((v) => v.player === this.player)) {
            await effect.removeSelf();
        }
    }

    // ===== 辅助 =====

    private _deathLog(): Record<string, any> {
        const k = this.killer;
        if (k === this.player) {
            return {
                text: '#Death1',
                values: [{ type: 'player', value: k.playerId }],
            };
        } else if (k) {
            return {
                text: '#Death3',
                values: [
                    { type: 'player', value: k.playerId },
                    { type: 'player', value: this.player.playerId },
                ],
            };
        }
        return {
            text: '#Death2',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }
}
