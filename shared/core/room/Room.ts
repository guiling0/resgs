import { MapSchema } from '@colyseus/schema';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { Player } from '../player/Player';
import { RoomState } from '../schema/RoomState';
import { MarkState } from '../schema/MarkState';
import { GameCard } from '../card/GameCard';
import { VirtualCard } from '../card/VirtualCard';
import {
    AreaId,
    AreaType,
    CardSubType,
    CardType,
    VirtualCardData,
} from '../card/CardTypes';
import { CardUseData, DamageType, MoveCardOpts, MoveCardData } from '../event/EventTypes';
import { CardManager } from './CardManager';
import { AreaManager } from './AreaManager';
import { VirtualCardManager } from './VirtualCardManager';
import { PlayerManager } from './PlayerManager';
import { GeneralManager } from './GeneralManager';
import { SkillManager } from './SkillManager';
import { EventManager } from './EventManager';
import { BroadcastManager } from './BroadcastManager';
import { ChooseManager } from './ChooseManager';
import { General } from '../general/General';
import { GeneralId } from '../general/GeneralType';
import { EventProcess } from '../event/EventProcess';
import { TimingName, UseCardEventData } from '../event/EventTypes';
import { Skill } from '../skill/Skill';
import { Effect } from '../skill/Effect';
import { PriorityType, StateEffectType } from '../skill/SkillTypes';
import { TurnEvent, PhaseEvent } from '../event/TurnEvent';
import { UseCardEvent } from '../event/UseCardEvent';
import { DropCardEvent } from '../event/DropCardEvent';
import { Phase } from '../player/PlayerTypes';
import type { GameMode } from './GameMode';
import { RoomOption } from './GameMode';
import { IPlayerInput } from './IPlayerInput';
import { ILogger } from '../ILogger';
import { parseAreaId } from '../utils';
import {
    SelectCount,
    SelectorType,
    SelectorContext,
    SelectorConfig,
    type SelectSession,
} from '../select/SelectTypes';

/** SelectorType → sgs.selectors 预设 key 映射 */
const SELECTOR_KEY: Record<string, string> = {
    [SelectorType.Card]: 'card',
    [SelectorType.Player]: 'player',
    [SelectorType.General]: 'general',
    [SelectorType.Option]: 'option',
    [SelectorType.Command]: 'command',
    [SelectorType.Confirm]: 'confirm',
};

/** 获取对象的 ID 标识（用于发送到客户端） */
function _getId(item: any, type: SelectorType): any {
    switch (type) {
        case SelectorType.Card:    return (item as GameCard).id;
        case SelectorType.Player:  return (item as Player).playerId;
        case SelectorType.General: return (item as General).id;
        default:                   return item; // Option/Command 原样
    }
}

/** 通过 ID 查找原对象 */
function _findItem<T>(items: T[], id: any, type: SelectorType): T | undefined {
    switch (type) {
        case SelectorType.Card:
            return items.find((it) => (it as any as GameCard).id === id);
        case SelectorType.Player:
            return items.find((it) => (it as any as Player).playerId === id);
        case SelectorType.General:
            return items.find((it) => (it as any as General).id === id);
        default:
            return items.find((it) => it === id);
    }
}

/** refreshs 回调条目（fn 已 bind，this 指向 source） */
export interface RefreshEntry {
    source: Skill | Effect;
    fn: (room: Room, data: any) => Promise<any>;
}

export class Room implements Omit<MarkHost, 'room'> {
    private _input!: IPlayerInput;
    /** 玩家输入接口（ChooseManager 通过此接口与客户端通信） */
    get input(): IPlayerInput {
        return this._input;
    }
    readonly logger: ILogger;
    // ===== MarkHost 实现 =====
    /** 房间自身状态（Colyseus Schema 根节点） */
    readonly state: RoomState;
    /** 运行时自定义数据 */
    readonly data: Record<string, any> = {};
    /** 标记状态 Map */
    readonly marksMap: MapSchema<MarkState>;
    /** 游戏运行时状态（到 GameState 的快捷引用） */
    readonly game: import('../schema/GameState').GameState;
    /** 标记 key→内容集合 索引 */
    readonly _markKeyMap = new Map<string, Set<string>>();

    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    // ===== Manager 实例 =====
    /** 区域操作 */
    area: AreaManager = new AreaManager(this);
    /** 卡牌创建/索引 */
    card: CardManager = new CardManager(this);
    /** 虚拟牌生命周期 */
    vcard: VirtualCardManager = new VirtualCardManager(this);
    /** 玩家查询/排序 */
    player: PlayerManager = new PlayerManager(this);
    /** 武将查询/选将 */
    general: GeneralManager = new GeneralManager(this);
    /** 技能/效果生命周期 */
    skill: SkillManager = new SkillManager(this);
    /** 事件触发调度 */
    event: EventManager = new EventManager(this);
    /** 客户端通讯 */
    broadcast: BroadcastManager = new BroadcastManager(this);
    /** 玩家选择交互 */
    choose: ChooseManager = new ChooseManager(this);

    // ===== 运行时容器 =====
    /** 所有玩家实体列表 */
    players: Player[] = [];
    /** playerId → Player 快速索引 */
    playerMaps: Map<string, Player> = new Map();
    /** 所有卡牌实例（ID → 实体） */
    cards: Map<string, GameCard> = new Map();
    /** 非衍生牌名列表 */
    cardNames: string[] = [];
    /** 牌名 → 卡牌类型 索引 */
    cardNamesToType: Map<CardType, Set<string>> = new Map();
    /** 牌名 → 卡牌副类型 索引 */
    cardNamesToSubType: Map<CardSubType, Set<string>> = new Map();
    /** 所有虚拟牌 */
    vcards: VirtualCard[] = [];
    /** 牌的默认使用方式（牌名 → CardUseData）。从 sgs.carduses 惰性复制，同名取首个 */
    carduses: Map<string, CardUseData> = new Map();
    /** 牌的默认使用方式（时机 → CardUseData[]）。供 needUseCard 按时机查找 */
    cardusesByTiming: Map<TimingName, CardUseData[]> = new Map();
    /** 所有武将实例（ID → 实体） */
    generals: Map<GeneralId, General> = new Map();
    /** 所有武将真名列表 */
    generalNames: string[] = [];
    /** 本局已被选走的武将真名集合（防止选将/补将重复） */
    pickedGeneralNames: Set<string> = new Set();
    /** 本次变更已用过的武将（防止变更时重复出同一张） */
    changeGenerals: Set<General> = new Set();

    // ===== 事件系统 =====
    /** 事件自增 ID */
    eventIds: number = 0;
    /** 技能自增 ID */
    skillIds: number = 0;
    /** 效果自增 ID */
    effectIds: number = 0;
    /** 所有运行时技能实例 */
    skills: Skill[] = [];
    /** 所有运行时效果实例 */
    effects: Effect[] = [];
    /** 当前事件栈（正在执行的事件链，不含 Turn/Phase 事件） */
    eventStack: EventProcess[] = [];
    /** 回合栈 */
    turnStack: TurnEvent[] = [];
    /** 阶段栈 */
    phaseStack: PhaseEvent[] = [];
    /** 当前回合（栈顶） */
    get currentTurn(): TurnEvent | undefined {
        return this.turnStack[this.turnStack.length - 1];
    }
    /** 当前阶段（栈顶） */
    get currentPhase(): PhaseEvent | undefined {
        return this.phaseStack[this.phaseStack.length - 1];
    }
    /** 延迟明置队列 */
    deferredOpens: EventProcess[] = [];
    /** 复活回调队列 */
    fuhuos: Array<() => Promise<void>> = [];

    // ===== 游戏配置 =====

    /** 房间设置 */
    readonly options: RoomOption;
    /** 游戏模式（startGame 时从 sgs.modes 获取并缓存） */
    mode?: GameMode;

    // ===== 游戏流程 =====

    /** 游戏阶段 */
    private _gameState: 'waiting' | 'gaming' | 'ending' = 'waiting';
    /** 是否正在游戏中 */
    get isGaming(): boolean {
        return this._gameState === 'gaming';
    }
    /** 游戏是否正在结束 */
    get isEnding(): boolean {
        return this._gameState === 'ending';
    }
    /** 当前轮次的起始回合 */
    roundStartTurn?: TurnEvent;
    /** 额外回合队列 */
    extraTurns: TurnEvent[] = [];
    /** 事件历史 */
    private _history: EventProcess[] = [];

    // ===== 技能/效果索引 =====
    /**
     * 触发效果索引：TimingName → PriorityType → { global, byPlayer }
     */
    triggerEffects: Map<
        TimingName,
        Map<
            PriorityType,
            {
                global: Effect[];
                byPlayer: Map<string, Effect[]>;
            }
        >
    > = new Map();
    /**
     * 状态效果索引：StateEffectType → 拥有该状态回调的效果列表
     */
    stateEffects: Map<StateEffectType, Effect[]> = new Map();
    /**
     * refreshs 回调索引：TimingName → before/after 回调列表
     */
    refreshsByTiming: Map<
        TimingName,
        {
            before: Array<RefreshEntry>;
            after: Array<RefreshEntry>;
        }
    > = new Map();

    // ===== 计算属性 =====
    /** 存活玩家列表 */
    get alives() {
        return this.players.filter((p) => p.alive);
    }
    set turnCount(value: number) {
        this.game.turnCount = value;
    }
    get turnCount(): number {
        return this.game.turnCount;
    }
    set roundCount(value: number) {
        this.game.roundCount = value;
    }
    get roundCount(): number {
        return this.game.roundCount;
    }

    // ===== 工具方法 =====

    /**
     * 游戏延迟等待。
     * 让玩家有时间观察游戏情况，暂停游戏流程。
     * @param seconds 延迟秒数
     * @param showProgressBar 是否让所有玩家显示等待进度条
     */
    async delay(
        seconds: number,
        showProgressBar: boolean = false,
    ): Promise<void> {
        // TODO Phase 9: 通过 BroadcastManager 发送延迟消息到客户端
    }

    // ===== 事件快捷方法（技能中便捷调用，核心代码仍用 EventManager）=====

    // ---- 伤害 / 体力 ----

    async damage(
        player: Player | undefined,
        target: Player,
        damageType = DamageType.None,
        number = 1,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ) {
        return this.event.damage({
            player: player as Player,
            target,
            damageType,
            number,
            channel,
            isChain,
        });
    }
    async loseHp(player: Player, number = 1) {
        return this.event.loseHp({ player, number });
    }
    async reduceHp(player: Player, number = 1) {
        return this.event.reduceHp({ player, number });
    }
    async recover(player: Player, number = 1) {
        return this.event.recover({ player, number });
    }
    async recoverTo(player: Player, targetHp: number) {
        const cur = player.hp;
        const max = player.maxhp;
        if (cur >= targetHp || cur >= max) return;
        const need = targetHp - cur;
        const cap = max - cur;
        const amount = need < cap ? need : cap;
        if (amount <= 0) return;
        return this.recover(player, amount);
    }
    async changeMaxHp(player: Player, number = 1) {
        return this.event.changeMaxHp({ player, number });
    }
    async dying(player: Player) {
        return this.event.dying({ player });
    }
    async die(player: Player, killer?: Player) {
        return this.event.die({ player, killer });
    }

    // ---- canXxx 检测方法 ----

    /** 检测 loseHp 是否可执行：体力值 ≥ number 且存活 */
    canLoseHp(player: Player, number: number = 1): boolean {
        return player.alive && player.inthp >= number;
    }

    /** 检测 recover 是否可执行：计算实际回复量（不超过已损失体力值）> 0 */
    canRecover(player: Player, number: number = 1): boolean {
        if (!player.alive) return false;
        const cap = player.maxhp - player.inthp;
        return number > 0 && cap > 0;
    }

    /** 检测 changeMaxHp 是否可执行（number 为负值时减少上限） */
    canChangeMaxHp(player: Player, number: number = 1): boolean {
        if (!player.alive) return false;
        if (number < 0 && player.maxhp + number <= 0) return false;
        return number !== 0;
    }

    // ---- 使用牌 ----

    /**
     * 使用牌——双签名入口。
     *
     * 签名 1（直接触发）：传入 card + targets，创建 UseCardEvent 并执行。
     * 签名 2（发起询问）：传入 cardNames/skills，通过 ChooseManager 选牌→选目标→回调签名 1。
     */
    async useCard(
        player: Player,
        cardOrOpts: VirtualCard | { cardNames?: string[] },
        targets?: Player[],
    ): Promise<UseCardEvent | null> {
        // 签名 1：直接触发
        if (cardOrOpts instanceof VirtualCard) {
            const card = cardOrOpts;
            const data: UseCardEventData = {
                player,
                targets: targets ?? [],
                card,
            };
            return this.event.create(UseCardEvent, data, { reason: 'use' });
        }

        // 签名 2：发起使用牌询问（M3 补全 need2 技能列表）
        const cardName = cardOrOpts.cardNames?.[0];
        if (!cardName) return null;

        // 选择实体牌 → 创建 VirtualCard → 选目标 → 调用签名 1
        const cardUse = this.carduses.get(cardName);
        if (!cardUse) return null;

        const handCards = player.getHandCards();
        const candidates = handCards.filter((c) => c.name === cardName);
        if (candidates.length === 0) return null;

        const chosen: GameCard[] = await this.chooseCard(player, candidates, 1);
        if (!chosen.length) return null;

        const vc = this.vcard.createByName(cardName, chosen);
        const validTargets = cardUse.target(this, player, vc);
        const chosenTargets = await this.choosePlayer(player, validTargets, 1);
        if (!chosenTargets.length) {
            this.vcard.destroy(vc);
            return null;
        }

        return this.useCard(player, vc, chosenTargets);
    }

    /**
     * 使用牌合法性检测（三关）。
     * 1. Prohibit_UseCard StateEffect
     * 2. 使用次数（杀在出牌阶段空闲时间点）
     * 3. 合法目标数 ≥ 额定下限 ≠ 0
     */
    canUseCard(
        player: Player,
        cardNameOrVCData: string | VirtualCardData,
        target?: Player,
    ): boolean {
        const cardName =
            typeof cardNameOrVCData === 'string'
                ? cardNameOrVCData
                : cardNameOrVCData.name;

        const cardUse = this.carduses.get(cardName);
        if (!cardUse) return false;

        // 辅助：创建临时 VirtualCard 供回调使用。
        // 不入 room.vcards，不绑定子牌——纯属性壳，用完即弃。
        const _makeVC = (): VirtualCard => {
            if (typeof cardNameOrVCData === 'string') {
                return new VirtualCard(cardName, [], undefined, false);
            }
            const data = cardNameOrVCData;
            const vc = new VirtualCard(
                data.name,
                [],
                { suit: data.suit, color: data.color, number: data.number, attr: data.attr },
                false,
            );
            Object.assign(vc.data, data.data);
            return vc;
        };
        const _cleanVC = (vc: VirtualCard) => vc.clearSubCards();

        // 1. 额外使用条件（如桃需体力不满）
        if (cardUse.canUse) {
            const vc = _makeVC();
            const ok = cardUse.canUse(this, player, vc);
            _cleanVC(vc);
            if (!ok) return false;
        }

        // 2. 目标数检测
        if (target) {
            const vc = _makeVC();
            const validTargets = cardUse.target(this, player, vc);
            _cleanVC(vc);
            if (validTargets.length === 0) return false;
            if (!validTargets.includes(target)) return false;
        }

        return true;
    }

    // ---- 打出牌 ----

    /**
     * 打出牌——直接触发 DropCardEvent。
     * M4 南蛮/决斗等场景中接入 needDropCard 询问。
     */
    async dropCard(
        player: Player,
        card: VirtualCard,
    ): Promise<DropCardEvent> {
        return this.event.create(DropCardEvent, { player, card }, { reason: 'drop' });
    }

    // ---- 卡牌移动快捷方法 ----

    /** 移动卡牌。cards 第一参数，toArea 第二参数 */
    async moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts) {
        return this.event.moveCards([{ cards, toArea, ...opts }]);
    }
    /** 移动卡牌（完整数据数组）。供复杂移动场景使用 */
    async moveCardsRaw(
        datas: MoveCardData[],
        opts?: {
            getMoveLabel?: (data: MoveCardData) => any;
            log?: (data: MoveCardData) => any;
        },
    ) {
        return this.event.moveCards(datas, opts);
    }

    /**
     * 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），仍不够则平局。
     */
    async getNCards(
        count: number,
        pos: 'top' | 'bottom' = 'top',
    ): Promise<GameCard[]> {
        const drawArea = AreaType.Draw;
        const drawCards = this.area.get(drawArea);

        if (!drawCards || drawCards.length < count) {
            await this.shuffleDiscardToDraw();
        }

        const current = this.area.get(drawArea);
        if (!current || current.length < count) {
            this.logger.warn(
                `getNCards: not enough cards need=${count} have=${current?.length ?? 0}`,
            );
            return [];
        }

        return this.card.gets(this.area.getCards(drawArea, count, pos));
    }

    // ---- 1. 置于/置入牌 ----

    /** 置于牌：将牌直接移动到目标区域（委托到 moveCards，reason 默认 'put'） */
    async putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts) {
        return this.moveCards(cards, toArea, opts);
    }

    // ---- 2. 洗牌 ----

    /**
     * 洗牌：将弃牌堆洗混后通过 MoveCardEvent 置入牌堆底部（原牌堆顺序不变）。
     */
    async shuffleDiscardToDraw(): Promise<void> {
        const discard = this.area.get(AreaType.Discard);
        if (!discard || discard.length === 0) return;

        // 原地洗混弃牌堆
        this.area.shuffle(AreaType.Discard);

        // 通过 MoveCardEvent 将弃牌堆所有牌移动到牌堆底部
        const cards = this.card.gets([...discard]);
        await this.event.moveCards([
            {
                cards,
                toArea: AreaType.Draw,
                reason: 'shuffle',
                pos: 'bottom',
            },
        ]);
    }

    // ---- 3. 摸牌 ----

    /** 摸牌：从牌堆摸 count 张到 player 的手牌。原因 draw */
    async draw(
        player: Player,
        count: number = 1,
        pos: 'top' | 'bottom' = 'top',
        opts?: MoveCardOpts,
    ) {
        const cards = await this.getNCards(count, pos);
        if (cards.length === 0) return;
        return this.event.moveCards([
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

    // ---- 4. 弃牌 ----

    /** 弃牌：将牌移动到弃牌堆。原因 discard */
    async discard(player: Player, cards: GameCard[], opts?: MoveCardOpts) {
        return this.event.moveCards([
            {
                player,
                cards,
                toArea: AreaType.Discard,
                reason: 'discard',
                ...opts,
            },
        ]);
    }

    // ---- 5. 获得牌 ----

    /** 获得牌：将牌移动到操作者手牌区。原因 obtain */
    async obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts) {
        if (!player.alive) return;
        const toArea = player.getAreaId(AreaType.Hand);
        const valid = cards.filter((c) => c.area !== toArea);
        if (valid.length === 0) return;
        return this.event.moveCards([
            {
                player,
                cards: valid,
                toArea,
                reason: 'obtain',
                ...opts,
            },
        ]);
    }

    // ---- 6. 重铸 ----

    /** 重铸：①将牌置入弃牌堆 → ②摸等量牌。drawOneAlways 为 true 时固定摸 1 张 */
    async recast(
        player: Player,
        cards: GameCard[],
        drawOneAlways: boolean = false,
        opts?: MoveCardOpts,
    ) {
        if (!player.alive) return;
        const owned = cards.filter(
            (c) => c.area && this._getAreaPlayer(c.area) === player,
        );
        if (owned.length === 0) return;

        await this.putTo(owned, AreaType.Discard, { reason: 'recast.put' });

        const drawCount = drawOneAlways ? 1 : owned.length;
        await this.draw(player, drawCount, 'top', { reason: 'recast.draw' });
    }

    // ---- 7. 交给牌 ----

    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 的手牌区。原因 give */
    async give(
        fromPlayer: Player,
        toPlayer: Player,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ) {
        if (!fromPlayer.alive || !toPlayer.alive) return;
        const valid = cards.filter((c) => !toPlayer.getHandCards().includes(c));
        if (valid.length === 0) return;
        return this.event.moveCards([
            {
                player: fromPlayer,
                cards: valid,
                toArea: toPlayer.getAreaId(AreaType.Hand),
                reason: 'give',
                ...opts,
            },
        ]);
    }

    // ---- 8. 交换牌 ----

    /**
     * 交换牌：将 cards1 和 cards2 同时置入处理区，再分别移动到对方区域。
     * 原因 swap.put / swap
     */
    async swap(
        cards1: GameCard[],
        toArea1: AreaId,
        cards2: GameCard[],
        toArea2: AreaId,
        opts?: MoveCardOpts,
    ) {
        const processing = AreaType.Processing;

        await this.putTo([...cards1, ...cards2], processing, {
            reason: 'swap.put',
        });

        const datas: MoveCardData[] = [];
        if (cards1.length > 0) {
            datas.push({
                cards: cards1,
                toArea: toArea1,
                reason: 'swap',
                ...opts,
            });
        }
        if (cards2.length > 0) {
            datas.push({
                cards: cards2,
                toArea: toArea2,
                reason: 'swap',
                ...opts,
            });
        }
        if (datas.length > 0) {
            return this.moveCardsRaw(datas);
        }
    }

    // ---- 9. 展示牌 ----

    /** 展示牌：通知客户端显示卡牌（无实际区域移动）。TODO Phase 9: 可见性 */
    async showCards(
        player: Player | undefined,
        cards: GameCard[],
    ): Promise<void> {
        if (cards.length === 0) return;
        // TODO Phase 9: 通过 BroadcastManager 发送展示动画
    }

    // ---- 10. 亮出牌 ----

    /** 亮出牌：牌堆里的牌 → 处理区(put)；其他牌 → 等同于展示 */
    async flashCards(
        player: Player | undefined,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ) {
        const toProcess: GameCard[] = [];
        const toShow: GameCard[] = [];

        for (const card of cards) {
            if (!card) continue;
            const areaType = this._getAreaType(card.area);
            if (areaType === AreaType.Draw) {
                toProcess.push(card);
            } else if (areaType !== AreaType.Processing) {
                toShow.push(card);
            }
        }

        if (toProcess.length > 0) {
            await this.putTo(toProcess, AreaType.Processing, {
                reason: 'put',
                ...opts,
            });
        }
        if (toShow.length > 0) {
            await this.showCards(player, toShow);
        }
    }

    // ---- 11. 移存牌 ----

    // ---- 12. 判定 ----

    // ---- 13. 状态改变 ----

    /** 明置武将 */
    async open(player: Player, generals: General[]) {
        return this.event.changeState({
            player,
            generals,
            toState: true as const,
        });
    }
    /** 暗置武将 */
    async close(player: Player, generals: General[]) {
        return this.event.changeState({
            player,
            generals,
            toState: false as const,
        });
    }
    /**
     * 横置/重置武将。
     * @param damageType 横置属性（toState=false 时用于解锁动画），默认 None
     */
    async chain(
        player: Player,
        toState?: boolean,
        damageType: DamageType = DamageType.None,
    ) {
        return this.event.changeState({
            player,
            toState: toState ?? !player.chained,
            damageType,
        });
    }
    /** 翻面 */
    async skip(player: Player, toState?: boolean) {
        return this.event.changeState({
            player,
            toState: toState ?? !player.skip,
        });
    }
    /** 变更武将（替换为主将或副将） */
    async change(
        player: Player,
        general: General | 'head' | 'deputy',
        toGeneral: General,
    ) {
        return this.event.changeState({ player, general, toGeneral });
    }
    /** 移除武将 */
    async remove(player: Player, general: General) {
        return this.event.changeState({ player, general });
    }

    /** 判定：对玩家执行一次判定流程 */
    async judge(
        player: Player,
        isSuccess?: (result: VirtualCardData) => boolean,
    ) {
        return this.event.judge({ player, isSuccess });
    }

    /** 移存牌：将牌移动到后备区。原因 remove */
    async removeToReserve(cards: GameCard[], opts?: MoveCardOpts) {
        if (cards.length === 0) return;
        return this.event.moveCards([
            {
                cards,
                toArea: AreaType.Reserve,
                reason: 'remove',
                ...opts,
            },
        ]);
    }

    // ---- 选择快捷方法 ----

    // ---- 选择快捷方法 ----

    /**
     * 请求玩家选择卡牌。
     * @returns 选中的卡牌数组，取消/超时返回空数组
     */
    async chooseCard(
        player: Player,
        cards: GameCard[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<GameCard[]> {
        return this._choose(player, SelectorType.Card, cards, count, opts);
    }

    /**
     * 请求玩家选择目标玩家。
     * @returns 选中的玩家数组，取消/超时返回空数组
     */
    async choosePlayer(
        player: Player,
        targets: Player[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<Player[]> {
        return this._choose(player, SelectorType.Player, targets, count, opts);
    }

    /**
     * 请求玩家选择武将。
     * @returns 选中的武将数组，取消/超时返回空数组
     */
    async chooseGeneral(
        player: Player,
        generals: General[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<General[]> {
        return this._choose(player, SelectorType.General, generals, count, opts);
    }

    /**
     * 请求玩家从选项列表中选择。
     * @returns 选中的选项 key 数组，取消/超时返回空数组
     */
    async chooseOption(
        player: Player,
        options: string[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<string[]> {
        return this._choose(player, SelectorType.Option, options, count, opts);
    }

    // ---- 选择内部辅助 ----

    /** 通用的单项选择实现 */
    private async _choose<T>(
        player: Player,
        type: SelectorType,
        items: T[],
        count: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<T[]> {
        const ids = items.map((it) => _getId(it, type));
        const key = SELECTOR_KEY[type];
        const config: SelectorConfig = {
            name: key,
            type,
            count,
            selectable: () => ids,
        };

        const ctx = this._makeSelectorContext(player);
        const session = this._buildSession(player, ctx, opts);
        session.steps = [config];
        const result = await this.choose.request(session);
        if (result.cancelled || result.timeout) return [];
        const resultIds: any[] = result.results[key] ?? [];
        return resultIds.map((id: any) => _findItem(items, id, type)).filter(Boolean) as T[];
    }

    /** 创建 SelectorContext，自动填充 eventData/skillName */
    private _makeSelectorContext(player: Player, skillName?: string): SelectorContext {
        const top = this.eventStack.length > 0
            ? this.eventStack[this.eventStack.length - 1]
            : undefined;
        return {
            player,
            room: this,
            eventData: top,
            skillName: skillName ?? this.event._currentEffect?.skill?.name ?? '',
        };
    }

    /** 构建带默认值的 SelectSession（opts 不可覆盖 id/player/steps/context） */
    private _buildSession(
        player: Player,
        ctx: SelectorContext,
        opts?: Partial<SelectSession>,
    ): SelectSession {
        return {
            ...opts,
            id: `choose_${this.eventIds++}`,
            player: player.playerId,
            steps: [],
            context: ctx,
        };
    }

    // ---- 内部辅助 ----

    /** 从 AreaId 获取区域类型 */
    private _getAreaType(areaId: string): string {
        return parseAreaId(areaId).areaType;
    }

    /** 从 AreaId 获取所属玩家 */
    private _getAreaPlayer(areaId: string): Player | undefined {
        const { playerId } = parseAreaId(areaId);
        return playerId ? this.playerMaps.get(playerId) : undefined;
    }

    // ===== 游戏流程方法 =====

    /** 默认 6 个额定阶段 */
    static getRatedPhases(): Phase[] {
        return [
            Phase.Ready,
            Phase.Judge,
            Phase.Draw,
            Phase.Play,
            Phase.Drop,
            Phase.End,
        ];
    }

    /**
     * 初始化游戏：创建区域、玩家、卡牌、武将。
     * TODO Phase 6: 加载卡牌/武将数据
     */
    async initStart(
        playerDatas: {
            playerId: string;
            username: string;
            prechooses?: string[];
            seattag?: string;
            controlId?: string;
        }[] = [],
    ): Promise<void> {
        this.logger.info(`initStart players=${playerDatas.length}`);

        // ===== 1. 创建公共区域（卡牌 + 武将） =====
        for (const type of [
            AreaType.Draw,
            AreaType.Discard,
            AreaType.Processing,
            AreaType.Granary,
            AreaType.Treasury,
            AreaType.Reserve,
        ]) {
            this.area.initArea(type);
            this.area.initArea(type, true);
        }

        // ===== 2. 创建玩家 =====
        for (const pd of playerDatas) {
            this.player.createPlayer(pd.playerId, pd.username, {
                prechooses: pd.prechooses,
                seattag: pd.seattag,
                controlId: pd.controlId,
            });
        }

        // ===== 4. 加载卡牌（不同步到客户端） =====
        for (const extName of this.options.cards) {
            const pack = sgs.cardpacks.get(extName);
            if (!pack) continue;
            for (const data of pack.cards) {
                this.card.create(data);
            }
        }
        // 批量注册索引
        for (const card of this.cards.values()) {
            this.card.build(card, false);
        }
        this.card.initCardUses();

        // ===== 5. 加载武将（不同步到客户端） =====
        const soldierIds = ['default.shibingn', 'default.shibingv'];
        const generalIds = [...soldierIds, ...this.options.generals];
        for (const id of generalIds) {
            const data = sgs.generals.get(id);
            if (!data) continue;
            this.general.create(data);
        }
        for (const general of this.generals.values()) {
            this.general.build(general, false);
        }
    }

    /**
     * 开始游戏：获取模式 → beforeStart → 主循环。
     */
    async startGame(): Promise<void> {
        this.logger.info('startGame');

        const modeId = this.options.mode;
        this.mode = sgs.modes.get(modeId ?? '');
        if (!this.mode) {
            this.logger.error(`mode not found: ${modeId}`);
            await this.gameOver([], 'mode_not_found');
            return;
        }

        this._gameState = 'gaming';
        await this.mode.beforeStart(this);

        await this._mainProcess();
    }

    /** 游戏主循环：按轮次/回合创建 TurnEvent 并执行。 */
    private async _mainProcess(): Promise<void> {
        let last: TurnEvent | undefined;
        const MAX_ROUNDS = 302;

        while (this.isGaming) {
            if (this.roundCount >= MAX_ROUNDS) {
                this.gameOver([], 'max_rounds');
                break;
            }
            if (this.players.filter((v) => v.alive || v.rest > 0).length <= 1) {
                this.gameOver([], 'last_standing');
                break;
            }

            let turn: TurnEvent;
            if (this.extraTurns.length > 0) {
                turn = this.extraTurns.shift()!;
            } else {
                this.turnCount++;
                turn = new TurnEvent(this, {
                    turnId: this.turnCount,
                    player: undefined!,
                    isExtraTurn: false,
                    isSkipped: false,
                    phases: Room.getRatedPhases().map((p) => ({
                        phase: p,
                        isExtraPhase: false,
                    })),
                    skippedPhases: [],
                    isRoundStart: false,
                    isRoundEnd: false,
                });
                if (this.mode?.mainProcess) {
                    await this.mode.mainProcess(this, turn, last);
                } else {
                    turn.player = this._getNextPlayer(last);
                    turn.isRoundStart =
                        !last || turn.player.seat <= (last.player?.seat ?? 0);
                }
                if (turn.isRoundStart) {
                    if (last) {
                        last.eventData.isRoundEnd = true;
                        await this.event.trigger(TimingName.RoundEnd, {
                            round: this.roundCount,
                            turn: last,
                        });
                    }
                    this.roundCount++;
                    this.roundStartTurn = turn;
                    await this.event.trigger(TimingName.RoundStart, {
                        round: this.roundCount,
                        turn,
                    });
                }
            }

            this.logger.info(
                `turn id=${turn.id} player=${turn.player.playerId} round=${this.roundCount}`,
            );

            try {
                await turn.exec();
            } catch (e) {
                this.logger.error(
                    `turn error id=${turn.id}: ${(e as Error).message}`,
                );
            }

            last = turn;
        }
    }

    /**
     * 确定下一名执行回合的玩家。
     * 跳过死亡玩家；休整玩家不跳过（由 TurnEvent 处理 rest 减扣与回合跳过）。
     */
    private _getNextPlayer(last: TurnEvent | undefined): Player {
        if (!last) {
            const first = this.players.find((p) => p.seat === 1 && p.alive);
            if (first) return first;
            return this.alives[0];
        }
        let next = last.player.right;
        let safety = 0;
        while (
            next &&
            next.death &&
            next.rest <= 0 &&
            safety < this.players.length
        ) {
            next = next.right!;
            safety++;
        }
        return next ? next : this.alives[0];
    }

    /**
     * 结束游戏。
     * @param wins 获胜方（空数组表示平局）
     * @param reason 结束原因（如 'mode_not_found' 表示模式不存在）
     */
    async gameOver(wins: Player[], reason: string): Promise<void> {
        this._gameState = 'ending';
        this.logger.info(
            `gameOver wins=${wins.map((p) => p.playerId).join(',') || '(draw)'} reason=${reason}`,
        );
        await this.event.trigger(TimingName.GameEnd, { wins, reason });
        this.extraTurns.length = 0;
        this.turnStack.length = 0;
        this.phaseStack.length = 0;
        // TODO Phase 9: 广播 GameOver 消息 + 战果
    }

    /** 记录事件到历史 */
    insertHistory(event: EventProcess): void {
        this._history.push(event);
    }

    /** 查询最后一个指定类型的历史事件 */
    getLastOneHistory<T extends EventProcess>(
        type: string,
        filter?: (event: T) => boolean,
    ): T | undefined {
        for (let i = this._history.length - 1; i >= 0; i--) {
            const e = this._history[i];
            if (e.type === type && (!filter || filter(e as T))) return e as T;
        }
        return undefined;
    }

    constructor(
        roomId: string,
        gameId: string,
        options: RoomOption,
        state: RoomState,
        input: IPlayerInput,
        logger: ILogger,
    ) {
        this.state = state;
        this.state.roomId = roomId;
        this.game = state.game;
        this.game.gameId = gameId;
        this.options = options;
        this.marksMap = state.game.markStates;
        this._input = input;
        this.logger = logger;
    }
}
