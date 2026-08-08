import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { GameCard } from '../../entity/GameCard';
import { AreaType } from '../../types/AreaTypes';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type { PindianEventData } from '../../types/EventTypes';

/**
 * 拼点事件
 * @rules events/pindian
 * @description 执行流程：Pindian（选牌并扣置入处理区）→ PindianCardShow（亮出拼点牌）→ 逐目标 PindianResult（拼点结果确定后）→ PindianEnd
 */
export class PindianEvent extends EventProcess<EventType.Pindian> {
    constructor(room: Room, data: PindianEventData) {
        super(room, EventType.Pindian, data);
        data.cards = data.cards ?? new Map();
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get targets(): Player[] {
        return this.eventData.targets;
    }

    /** 各角色的拼点牌 */
    get cards(): Map<Player, GameCard> {
        return this.eventData.cards!;
    }

    /** 发起者与每名目标的拼点结果 */
    get settleResults(): Map<Player, { winner?: Player; loser?: Player[] }> | undefined {
        return this.eventData.settleResults;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.Pindian, undefined, [
                this.bindWithMark(this._onPindianAfter),
            ]),
        ];
        this.endTriggers = [createTiming(TimingName.PindianEnd)];
    }

    // ===== 生命周期 =====

    /** 发起者存活且有手牌（或已指定拼点牌），目标为存活且有手牌（或已指定拼点牌）的其他角色 */
    check(): boolean {
        if (!this.player || !this.player.alive) return false;
        if (this.targets.length === 0) return false;
        for (const p of [this.player, ...this.targets]) {
            if (!p.alive) return false;
            if (!this.cards.has(p) && p.getHandCards().length === 0) return false;
        }
        return true;
    }

    // ===== 主执行流程（生成式目标结算） =====

    async exec(): Promise<this> {
        if (!this.check()) return this;
        await this.init();

        // 固定段：Pindian（触发时机 → 选牌 + 扣置处理区）
        await this._runTiming(this.eventTriggers.shift()!);
        if (this.isEnd || this.isComplete) return this._finish();

        // 亮出拼点牌
        await this._runTiming(
            createTiming(TimingName.PindianCardShow, [
                this.bindWithMark(this._onPindianCardShowBefore),
            ]),
        );
        if (this.isEnd || this.isComplete) return this._finish();

        // 生成式：逐目标确定结果并触发 PindianResult
        for (const target of [...this.targets]) {
            if (this.isComplete || this.room.isEnding) break;
            this._settleOne(target);
            await this._runTiming(createTiming(TimingName.PindianResult));
        }

        return this._finish();
    }

    /** 执行单个 timing */
    private async _runTiming(timing: ReturnType<typeof createTiming>): Promise<void> {
        if (this.isComplete || this.room.isEnding) return;
        await this.triggerFunc(timing);
    }

    /** 完成事件：执行 endTriggers + processCompleted */
    private async _finish(): Promise<this> {
        this.isEnd = true;
        let step = 0;
        while (!this.isComplete && this.endTriggers.length > 0) {
            step++;
            await this.triggerFunc(this.endTriggers.shift()!, step);
        }
        this.isComplete = true;

        this.room.logger.info(
            `[exec] complete`,
            { roomId: this.room.roomId, playerId: this.player?.playerId, event: `${this.type}:${this.id}.exec` },
        );

        await this.processCompleted();
        return this;
    }

    // ===== 流程回调 =====

    /** Pindian 之后：各角色选牌并扣置入处理区 */
    private async _onPindianAfter(_room: Room, _data: PindianEventData): Promise<void> {
        // 选牌：cards 未预填的角色按序询问，无手牌角色跳过
        for (const p of [this.player, ...this.targets]) {
            if (this.cards.has(p)) continue;
            const card = await this._askForPindianCard(p);
            if (card) this.cards.set(p, card);
        }

        const pindianCards = [...this.cards.values()];
        if (pindianCards.length === 0) return;
        await this.room.event.moveCards(
            [{ cards: pindianCards, toArea: AreaType.Processing, reason: 'pindian', moveType: false, putType: false }],
            { source: this },
        );
    }

    /** 询问角色选择拼点牌——TODO(R2): 选择系统接线后改为询问玩家，当前默认取手牌第一张 */
    private async _askForPindianCard(player: Player): Promise<GameCard | undefined> {
        const hand = player.getHandCards();
        if (hand.length === 0) return undefined;
        return hand[0];
    }

    /** PindianCardShow 之前：亮出全部拼点牌 */
    private async _onPindianCardShowBefore(_room: Room, _data: PindianEventData): Promise<void> {
        for (const card of this.cards.values()) {
            card.turnTo(true);
        }
    }

    /** 确定发起者与目标的拼点结果：点数大者赢，点数相同均未赢；无牌一方不结算 */
    private _settleOne(target: Player): void {
        const fromCard = this.cards.get(this.player);
        const toCard = this.cards.get(target);
        if (!fromCard || !toCard) return;

        const winner =
            fromCard.number > toCard.number ? this.player :
            fromCard.number < toCard.number ? target :
            undefined;

        this.eventData.settleTarget = target;
        this.eventData.settleWinner = winner;
        this.eventData.settleLoser = winner
            ? [winner === this.player ? target : this.player]
            : [this.player, target];

        const results = this.eventData.settleResults ?? new Map();
        results.set(target, { winner, loser: [...this.eventData.settleLoser] });
        this.eventData.settleResults = results;

        this.room.logger.debug(
            `[settle] target=${target.playerId} from=${fromCard.number} to=${toCard.number} winner=${winner?.playerId ?? 'none'}`,
            { roomId: this.room.roomId, playerId: this.player.playerId, event: `${this.type}:${this.id}.settle` },
        );
    }
}
