import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import { GameCard } from '../../entity/GameCard';
import type { VirtualCard } from '../../entity/VirtualCard';
import type { VirtualCardOverrides } from '../../entity/VirtualCard';
import type { VirtualCardData } from '../../types/CardTypes';
import { VirtualCardHost } from './VirtualCardHost';
import type { VirtualCardAbility } from './VirtualCardHost';
import { EventManager } from '../event/EventManager';
import type { EventProcess } from '../event/EventProcess';
import type { TurnEvent, PhaseEvent } from '../event/TurnEvent';
import type { MoveCardEvent } from '../event/MoveCardEvent';
import { UseCardEvent } from '../event/UseCardEvent';
import { DropCardEvent } from '../event/DropCardEvent';
import type { AreaId } from '../../types/AreaTypes';
import { AreaType } from '../../types/AreaTypes';
import type { MoveCardData, MoveCardOpts } from '../../types/EventTypes';
import type { CardUseData } from '../../types/EventTypes';
import { sgs } from '../../sgs';

/**
 * 房间主机——权威端房间业务逻辑聚合（仅权威端运行时存在）。
 * 能力经 mixin 组合注入：vcard（虚拟牌）+ event（事件系统：管理器 + 事件栈 + 历史 + 移动族）。
 */
export class RoomHost implements VirtualCardAbility {
    /** vCard 能力（mixin 注入） */
    readonly vcard: VirtualCardHost;
    /** 事件管理器（触发调度/事件创建/refreshs） */
    readonly event: EventManager;
    /** 当前事件栈（执行中的事件链，不含 Turn/Phase） */
    readonly eventStack: EventProcess[] = [];
    /** 回合栈 */
    readonly turnStack: TurnEvent[] = [];
    /** 阶段栈 */
    readonly phaseStack: PhaseEvent[] = [];
    /** 延迟明置队列（事件栈排空后按序触发 Open 时机） */
    readonly deferredOpens: EventProcess[] = [];
    /** 复活回调队列（伤害/失去体力结束后排空） */
    readonly fuhuos: Array<() => Promise<void>> = [];
    /** 事件历史（insertHistory/getLastOneHistory） */
    private readonly _history: EventProcess[] = [];

    /** 当前回合（栈顶） */
    get currentTurn(): TurnEvent | undefined {
        return this.turnStack[this.turnStack.length - 1];
    }

    /** 当前阶段（栈顶） */
    get currentPhase(): PhaseEvent | undefined {
        return this.phaseStack[this.phaseStack.length - 1];
    }

    constructor(readonly room: Room) {
        this.vcard = new VirtualCardHost(room);
        this.event = new EventManager(room);
    }

    // ===== 历史记录 =====

    /** 记录事件到历史 */
    insertHistory(event: EventProcess): void {
        this._history.push(event);
    }

    /** 查询最后一个指定类型的历史事件 */
    getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T) => boolean): T | undefined {
        for (let i = this._history.length - 1; i >= 0; i--) {
            const e = this._history[i];
            if (e.type === type && (!filter || filter(e as T))) return e as T;
        }
        return undefined;
    }

    // ===== 牌堆/移动族（事件结算支撑；区域同步语义 TODO(R1)） =====

    /**
     * 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），仍不够则返回空。
     */
    async getNCards(count: number, pos: 'top' | 'bottom' = 'top'): Promise<GameCard[]> {
        const drawArea = this.room.drawArea;

        if (!drawArea || drawArea.count < count) {
            await this.shuffleDiscardToDraw();
        }

        const current = this.room.drawArea;
        if (!current || current.count < count) {
            this.room.logger.warn(
                `getNCards: not enough cards need=${count} have=${current?.count ?? 0}`,
                { roomId: this.room.roomId, event: 'getNCards' },
            );
            return [];
        }

        return current.get(count, GameCard, pos);
    }

    /** 洗牌：弃牌堆洗混后经 MoveCardEvent 置入牌堆底部（原牌堆顺序不变） */
    async shuffleDiscardToDraw(): Promise<void> {
        const discard = this.room.discardArea;
        if (!discard || discard.count === 0) return;

        discard.shuffle('cards');

        const cards = discard.cards;
        await this.event.moveCards([
            { cards, toArea: AreaType.Draw, reason: 'shuffle', pos: 'bottom' },
        ]);
    }

    /** 摸牌：从牌堆摸 count 张到玩家手牌 */
    async draw(player: Player, count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts): Promise<void> {
        const cards = await this.getNCards(count, pos);
        if (cards.length === 0) return;
        await this.event.moveCards([
            {
                player,
                cards,
                toArea: player.getAreaId(AreaType.Hand),
                reason: 'draw',
                pos: 'bottom',
                ...opts,
            },
        ]);
    }

    /** 弃牌：将牌移动到弃牌堆 */
    async discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.event.moveCards([
            { player, cards, toArea: AreaType.Discard, reason: 'discard', ...opts },
        ]);
    }

    /** 获得牌：将牌移动到操作者手牌区 */
    async obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!player.alive) return undefined;
        const toArea = player.getAreaId(AreaType.Hand);
        const valid = cards.filter((c) => this.room.areas.get(toArea) && !this.room.areas.get(toArea)!.has(c));
        if (valid.length === 0) return undefined;
        return this.event.moveCards([
            { player, cards: valid, toArea, reason: 'obtain', ...opts },
        ]);
    }

    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 */
    async give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (!fromPlayer.alive || !toPlayer.alive) return undefined;
        const toArea = toPlayer.getAreaId(AreaType.Hand);
        const valid = cards.filter((c) => !this.room.areas.get(toArea)?.has(c));
        if (valid.length === 0) return undefined;
        return this.event.moveCards([
            { player: fromPlayer, cards: valid, toArea, reason: 'give', ...opts },
        ]);
    }

    /** 交换牌：两批牌同时置入处理区后分别移动到对方区域 */
    async swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        const processing = AreaType.Processing;

        await this.event.moveCards([
            { cards: [...cards1, ...cards2], toArea: processing, reason: 'swap.put' },
        ]);

        const datas: MoveCardData[] = [];
        if (cards1.length > 0) {
            datas.push({ cards: cards1, toArea: toArea1, reason: 'swap', ...opts });
        }
        if (cards2.length > 0) {
            datas.push({ cards: cards2, toArea: toArea2, reason: 'swap', ...opts });
        }
        if (datas.length > 0) {
            return this.event.moveCards(datas);
        }
        return undefined;
    }

    /** 重铸：置入弃牌堆后摸等量牌 */
    async recast(player: Player, cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<void> {
        if (!player.alive) return;
        const owned = cards.filter((c) => {
            for (const area of this.room.areas.values()) {
                if (area.has(c) && area.player === player) return true;
            }
            return false;
        });
        if (owned.length === 0) return;

        await this.event.moveCards([
            { cards: owned, toArea: AreaType.Discard, reason: 'recast.put' },
        ]);

        const drawCount = drawOneAlways ? 1 : owned.length;
        await this.draw(player, drawCount, 'top', { reason: 'recast.draw' });
    }

    /** 展示牌：通知客户端显示卡牌（无实际区域移动）——TODO(R9): 可见性 */
    async showCards(_player: Player | undefined, _cards: GameCard[]): Promise<void> {
        // TODO(R9): 广播展示动画（card.show）
    }

    /** 亮出牌：牌堆牌移入处理区，其他牌等同展示 */
    async flashCards(player: Player | undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<void> {
        const toProcess: GameCard[] = [];
        const toShow: GameCard[] = [];

        for (const card of cards) {
            if (!card) continue;
            const area = this._findArea(card);
            const areaType = area?.type;
            if (areaType === AreaType.Draw) {
                toProcess.push(card);
            } else if (areaType !== AreaType.Processing) {
                toShow.push(card);
            }
        }

        if (toProcess.length > 0) {
            await this.event.moveCards([
                { cards: toProcess, toArea: AreaType.Processing, reason: 'put', ...opts },
            ]);
        }
        if (toShow.length > 0) {
            await this.showCards(player, toShow);
        }
    }

    /** 移存牌：将牌移动到后备区 */
    async removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        if (cards.length === 0) return undefined;
        return this.event.moveCards([
            { cards, toArea: AreaType.Reserve, reason: 'remove', ...opts },
        ]);
    }

    // ===== 使用/打出牌 =====

    /**
     * 注册牌的使用方式定义（从 sgs.carduses 拷贝到房间索引）。
     * 按时机索引 cardusesByTiming：timing → CardUseData[]；
     * 按牌名索引 carduses：同名首个用 name，后续用 name.timing。
     */
    initCardUses(): void {
        // 先按 name 分组，确定各组首个
        const byName = new Map<string, CardUseData[]>();
        for (const data of sgs.carduses) {
            let list = byName.get(data.name);
            if (!list) {
                list = [];
                byName.set(data.name, list);
            }
            list.push(data);
        }

        for (const data of sgs.carduses) {
            // 按时机注册
            let timingList = this.room.cardusesByTiming.get(data.timing);
            if (!timingList) {
                timingList = [];
                this.room.cardusesByTiming.set(data.timing, timingList);
            }
            timingList.push({ ...data });

            // 按牌名注册（同名首个用 name，后续用 name.timing）
            const sameName = byName.get(data.name)!;
            if (sameName[0] === data) {
                this.room.carduses.set(data.name, { ...data });
            } else {
                this.room.carduses.set(`${data.name}.${data.timing}`, { ...data });
            }
        }
        this.room.logger.info(
            `initCardUses total=${this.room.carduses.size}`,
            { roomId: this.room.roomId, event: 'initCardUses' },
        );
    }

    /** 使用牌（直接触发 UseCardEvent） */
    async useCard(player: Player, card: VirtualCard, targets: Player[] = []): Promise<UseCardEvent> {
        return this.event.create(UseCardEvent, { player, targets, card }, { reason: 'use' });
    }

    /** 打出牌（直接触发 DropCardEvent） */
    async dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent> {
        return this.event.create(DropCardEvent, { player, card }, { reason: 'drop' });
    }

    /** 在区域集合中查找牌所在区域 */
    private _findArea(card: GameCard) {
        for (const area of this.room.areas.values()) {
            if (area.has(card)) return area;
        }
        return undefined;
    }

    // ===== vCard 能力（mixin 转发） =====

    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    createVirtualCard(
        nameOrCardOrData: string | GameCard | VirtualCardData,
        subcardsOrOverrides?: GameCard[] | VirtualCardOverrides,
        overrides?: VirtualCardOverrides,
    ): VirtualCard {
        if (typeof nameOrCardOrData === 'string') {
            if (Array.isArray(subcardsOrOverrides)) {
                return this.vcard.create(nameOrCardOrData, subcardsOrOverrides, overrides);
            }
            return this.vcard.createByNone(nameOrCardOrData, subcardsOrOverrides as VirtualCardOverrides | undefined);
        }
        if ('subcards' in nameOrCardOrData) {
            return this.vcard.createFromData(nameOrCardOrData);
        }
        return this.vcard.createFromCard(nameOrCardOrData, subcardsOrOverrides as VirtualCardOverrides | undefined);
    }

    destroyVirtualCard(vc: VirtualCard): void {
        this.vcard.destroyVirtualCard(vc);
    }
}
