import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { VirtualCard } from '../card/VirtualCard';
import { AreaType } from '../card/CardTypes';
import { EventProcess, createTiming } from './EventProcess';
import {
    DropCardEventData,
    EventType,
    TimingName,
} from './EventTypes';

// ===== DropCardEvent =====

/**
 * 打出牌事件（无目标、固定时序）。
 *
 * 执行流程：
 *   Declare（before: 实体牌移入处理区）→ Droped → End（after: 虚拟牌消失）
 *
 * need/pre 链路在 M4 锦囊牌场景中激活。
 */
export class DropCardEvent extends EventProcess<EventType.DropCard> {
    constructor(room: Room, data: DropCardEventData) {
        super(room, EventType.DropCard, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get card(): VirtualCard {
        return this.eventData.card;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.DropCardDeclare, [
                this.bindWithMark(this._onDeclare),
            ]),
            createTiming(TimingName.DropCardDroped),
        ];
        this.endTriggers = [
            createTiming(TimingName.DropCardEnd, undefined, [
                this.bindWithMark(this._onEnd),
            ]),
        ];
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.card && !this.card.destroyed;
    }

    checkEvent(): boolean {
        return !this.room.isEnding;
    }

    // ===== 回调 =====

    /** Declare before：实体牌移入处理区 */
    private async _onDeclare(
        _room: Room,
        _data: DropCardEventData,
    ): Promise<void> {
        const card = this.card;
        if (card && card.hasSubCards()) {
            const subcards = [...card.subcards];
            await this.room.event.moveCards(
                [{ cards: subcards, toArea: AreaType.Processing, reason: 'drop' }],
                { source: this },
            );
        }
    }

    /** End after：虚拟牌消失 */
    private async _onEnd(
        _room: Room,
        _data: DropCardEventData,
    ): Promise<void> {
        const card = this.card;
        if (card) {
            this.room.vcard.destroy(card);
        }
    }
}
