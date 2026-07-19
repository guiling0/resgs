import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { EventProcess, createTiming } from './EventProcess';
import {
    ChangeMaxHpEventData,
    EventType,
    RecoverHpEventData,
    TimingName,
} from './EventTypes';

// ===== 回复体力事件 =====

/**
 * 回复体力事件。
 *
 * 执行流程：
 *   RecoverHpStart → RecoverHpAfter（实际回复）→ RecoverHpEnd
 */
export class RecoverHpEvent extends EventProcess<EventType.RecoverHp> {
    constructor(room: Room, data: RecoverHpEventData) {
        super(room, EventType.RecoverHp, data);
        data.number = data.number ?? 1;
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get number(): number {
        return this.eventData.number;
    }
    set number(v: number) {
        this.eventData.number = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.RecoverHpStart),
            createTiming(TimingName.RecoverHpAfter, [
                this.bindWithMark(this._onRecoverHpAfter),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.RecoverHpEnd),
        ];
    }

    // ===== 生命周期 =====

    check(): boolean {
        const p = this.player;
        if (!p || p.death) return false;
        if (this.number <= 0) return false;

        const lost = p.losshp;
        if (lost === 0) return false;
        if (lost < this.number) {
            this.number = lost;
        }
        return true;
    }

    checkEvent(): boolean {
        return this.player.alive;
    }

    // ===== 回调 =====

    /** RecoverHpAfter 之前：实际回复体力 */
    private async _onRecoverHpAfter(
        _room: Room,
        _data: RecoverHpEventData,
    ): Promise<void> {
        const p = this.player;
        p.hp = p.hp + this.number;
        this.room.logger.info(
            `recover player=${p.playerId} +${this.number} → hp=${p.hp}`,
            { roomId: this.room.state.roomId, playerId: this.player.playerId, event: `RecoverHp:${this.id}._onRecoverHpAfter` },
        );
        this.room.event.insertHistory(this);
    }
}

// ===== 体力上限改变事件 =====

/**
 * 体力上限改变事件。
 *
 * 执行流程：
 *   ChangeMaxHpStart → ChangeMaxHpAfter（实际修改）→ ChangeMaxHpEnd
 *
 * 上限降至 ≤0 时触发死亡。
 */
export class ChangeMaxHpEvent extends EventProcess<EventType.ChangeMaxHp> {
    constructor(room: Room, data: ChangeMaxHpEventData) {
        super(room, EventType.ChangeMaxHp, data);
        data.number = data.number ?? 1;
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    /** 变化值（正=增加，负=减少） */
    get number(): number {
        return this.eventData.number;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.ChangeMaxHpStart),
            createTiming(TimingName.ChangeMaxHpAfter, [
                this.bindWithMark(this._onChangeMaxHpAfter),
            ]),
        ];
        this.endTriggers = [
            createTiming(TimingName.ChangeMaxHpEnd),
        ];
    }

    // ===== 生命周期 =====

    check(): boolean {
        const p = this.player;
        return !!p && !p.death && this.number !== 0;
    }

    checkEvent(): boolean {
        return this.player.alive;
    }

    // ===== 回调 =====
    private async _onChangeMaxHpAfter(
        _room: Room,
        _data: ChangeMaxHpEventData,
    ): Promise<void> {
        const p = this.player;
        const newMax = Math.max(0, p.maxhp + this.number);
        p.maxhp = newMax;

        if (p.hp > newMax) {
            p.hp = newMax;
        }

        this.room.logger.info(
            `changeMaxHp player=${p.playerId} ${this.number > 0 ? '+' : ''}${this.number} → maxhp=${p.maxhp} hp=${p.hp}`,
            { roomId: this.room.state.roomId, playerId: p.playerId, event: `ChangeMaxHp:${this.id}._onChangeMaxHpAfter` },
        );

        this.room.event.insertHistory(this);

        // 上限降到 0 以下 → 死亡
        if (newMax <= 0) {
            this.isEnd = true;
            await this.room.event.die({
                player: this.player,
                source: this,
                reason: 'die_reducehpmax',
            });
        }
    }
}
