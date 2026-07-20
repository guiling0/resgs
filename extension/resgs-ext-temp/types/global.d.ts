/**
 * sgs 全局类型声明（全量）。
 * 由 scripts/build-types.ts 自动生成——勿手动编辑。
 * 生成时间：2026-07-20T18:31:08.627Z
 * 源文件：55 个 .d.ts
 */

/** CardBuilder 实例接口——构建实体牌数据，不负责注册 */
declare interface CardBuilder {
    readonly name: string;
    suit(s: CardSuit): this;
    number(n: CardNumber): this;
    attr(a: CardAttr[]): this;
    derived(d?: boolean): this;
    /** 构建 GameCardData（id 由 registerCards 分配） */
    build(): GameCardData;
}
/** CardBuilder 工厂——无需 new */
declare function CardBuilder(name: string): CardBuilder;

declare interface ICard {
    name: string;
    attr: CardAttr[];
    type: CardType;
    subtype: CardSubType;
}
declare function hasAttr(this: ICard, attr: CardAttr): boolean;
declare function isCommonSha(this: ICard): boolean;
declare function isDamageCard(this: ICard): boolean;
declare function isRecoverCard(this: ICard): boolean;
declare function isBasic(this: ICard): boolean;
declare function isScroll(this: ICard): boolean;
declare function isEquip(this: ICard): boolean;
declare function isDelayedScroll(this: ICard): boolean;
declare function isInstantScroll(this: ICard): boolean;
declare function isWeapon(this: ICard): boolean;
declare function isArmor(this: ICard): boolean;
declare function isDefensiveMount(this: ICard): boolean;
declare function isOffensiveMount(this: ICard): boolean;
declare function isSpecialMount(this: ICard): boolean;
declare function isTreasure(this: ICard): boolean;
declare function isMount(this: ICard): boolean;
declare const CardMethods: {
    hasAttr: typeof hasAttr;
    isCommonSha: typeof isCommonSha;
    isDamageCard: typeof isDamageCard;
    isRecoverCard: typeof isRecoverCard;
    isBasic: typeof isBasic;
    isScroll: typeof isScroll;
    isEquip: typeof isEquip;
    isDelayedScroll: typeof isDelayedScroll;
    isInstantScroll: typeof isInstantScroll;
    isWeapon: typeof isWeapon;
    isArmor: typeof isArmor;
    isDefensiveMount: typeof isDefensiveMount;
    isOffensiveMount: typeof isOffensiveMount;
    isSpecialMount: typeof isSpecialMount;
    isTreasure: typeof isTreasure;
    isMount: typeof isMount;
};
declare;
{
}

/** 实体牌ID——格式：{扩展名}.{自增序号}，保证跨扩展不冲突 */
declare type GameCardId = string;
/** 虚拟牌ID */
declare type VirtualCardId = number;
/** 牌放置方式 */
declare type CardPut = boolean;
/** 区域ID */
declare type AreaId = string;
/** 实体牌数据 */
declare interface GameCardData {
    id: GameCardId;
    /** 卡牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色 */
    color?: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性 */
    attr: CardAttr[];
    /** 是否为衍生牌 */
    derived: boolean;
}
declare interface CardData {
    /** 卡牌名 */
    name: string;
    /** 卡牌类别 */
    type: CardType;
    /** 卡牌副类别 */
    subtype: CardSubType;
    /** 是否为伤害卡牌 */
    damage: boolean;
    /** 是否为回复类卡牌 */
    recover: boolean;
    /** 牌名字数 */
    length: number;
    /** 韵脚 */
    rhyme: string;
    /** 卡牌技术分 */
    score: [number, number, number];
    /** 简略牌名 */
    acronym: string;
    /** 装备牌在装备栏最开始显示的内容 */
    equiptip: string;
    /** 卡牌图 */
    image?: string;
    /** 卡牌配音文件名 */
    audio?: string;
    /** 卡牌名翻译 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}
declare interface SourceData {
    id: GameCardId;
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
}
declare interface VirtualSourceData {
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
}
declare interface VirtualCardData {
    name: string;
    suit: CardSuit;
    color: CardColor;
    number: CardNumber;
    attr: CardAttr[];
    subcards: GameCardId[];
    data: Record<string, any>;
}
/** 卡牌属性 */
declare enum CardAttr {
    /** 火属性 杀专属*/
    Fire = 1,
    /** 雷属性 杀专属*/
    Thunder = 2,
    /** 国属性 国战无懈可击专属 */
    Country = 3,
    /** 可重铸 */
    Recastable = 4,
    /** 可合纵 */
    Transferable = 5,
    /** 鏖战 */
    Aozhan = 6,
}
/** 卡牌花色 */
declare enum CardSuit {
    None = 0,
    /** 黑桃 */
    Spade = 1,
    /** 红桃 */
    Heart = 2,
    /** 梅花 */
    Club = 3,
    /** 方片 */
    Diamond = 4,
}
/** 卡牌点数 */
declare enum CardNumber {
    None = -1,
    JOKER_BLACK = 0,
    A = 1,
    Number2 = 2,
    Number3 = 3,
    Number4 = 4,
    Number5 = 5,
    Number6 = 6,
    Number7 = 7,
    Number8 = 8,
    Number9 = 9,
    Number10 = 10,
    J = 11,
    Q = 12,
    K = 13,
    JOKER_RED = 14,
}
/** 卡牌颜色 */
declare enum CardColor {
    None = 0,
    /** 红色 */
    Red = 1,
    /** 黑色 */
    Black = 2,
}
/** 卡牌类别 */
declare enum CardType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 锦囊牌 */
    Scroll = 2,
    /** 装备牌 */
    Equip = 3,
}
/** 装备牌副类别 */
declare enum EquipSubType {
    None = 0,
    /** 武器 */
    Weapon = 31,
    /** 防具 */
    Armor = 32,
    /** 防御坐骑 */
    DefensiveMount = 33,
    /** 进攻坐骑 */
    OffensiveMount = 34,
    /** 特殊坐骑 */
    SpecialMount = 35,
    /** 宝物 */
    Treasure = 36,
}
/** 卡牌副类别 */
declare enum CardSubType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 非延时锦囊牌 */
    InstantScroll = 21,
    /** 延时锦囊牌 */
    DelayedScroll = 22,
    /** 武器 */
    Weapon = 31,
    /** 防具 */
    Armor = 32,
    /** 防御坐骑 */
    DefensiveMount = 33,
    /** 进攻坐骑 */
    OffensiveMount = 34,
    /** 特殊坐骑 */
    SpecialMount = 35,
    /** 宝物 */
    Treasure = 36,
}
declare enum AreaType {
    Unknown = 'unknown',
    /** 牌堆 */
    Draw = 'draw',
    /** 弃牌堆 */
    Discard = 'discard',
    /** 处理区 */
    Processing = 'processing',
    /** 仓廪 */
    Granary = 'granary',
    /** 府库 */
    Treasury = 'treasury',
    /** 后备区 */
    Reserve = 'reserve',
    /** 手牌区 */
    Hand = 'hand',
    /** 装备区 */
    Equip = 'equip',
    /** 判定区 */
    Judge = 'judge',
    /** 武将牌上 */
    Up = 'up',
    /** 武将牌旁 */
    Side = 'side',
}
/** 根据花色获取颜色 */
declare function getColorBySuit(suit: CardSuit): CardColor;
/** 获取卡牌类别 */
declare function getCardType(
    name: string,
): CardType.Basic | CardType.Scroll | CardType.Equip;
/** 获取卡牌副类别 */
declare function getCardSubType(
    name: string,
):
    | CardSubType.Basic
    | CardSubType.InstantScroll
    | CardSubType.DelayedScroll
    | CardSubType.Weapon
    | CardSubType.Armor
    | CardSubType.DefensiveMount
    | CardSubType.OffensiveMount
    | CardSubType.SpecialMount
    | CardSubType.Treasure;

declare class GameCard implements MarkHost, ICard {
    readonly id: GameCardId;
    readonly room: Room;
    readonly _jsonData: GameCardData;
    readonly state: CardState;
    readonly data: Record<string, any>;
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap: Map<string, Set<string>>;
    readonly sourceData: {
        id: GameCardId;
        name: string;
        suit: CardSuit;
        color: CardColor;
        number: CardNumber;
        attr: CardAttr[];
    };
    vcard?: VirtualCard;
    constructor(data: GameCardData, room: Room, state: CardState);
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    get name(): string;
    get suit(): CardSuit;
    get color(): CardColor;
    get number(): CardNumber;
    get attr(): CardAttr[];
    get type():
        | import('./CardTypes').CardType.Basic
        | import('./CardTypes').CardType.Scroll
        | import('./CardTypes').CardType.Equip;
    get subtype():
        | import('./CardTypes').CardSubType.Basic
        | import('./CardTypes').CardSubType.InstantScroll
        | import('./CardTypes').CardSubType.DelayedScroll
        | import('./CardTypes').CardSubType.Weapon
        | import('./CardTypes').CardSubType.Armor
        | import('./CardTypes').CardSubType.DefensiveMount
        | import('./CardTypes').CardSubType.OffensiveMount
        | import('./CardTypes').CardSubType.SpecialMount
        | import('./CardTypes').CardSubType.Treasure;
    get derived(): boolean;
    get area(): AreaId;
    get put(): boolean;
    setArea(area: AreaId): void;
    turnTo(put: boolean): void;
    setLabel(label: RichString, area?: string): void;
    hasAttr: (this: ICard, attr: CardAttr) => boolean;
    isCommonSha: (this: ICard) => boolean;
    isDamageCard: (this: ICard) => boolean;
    isRecoverCard: (this: ICard) => boolean;
    isBasic: (this: ICard) => boolean;
    isScroll: (this: ICard) => boolean;
    isEquip: (this: ICard) => boolean;
    isDelayedScroll: (this: ICard) => boolean;
    isInstantScroll: (this: ICard) => boolean;
    isWeapon: (this: ICard) => boolean;
    isArmor: (this: ICard) => boolean;
    isDefensiveMount: (this: ICard) => boolean;
    isOffensiveMount: (this: ICard) => boolean;
    isSpecialMount: (this: ICard) => boolean;
    isTreasure: (this: ICard) => boolean;
    isMount: (this: ICard) => boolean;
    formatVirtualCardData(source?: boolean): VirtualCardData;
}

declare class VirtualCard implements ICard {
    readonly name: string;
    readonly sourceData: VirtualSourceData;
    readonly subcards: GameCard[];
    readonly data: Record<string, any>;
    /** 是否已销毁 */
    destroyed: boolean;
    /** 通过转化使用或打出的技能效果 */
    transform: any;
    /** 使用或打出的来源 */
    usefrom: any;
    constructor(
        name: string,
        cards?: GameCard[],
        overrides?: Partial<SourceData>,
        record?: boolean,
    );
    addSubCards(cards: GameCard[]): void;
    delSubCard(card: GameCard): void;
    clearSubCards(): void;
    hasSubCards(): boolean;
    /** 实体牌 ID 列表 */
    get cardIds(): string[];
    get suit(): CardSuit;
    get color(): CardColor;
    get number(): CardNumber;
    get attr(): CardAttr[];
    get type():
        | import('./CardTypes').CardType.Basic
        | import('./CardTypes').CardType.Scroll
        | import('./CardTypes').CardType.Equip;
    get subtype():
        | import('./CardTypes').CardSubType.Basic
        | import('./CardTypes').CardSubType.InstantScroll
        | import('./CardTypes').CardSubType.DelayedScroll
        | import('./CardTypes').CardSubType.Weapon
        | import('./CardTypes').CardSubType.Armor
        | import('./CardTypes').CardSubType.DefensiveMount
        | import('./CardTypes').CardSubType.OffensiveMount
        | import('./CardTypes').CardSubType.SpecialMount
        | import('./CardTypes').CardSubType.Treasure;
    /**
     * 设置虚拟牌属性
     * @param param0 需要修改的属性
     * @param update 未提供的属性是否更新默认属性
     */
    refresh(
        { suit, color, number, attr }?: Omit<Partial<SourceData>, 'name'>,
        update?: boolean,
    ): void;
    protected defaultSuit(): CardSuit;
    protected defaultColor(): CardColor;
    protected defaultNumber(): -1 | CardNumber;
    hasAttr: (this: ICard, attr: CardAttr) => boolean;
    isCommonSha: (this: ICard) => boolean;
    isDamageCard: (this: ICard) => boolean;
    isRecoverCard: (this: ICard) => boolean;
    isBasic: (this: ICard) => boolean;
    isScroll: (this: ICard) => boolean;
    isEquip: (this: ICard) => boolean;
    isDelayedScroll: (this: ICard) => boolean;
    isInstantScroll: (this: ICard) => boolean;
    isWeapon: (this: ICard) => boolean;
    isArmor: (this: ICard) => boolean;
    isDefensiveMount: (this: ICard) => boolean;
    isOffensiveMount: (this: ICard) => boolean;
    isSpecialMount: (this: ICard) => boolean;
    isTreasure: (this: ICard) => boolean;
    isMount: (this: ICard) => boolean;
    toData(): VirtualCardData;
}

/**
 * 根据数据形状推断 ChangeState 的子类型。
 *
 * 推断规则（按唯一字段组合）：
 * - `toGeneral` 存在       → Change
 * - `general` 存在         → Remove
 * - `damageType` 存在      → Chain
 * - `toState` + `generals` → Open/Close（toState=true→Open, false→Close）
 * - `toState` 单独存在     → Skip
 */
declare function detectChangeStateType(data: ChangeStateData): ChangeStateType;
/**
 * 牌/武将状态改变事件。统一处理 6 种状态变更：
 *   Open（明置）、Close（暗置）、Chain（横置）、Skip（翻面）、Change（变更）、Remove（移除）
 *
 * 执行流程：
 *   ChangeState → ChangeStateAfter → ChangeStateEnd（公共）
 *   Open 额外在 _onChangeStateAfter 中将事件推入 room.deferredOpens
 */
declare class ChangeStateEvent extends EventProcess<ChangeStateType> {
    constructor(
        room: Room,
        data: ChangeStateData & {
            _type?: ChangeStateType;
        },
    );
    get player(): Player;
    private _buildTriggers;
    check(): boolean;
    /** ChangeStateAfter Before：执行实际状态变更 */
    private _onChangeStateAfter;
    private _applyOpen;
    private _applyClose;
    private _applyChain;
    private _applySkip;
    private _applyChange;
    private _applyRemove;
    /** 防止状态改变。仅在 ChangeState 时机可调用。 */
    prevent(): Promise<this>;
    private _checkToggle;
    private _checkGeneralFilter;
    private _setPlayerGeneral;
}

/**
 * 伤害事件。
 *
 * 执行流程：
 *   DamageStart → DamageCause1 → DamageCause2 → DamageInflict1 → DamageInflict2
 *   → DamageInflict3 → DamageCauseAfter（扣减体力）→ DamageInflictAfter → DamageEnd
 */
declare class DamageEvent extends EventProcess<EventType.Damage> {
    constructor(room: Room, data: DamageEventData);
    /** 伤害来源 */
    get player(): Player;
    set player(v: Player);
    /** 受到伤害的角色 */
    get target(): Player;
    set target(v: Player);
    get damageType(): DamageType;
    set damageType(v: DamageType);
    /** 伤害值 */
    get number(): number;
    set number(v: number);
    /** 伤害渠道（卡牌或效果名） */
    get channel(): VirtualCard | string | undefined;
    set channel(v: VirtualCard | string | undefined);
    /** 是否为连环伤害 */
    get isChain(): boolean;
    set isChain(v: boolean);
    triggerChain?: boolean;
    private _buildTriggers;
    /** CauseDamaged 之前：执行扣减体力 */
    private _onCauseDamaged;
    /** DamageEnd 之后：处理复活队列 + 连环传导 */
    private _onDamageEnd;
    check(): boolean;
    checkEvent(): boolean;
    /**
     * 防止伤害。
     * 仅在 DamageStart / Cause1-2 / Inflict1-3 期间可调用。
     */
    prevent(): Promise<this>;
    /**
     * 转移伤害。
     * 仅在防止伤害时机内可调用，且目标不能是自身。
     */
    transfer(to: Player): Promise<this>;
}
/**
 * 失去体力事件。
 *
 * 执行流程：
 *   LoseHpStart → LoseHp → LoseHpEnd
 */
declare class LoseHpEvent extends EventProcess<EventType.LoseHp> {
    constructor(room: Room, data: LoseHpEventData);
    /** 失去体力的角色 */
    get player(): Player;
    set player(v: Player);
    /** 失去体力的数值 */
    get number(): number;
    set number(v: number);
    private _buildTriggers;
    /** LoseHp 之前：执行扣减体力 */
    private _onLoseHp;
    /** LoseHpEnd 之后：处理复活队列 */
    private _onLoseHpEnd;
    check(): boolean;
    checkEvent(): boolean;
    /**
     * 防止失去体力。
     * 仅在 LoseHpStart 期间可调用。
     */
    prevent(): Promise<this>;
}
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
declare class ReduceHpEvent extends EventProcess<EventType.ReduceHp> {
    constructor(room: Room, data: ReduceHpEventData);
    /** 扣减体力的角色 */
    get player(): Player;
    set player(v: Player);
    /** 扣减数值 */
    get number(): number;
    set number(v: number);
    /**
     * 覆写 init() 以确保连环处理在 source 赋值之后、所有 timing 之前执行。
     */
    protected init(): Promise<void>;
    /** 处理连环状态的解除与传导标记。必须在 init() 中调用，早于所有时机。 */
    private _handleChain;
    private _buildTriggers;
    /**
     * ReduceHpAfter 之后：实际修改 HP、护盾，广播动画，记录历史。
     */
    private _onReduceHpAfter;
    /**
     * ReduceHpEnd 之后：检查是否需要进入濒死。
     */
    private _onReduceHpEnd;
    check(): boolean;
    checkEvent(): boolean;
    /** 获取关联的伤害事件 */
    private _getDamage;
    /** 获取关联的失去体力事件 */
    private _getLoseHp;
}

/**
 * 濒死事件。
 *
 * 执行流程：
 *   DyingEntry → DyingEntryAfter → Dying（求桃）→ DyingEnd
 *   → 若 hp 仍 ≤0 则创建 DeathEvent（包含 killer）
 */
declare class DyingEvent extends EventProcess<EventType.Dying> {
    constructor(room: Room, data: DyingEventData);
    get player(): Player;
    /** 造成濒死的角色 */
    get killer(): Player | undefined;
    set killer(v: Player | undefined);
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    checkEvent(): boolean;
    /** Dying 之前：求桃阶段 */
    private _onDying;
    /** DyingEnd 之后：若未救活则追溯 killer 并进入死亡 */
    private _onDyingEnd;
    /**
     * 从事件链追溯造成濒死的角色：
     *   DyingEvent.source(reason=dying_reducehp) → ReduceHp(reason=reducehp) → DamageEvent.player
     */
    private _findKiller;
}
/**
 * 死亡事件。
 *
 * 执行流程：
 *   DeathBefore → DeathConfirmRole → Death → DeathAfter → DeathEnd
 */
declare class DeathEvent extends EventProcess<EventType.Death> {
    constructor(room: Room, data: DeathEventData);
    get player(): Player;
    /** 击杀者（优先使用 DyingEvent 传入的值） */
    get killer(): Player | undefined;
    set killer(v: Player | undefined);
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    /** ConfirmRole 之前：确认身份、确定击杀者、广播死亡 */
    private _onConfirmRole;
    /** DeathAfter 之后：弃置所有牌、清除标记 */
    private _onDeathAfter;
    /** DeathEnd 之后：移除该角色所有技能和效果 */
    private _onDeathEnd;
    private _deathLog;
}

/**
 * 创建 Timing 对象的便捷工厂。
 * 供所有 EventProcess 子类使用，避免在每个事件文件中重复定义。
 */
declare function createTiming(
    name: TimingName,
    before?: Array<(room: Room, data: any) => Promise<void>>,
    after?: Array<(room: Room, data: any) => Promise<void>>,
): Timing;
/**
 * 事件执行基类。
 * 子类在构造函数中填充 eventTriggers / endTriggers（Timing[]），
 * exec() 按顺序执行各时机，before → trigger → after。
 */
declare abstract class EventProcess<T extends EventType = EventType> {
    /** 所属房间 */
    readonly room: Room;
    /** 事件类型 */
    readonly type: T;
    /** 事件自增 ID */
    readonly id: number;
    /** 预设事件数据（由 EventDataMap 类型推导） */
    readonly eventData: EventData<T>;
    /** 进行中的时机序列 */
    eventTriggers: Timing[];
    /** 结束时的时机序列 */
    endTriggers: Timing[];
    /** 当前触发时机名 */
    trigger?: TimingName;
    /** 是否已结束（开始执行 endTriggers） */
    isEnd: boolean;
    /** 是否完全完成（已 cleanup） */
    isComplete: boolean;
    /** 是否允许继续触发（设为 false 跳过后续 trigger） */
    triggerable: boolean;
    /** 是否跳过触发（业务逻辑跳过，区别于 triggerable） */
    triggerNot: boolean;
    /** 父事件 */
    source?: EventProcess;
    /** 运行时自定义数据 */
    data: Record<string, any>;
    /** 子事件（MoveCardEvent）移动到处理区的牌及其原因。processCompleted 中通过 MoveCardEvent 清理 */
    private _processingCards;
    /** 子事件（MoveCardEvent）将牌移动到处理区时回调。基类自动收集，子类无需覆写 */
    _trackProcessingCard(card: GameCard, reason: string): void;
    constructor(room: Room, type: T, eventData: EventData<T>);
    /** 事件合法性检查（返回 false 则不执行） */
    check(): boolean;
    /** 每轮触发前检查是否继续 */
    checkEvent(): boolean;
    /** 初始化：设置 source → 推入事件栈。Turn→turnStack, Phase→phaseStack。 */
    protected init(): Promise<void>;
    /** 主执行循环 */
    exec(): Promise<this>;
    /** 触发单个时机：注入 refreshs → before → trigger → after */
    triggerFunc(timing: Timing, step?: number): Promise<void>;
    /** 将 room.refreshsByTiming 中匹配的 refreshs 注入到 Timing 的 before/after */
    private injectRefreshs;
    /** 事件完成后的清理 */
    processCompleted(): Promise<void>;
    /**
     * 在时机序列中插入新时机。
     * @param timings 插入的时机（TimingName 会自动构建为无回调的 Timing）
     * @param appoint 在此时机名之后插入，不指定则插到最前
     */
    insert(timings: (TimingName | Timing)[], appoint?: string): void;
    /**
     * 在指定时机的 before 列表中注册回调。
     * 若该时机不存在则自动创建。
     * @param fn 回调函数，this 指向当前事件实例
     */
    registerBefore(
        timingName: string,
        fn: (room: Room, data: any) => Promise<any>,
    ): void;
    /**
     * 在指定时机的 after 列表中注册回调。
     * 若该时机不存在则自动创建。
     * @param fn 回调函数，this 指向当前事件实例
     */
    registerAfter(
        timingName: string,
        fn: (room: Room, data: any) => Promise<any>,
    ): void;
    /** 从 before/after 中移除指定回调（需传入原始未 bind 的函数引用） */
    removeCallback(timingName: string, fn: (...args: any[]) => any): void;
    /** 包装 bind 并标记原始函数引用，便于后续 remove */
    protected bindWithMark(
        fn: Function,
    ): (room: Room, data: any) => Promise<any>;
    /** 查找或创建一个 Timing（优先查 eventTriggers，再查 endTriggers） */
    private findOrCreate;
    end(): Promise<this>;
    /** 强制完成事件 */
    complete(): Promise<this>;
}

declare enum TimingName {
    GameStageBefore = 'game_stage_before', // 登场前
    GameStage = 'game_stage', // 登场时
    GameStageAfter = 'game_stage_after', // 登场后
    GameStartBefore = 'game_start_before', // 游戏开始前
    GameStart = 'game_start', // 游戏开始
    GameEnd = 'game_end', // 游戏结束
    RoundStart = 'round_start', // 轮次开始
    RoundEnd = 'round_end', // 轮次结束
    RestStart = 'rest_start', // 休整开始
    RestEnd = 'rest_end', // 休整结束
    TurnStartBefore = 'turn_start_before', // 回合开始前
    TurnStart = 'turn_start', // 回合开始
    TurnStartAfter = 'turn_start_after', // 回合开始后
    TurnEnd = 'turn_end', // 回合结束
    TurnEndAfter = 'turn_end_after', // 回合结束后
    ReadyPhaseStartBefore = 'ready_start_before', // 准备阶段开始前
    ReadyPhaseStart = 'ready_start', // 准备阶段开始
    ReadyPhase = 'ready_phase', // 准备阶段
    ReadyPhaseEnd = 'ready_end', // 准备阶段结束
    JudgePhaseStartBefore = 'judge_start_before', // 判定阶段开始前
    JudgePhaseStart = 'judge_start', // 判定阶段开始
    JudgePhase = 'judge_phase', // 判定阶段
    JudgePhaseEnd = 'judge_phase_end', // 判定阶段结束
    DrawPhaseStartBefore = 'draw_start_before', // 摸牌阶段开始前
    DrawPhaseStart1 = 'draw_start1', // 摸牌阶段开始1
    DrawPhaseStart2 = 'draw_start2', // 摸牌阶段开始2
    DrawPhase = 'draw_phase', // 摸牌阶段
    DrawPhaseEnd = 'draw_end', // 摸牌阶段结束
    PlayPhaseStartBefore = 'play_start_before', // 出牌阶段开始前
    PlayPhaseStart = 'play_start', // 出牌阶段开始
    PlayPhase = 'play_phase', // 出牌阶段
    PlayPhaseEnd = 'play_end', // 出牌阶段结束
    DiscardPhaseStartBefore = 'discard_start_before', // 弃牌阶段开始前
    DiscardPhaseStart = 'discard_start', // 弃牌阶段开始
    DiscardPhase = 'discard_phase', // 弃牌阶段
    DiscardPhaseEnd = 'discard_end', // 弃牌阶段结束
    EndPhaseStartBefore = 'end_start_before', // 结束阶段开始前
    EndPhaseStart = 'end_start', // 结束阶段开始
    EndPhase = 'end_phase', // 结束阶段
    EndPhaseEnd = 'end_end', // 结束阶段结束
    MoveCardFixed = 'movecard_fixed', // 固定移动牌
    MoveCardBefore1 = 'movecard_before1', // 移动牌前1
    MoveCardBefore2 = 'movecard_before2', // 移动牌前2
    MoveCardAfter1 = 'movecard_after1', // 移动牌后1
    MoveCardAfter2 = 'movecard_after2', // 移动牌后2
    MoveCardEnd = 'movecard_end', // 移动牌结束
    UseCardNeed1 = 'usecard_need1', // 需要使用牌1
    UseCardNeed2 = 'usecard_need2', // 需要使用牌2
    UseCardDeclare = 'usecard_declare', // 声明使用牌
    UseCardDeclareAfter = 'usecard_declare_after', // 声明使用牌后
    UseCardChooseTarget = 'usecard_choose_target', // 选择使用牌目标
    UseCardUsed = 'usecard_used', // 牌被使用时
    UseCardAssignTarget = 'usecard_assign_target', // 指定目标时
    UseCardBecomeTarget = 'usecard_become_target', // 成为目标时
    UseCardAssignTargetAfter = 'usecard_assign_target_after', // 指定目标后
    UseCardBecomeTargetAfter = 'usecard_become_target_after', // 成为目标后
    UseCardReady = 'usecard_ready', // 使用结算准备工作结束时
    UseCardEffectStart = 'usecard_effect_start', // 对当前目标结算开始时
    UseCardEffectBefore = 'usecard_effect_before', // 对当前目标生效前
    UseCardOffset = 'usecard_offset', // 被抵消后
    UseCardEffect = 'usecard_effect', // 对当前目标生效时
    UseCardEffectAfter = 'usecard_effect_after', // 对当前目标生效后
    UseCardEnd1 = 'usecard_end1', // 使用结算结束后1
    UseCardEnd2 = 'usecard_end2', // 使用结算结束后2
    UseCardEnd3 = 'usecard_end3', // 使用结算结束后3
    DropCardNeed1 = 'dropcard_need1', // 需要打出牌时1
    DropCardNeed2 = 'dropcard_need2', // 需要打出牌时2
    DropCardDeclare = 'dropcard_declare', // 声明打出牌
    DropCardDroped = 'dropcard_droped', // 打出牌后
    DropCardEnd = 'dropcard_end', // 打出牌结束
    Pindian = 'pindian', // 拼点时
    PindianCardShow = 'pindian_card_show', //拼点牌被亮出时
    PindianResult = 'pindian_result', //拼点结果确定后
    PindianEnd = 'pindian_end', //拼点结算结束后
    ChangeState = 'change_state', // 牌状态改变时
    ChangeStateAfter = 'change_state_after', // 牌状态改变后
    Open = 'open', // 明置后
    Judge = 'judge', // 判定时
    JudgeCard = 'judge_card', // 成为判定牌后
    JudgeResult1 = 'judge_result1', // 判定结果确定前1
    JudgeResult2 = 'judge_result2', // 判定结果确定前2
    JudgeResultAfter1 = 'judge_result_after1', // 判定结果确定后1
    JudgeResultAfter2 = 'judge_result_after2', // 判定结果确定后2
    JudgeEnd = 'judge_end', // 判定结算结束后
    DamageStart = 'damage_start', // 伤害开始
    DamageCause1 = 'damage_cause1', // 造成伤害时1
    DamageCause2 = 'damage_cause2', // 造成伤害时2
    DamageInflict1 = 'damage_inflict1', // 受到伤害时1
    DamageInflict2 = 'damage_inflict2', // 受到伤害时2
    DamageInflict3 = 'damage_inflict3', // 受到伤害时3
    DamageCauseAfter = 'damage_cause_after', // 造成伤害后
    DamageInflictAfter = 'damage_inflict_after', // 受到伤害后
    DamageEnd = 'damage_end', // 伤害结算结束后
    LoseHpStart = 'losehp_start', // 失去体力开始
    LoseHp = 'losehp', // 失去体力时
    LoseHpAfter = 'losehp_after', // 失去体力后
    LoseHpEnd = 'losehp_end', // 失去体力结束
    ReduceHpStart = 'reducehp_start', // 扣减体力开始
    ReduceHp = 'reducehp', // 扣减体力时
    ReduceHpAfter = 'reducehp_after', // 扣减体力后
    ReduceHpEnd = 'reducehp_end', // 扣减体力结束
    RecoverHpStart = 'recoverhp_start', // 回复体力开始
    RecoverHp = 'recoverhp', // 回复体力时
    RecoverHpAfter = 'recoverhp_after', // 回复体力后
    RecoverHpEnd = 'recoverhp_end', // 回复体力结束
    ChangeMaxHpStart = 'change_maxhp_start', // 体力上限改变开始
    ChangeMaxHp = 'change_maxhp', // 体力上限改变时
    ChangeMaxHpAfter = 'change_maxhp_after', // 体力上限改变后
    ChangeMaxHpEnd = 'change_maxhp_end', // 体力上限改变结束
    DyingEntry = 'dying_entry', // 进入濒死状态时
    DyingEntryAfter = 'dying_entry_after', // 进入濒死状态后
    Dying = 'dying', // (连续若干个)处于濒死状态时
    DyingEnd = 'dying_end', // 濒死结束
    DeathBefore = 'death_before', // 死亡前
    DeathConfirmRole = 'death_confirm_role', // 确认死亡角色
    Death = 'death', // 死亡时
    DeathAfter = 'death_after', // 死亡后
    DeathEnd = 'death_end', // 死亡结束
    SkillObtain = 'skill_obtain', // 获得技能时
    SkillLose = 'skill_lose', // 失去技能时
    EffectObtain = 'effect_obtain', // 获得效果时
    EffectLose = 'effect_lose', // 失去效果时
    Cost = 'cost', // 执行消耗后
    Effect = 'effect', // 发动技能后
    EventEnd = 'event_end', // 事件结束
    AllEventEnd = 'all_event_end',
}
declare type TimingTrigger = TimingName | string;
declare enum EventType {
    Ready = 'Ready',
    Turn = 'Turn',
    Phase = 'Phase',
    Move = 'Move',
    UseCard = 'UseCard',
    UseCardToCard = 'UseCardToCard',
    UseCardSpecial = 'UseCardSpecial',
    DropCard = 'DropCard',
    Pindian = 'Pindian',
    Open = 'Open',
    Close = 'Close',
    Chain = 'Chain',
    Skip = 'Skip',
    Change = 'Change',
    Remove = 'Remove',
    Judge = 'Judge',
    Damage = 'Damage',
    LoseHp = 'LoseHp',
    ReduceHp = 'ReduceHp',
    RecoverHp = 'RecoverHp',
    ChangeMaxHp = 'ChangeMaxHp',
    Dying = 'Dying',
    Death = 'Death',
    UseSkill = 'UseSkill',
}
declare interface ReadyEventData {}
declare interface TurnEventData {
    turnId: number;
    player: Player;
    isExtraTurn: boolean;
    isSkipped: boolean;
    phases: {
        player?: Player;
        phase: Phase;
        isExtraPhase: boolean;
    }[];
    skippedPhases: Phase[];
    isRoundStart: boolean;
    isRoundEnd: boolean;
}
declare interface PhaseEventData {
    phaseId: number;
    player: Player;
    phase: Phase;
    isExtraPhase: boolean;
    drawCount: number;
}
/** 单条移动数据 — 描述一批卡牌的移动方式 */
declare interface MoveCardData {
    /** 移动主体 */
    player?: Player;
    /** 移动的卡牌 */
    cards: GameCard[];
    /** 原区域（自动赋值为卡牌所在区域，提供后仅移动该区域的牌） */
    fromArea?: AreaId;
    /** 目标区域 */
    toArea: AreaId;
    /** 目标区域存放位置（详见 AreaManager.add 的 pos） */
    pos?: 'top' | 'bottom' | 'random' | number;
    /** 移动原因（draw/discard/obtain...，默认 'put'） */
    reason?: string;
    /** 移动方式（true=正面朝上, false=背面朝上, 默认卡牌当前放置方式） */
    moveType?: boolean;
    /** 放置方式（到目标区域后的放置方式，默认手牌区=false 其他=true） */
    putType?: boolean;
    /** 是否播放动画（默认true，仅客户端用） */
    animation?: boolean;
    /** 动画可见角色（默认[]=全部可见，仅客户端用） */
    visiblePlayers?: Player[];
    /** 移动后牌的可见角色（暂未实现） */
    cardVisiblePlayers?: Player[];
    /** 移动后为每张牌执行的操作 */
    handler?: (card: GameCard) => Promise<void>;
    /** 标签文本（仅客户端用） */
    label?: RichString;
    /** 战报文本（仅客户端用） */
    log?: RichString;
    /** 是否同时将log进行提示（仅客户端用） */
    toast?: boolean;
    /** 视为信息（仅客户端用） */
    viewas?: VirtualCardData;
    /** 自定义数据 */
    _data?: Record<string, any>;
}
/** moveCards 快捷方法的可选参数（MoveCardData 除去 cards/toArea/player/fromArea） */
declare interface MoveCardOpts {
    player?: Player;
    reason?: string;
    pos?: 'top' | 'bottom' | 'random' | number;
    moveType?: boolean;
    putType?: boolean;
    animation?: boolean;
    visiblePlayers?: Player[];
    cardVisiblePlayers?: Player[];
    handler?: (card: GameCard) => Promise<void>;
    label?: RichString;
    log?: RichString;
    toast?: boolean;
    viewas?: VirtualCardData;
    _data?: Record<string, any>;
}
/** 移动事件数据 — 可包含多条移动，每条描述一批卡牌的移动方式 */
declare interface MoveEventData {
    /** 移动数据列表 */
    datas: MoveCardData[];
    /** 获取移动标签（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString;
    /** 获取战报文本（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString;
}
declare interface TargetEntry {
    /** 自增 ID——仅用于同玩家时稳定排序，不回写 */
    index: number;
    /** 目标角色 */
    target: Player;
    /** 借刀子目标（不进目标列表、不触发 assign/become 时机） */
    subTargets?: Player[];
    /** 此牌对此目标无效（跳过生效时机） */
    invalid?: boolean;
    /** 抵消此牌的事件（闪/无懈 → 使用流程结束，M3 接线） */
    offset?: any;
    /** 生效次数（默认取事件的 effectTimes，可单独修改） */
    effectTimes?: number;
    /** 已结算次数 */
    settleCount?: number;
}
/** 统一的使用牌事件数据（替代旧三子类） */
declare interface UseCardEventData {
    /** 使用者 */
    player: Player;
    /** 目标角色列表 */
    targets: Player[];
    /** 使用的虚拟牌 */
    card: VirtualCard;
    /** 不播放指向线 */
    noPlayDirectLine?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
    /** 是否自动排序目标角色 默认为true */
    autoSort?: boolean;
    /** 采用顺时针结算 默认为false（逆时针） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 未实现 */
    effectCorrection?: any;
    /** 每个目标的默认生效次数（默认 1） */
    effectTimes?: number;
    /** 结算次数 */
    settleCount?: number;
    /** 伤害值基数 */
    damageBase?: number;
    /** 回复值基数 */
    recoverBase?: number;
    /** 是否为第一个目标 */
    isFirstTarget?: boolean;
    /** 目标角色对应关系 */
    targetList?: TargetEntry[];
    /** 当前结算目标索引 */
    settleTarget?: number;
}
/** @deprecated 统一为 UseCardEventData + TargetEntry；M3 实现时删除 */
declare interface UseCardToCardEventData {
    player: Player;
    targets: VirtualCard;
    card: VirtualCard;
    forcePlayCardVoice?: boolean;
    effectCorrection?: any;
    targetList?: TargetEntry[];
    settleTarget?: number;
}
/** @deprecated 统一为 UseCardEventData + TargetEntry；M4 实现时删除 */
declare interface UseCardSpecialEventData {
    targets: Player;
    card: VirtualCard;
    targetList?: TargetEntry[];
    settleTarget?: number;
}
/** 牌的默认使用方式定义 */
declare interface CardUseData {
    /** 牌名（如 'sha', 'tao'） */
    name: string;
    /** 默认使用时机（每种使用方法只在一个默认时机） */
    timing: TimingName;
    /** 合法目标选择器 */
    target: (room: Room, player: Player, card: VirtualCard) => Player[];
    /** 距离条件 */
    distanceCondition?: (
        room: Room,
        player: Player,
        target: Player,
        card: VirtualCard,
    ) => boolean;
    /** 牌面效果 */
    effect: (
        room: Room,
        target: Player,
        event: UseCardEventData,
    ) => Promise<void>;
    /** 额外使用条件（如桃需体力不满） */
    canUse?: (room: Room, player: Player, card: VirtualCard) => boolean;
    /** 使用次数条件（默认无限制） */
    timesCondition?: (room: Room, player: Player) => number;
}
/** 使用牌时的修正器（临时优先于状态效果） */
declare interface UseModifiers {
    /** 无次数限制 */
    unlimitedTimes?: boolean;
    /** 无距离限制 */
    unlimitedDistance?: boolean;
    /** 不计入次数 */
    noCount?: boolean;
    /** 是否可使用技能 */
    canUseSkill?: boolean;
    /** 借刀子目标（不进 targetList） */
    subTarget?: Player;
}
declare interface DropCardEventData {
    player: Player;
    card: VirtualCard;
    forcePlayCardVoice?: boolean;
}
declare interface PindianEventData {
    player: Player;
    targets: Player[];
    cards: Map<Player, GameCard>;
    card_limits?: Map<Player, string[]>;
    reqOptions: any;
    settleTarget?: Player;
    settleWinner?: Player;
    settleLoser?: Player[];
    settleResults?: Map<
        Player,
        {
            winner?: Player;
            loser?: Player[];
        }
    >;
}
declare interface OpenEventData {
    player: Player;
    generals: General[];
    /** true=明置 */
    toState: true;
}
declare interface CloseEventData {
    player: Player;
    generals: General[];
    /** false=暗置 */
    toState: false;
}
declare interface ChainEventData {
    player: Player;
    toState: boolean;
    damageType: DamageType;
}
declare interface SkipEventData {
    player: Player;
    toState: boolean;
}
declare interface ChangeEventData {
    player: Player;
    general: General | 'head' | 'deputy';
    toGeneral: General;
}
declare interface RemoveEventData {
    player: Player;
    general: General;
}
/** ChangeState 六种子类型 */
declare type ChangeStateType =
    | EventType.Open
    | EventType.Close
    | EventType.Chain
    | EventType.Skip
    | EventType.Change
    | EventType.Remove;
/** ChangeState 联合数据类型 */
declare type ChangeStateData =
    | OpenEventData
    | CloseEventData
    | ChainEventData
    | SkipEventData
    | ChangeEventData
    | RemoveEventData;
declare interface JudgeEventData {
    player: Player;
    card?: GameCard;
    result?: VirtualCardData;
    isSuccess?: (result: VirtualCardData) => boolean;
}
declare interface DamageEventData {
    player?: Player;
    target: Player;
    damageType: DamageType;
    number: number;
    channel?: VirtualCard | string;
    isChain?: boolean;
}
declare interface LoseHpEventData {
    player: Player;
    number: number;
}
declare interface ReduceHpEventData {
    player: Player;
    number: number;
}
declare interface RecoverHpEventData {
    player: Player;
    number: number;
}
declare interface ChangeMaxHpEventData {
    player: Player;
    number: number;
}
declare interface DyingEventData {
    player: Player;
    /** 造成濒死的角色（由 DyingEvent 从伤害链追溯，传递给 DeathEvent） */
    killer?: Player;
}
declare interface DeathEventData {
    player: Player;
    /** 击杀者（由 DyingEvent 传入时已有值；未传入时 DeathEvent 自行追溯） */
    killer?: Player;
}
declare interface UseSkillEventData {
    /** 发动的效果 */
    effect?: Effect;
    /** 技能上下文 */
    context?: EffectContext;
    /** 是否发动成功 */
    used?: boolean;
}
declare interface StageData {
    player: Player;
    generals: General[];
}
declare interface NeedUseCardData {
    player: Player;
    cards: {
        name: string;
        method: number;
    }[];
    response?: VirtualCard;
    card_limits?: string[];
    target_limits?: string[];
    canUseSkill?: boolean;
    skills?: string[];
    reqOptions: any;
    useCardEventData?: UseCardEventData | UseCardToCardEventData;
    immediateSettle?: boolean;
    noPlayDirectLine?: boolean;
    forcePlayCardVoice?: boolean;
    autoSort?: boolean;
    clockwise?: boolean;
    effectCorrection?: any;
    settleCount?: number;
    damageBase?: number;
    recoverBase?: number;
}
declare interface NeedDropCardData {
    player: Player;
    cards: string[];
    response?: VirtualCard;
    card_limits?: string[];
    canUseSkill?: boolean;
    skills?: string[];
    reqOptions: any;
    dropCardEventData?: DropCardEventData;
    immediateSettle?: boolean;
    forcePlayCardVoice?: boolean;
}
declare interface EventDataMap {
    [EventType.Ready]: ReadyEventData;
    [EventType.Turn]: TurnEventData;
    [EventType.Phase]: PhaseEventData;
    [EventType.Move]: MoveEventData;
    [EventType.UseCard]: UseCardEventData;
    /** @deprecated 统一为 EventType.UseCard */
    [EventType.UseCardToCard]: UseCardEventData;
    /** @deprecated 统一为 EventType.UseCard */
    [EventType.UseCardSpecial]: UseCardEventData;
    [EventType.DropCard]: DropCardEventData;
    [EventType.Pindian]: PindianEventData;
    [EventType.Open]: OpenEventData;
    [EventType.Close]: CloseEventData;
    [EventType.Chain]: ChainEventData;
    [EventType.Skip]: SkipEventData;
    [EventType.Change]: ChangeEventData;
    [EventType.Remove]: RemoveEventData;
    [EventType.Judge]: JudgeEventData;
    [EventType.Damage]: DamageEventData;
    [EventType.LoseHp]: LoseHpEventData;
    [EventType.ReduceHp]: ReduceHpEventData;
    [EventType.RecoverHp]: RecoverHpEventData;
    [EventType.ChangeMaxHp]: ChangeMaxHpEventData;
    [EventType.Dying]: DyingEventData;
    [EventType.Death]: DeathEventData;
    [EventType.UseSkill]: UseSkillEventData;
}
declare type EventData<T extends EventType> = EventDataMap[T];
declare interface TimingEventMap {
    [TimingName.GameStartBefore]: EventType.Ready;
    [TimingName.GameStart]: EventType.Ready;
    [TimingName.TurnStartBefore]: EventType.Turn;
    [TimingName.TurnStart]: EventType.Turn;
    [TimingName.TurnStartAfter]: EventType.Turn;
    [TimingName.TurnEnd]: EventType.Turn;
    [TimingName.TurnEndAfter]: EventType.Turn;
    [TimingName.ReadyPhaseStartBefore]: EventType.Phase;
    [TimingName.ReadyPhaseStart]: EventType.Phase;
    [TimingName.ReadyPhase]: EventType.Phase;
    [TimingName.ReadyPhaseEnd]: EventType.Phase;
    [TimingName.JudgePhaseStartBefore]: EventType.Phase;
    [TimingName.JudgePhaseStart]: EventType.Phase;
    [TimingName.JudgePhase]: EventType.Phase;
    [TimingName.JudgePhaseEnd]: EventType.Phase;
    [TimingName.DrawPhaseStartBefore]: EventType.Phase;
    [TimingName.DrawPhaseStart1]: EventType.Phase;
    [TimingName.DrawPhaseStart2]: EventType.Phase;
    [TimingName.DrawPhase]: EventType.Phase;
    [TimingName.DrawPhaseEnd]: EventType.Phase;
    [TimingName.PlayPhaseStartBefore]: EventType.Phase;
    [TimingName.PlayPhaseStart]: EventType.Phase;
    [TimingName.PlayPhase]: EventType.Phase;
    [TimingName.PlayPhaseEnd]: EventType.Phase;
    [TimingName.DiscardPhaseStartBefore]: EventType.Phase;
    [TimingName.DiscardPhaseStart]: EventType.Phase;
    [TimingName.DiscardPhase]: EventType.Phase;
    [TimingName.DiscardPhaseEnd]: EventType.Phase;
    [TimingName.EndPhaseStartBefore]: EventType.Phase;
    [TimingName.EndPhaseStart]: EventType.Phase;
    [TimingName.EndPhase]: EventType.Phase;
    [TimingName.EndPhaseEnd]: EventType.Phase;
    [TimingName.MoveCardFixed]: EventType.Move;
    [TimingName.MoveCardBefore1]: EventType.Move;
    [TimingName.MoveCardBefore2]: EventType.Move;
    [TimingName.MoveCardAfter1]: EventType.Move;
    [TimingName.MoveCardAfter2]: EventType.Move;
    [TimingName.MoveCardEnd]: EventType.Move;
    [TimingName.UseCardDeclare]: EventType.UseCard;
    [TimingName.UseCardDeclareAfter]: EventType.UseCard;
    [TimingName.UseCardChooseTarget]: EventType.UseCard;
    [TimingName.UseCardUsed]: EventType.UseCard;
    [TimingName.UseCardAssignTarget]: EventType.UseCard;
    [TimingName.UseCardBecomeTarget]: EventType.UseCard;
    [TimingName.UseCardAssignTargetAfter]: EventType.UseCard;
    [TimingName.UseCardBecomeTargetAfter]: EventType.UseCard;
    [TimingName.UseCardReady]: EventType.UseCard;
    [TimingName.UseCardEffectStart]: EventType.UseCard;
    [TimingName.UseCardEffectBefore]: EventType.UseCard;
    [TimingName.UseCardOffset]: EventType.UseCard;
    [TimingName.UseCardEffect]: EventType.UseCard;
    [TimingName.UseCardEffectAfter]: EventType.UseCard;
    [TimingName.UseCardEnd1]: EventType.UseCard;
    [TimingName.UseCardEnd2]: EventType.UseCard;
    [TimingName.UseCardEnd3]: EventType.UseCard;
    [TimingName.DropCardDeclare]: EventType.DropCard;
    [TimingName.DropCardDroped]: EventType.DropCard;
    [TimingName.DropCardEnd]: EventType.DropCard;
    [TimingName.Pindian]: EventType.Pindian;
    [TimingName.PindianCardShow]: EventType.Pindian;
    [TimingName.PindianResult]: EventType.Pindian;
    [TimingName.PindianEnd]: EventType.Pindian;
    [TimingName.ChangeState]:
        | EventType.Open
        | EventType.Close
        | EventType.Chain
        | EventType.Skip
        | EventType.Change
        | EventType.Remove;
    [TimingName.ChangeStateAfter]:
        | EventType.Open
        | EventType.Close
        | EventType.Chain
        | EventType.Skip
        | EventType.Change
        | EventType.Remove;
    [TimingName.Open]: EventType.Open;
    [TimingName.Judge]: EventType.Judge;
    [TimingName.JudgeCard]: EventType.Judge;
    [TimingName.JudgeResult1]: EventType.Judge;
    [TimingName.JudgeResult2]: EventType.Judge;
    [TimingName.JudgeResultAfter1]: EventType.Judge;
    [TimingName.JudgeResultAfter2]: EventType.Judge;
    [TimingName.JudgeEnd]: EventType.Judge;
    [TimingName.DamageStart]: EventType.Damage;
    [TimingName.DamageCause1]: EventType.Damage;
    [TimingName.DamageCause2]: EventType.Damage;
    [TimingName.DamageInflict1]: EventType.Damage;
    [TimingName.DamageInflict2]: EventType.Damage;
    [TimingName.DamageInflict3]: EventType.Damage;
    [TimingName.DamageCauseAfter]: EventType.Damage;
    [TimingName.DamageInflictAfter]: EventType.Damage;
    [TimingName.DamageEnd]: EventType.Damage;
    [TimingName.LoseHpStart]: EventType.LoseHp;
    [TimingName.LoseHp]: EventType.LoseHp;
    [TimingName.LoseHpAfter]: EventType.LoseHp;
    [TimingName.LoseHpEnd]: EventType.LoseHp;
    [TimingName.ReduceHpStart]: EventType.ReduceHp;
    [TimingName.ReduceHp]: EventType.ReduceHp;
    [TimingName.ReduceHpAfter]: EventType.ReduceHp;
    [TimingName.ReduceHpEnd]: EventType.ReduceHp;
    [TimingName.RecoverHpStart]: EventType.RecoverHp;
    [TimingName.RecoverHp]: EventType.RecoverHp;
    [TimingName.RecoverHpAfter]: EventType.RecoverHp;
    [TimingName.RecoverHpEnd]: EventType.RecoverHp;
    [TimingName.ChangeMaxHpStart]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHp]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHpAfter]: EventType.ChangeMaxHp;
    [TimingName.ChangeMaxHpEnd]: EventType.ChangeMaxHp;
    [TimingName.DyingEntry]: EventType.Dying;
    [TimingName.DyingEntryAfter]: EventType.Dying;
    [TimingName.Dying]: EventType.Dying;
    [TimingName.DyingEnd]: EventType.Dying;
    [TimingName.DeathBefore]: EventType.Death;
    [TimingName.DeathConfirmRole]: EventType.Death;
    [TimingName.Death]: EventType.Death;
    [TimingName.DeathAfter]: EventType.Death;
    [TimingName.DeathEnd]: EventType.Death;
    [TimingName.Cost]: EventType.UseSkill;
    [TimingName.Effect]: EventType.UseSkill;
}
declare interface TimingDataMap {
    [TimingName.GameStageBefore]: StageData;
    [TimingName.GameStage]: StageData;
    [TimingName.GameStageAfter]: StageData;
    [TimingName.GameStartBefore]: {};
    [TimingName.GameStart]: {};
    [TimingName.GameEnd]: {};
    [TimingName.RoundStart]: {
        round: number;
        turn: TurnEvent;
    };
    [TimingName.RoundEnd]: {
        round: number;
        turn: TurnEvent;
    };
    [TimingName.RestStart]: {
        player: Player;
    };
    [TimingName.RestEnd]: {
        player: Player;
    };
    [TimingName.UseCardNeed1]: NeedUseCardData;
    [TimingName.UseCardNeed2]: NeedUseCardData;
    [TimingName.DropCardNeed1]: NeedDropCardData;
    [TimingName.DropCardNeed2]: NeedDropCardData;
    [TimingName.SkillObtain]: {};
    [TimingName.SkillLose]: {};
    [TimingName.EffectObtain]: {};
    [TimingName.EffectLose]: {};
    [TimingName.EventEnd]: {};
    [TimingName.AllEventEnd]: {};
    [key: string]: Record<string, any>;
}
declare type TimingData<T extends TimingTrigger> =
    T extends keyof TimingEventMap
        ? EventDataMap[TimingEventMap[T]]
        : T extends keyof TimingDataMap
          ? TimingDataMap[T]
          : Record<string, any>;
/** 时机定义：名称 + before/after 回调 */
declare interface Timing<T extends TimingTrigger = 'none'> {
    name: TimingTrigger;
    /** 在 eventManager.trigger 之前执行 */
    before?: Array<(room: Room, data: TimingData<T>) => Promise<any>>;
    /** 在 eventManager.trigger 之后执行 */
    after?: Array<(room: Room, data: TimingData<T>) => Promise<any>>;
}
declare enum DamageType {
    None = 0,
    Fire = 1,
    Thunder = 2,
}

/**
 * 回复体力事件。
 *
 * 执行流程：
 *   RecoverHpStart → RecoverHpAfter（实际回复）→ RecoverHpEnd
 */
declare class RecoverHpEvent extends EventProcess<EventType.RecoverHp> {
    constructor(room: Room, data: RecoverHpEventData);
    get player(): Player;
    get number(): number;
    set number(v: number);
    private _buildTriggers;
    check(): boolean;
    checkEvent(): boolean;
    /** RecoverHpAfter 之前：实际回复体力 */
    private _onRecoverHpAfter;
}
/**
 * 体力上限改变事件。
 *
 * 执行流程：
 *   ChangeMaxHpStart → ChangeMaxHpAfter（实际修改）→ ChangeMaxHpEnd
 *
 * 上限降至 ≤0 时触发死亡。
 */
declare class ChangeMaxHpEvent extends EventProcess<EventType.ChangeMaxHp> {
    constructor(room: Room, data: ChangeMaxHpEventData);
    get player(): Player;
    /** 变化值（正=增加，负=减少） */
    get number(): number;
    private _buildTriggers;
    check(): boolean;
    checkEvent(): boolean;
    private _onChangeMaxHpAfter;
}

/**
 * 判定事件。
 *
 * 执行流程：
 *   Judge → JudgeCard → JudgeResult1 → JudgeResult2
 *   → JudgeResultAfter1 → JudgeResultAfter2 → JudgeEnd
 *
 * - Judge After：从牌堆取牌 → putTo(处理区) → setCard（创建虚拟牌）
 * - JudgeCard 时机：技能改判（调用 setCard 替换判定牌）
 * - JudgeResultAfter1 Before：广播判定结果动画
 * - JudgeEnd After：将所有因此事件置入处理区的牌移回弃牌堆
 */
declare class JudgeEvent extends EventProcess<EventType.Judge> {
    constructor(room: Room, data: JudgeEventData);
    get player(): Player;
    get card(): GameCard | undefined;
    set card(v: GameCard | undefined);
    get result(): VirtualCardData | undefined;
    set result(v: VirtualCardData | undefined);
    get isSuccess(): ((result: VirtualCardData) => boolean) | undefined;
    /** 当前判定是否成功（由 setCard/resetSuccess 设置） */
    success?: boolean;
    private _buildTriggers;
    check(): boolean;
    /** Judge After：从牌堆取牌 → 移到处理区 → setCard */
    private _onJudgeAfter;
    /** JudgeResultAfter1 Before：广播判定结果动画 */
    private _onJudgeResultAfter1Before;
    /**
     * 设置判定牌（改判技能调用）。
     *
     * 若已有旧判定牌且在处理区，先将其移入弃牌堆；
     * 然后为新牌创建虚拟牌作为判定结果。
     */
    setCard(card: GameCard): Promise<void>;
    /** 重新评估判定是否成功（改判后调用） */
    resetSuccess(): void;
}

/**
 * 移动卡牌事件。
 *
 * 执行流程：
 *   MoveCardFixed → MoveCardBefore1 → MoveCardBefore2
 *   → MoveCardAfter1（执行实际移动）→ MoveCardAfter2 → MoveCardEnd
 *
 * 在 MoveCardBefore1/2 期间可调用 cancel()/preventMove() 来取消或阻止移动。
 */
declare class MoveCardEvent extends EventProcess<EventType.Move> {
    /** 分类后的移动数据 */
    move_datas: MoveCardData[];
    /** 移动标签生成函数（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString;
    /** 战报生成函数（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString;
    constructor(room: Room, data: MoveEventData);
    /** eventData.datas 便捷访问 */
    get datas(): MoveCardData[];
    set datas(v: MoveCardData[]);
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    checkEvent(): boolean;
    /** MoveCardFixed: 固定移动（对移动数据做最终校正，子类或外部可覆写） */
    private _onMoveCardFixed;
    /** MoveCardAfter1 Before：执行实际卡牌移动 */
    private _onMoveCardAfter1;
    /**
     * 移动后处理虚拟牌及装备牌关联。
     *
     * 流程：
     *   1. 装备牌 — 离开/进入装备区时更新玩家装备记录
     *   2. 延时锦囊 — 离开/进入判定区时更新判定记录
     *   3. 移动到非处理区 ─ 切断/删除虚拟牌关联
     */
    protected handleVirtualCard(
        card: GameCard,
        fromArea: AreaId,
        toArea: AreaId,
    ): Promise<void>;
    /**
     * 对移动数据分类赋默认值并归类。
     *
     * 每条移动数据：
     * 1. 填充默认值（reason/putType/animation/pos/toast/moveType/fromArea）
     * 2. 将相同 (player, fromArea, toArea, reason, moveType, putType, ...) 的卡牌合并到同一组
     */
    classify(): void;
    /** 增加一条移动数据，可选延迟归类（批量添加时最后统一调用 classify） */
    add(data: MoveCardData, reclassify?: boolean): void;
    /**
     * 修改指定牌的移动数据。
     * @param cards 要修改的牌
     * @param newData 新的移动参数，未提供的将沿用原参数
     */
    update(cards: GameCard[], newData?: Partial<MoveCardData>): void;
    /** 获取本次移动中包含指定牌的 MoveCardData */
    get(card: GameCard): MoveCardData | undefined;
    /** 本次移动中是否包含指定牌的移动 */
    has(card: GameCard): boolean;
    /** 获取本次移动中符合条件的牌 */
    getCards(
        filter?: (data: MoveCardData, card: GameCard) => boolean,
    ): GameCard[];
    /** 获取本次移动中符合条件的牌（返回第一张，短路查找） */
    getCard(
        filter?: (data: MoveCardData, card: GameCard) => boolean,
    ): GameCard | undefined;
    /** 获取符合条件的移动数据 */
    filter(
        filter: (data: MoveCardData, card: GameCard) => boolean,
    ): MoveCardData[];
    /** 移动中是否包含符合条件的数据 */
    has_filter(
        filter: (data: MoveCardData, card: GameCard) => boolean,
    ): boolean;
    /** 获取移动的总牌数 */
    getMoveCount(): number;
    /** 判断一张牌的上一次移动是否为此移动事件 */
    isLast(card: GameCard): boolean;
    /**
     * 获取某玩家因指定原因会失去的牌的数据。
     * 失去 = 原区域是该玩家的手牌/装备区，目标区域不是该玩家的手牌/装备区。
     */
    getLoseByReason(
        player: Player,
        reason: string,
        pos?: string,
    ): MoveCardData[];
    /** getLoseByReason 的 GameCard[] 版本 */
    getLoseCardsByReason(
        player: Player,
        reason: string,
        pos?: string,
    ): GameCard[];
    /** 是否有因指定原因失去牌的数据 */
    hasLoseByReason(player: Player, reason: string, pos?: string): boolean;
    /**
     * 获取某玩家因指定原因会获得的牌的数据。
     * 获得 = 原区域不是该玩家的手牌区，目标区域是该玩家的手牌区。
     */
    getObtainByReason(player: Player, reason: string): MoveCardData[];
    /** getObtainByReason 的 GameCard[] 版本 */
    getObtainCardsByReason(player: Player, reason: string): GameCard[];
    /** 是否有因指定原因获得牌的数据 */
    hasObtainByReason(player: Player, reason: string): boolean;
    /**
     * 取消移动。
     *
     * 仅在 MoveCardBefore1 / MoveCardBefore2 时机可调用。
     * @param cards 要取消移动的牌。不提供则等同于 preventMove()
     * @param prevent 取消后若所有牌都被取消，是否自动阻止事件
     */
    cancel(cards?: GameCard[], prevent?: boolean): Promise<this>;
    /**
     * 阻止整个移动事件。
     *
     * 仅在 MoveCardBefore1 / MoveCardBefore2 时机可调用。
     */
    preventMove(): Promise<this>;
}

/**
 * 回合事件。
 *
 * 执行流程：
 *   TurnStartBefore → TurnStart → TurnStartAfter
 *     → [各阶段 PhaseEvent 依次执行]
 *   TurnEnd → TurnEndAfter
 */
declare class TurnEvent extends EventProcess<EventType.Turn> {
    constructor(room: Room, data: TurnEventData);
    get player(): Player;
    set player(v: Player);
    get turnId(): number;
    set turnId(v: number);
    get isExtraTurn(): boolean;
    set isExtraTurn(v: boolean);
    get isSkipped(): boolean;
    get phases(): TurnEventData['phases'];
    get skippedPhases(): Phase[];
    get isRoundStart(): boolean;
    set isRoundStart(v: boolean);
    get isRoundEnd(): boolean;
    set isRoundEnd(v: boolean);
    private _buildTriggers;
    private _onTurnStartBefore;
    private _onTurnStarted;
    private _onTurnEnd;
    private _generatePhases;
    processCompleted(): Promise<void>;
    skipPhase(phase?: Phase | Phase[]): Promise<void>;
    end(): Promise<this>;
    isNotSkip(phase: Phase): boolean;
    private _skipTurn;
    private _sendTurnLog;
    private _findCurrentPhaseEvent;
}
/**
 * 阶段事件。
 *
 * 每个阶段有 3 个 eventTriggers + 1 个 endTrigger：
 *   {Phase}StartBefore → {Phase}Start → {Phase} → {Phase}End
 *
 * 摸牌阶段的 DrawPhaseStart1/Start2 提供两次修正摸牌数的时机。
 */
declare class PhaseEvent extends EventProcess<EventType.Phase> {
    constructor(room: Room, data: PhaseEventData);
    get player(): Player;
    get phase(): Phase;
    get isExtraPhase(): boolean;
    /** draw_start1 归零后锁定，阻止 draw_start2 再修改 */
    private _drawCountLocked;
    get drawCount(): number;
    set drawCount(value: number);
    /** draw_start1 类效果：额定摸牌数改为 0，锁定后续 draw_start2 修改 */
    zeroDrawCount(): void;
    times: Record<string, Record<number, number>>;
    private _buildTriggers;
    checkEvent(): boolean;
    skip(): Promise<this>;
    isExecutor(player: Player, phase?: Phase): boolean;
}

/**
 * 牌的使用事件（统一类，替代旧项目三子类）。
 *
 * 关键设计：目标扩展与使用结算采用**生成式**时序——
 * 每个时机完成后根据当前状态即时生成下一个时机。
 *
 * 执行流程（基本牌/普通锦囊）：
 *   预结算固定段：Declare → DeclareAfter → ChooseTarget → Used（重排序）
 *   目标扩展段（生成式）：逐阶段 × 逐个当前目标
 *     - 中途加入：从当前阶段开始，不补已过阶段
 *     - 中途移除：跳过剩余阶段
 *   Ready（移除死者→重排序→最终目标列表）
 *   结算段（生成式轮询）：按 effectTimes 逐轮结算
 *     - 已有 invalid → 跳过全部
 *     - EffectStart 期间 invalid → 跳过后续
 *     - EffectBefore 期间 offset → Offset + 跳过 Effect/EffectAfter
 *     - 否则 → Effect → EffectAfter
 *   结束后固定段：End1 → End2 → End3（虚拟牌消失）
 */
declare class UseCardEvent extends EventProcess<EventType.UseCard> {
    /** 目标自增 ID——仅用于同玩家时稳定排序，不回写 */
    private _targetId;
    /** 各目标已完成的目标扩展阶段（index → 已完成时机名集合） */
    private _doneTargetPhases;
    constructor(room: Room, data: UseCardEventData);
    get player(): Player;
    get card(): VirtualCard;
    get targets(): Player[];
    get targetList(): TargetEntry[];
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    checkEvent(): boolean;
    exec(): Promise<this>;
    /** 执行固定段的 eventTriggers */
    private _runFixedTriggers;
    /** 执行单个 timing */
    private _runTiming;
    /** 完成事件：执行 endTriggers + processCompleted */
    private _finish;
    /**
     * 逐阶段 × 逐个当前目标，生成式执行四阶段。
     * 每个阶段的第一个目标设置 isFirstTarget=true。
     */
    private _runTargetPhases;
    private _hasDonePhase;
    private _markDonePhase;
    /** BecomeTarget 阶段全部完成后定型"对XX使用过此牌" */
    private _finalizeBecomeTarget;
    /**
     * 按 effectTimes 轮询结算。
     * 每轮的第一个目标（即使 invalid）设置 isFirstTarget=true。
     */
    private _runSettleLoop;
    /** 结算单个目标的一次 */
    private _settleOneTarget;
    private _onUseCardDeclare;
    private _onUseCardUsed;
    /** BecomeTarget before（每个目标）：时机钩子，实际定型在 _finalizeBecomeTarget */
    private _onBecomeTarget;
    private _onUseCardReady;
    private _onEffectAfter;
    private _onUseCardEnd3;
    /**
     * 对目标列表排序。
     * - 从当前回合角色（或其下家）开始
     * - 逆时针（默认）：座位升序偏移
     * - 顺时针：座位降序偏移
     * - 同玩家 → index 升序
     */
    private _sortTargets;
    /** 转移目标：替换目标玩家 + 重排序 */
    changeTarget(oldTarget: Player, newTarget: Player): void;
    /** 新增目标：构建 TargetEntry 加入列表 + 重排序 */
    addTarget(target: Player): TargetEntry;
    /** 取消目标：移出列表 + 终止当前时机 */
    cancelTarget(target: Player): void;
    /** 标记无效（跳过生效时机） */
    markInvalid(target: Player): void;
    /** 标记被抵消（M3 接线） */
    offsetTarget(target: Player, offsetEvent: EventProcess): void;
}

/**
 * 技能使用事件。
 *
 * 不使用 eventTriggers/endTriggers 的时序驱动，重写 exec() 编排流程：
 *   1. 排序目标 → 2. 执行 choose → 3. 明置武将 → 4. 记录历史
 *   → 5-11. 动画/战报/标记（TODO 通讯模块）
 *   → 12. cost → 触发 Cost 时机 → 13. effect → 触发 Effect 时机
 */
declare class UseSkillEvent extends EventProcess<EventType.UseSkill> {
    constructor(room: Room, data: UseSkillEventData);
    get effect(): Effect;
    get context(): EffectContext;
    get used(): boolean;
    private _prevEffect?;
    protected init(): Promise<void>;
    exec(): Promise<this>;
    private _finalize;
}

/**
 * 直接创建方法——sgs.General(data) / sgs.CardConfig(data) / sgs.GameCard() 等。
 * Input 类型 = Partial<Data> & Pick<Data, 必填键>，字段增减时自动跟随。
 */

declare function setExtensionContext(name: string): void;
/**
 * 为实体牌分配 ID（{扩展名}.{自增序号}）并批量注册到 sgs.cards。
 * 扩展名自动注入——加载器在导入扩展前调用 setExtensionContext()。
 * 不同扩展独立计数，不依赖加载顺序。
 */
declare function registerCards(cards: GameCardData[]): GameCardData[];
/** 注册卡牌扩展包——内部调用 registerCards + sgs.cardpacks.set */
declare function CardPackage(name: string, cards: GameCardData[]): CardPackData;
/** 注册武将扩展包 → sgs.generalpacks */
declare function GeneralPackage(
    name: string,
    subpacks: GeneralPackData['subpacks'],
): GeneralPackData;
declare type CardConfigInput = Partial<CardData> & Pick<CardData, 'name'>;
declare function CardConfig(input: CardConfigInput): CardData;
declare type GameCardInput = Partial<GameCardData>;
declare function GameCard(input?: GameCardInput): GameCardData;
declare type GeneralInput = Partial<GeneralData> & Pick<GeneralData, 'name'>;
declare function General(input: GeneralInput): GeneralData;
declare type GameModeInput = Partial<GameMode> & Pick<GameMode, 'name'>;
declare function GameMode(input: GameModeInput): GameMode;
declare type SkillInput = Partial<SkillData> & Pick<SkillData, 'name'>;
declare function Skill(input: SkillInput): SkillData;
declare type EffectInput = Pick<
    Partial<EffectData>,
    'tag' | 'priority' | 'condition'
> & {
    name: string;
    skillName: string;
};
declare function Effect(input: EffectInput): EffectData;

/** GeneralBuilder 实例接口 */
declare interface GeneralBuilder {
    readonly name: string;
    kingdom(k: GeneralKingdom): this;
    hp(h: GeneralHp): this;
    gender(g: Gender): this;
    skills(s: string[]): this;
    lord(l?: boolean): this;
    enable(e?: boolean): this;
    hidden(h?: boolean): this;
    isWars(w?: boolean): this;
    rs(r: string[]): this;
    register(): GeneralData;
}
/** GeneralBuilder 工厂——无需 new */
declare function GeneralBuilder(name: string): GeneralBuilder;

declare class General implements MarkHost {
    readonly id: GeneralId;
    readonly room: Room;
    readonly _jsondata: GeneralData;
    readonly state: GeneralState;
    readonly data: Record<string, any>;
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap: Map<string, Set<string>>;
    readonly sourceData: {
        id: GeneralId;
        name: string;
        trueName: string;
        kingdom: string;
        kingdom2: string;
        kingdoms: string[];
        hp: number;
        hpmax: number;
        shield: number;
        gender: Gender;
        skills: string[];
        lord: boolean;
        isWars: boolean;
        enable: boolean;
        source: GeneralData;
    };
    constructor(data: GeneralData, room: Room, state: GeneralState);
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    get name(): string;
    get trueName(): string;
    get kingdom(): string;
    get kingdom2(): string;
    get kingdoms(): string[];
    get hp(): number;
    get hpmax(): number;
    get shield(): number;
    get gender(): Gender;
    get skills(): string[];
    get enable(): boolean;
    get isWars(): boolean;
    get lord(): boolean;
    get area(): AreaId;
    get put(): boolean;
    turnTo(put: boolean): void;
    setLabel(label: RichString, area?: string): void;
    isDual(): boolean;
    sameAs(to: General): boolean;
    isLord(): boolean;
    isShibing(): boolean;
    isYexinjia(): boolean;
    getAssetsUrl(
        type: 'image' | 'dual_image' | 'self_image' | 'death',
        skinName?: string,
    ): string;
    private getSkinData;
}

/** 武将ID */
declare type GeneralId = string;
/** 武将势力 可以用,分割多个势力 */
declare type GeneralKingdom = string;
/** 武将体力 其中数组代表[初始体力值,初始体力上限,初始护盾] */
declare type GeneralHp = number | [number, number] | [number, number, number];
declare interface GeneralData {
    /** 武将名 */
    name: string;
    /** 势力 */
    kingdom: GeneralKingdom;
    /** 血量 */
    hp: GeneralHp;
    /** 性别 */
    gender: Gender;
    /** 技能 */
    skills: string[];
    /** 是否为主公/君主 */
    lord: boolean;
    /** 是否启用 */
    enable: boolean;
    /** 在武将一览中隐藏 */
    hidden: boolean;
    /** 是否为国战武将 */
    isWars: boolean;
    /** 珠联璧合表 */
    rs?: string[];
}
declare interface GeneralAssetsData {
    info: {
        /** 编号 */
        id?: string;
        /** 版本 */
        version?: string;
        /** 称号 */
        title?: string;
        /** 前缀 如“界” */
        prefix?: string;
        /** 设计师 */
        designer?: string;
        /** 代码提供 */
        script?: string;
    };
    /** 所有皮肤  其中default字段为原画，如果不添加则会在初始化后添加默认原画配置*/
    skins: {
        /** 皮肤名 */
        name: string;
        /** 画师 */
        painter?: string;
        /** 配音 */
        cv?: string;
        /** 台词编写 */
        cv_designer?: string;
        /** 是否启用双头武将特殊插画 */
        isDualImage?: boolean;
        /** 是否为动态皮肤 */
        dynamic?: boolean;
        /** 根目录地址 所有资源都会在该目录下寻找
         * 对于插画，以下资源如果字符串中包含“/”，则会忽略baseUrl，改为在generals下寻找
         * 对于语音，技能语音不在这里设置，但皮肤专属配音依赖于baseUrl，
         * 该武将牌上的技能会按照其设置的每一个语音文件名（如果字符串中包含“/”，则文件名为最后一个/之后的内容）
         * 在baseUrl下寻找同名文件作为其的皮肤代替配音
         */
        baseUrl: string;
        /** 插画文件名 */
        image?: string;
        /** 双头插画文件名（其他视角） */
        image_dual?: string;
        /** 双头插画文件名（自己视角） */
        image_dual2?: string;
        /** 用于其他人的主视角中显示可发动的你的技能的头像 */
        avatar?: string;
        /** 所有语音 其中death字段为阵亡语音
         * */
        audios: {
            [key: string]: {
                url: string;
                translation: string;
            };
        };
    }[];
}
/** 性别 */
declare enum Gender {
    /** 无性别 */
    None = 0,
    /** 男 */
    Male = 1,
    /** 女 */
    Female = 2,
    /** 双性 */
    Doublesex = 9,
}

declare interface LogMeta {
    roomId?: string;
    playerId?: string;
    event?: string;
    [key: string]: any;
}
declare interface ILogger {
    debug(message: string, extra?: LogMeta): void;
    info(message: string, extra?: LogMeta): void;
    warn(message: string, extra?: LogMeta): void;
    error(message: string, extra?: LogMeta): void;
}

declare interface MarkOptions {
    /** 来源 */
    source?: string;
    /** 是否可见 */
    visible?: boolean | string[];
    /** 仅针对string类型标记，动态显示内容会根据此对象进行解析 */
    values?: Record<string, RichStringValue>;
    /** 解析类型 */
    parseType?:
        | 'img'
        | 'card'
        | 'general'
        | 'command'
        | 'prompt'
        | 'suit'
        | 'color'
        | 'card_number'
        | 'area';
    ref?: {
        area: string;
        mark: string;
    };
}
declare interface MarkHost {
    room: Room;
    data: Record<string, any>;
    marksMap: MapSchema<MarkState>;
    _markKeyMap: Map<string, Set<string>>;
}
declare function parseKey(rawKey: string): {
    originalKey: string;
    tags: string[];
};
declare function setMark<T>(
    this: MarkHost,
    rawKey: string,
    value: T,
    options?: MarkOptions,
): void;
declare function getMark<T>(this: MarkHost, rawKey: string): T | undefined;
declare function removeMark(this: MarkHost, rawKey: string): void;
declare function hasMark(this: MarkHost, rawKey: string): boolean;
declare function countMark(
    this: MarkHost,
    rawKey: string,
    value: number,
    options?: MarkOptions,
): void;
declare function pushMark<T>(
    this: MarkHost,
    rawKey: string,
    item: T,
    options?: MarkOptions,
): void;
declare function unpushMark<T>(
    this: MarkHost,
    rawKey: string,
    item: T,
    options?: MarkOptions,
): void;
declare function clearMark(this: MarkHost, tag?: string): void;
declare const MarkMethods: {
    parseKey: typeof parseKey;
    setMark: typeof setMark;
    getMark: typeof getMark;
    removeMark: typeof removeMark;
    hasMark: typeof hasMark;
    countMark: typeof countMark;
    pushMark: typeof pushMark;
    unpushMark: typeof unpushMark;
    clearMark: typeof clearMark;
};
declare;
{
}

declare interface CardPackData {
    name: string;
    cards: GameCardData[];
}
declare interface GeneralPackData {
    name: string;
    subpacks: {
        /** 子包名（通常为大包.子包，如 standard.wei） */
        name: string;
        /** 角标图片名，按 {cdn}/image/icon/{icon}.png 查找 */
        icon?: string;
        /** 包内武将数据 */
        generals: GeneralData[];
    }[];
}

declare class Player implements MarkHost {
    /** 是否是自己（客户端 UI 标识） */
    isSelf: boolean;
    /** 所属房间 */
    readonly room: Room;
    /** Colyseus 同步状态 */
    readonly state: PlayerState;
    /** 运行时自定义数据 */
    readonly data: Record<string, any>;
    /** 标记状态 Map（来自 state.markStates） */
    readonly marksMap: MapSchema<MarkState>;
    /** 标记 key→内容集合 索引（MarkHost） */
    readonly _markKeyMap: Map<string, Set<string>>;
    constructor(playerId: string, room: Room, state: PlayerState);
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    /** 唯一玩家ID */
    get playerId(): string;
    /** 玩家名字 */
    get username(): string;
    /** 会话ID */
    get sessionId(): string;
    /** 座次 */
    set seat(value: number);
    get seat(): number;
    /** 座位标签（游戏开始前用于确认身份，开始后随机分配时可能被修改） */
    get seattag(): string | undefined;
    set seattag(value: string | undefined);
    /** 身份（zhugong/zhongchen/fanzei/neijian） */
    set role(value: string);
    get role(): string;
    /** 身份牌是否明示 */
    set rolePut(value: boolean);
    get rolePut(): boolean;
    /** 势力 */
    set kingdom(value: string);
    get kingdom(): string;
    /** 性别 */
    set gender(value: Gender);
    get gender(): Gender;
    /** 体力值 */
    set hp(value: number);
    get hp(): number;
    /** 体力上限 */
    set maxhp(value: number);
    get maxhp(): number;
    /** 护甲值 */
    set shield(value: number);
    get shield(): number;
    /** 连环状态 */
    set chained(value: boolean);
    get chained(): boolean;
    /** 翻面状态 */
    set skip(value: boolean);
    get skip(): boolean;
    /** 是否死亡 */
    set death(value: boolean);
    get death(): boolean;
    /** 休整剩余轮次 */
    set rest(value: number);
    get rest(): number;
    /** 当前阶段 */
    set phase(value: Phase);
    get phase(): Phase;
    /** 是否处于自己的回合内（客户端 UI 需要） */
    set inturn(value: boolean);
    get inturn(): boolean;
    /** 主将 ID（写入时查找 room.generals 缓存实例） */
    set headId(value: string);
    get headId(): string;
    /** 副将 ID */
    set deputyId(value: string);
    get deputyId(): string;
    /** 显示用名称（武将名+座次+自己标识） */
    get gameName(): string;
    /** 是否存活 */
    get alive(): boolean;
    /** 安全体力值（最小为 0，用于伤害计算等场景） */
    get inthp(): number;
    /** 已损失体力值 */
    get losshp(): number;
    /** 起始手牌数 */
    get initHandCardCount(): number;
    /** 备选武将数量 */
    get chooseGeneralCount(): number;
    /** 预选武将名列表 */
    get preChooseGeneral(): string[];
    /** 右手边玩家（顺时针，不论死活） */
    get right(): Player;
    /** 左手边玩家（逆时针，不论死活） */
    get left(): Player;
    /** 获取玩家私有区域 ID */
    getAreaId(type: AreaType): AreaId;
    /** 从指定区域类型获取卡牌 */
    private _getCardsByArea;
    getHandCards(): GameCard[];
    getEquipCards(): GameCard[];
    getJudgeCards(): GameCard[];
    /** 自己的所有牌（手牌+装备） */
    getSelfCards(): GameCard[];
    /** 自己区域内的所有牌（手牌+装备+判定） */
    getAreaCards(): GameCard[];
    private _head?;
    private _deputy?;
    /** 主将实例（设置时同步更新 state.headId） */
    set head(value: General | undefined);
    get head(): General | undefined;
    /** 副将实例 */
    set deputy(value: General | undefined);
    get deputy(): General | undefined;
    /** 主将是否明置 */
    get headOpen(): boolean;
    /** 副将是否明置 */
    get deputyOpen(): boolean;
    /** 是否拥有非士兵武将 */
    private _hasGeneral;
    hasHead(): boolean;
    hasDeputy(): boolean;
    /** 获取所有已明置的武将 */
    getOpenedGenerals(): General[];
    /** 获取所有暗置的武将 */
    getCloseGenerals(): General[];
    /** 作为伤害来源对 target 造成伤害 */
    damage(
        target: Player,
        damageType?: DamageType,
        number?: number,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ): Promise<import('../event/DamageEvent').DamageEvent>;
    /** 作为目标受到伤害（source 可为 undefined 表示无来源） */
    takeDamage(
        source: Player | undefined,
        damageType?: DamageType,
        number?: number,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ): Promise<import('../event/DamageEvent').DamageEvent>;
    loseHp(
        number?: number,
    ): Promise<import('../event/DamageEvent').LoseHpEvent>;
    reduceHp(
        number?: number,
    ): Promise<import('../event/DamageEvent').ReduceHpEvent>;
    recover(
        number?: number,
    ): Promise<import('../event/HpEvent').RecoverHpEvent>;
    /** 将体力恢复到目标值（自动计算回复量，最多到上限），委托到 Room */
    recoverTo(
        targetHp: number,
    ): Promise<import('../event/HpEvent').RecoverHpEvent>;
    changeMaxHp(
        number?: number,
    ): Promise<import('../event/HpEvent').ChangeMaxHpEvent>;
    dying(): Promise<import('../event/DyingEvent').DyingEvent>;
    die(killer?: Player): Promise<import('../event/DyingEvent').DeathEvent>;
    canLoseHp(number?: number): boolean;
    canRecover(number?: number): boolean;
    canChangeMaxHp(number?: number): boolean;
    /**
     * 检测 targetPlayer 指定区域的牌中可被当前玩家弃置的数量是否 ≥ count。
     * @param targetPlayer 被检者
     * @param count 需要数量
     * @param pos 区域（h/e/j/u/s，默认 h）
     */
    canDiscard(targetPlayer: Player, count?: number, pos?: string): boolean;
    /**
     * 检测 targetPlayer 指定区域的牌中可被当前玩家获得的数量是否 ≥ count。
     * @param targetPlayer 被检者
     * @param count 需要数量
     * @param pos 区域（h/e/j/u/s，默认 h）
     */
    canObtain(targetPlayer: Player, count?: number, pos?: string): boolean;
    moveCards(
        cards: GameCard[],
        toArea: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    putTo(
        cards: GameCard[],
        toArea: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    draw(
        count?: number,
        pos?: 'top' | 'bottom',
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    discard(
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    obtain(
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    recast(
        cards: GameCard[],
        drawOneAlways?: boolean,
        opts?: MoveCardOpts,
    ): Promise<void>;
    give(
        toPlayer: Player,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    swap(
        cards1: GameCard[],
        toArea1: AreaId,
        cards2: GameCard[],
        toArea2: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 明置自己的武将 */
    open(
        generals: General[],
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 暗置自己的武将 */
    close(
        generals: General[],
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /**
     * 横置/重置自己。
     * @param damageType 横置属性（toState=false 时用于解锁动画），默认 None
     */
    chain(
        toState?: boolean,
        damageType?: DamageType,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 翻面 */
    turnOver(
        toState?: boolean,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 变更自己的武将 */
    change(
        general: General | 'head' | 'deputy',
        toGeneral: General,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 移除自己的武将 */
    remove(
        general: General,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    judge(
        isSuccess?: (result: VirtualCardData) => boolean,
    ): Promise<import('../event/JudgeEvent').JudgeEvent>;
    showCards(cards: GameCard[]): Promise<void>;
    flashCards(cards: GameCard[], opts?: MoveCardOpts): Promise<void>;
    removeToReserve(
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    chooseCard(
        cards: GameCard[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<GameCard[]>;
    choosePlayer(
        targets: Player[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<Player[]>;
    chooseGeneral(
        generals: General[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<General[]>;
    chooseOption(
        options: string[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<string[]>;
    /** 按位置字符获取目标玩家对应区域的牌 */
    private _getCardsByPos;
}

declare enum Phase {
    None = 0,
    Ready = 1,
    Judge = 2,
    Draw = 3,
    Play = 4,
    Drop = 5,
    End = 6,
    JiaoDiZhu = 100,
    ConfirmScore = 101,
    NotScore = 102,
}

/**
 * 核心注册——将全部枚举和 Builder 类一次性挂载到 sgs 全局对象。
 * 扩展通过 sgs.TimingName.DamageStart 访问运行时值，无需 import 核心模块。
 */
/**
 * 将核心枚举和 Builder 一次性挂载到目标对象。
 * 幂等——重复调用不重复赋值（Object.assign 天然覆盖幂等）。
 */
declare function registerCore(target: Record<string, any>): void;

declare type RichString =
    | string
    | {
          text: string;
          values: Record<string, RichStringValue>;
      };
declare type RichStringValue =
    | {
          player: string;
      }
    | {
          players: string[];
      }
    | {
          card: string;
      }
    | {
          cards: string[];
      }
    | {
          number: number;
      }
    | {
          text: RichString;
      }
    | {
          texts: RichString[];
      }
    | {
          cardData: string;
      }
    | {
          cardDatas: string[];
      }
    | {
          vcard: VirtualCardData;
      }
    | {
          vcards: VirtualCardData[];
      }
    | {
          area: string;
      };

/** ModeBuilder 实例接口 */
declare interface ModeBuilder {
    readonly name: string;
    maxPlayer(n: number): this;
    isTeamMode(v?: boolean): this;
    settings(s: Record<string, string[]>): this;
    rules(r: string): this;
    beforeStart(fn: (room: Room) => Promise<void>): this;
    mainProcess(
        fn: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>,
    ): this;
    register(): GameMode;
}
/** ModeBuilder 工厂——无需 new */
declare function ModeBuilder(name: string): ModeBuilder;

/** 房间创建选项 */
declare interface RoomOption {
    name: string;
    password?: string;
    /** 游戏模式标识（对应 sgs.modes key） */
    mode?: string;
    /** 最大玩家数 */
    playerCountMax?: number;
    /** 响应时间(秒) */
    responseTime?: number;
    /** 选将时间(秒) */
    chooseGeneralTime?: number;
    /** 启用的卡牌扩展包 */
    cards: string[];
    /** 启用的武将 */
    generals: string[];
    /** 初始选将数量 */
    chooseGeneralCount?: number;
    /** 手气卡次数 */
    luckyCardCount?: number;
    /** 其他设置 */
    settings: Record<string, any>;
}
declare interface GameMode {
    /** 模式名 */
    name: string;
    /** 玩家数 */
    maxPlayer: number;
    /** 是否为团队模式 */
    isTeamMode: boolean;
    /** 额外设置项 客户端会根据此项构建UI，键->设置key，值->设置选项如果数组为空则表示切换为checkbox */
    settings: Record<string, string[]>;
    /** 不通用的规则技能 */
    rules: string;
    /** 游戏开始前调用（必须提供） */
    beforeStart: (room: Room) => Promise<void>;
    /** 主流程逻辑
     * 主流程指回合交替。它用于处理如何确定下一个进行回合的角色。
     * 如果不实现这个函数，则会按照默认的处理方式进行游戏。
     * 这个函数在游戏主循环中被调用，所以无需再内部实现循环逻辑
     * 默认的流程：由一号位开始进行回合，每回合结束后由该玩家的下家进行回合。每次额定回合重新轮到一号位时，轮数+1。
     * 你需要在内部实现中对turn参数的数据进行修改
     * 关于额外回合：主流程逻辑表示游戏中的每个额定回合如何确定，无需考虑额外回合的实现。
     */
    mainProcess?: (
        room: Room,
        turn: TurnEvent,
        last?: TurnEvent,
    ) => Promise<void>;
}

/**
 * 玩家输入接口。
 * 服务端通过此接口向客户端发送选择请求。
 * 响应通过 ChooseManager.respond() 回传（网络层收到客户端消息后调用）。
 */
declare interface IPlayerInput {
    /**
     * 向客户端发送选择请求。
     * @returns Promise<void> 表示消息已发送（不等待玩家响应）
     */
    requestChoice(playerId: string, session: SelectSession): Promise<void>;
}

/**
 * 区域 ID 联合类型：GameCardId = string, GeneralId = string
 */
type AreaItemId = GameCardId | GeneralId;
/**
 * 区域管理器 — 卡牌区域和武将区域的增删查改、洗牌、移动。
 *
 * 通过泛型自动判断 ID 类型：
 * - number → 操作 room.state.cardAreas（游戏牌）
 * - string → 操作 room.state.generalAreas（武将牌）
 */
declare class AreaManager {
    readonly room: Room;
    constructor(room: Room);
    /** 初始化区域（若不存在则创建空 ArraySchema）。isGeneral=true 创建武将区域 */
    initArea(areaId: AreaId, isGeneral?: boolean): void;
    /** 根据 ID 格式返回对应的区域 MapSchema——卡牌 ID 匹配 {扩展名}.{数字} */
    private _mapFor;
    /**
     * 向区域添加 ID（卡牌或武将），自动判断区域类型。
     * @param pos 插入位置：'top' | 'bottom' | 'random' | 精确索引
     */
    add<T extends AreaItemId>(
        areaId: AreaId,
        ids: T[],
        pos?: 'top' | 'bottom' | 'random' | number,
    ): void;
    /** 从区域移除 ID */
    remove<T extends AreaItemId>(areaId: AreaId, ids: T[]): void;
    /** 获取卡牌/武将区域的 ID 列表（均为 string[]） */
    get(areaId: AreaId, isGeneral?: boolean): ArraySchema<string> | undefined;
    /**
     * 从区域获取 count 个 ID（不移除）。
     * @param pos 'top' | 'bottom' | 'random' | 精确索引
     */
    getCards(
        areaId: AreaId,
        count: number,
        pos?: 'top' | 'bottom' | 'random' | number,
        isGeneral?: boolean,
    ): string[];
    /** 获取单张 ID（卡牌或武将） */
    getOne(
        areaId: AreaId,
        pos?: 'top' | 'bottom' | 'random' | number,
        isGeneral?: boolean,
    ): number | string | undefined;
    /**
     * 按条件筛选卡牌 ID（仅游戏牌，需要 GameCard 实体）。
     */
    filterCards(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number,
        fn: (card: GameCard) => boolean,
    ): string[];
    /** 按条件筛选单张卡牌 ID */
    filterOneCard(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number,
        fn: (card: GameCard) => boolean,
    ): string | undefined;
    /**
     * 按条件筛选武将 ID。
     */
    filterGenerals(
        areaId: AreaId,
        count: number,
        pos: 'top' | 'bottom' | 'random' | number,
        fn: (general: General) => boolean,
    ): string[];
    /** 按条件筛选单张武将 ID */
    filterOneGeneral(
        areaId: AreaId,
        pos: 'top' | 'bottom' | 'random' | number,
        fn: (general: General) => boolean,
    ): string | undefined;
    /** 将 ID 从 from 区域移动到 to 区域 */
    move<T extends AreaItemId>(
        ids: T[],
        from: AreaId,
        to: AreaId,
        pos?: 'top' | 'bottom' | 'random' | number,
    ): void;
    /**
     * 洗牌（卡牌或武将）。
     * 不传 targetIds 时全量 Fisher-Yates 洗牌；
     * 传 targetIds 时将这些 ID 随机重插入。
     * @param isGeneral 是否为武将区域
     */
    shuffle(
        areaId: string,
        targetIds?: (number | string)[],
        isGeneral?: boolean,
    ): void;
    /** 洗牌实现（泛型，避免 union 类型冲突） */
    private _shuffleImpl;
    /** 按位置参数排序/截取 */
    private _applyPos;
    /** 计算插入位置 */
    private _addIndex;
    /** 从数组中随机取 count 个元素（不修改原数组） */
    private _randomPick;
}
declare;
{
}

/**
 * 通讯管理器 — 向客户端发送消息。
 *
 * `broadcast` 为基础方法，其余均为快捷方法：
 * - sendLog: 游戏战报（面向玩家的日志）
 * - toast: 弹出提示
 * - playAudio: 播放配音/音效
 * - playBGM: 切换背景音乐
 * - playDirectLine: 播放指向线
 * - playAnimation: 播放动画
 *
 * 当前为桩实现，Phase 9（网络层）补充。
 */
declare class BroadcastManager {
    readonly room: Room;
    constructor(room: Room);
    /**
     * 基础广播方法。
     * @param msg 消息体
     * @param except 排除的玩家（不发送）
     */
    broadcast(msg: Record<string, any>, except?: Player[]): void;
    /** 向指定玩家发送消息 */
    sendToPlayer(playerId: string, msg: Record<string, any>): void;
    /**
     * 发送游戏战报（面向玩家的日志）。
     * @param log 战报数据
     * @param toast 是否同时弹出提示
     */
    sendLog(log: Record<string, any>, toast?: boolean): void;
    /** 弹出提示 */
    toast(text: string, player?: Player): void;
    /** 播放配音/音效 */
    playAudio(url: string, player?: Player): void;
    /** 切换背景音乐 */
    playBGM(url: string): void;
    /** 播放指向线动画 */
    playDirectLine(from: Player, to: Player | Player[]): void;
    /** 播放动画（脸谱动画、特效等） */
    playAnimation(
        type: string,
        player: Player | Player[],
        data?: Record<string, any>,
    ): void;
}

/**
 * 卡牌管理器 — 负责卡牌实例创建、索引构建与查询。
 * 区域移动见 AreaManager，虚拟牌操作见 VirtualCardManager。
 */
declare class CardManager {
    readonly room: Room;
    constructor(room: Room);
    /**
     * 创建实体牌实例并放入区域。
     * @param sync 是否同步到客户端（initStart 批量为 false）
     */
    create(data: GameCardData, initArea?: string): GameCard;
    /**
     * 注册卡牌到房间索引（cards Map + name/type/subtype）。
     * 衍生牌跳过牌名索引。initStart 中批量加载后统一调用。
     * @param sync 是否同步到客户端
     */
    build(card: GameCard, sync?: boolean): void;
    /** 按 ID 获取卡牌 */
    get(id: GameCardId): GameCard | undefined;
    /** 批量获取卡牌（过滤无效 ID） */
    gets(ids: GameCardId[]): GameCard[];
    /** 获取卡牌 ID 数组 */
    getIds(cards: GameCard[]): GameCardId[];
    /** 注册牌的使用方式定义（从 sgs.carduses 拷贝到 room.carduses） */
    initCardUses(): void;
}

/**
 * 选择管理器 — 玩家交互选择的运行时。
 *
 * 管理选择会话的完整生命周期：发起 → 等待 → 响应/超时/取消。
 * 同一玩家同一时间只能有一个进行中的选择，新请求会自动取消旧会话。
 */
declare class ChooseManager {
    readonly room: Room;
    constructor(room: Room);
    /** sessionId → 等待中的选择 */
    private _pending;
    /** playerId → sessionId（同一玩家同时只有一个会话） */
    private _byPlayer;
    /**
     * 发起选择请求，返回 Promise 在玩家响应/超时/取消时 resolve。
     * 同一玩家已有进行中会话时自动取消旧会话。
     *
     * @param session 选择会话配置（timeout 单位为秒）
     */
    request(session: SelectSession): Promise<SelectResult>;
    /**
     * 多段选择：依次发送多个会话，共享总超时。
     * 任一会话取消则终止后续所有会话。
     * 后续会话可通过 ctx.results 访问已完成会话的所有选择结果。
     *
     * @param playerId 目标玩家 ID
     * @param sessions 选择会话列表（每个 timeout 单位为秒）
     * @param totalTimeoutSec 总超时（秒），默认取自 room.options.responseTime ?? 15
     * @returns 按顺序排列的选择结果数组
     */
    multiStep(
        playerId: string,
        sessions: SelectSession[],
        totalTimeoutSec?: number,
    ): Promise<SelectResult[]>;
    /**
     * 玩家响应选择结果。
     * 将结果写入 ctx.results / ctx.windowResults，通常在网络层收到客户端消息时调用。
     */
    respond(sessionId: string, result: SelectResult): void;
    /**
     * 取消指定会话。
     */
    cancel(sessionId: string): void;
    /**
     * 取消某玩家当前等待中的选择。
     */
    cancelAll(playerId: string): void;
    /**
     * 玩家是否有等待中的选择。
     */
    isPending(playerId: string): boolean;
    /**
     * 获取玩家当前等待中的会话 ID。
     */
    getPendingSessionIds(playerId: string): string[];
    /** 超时处理：自动选择或标记取消 */
    private _handleTimeout;
    /**
     * 自动选择每个步骤的第一个可选项。
     * 通过 step.name 查询 sgs.selectors 预设，step 中 name 以外的字段覆盖预设。
     */
    private _autoSelect;
    /** 判断是否还能继续选择更多项 */
    private _canSelectMore;
    /** 清理等待队列和定时器 */
    private _cleanup;
}

/**
 * 事件管理器 — 事件创建、触发调度、历史记录、复活队列。
 */
declare class EventManager {
    readonly room: Room;
    constructor(room: Room);
    /** 当前正在执行的 Effect（UseSkillEvent 执行 cost/effect 期间设置） */
    _currentEffect?: Effect;
    private _meta;
    /**
     * 泛型事件工厂：创建事件 → 注入元数据 → 执行 → 返回。
     * 若存在 _currentEffect 且未显式传入 reason/effect，则自动填充。
     */
    create<T extends EventProcess>(
        EventClass: new (room: Room, data: any) => T,
        eventData: Record<string, any>,
        opts?: {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<T>;
    /** 创建并执行伤害事件。 */
    damage(
        opts: DamageEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DamageEvent>;
    /** 创建并执行失去体力事件。 */
    loseHp(
        opts: LoseHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<LoseHpEvent>;
    /** 创建并执行扣减体力事件。 */
    reduceHp(
        opts: ReduceHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ReduceHpEvent>;
    /** 创建并执行濒死事件。 */
    dying(
        opts: DyingEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DyingEvent>;
    /** 创建并执行死亡事件。killer 由 DyingEvent 传入，未传时 DeathEvent 自行追溯。 */
    die(
        opts: DeathEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<DeathEvent>;
    /** 创建并执行回复体力事件。 */
    recover(
        opts: RecoverHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<RecoverHpEvent>;
    /** 创建并执行体力上限改变事件。 */
    changeMaxHp(
        opts: ChangeMaxHpEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ChangeMaxHpEvent>;
    /** 创建并执行状态改变事件。自动检测子类型。 */
    changeState(
        opts: ChangeStateData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<ChangeStateEvent>;
    /** 创建并执行判定事件。 */
    judge(
        opts: JudgeEventData & {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
        },
    ): Promise<JudgeEvent>;
    /** 创建并执行移动卡牌事件。 */
    moveCards(
        datas: MoveCardData[],
        opts?: {
            source?: EventProcess;
            reason?: string;
            effect?: Effect;
            getMoveLabel?: (data: MoveCardData) => any;
            log?: (data: MoveCardData) => any;
        },
    ): Promise<MoveCardEvent>;
    /** 将事件记录到历史日志（委托到 Room）。 */
    insertHistory(event: EventProcess): void;
    /**
     * 异步处理所有待执行的复活回调。
     * 由事件回调内部调用（DamageEnd / LoseHpEnd），确保复活在后续流程前完成。
     */
    drainFuhuos(): Promise<void>;
    /** 注册技能/效果的 refreshs 到房间索引 */
    registerRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<any, T>> | undefined,
    ): void;
    /** 注销技能/效果的 refreshs */
    unregisterRefreshs<T extends Skill | Effect>(
        source: T,
        refreshs: Array<TimingCallback<any, T>> | undefined,
    ): void;
    /**
     * 触发一个时机 — 按优先级调度触发效果。
     *
     * @param skipRefreshs 事件流程中已通过 injectRefreshs 注入到 Timing 中，
     *   触发时传 true 避免重复分发。独立调用（如 processCompleted）传默认值 false。
     */
    trigger(
        timingName: TimingName,
        data: EventProcess | Record<string, any>,
        skipRefreshs?: boolean,
    ): Promise<void>;
    /**
     * 创建 UseSkillEvent 并执行。返回 false 表示"时机结束"信号。
     */
    private _invokeSkill;
    /**
     * 询问玩家选择要发动的技能。
     * 若包含可自动发动的技能 → 客户端不能取消（canCancel=false）。
     * headless 模式通过 autoSelectFirst+短超时自动确认第一个。
     */
    private _askForSkillInvoke;
    private _orderToPriority;
    private _priorityLabel;
}

/**
 * 武将管理器 — 武将查询、选将分配、变更。
 */
declare class GeneralManager {
    readonly room: Room;
    constructor(room: Room);
    /**
     * 创建武将实例并放入区域。
     * @param sync 是否同步到客户端（initStart 批量为 false）
     */
    create(data: GeneralData): General;
    /**
     * 注册武将到房间索引。
     * @param sync 是否同步到客户端
     */
    build(general: General, sync?: boolean): void;
    /** 按 ID 获取武将 */
    get(id: GeneralId): General | undefined;
    /** 批量按 ID 获取武将 */
    gets(ids: GeneralId[]): General[];
    /** 获取武将 ID 数组 */
    getIds(generals: General[]): GeneralId[];
    /** 按真名查找武将 */
    getByName(trueName: string): General | undefined;
    /**
     * 获取主公武将列表（去重真名，随机顺序）。
     * @param count 最多返回数量
     */
    getLordGenerals(count?: number): General[];
    /**
     * 随机选取 count 张真名未被选走的武将，并记录到 room.pickedGeneralNames。
     * @param count 选取数量
     */
    pickRandom(count?: number): General[];
    /**
     * 将指定武将的真名从已选集合中释放，允许后续再次被选取。
     * @param generals 需释放的武将列表
     */
    releasePicked(generals: General[]): void;
    /**
     * 为玩家分配选将。
     * 1) 按座次顺序处理所有玩家的预选，记录到 pickedGeneralNames
     * 2) 为每位玩家随机补足至 chooseGeneralCount 张
     */
    allocateGenerals(players: Player[]): Map<Player, General[]>;
    /**
     * 获取用于变更的武将牌。
     * 优先取同势力，同势力已用完时清空 changeGenerals 记录重试。
     * @param kingdomOrPlayer 势力字符串或 Player 实例
     * @param count 需要数量
     */
    getChangeGeneral(
        kingdomOrPlayer: string | Player,
        count?: number,
    ): General[];
}

/**
 * 玩家管理器 — 负责玩家查询、座次排序、响应顺序，以及玩家生命周期。
 */
declare class PlayerManager {
    readonly room: Room;
    constructor(room: Room);
    /**
     * 创建玩家实体并注册到 Room。游戏中途也可调用（如 3v3 模式）。
     */
    createPlayer(
        playerId: string,
        username: string,
        opts?: {
            prechooses?: string[];
            seattag?: string;
            controlId?: string;
        },
    ): Player;
    /** 按 ID 获取玩家 */
    get(id: string): Player | undefined;
    /** 批量按 ID 获取玩家 */
    gets(ids: string[]): (Player | undefined)[];
    /** 获取玩家 ID 数组 */
    getIds(players?: Player[]): string[];
    /** 按条件筛选玩家 */
    filter(fn: (p: Player) => boolean, includeDead?: boolean): Player[];
    /** 按条件统计玩家数 */
    count(fn: (p: Player) => boolean, includeDead?: boolean): number;
    /**
     * 按座次排序（原地修改数组）。
     * - clockwise=false（默认）：逆时针序（三国杀正常回合顺序）
     * - 以 start 为起点，start 不在列表中时取其座位计算偏移
     */
    sort(players?: Player[], start?: Player, clockwise?: boolean): Player[];
    /** 按响应顺序排序（从当前回合/seat=1 玩家开始逆时针） */
    sortResponse(players?: Player[]): Player[];
    /** 按顺时针排序 */
    sortClockwise(players?: Player[]): Player[];
}

/**
 * 技能管理器 — 技能/效果生命周期、效果索引、状态技查询。
 */
declare class SkillManager {
    readonly room: Room;
    constructor(room: Room);
    /** 为玩家添加技能并创建所有关联 Effect */
    addSkill(
        skillName: string,
        player: Player | undefined,
        options?: SkillOptions,
    ): Skill | undefined;
    /** 移除技能及所有关联效果 */
    removeSkill(skill: Skill): Promise<void>;
    /** 创建效果并注册索引 */
    addEffect(
        effectName: string,
        player: Player | undefined,
        options?: EffectOptions,
        fromSkill?: Skill,
    ): Effect | undefined;
    /** 移除效果：注销索引 → 从列表移除 */
    removeEffect(effect: Effect, removeSkill?: boolean): Promise<void>;
    /** 注册效果到房间索引：触发效果 → triggerEffects，状态效果 → stateEffects。二者互斥。 */
    private registerEffect;
    /** 注销效果索引 */
    private unregisterEffect;
    /**
     * 查询所有匹配的状态效果回调。
     */
    getStates<T extends StateEffectType>(type: T, ...args: any[]): any[];
}

/**
 * 虚拟牌管理器 — 虚拟牌的生命周期（创建/销毁/切断/清空）。
 */
declare class VirtualCardManager {
    readonly room: Room;
    constructor(room: Room);
    /** 按名称+子牌创建虚拟牌 */
    createByName(
        name: string,
        cards: GameCard[],
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard;
    /** 创建无子牌的虚拟牌 */
    createByEmpty(
        name: string,
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard;
    /** 以单张实体牌为子牌创建虚拟牌 */
    createFromCard(
        card: GameCard,
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard;
    /** 从 VirtualCardData 数据恢复虚拟牌 */
    createFromData(data: VirtualCardData): VirtualCard;
    /** 销毁虚拟牌：断子牌链接 → 标记销毁 → 移除 */
    destroy(vc: VirtualCard): void;
    /** 断开虚拟牌与子牌的关联（不销毁虚拟牌本身） */
    break(vc: VirtualCard): void;
    /** 清空全部虚拟牌 */
    clear(): void;
}

/** refreshs 回调条目（fn 已 bind，this 指向 source） */
declare interface RefreshEntry {
    source: Skill | Effect;
    fn: (room: Room, data: any) => Promise<any>;
}
declare class Room implements Omit<MarkHost, 'room'> {
    private _input;
    /** 玩家输入接口（ChooseManager 通过此接口与客户端通信） */
    get input(): IPlayerInput;
    readonly logger: ILogger;
    /** 房间自身状态（Colyseus Schema 根节点） */
    readonly state: RoomState;
    /** 运行时自定义数据 */
    readonly data: Record<string, any>;
    /** 标记状态 Map */
    readonly marksMap: MapSchema<MarkState>;
    /** 标记 key→内容集合 索引 */
    readonly _markKeyMap: Map<string, Set<string>>;
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    /** 区域操作 */
    area: AreaManager;
    /** 卡牌创建/索引 */
    card: CardManager;
    /** 虚拟牌生命周期 */
    vcard: VirtualCardManager;
    /** 玩家查询/排序 */
    player: PlayerManager;
    /** 武将查询/选将 */
    general: GeneralManager;
    /** 技能/效果生命周期 */
    skill: SkillManager;
    /** 事件触发调度 */
    event: EventManager;
    /** 客户端通讯 */
    broadcast: BroadcastManager;
    /** 玩家选择交互 */
    choose: ChooseManager;
    /** 所有玩家实体列表 */
    players: Player[];
    /** playerId → Player 快速索引 */
    playerMaps: Map<string, Player>;
    /** 所有卡牌实例（ID → 实体） */
    cards: Map<string, GameCard>;
    /** 非衍生牌名列表 */
    cardNames: string[];
    /** 牌名 → 卡牌类型 索引 */
    cardNamesToType: Map<CardType, Set<string>>;
    /** 牌名 → 卡牌副类型 索引 */
    cardNamesToSubType: Map<CardSubType, Set<string>>;
    /** 所有虚拟牌 */
    vcards: VirtualCard[];
    /** 牌的默认使用方式（牌名 → CardUseData）。从 sgs.carduses 惰性复制 */
    carduses: Map<string, CardUseData>;
    /** 所有武将实例（ID → 实体） */
    generals: Map<GeneralId, General>;
    /** 所有武将真名列表 */
    generalNames: string[];
    /** 本局已被选走的武将真名集合（防止选将/补将重复） */
    pickedGeneralNames: Set<string>;
    /** 本次变更已用过的武将（防止变更时重复出同一张） */
    changeGenerals: Set<General>;
    /** 事件自增 ID */
    eventIds: number;
    /** 技能自增 ID */
    skillIds: number;
    /** 效果自增 ID */
    effectIds: number;
    /** 所有运行时技能实例 */
    skills: Skill[];
    /** 所有运行时效果实例 */
    effects: Effect[];
    /** 当前事件栈（正在执行的事件链，不含 Turn/Phase 事件） */
    eventStack: EventProcess[];
    /** 回合栈 */
    turnStack: TurnEvent[];
    /** 阶段栈 */
    phaseStack: PhaseEvent[];
    /** 当前回合（栈顶） */
    get currentTurn(): TurnEvent | undefined;
    /** 当前阶段（栈顶） */
    get currentPhase(): PhaseEvent | undefined;
    /** 延迟明置队列 */
    deferredOpens: EventProcess[];
    /** 复活回调队列 */
    fuhuos: Array<() => Promise<void>>;
    /** 房间设置 */
    readonly options: RoomOption;
    /** 游戏模式（startGame 时从 sgs.modes 获取并缓存） */
    mode?: GameMode;
    /** 游戏阶段 */
    private _gameState;
    /** 是否正在游戏中 */
    get isGaming(): boolean;
    /** 游戏是否正在结束 */
    get isEnding(): boolean;
    /** 当前轮次的起始回合 */
    roundStartTurn?: TurnEvent;
    /** 额外回合队列 */
    extraTurns: TurnEvent[];
    /** 事件历史 */
    private _history;
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
    >;
    /**
     * 状态效果索引：StateEffectType → 拥有该状态回调的效果列表
     */
    stateEffects: Map<StateEffectType, Effect[]>;
    /**
     * refreshs 回调索引：TimingName → before/after 回调列表
     */
    refreshsByTiming: Map<
        TimingName,
        {
            before: Array<RefreshEntry>;
            after: Array<RefreshEntry>;
        }
    >;
    /** 存活玩家列表 */
    get alives(): Player[];
    set turnCount(value: number);
    get turnCount(): number;
    set roundCount(value: number);
    get roundCount(): number;
    /**
     * 游戏延迟等待。
     * 让玩家有时间观察游戏情况，暂停游戏流程。
     * @param seconds 延迟秒数
     * @param showProgressBar 是否让所有玩家显示等待进度条
     */
    delay(seconds: number, showProgressBar?: boolean): Promise<void>;
    damage(
        player: Player | undefined,
        target: Player,
        damageType?: DamageType,
        number?: number,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ): Promise<import('../event/DamageEvent').DamageEvent>;
    loseHp(
        player: Player,
        number?: number,
    ): Promise<import('../event/DamageEvent').LoseHpEvent>;
    reduceHp(
        player: Player,
        number?: number,
    ): Promise<import('../event/DamageEvent').ReduceHpEvent>;
    recover(
        player: Player,
        number?: number,
    ): Promise<import('../event/HpEvent').RecoverHpEvent>;
    recoverTo(
        player: Player,
        targetHp: number,
    ): Promise<import('../event/HpEvent').RecoverHpEvent>;
    changeMaxHp(
        player: Player,
        number?: number,
    ): Promise<import('../event/HpEvent').ChangeMaxHpEvent>;
    dying(player: Player): Promise<import('../event/DyingEvent').DyingEvent>;
    die(
        player: Player,
        killer?: Player,
    ): Promise<import('../event/DyingEvent').DeathEvent>;
    /** 检测 loseHp 是否可执行：体力值 ≥ number 且存活 */
    canLoseHp(player: Player, number?: number): boolean;
    /** 检测 recover 是否可执行：计算实际回复量（不超过已损失体力值）> 0 */
    canRecover(player: Player, number?: number): boolean;
    /** 检测 changeMaxHp 是否可执行（number 为负值时减少上限） */
    canChangeMaxHp(player: Player, number?: number): boolean;
    /**
     * 使用牌——双签名入口。
     *
     * 签名 1（直接触发）：传入 card + targets，创建 UseCardEvent 并执行。
     * 签名 2（发起询问）：传入 cardNames/skills，通过 ChooseManager 选牌→选目标→回调签名 1。
     */
    useCard(
        player: Player,
        cardOrOpts:
            | VirtualCard
            | {
                  cardNames?: string[];
              },
        targets?: Player[],
    ): Promise<UseCardEvent | null>;
    /**
     * 使用牌合法性检测（三关）。
     * 1. Prohibit_UseCard StateEffect
     * 2. 使用次数（杀在出牌阶段空闲时间点）
     * 3. 合法目标数 ≥ 额定下限 ≠ 0
     */
    canUseCard(
        player: Player,
        cardNameOrVC: string | VirtualCard,
        target?: Player,
    ): boolean;
    /** 移动卡牌。cards 第一参数，toArea 第二参数 */
    moveCards(
        cards: GameCard[],
        toArea: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 移动卡牌（完整数据数组）。供复杂移动场景使用 */
    moveCardsRaw(
        datas: MoveCardData[],
        opts?: {
            getMoveLabel?: (data: MoveCardData) => any;
            log?: (data: MoveCardData) => any;
        },
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /**
     * 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），仍不够则平局。
     */
    getNCards(count: number, pos?: 'top' | 'bottom'): Promise<GameCard[]>;
    /** 置于牌：将牌直接移动到目标区域（委托到 moveCards，reason 默认 'put'） */
    putTo(
        cards: GameCard[],
        toArea: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /**
     * 洗牌：将弃牌堆洗混后通过 MoveCardEvent 置入牌堆底部（原牌堆顺序不变）。
     */
    shuffleDiscardToDraw(): Promise<void>;
    /** 摸牌：从牌堆摸 count 张到 player 的手牌。原因 draw */
    draw(
        player: Player,
        count?: number,
        pos?: 'top' | 'bottom',
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 弃牌：将牌移动到弃牌堆。原因 discard */
    discard(
        player: Player,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 获得牌：将牌移动到操作者手牌区。原因 obtain */
    obtain(
        player: Player,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 重铸：①将牌置入弃牌堆 → ②摸等量牌。drawOneAlways 为 true 时固定摸 1 张 */
    recast(
        player: Player,
        cards: GameCard[],
        drawOneAlways?: boolean,
        opts?: MoveCardOpts,
    ): Promise<void>;
    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 的手牌区。原因 give */
    give(
        fromPlayer: Player,
        toPlayer: Player,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /**
     * 交换牌：将 cards1 和 cards2 同时置入处理区，再分别移动到对方区域。
     * 原因 swap.put / swap
     */
    swap(
        cards1: GameCard[],
        toArea1: AreaId,
        cards2: GameCard[],
        toArea2: AreaId,
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /** 展示牌：通知客户端显示卡牌（无实际区域移动）。TODO Phase 9: 可见性 */
    showCards(player: Player | undefined, cards: GameCard[]): Promise<void>;
    /** 亮出牌：牌堆里的牌 → 处理区(put)；其他牌 → 等同于展示 */
    flashCards(
        player: Player | undefined,
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<void>;
    /** 明置武将 */
    open(
        player: Player,
        generals: General[],
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 暗置武将 */
    close(
        player: Player,
        generals: General[],
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /**
     * 横置/重置武将。
     * @param damageType 横置属性（toState=false 时用于解锁动画），默认 None
     */
    chain(
        player: Player,
        toState?: boolean,
        damageType?: DamageType,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 翻面 */
    skip(
        player: Player,
        toState?: boolean,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 变更武将（替换为主将或副将） */
    change(
        player: Player,
        general: General | 'head' | 'deputy',
        toGeneral: General,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 移除武将 */
    remove(
        player: Player,
        general: General,
    ): Promise<import('../event/ChangeStateEvent').ChangeStateEvent>;
    /** 判定：对玩家执行一次判定流程 */
    judge(
        player: Player,
        isSuccess?: (result: VirtualCardData) => boolean,
    ): Promise<import('../event/JudgeEvent').JudgeEvent>;
    /** 移存牌：将牌移动到后备区。原因 remove */
    removeToReserve(
        cards: GameCard[],
        opts?: MoveCardOpts,
    ): Promise<import('../event/MoveCardEvent').MoveCardEvent>;
    /**
     * 请求玩家选择卡牌。
     * @returns 选中的卡牌数组，取消/超时返回空数组
     */
    chooseCard(
        player: Player,
        cards: GameCard[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<GameCard[]>;
    /**
     * 请求玩家选择目标玩家。
     * @returns 选中的玩家数组，取消/超时返回空数组
     */
    choosePlayer(
        player: Player,
        targets: Player[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<Player[]>;
    /**
     * 请求玩家选择武将。
     * @returns 选中的武将数组，取消/超时返回空数组
     */
    chooseGeneral(
        player: Player,
        generals: General[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<General[]>;
    /**
     * 请求玩家从选项列表中选择。
     * @returns 选中的选项 key 数组，取消/超时返回空数组
     */
    chooseOption(
        player: Player,
        options: string[],
        count?: SelectCount,
        opts?: Partial<SelectSession>,
    ): Promise<string[]>;
    /** 通用的单项选择实现 */
    private _choose;
    /** 创建 SelectorContext，自动填充 eventData/skillName */
    private _makeSelectorContext;
    /** 构建带默认值的 SelectSession（opts 不可覆盖 id/player/steps/context） */
    private _buildSession;
    /** 从 AreaId 获取区域类型 */
    private _getAreaType;
    /** 从 AreaId 获取所属玩家 */
    private _getAreaPlayer;
    /** 默认 6 个额定阶段 */
    static getRatedPhases(): Phase[];
    /**
     * 初始化游戏：创建区域、玩家、卡牌、武将。
     * TODO Phase 6: 加载卡牌/武将数据
     */
    initStart(
        playerDatas?: {
            playerId: string;
            username: string;
            prechooses?: string[];
            seattag?: string;
            controlId?: string;
        }[],
    ): Promise<void>;
    /**
     * 开始游戏：获取模式 → beforeStart → 主循环。
     */
    startGame(): Promise<void>;
    /** 游戏主循环：按轮次/回合创建 TurnEvent 并执行。 */
    private _mainProcess;
    /**
     * 确定下一名执行回合的玩家。
     * 跳过死亡玩家；休整玩家不跳过（由 TurnEvent 处理 rest 减扣与回合跳过）。
     */
    private _getNextPlayer;
    /**
     * 结束游戏。
     * @param wins 获胜方（空数组表示平局）
     * @param reason 结束原因（如 'mode_not_found' 表示模式不存在）
     */
    gameOver(wins: Player[], reason: string): Promise<void>;
    /** 记录事件到历史 */
    insertHistory(event: EventProcess): void;
    /** 查询最后一个指定类型的历史事件 */
    getLastOneHistory<T extends EventProcess>(
        type: string,
        filter?: (event: T) => boolean,
    ): T | undefined;
    constructor(
        roomId: string,
        gameId: string,
        options: RoomOption,
        state: RoomState,
        input: IPlayerInput,
        logger: ILogger,
    );
}

declare class CardState extends Schema {
    id: string;
    area: string;
    put: boolean;
    label: string;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
}

declare class EffectState extends Schema {
    id: number;
    skillId: number;
    playerId: string;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
    invalids: ArraySchema<string>;
    audios: ArraySchema<string>;
}

declare class GeneralState extends Schema {
    id: string;
    area: string;
    put: boolean;
    label: string;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
}

declare class MarkState extends Schema {
    key: string;
    value: string;
    source: string;
    visible: ArraySchema<string>;
    values: string;
    parseType: string;
    refType: string;
    refArea: string;
    refMark: string;
}

declare class PlayerState extends Schema {
    /** 唯一玩家ID */
    playerId: string;
    /** 玩家名字 */
    username: string;
    /** 会话ID */
    sessionId: string;
    /** 座次 */
    seat: number;
    /** 身份 */
    role: string;
    /** 身份牌放置方式 */
    rolePut: boolean;
    /** 势力 */
    kingdom: string;
    /** 性别 */
    gender: number;
    /** 体力 */
    hp: number;
    /** 体力上限 */
    maxhp: number;
    /** 护甲值 */
    shield: number;
    /** 连环状态 */
    chained: boolean;
    /** 翻面状态 */
    skip: boolean;
    /** 是否死亡 */
    death: boolean;
    /** 休整轮次 */
    rest: number;
    /** 当前阶段 */
    phase: number;
    /** 是否处于自己的回合内（客户端 UI 需要） */
    inturn: boolean;
    /** 主将ID */
    headId: string;
    /** 副将ID */
    deputyId: string;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
}

declare class RoomState extends Schema {
    /** 房间ID */
    roomId: string;
    /** 游戏ID */
    gameId: string;
    /** 总回合数 */
    turnCount: number;
    /** 总轮次数 */
    roundCount: number;
    /** 玩家状态 */
    players: MapSchema<PlayerState>;
    /** 卡牌区域数据——存 GameCardId（string） */
    cardAreas: MapSchema<ArraySchema<string>>;
    /** 卡牌状态 */
    cardStates: MapSchema<CardState>;
    /** 武将区域数据 */
    generalAreas: MapSchema<ArraySchema<string>>;
    /** 武将状态 */
    generalStates: MapSchema<GeneralState>;
    /** 技能状态 */
    skillStates: MapSchema<SkillState>;
    /** 效果状态 */
    effectStates: MapSchema<EffectState>;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
    createCardArea(): ArraySchema<string>;
    createGeneralArea(): ArraySchema<string>;
}

declare class SkillState extends Schema {
    id: number;
    playerId: string;
    /** 标记状态 */
    markStates: MapSchema<MarkState>;
    showui: string;
    sourceGeneral?: string;
    sourceEquip?: string;
    sourceEffect?: number;
    invalids: ArraySchema<string>;
    preshow: boolean;
}

/**
 * 选择数量约束
 * @type number 只能选择这个数量
 * @type [number,number] 最少选择[0]，最多选择[1] (均包含)
 * 其中[0]若小于0则会改为0，[1]若小于0则会改为其能选择的最大数量
 */
declare type SelectCount = number | [number, number];
declare enum SelectorType {
    Card = 'Card',
    Player = 'Player',
    General = 'General',
    Option = 'Option',
    Command = 'Command',
    Confirm = 'Confirm',
}
declare interface SelectorLifecycle<T = any> {
    onInit?: (
        ctx: SelectorContext,
        validCandidates: T[],
    ) => Partial<SelectorConfig>;
    onSelect?: (
        item: T,
        selected: T[],
        ctx: SelectorContext,
    ) => Partial<SelectorConfig>;
    onDeselect?: (
        item: T,
        selected: T[],
        ctx: SelectorContext,
    ) => Partial<SelectorConfig>;
    onComplete?: (selected: T[], ctx: SelectorContext) => boolean;
}
declare interface SelectorConfig<T = any> {
    /** 选择器名称 */
    name: string;
    type: SelectorType;
    count: SelectCount;
    auto?: boolean;
    selectable: (ctx: SelectorContext) => T[];
    filter?: (item: T, selected: T[], ctx: SelectorContext) => boolean;
    life?: SelectorLifecycle<T>;
    window?: SelectorWindow;
}
/** 选择步骤：仅 name 必填，其余字段可选（缺失时从 sgs.selectors 预设继承） */
declare type StepConfig = Partial<Omit<SelectorConfig, 'name'>> & {
    name: string;
};
declare interface SelectorWindow {
    type: string;
    options?: any;
    filter?: (
        item: string,
        selected: string[],
        ctx: SelectorContext,
    ) => boolean;
    isAllShow?: boolean;
}
declare interface SelectorContext {
    player: Player;
    room: Room;
    /** 选择结果（选择完成后由 ChooseManager.respond 填充，key = SelectorConfig.name） */
    results?: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResults?: Record<string, string[]>;
    /** 触发选择的事件（从事件栈顶获取） */
    eventData?: any;
    /** 技能名（动态注入，未显式传入且无当前技能时为空） */
    skillName?: string;
    [key: string]: any;
}
declare interface SelectSession {
    id: string;
    player: string;
    /** 选择步骤。仅 name 必填，其余字段缺失时从 sgs.selectors 预设继承；额外字段覆盖预设并序列化给客户端 */
    steps: StepConfig[];
    context: SelectorContext;
    /** 提示文本 */
    prompt?: {
        main?: RichString;
        side?: RichString;
    };
    /** 是否可取消 */
    canCancel?: boolean;
    /** 是否显示主视角的确定/取消按钮 */
    showConfirmButton?: boolean;
    /** 是否显示倒计时 UI */
    showTimer?: boolean;
    /** 超时时间（秒）。未设置时使用房间 responseTime，仍未设置则默认 15 秒 */
    timeout?: number;
    /** 多段选择时当前会话的剩余时间（秒），由 ChooseManager 自动计算 */
    remaining?: number;
    /** 是否自动选择第一个可选项 */
    autoSelectFirst?: boolean;
    /** 是否为出牌阶段询问 */
    isPlayPhase?: boolean;
    /** 是否为使用牌询问 */
    isUseCard?: boolean;
    /** 是否为打出牌询问 */
    isPlayCard?: boolean;
    /** 是否为技能选择询问 */
    isSkillSelect?: boolean;
}
declare interface SelectResult {
    id: string;
    /** 是否取消 */
    cancelled: boolean;
    /** 是否超时 */
    timeout?: boolean;
    /** 每个的选择器的结果 */
    results: Record<string, any[]>;
    /** 每个的选择器的窗口结果 */
    windowResult?: Record<string, string[]>;
    /** 出牌阶段操作类型 */
    playPhaseResult?: PlayPhaseResult;
    /** 使用的牌（虚拟牌数据，服务端据此创建 VirtualCard） */
    useCard?: VirtualCardData;
    /** 打出的牌 */
    playCard?: VirtualCardData;
    /** 选中的技能名 */
    skillName?: string;
}
declare enum PlayPhaseResult {
    None = 0,
    /** 使用牌 */
    UseCard = 1,
    /** 使用技能 */
    UseSkill = 2,
    /** 重铸牌 */
    Recast = 3,
    /** 明置武将牌 */
    OpenHead = 4,
    OpenDeputy = 5,
    /** 结束 */
    End = 6,
}

declare class RESGS {
    private static instance;
    static getInstance(): RESGS;
    private constructor();
    TimingName: typeof TimingName;
    EventType: typeof EventType;
    DamageType: typeof DamageType;
    PriorityType: typeof PriorityType;
    SkillTag: typeof SkillTag;
    StateEffectType: typeof StateEffectType;
    CardAttr: typeof CardAttr;
    CardSuit: typeof CardSuit;
    CardNumber: typeof CardNumber;
    CardColor: typeof CardColor;
    CardType: typeof CardType;
    CardSubType: typeof CardSubType;
    EquipSubType: typeof EquipSubType;
    AreaType: typeof AreaType;
    Phase: typeof Phase;
    SelectorType: typeof SelectorType;
    PlayPhaseResult: typeof PlayPhaseResult;
    Gender: typeof Gender;
    SkillBuilder: typeof SkillBuilder;
    EffectBuilder: typeof EffectBuilder;
    GeneralBuilder: typeof GeneralBuilder;
    CardBuilder: typeof CardBuilder;
    ModeBuilder: typeof ModeBuilder;
    General: typeof General;
    CardConfig: typeof CardConfig;
    GameCard: typeof GameCard;
    GameMode: typeof GameMode;
    Skill: typeof Skill;
    Effect: typeof Effect;
    registerCards: typeof registerCards;
    CardPackage: typeof CardPackage;
    GeneralPackage: typeof GeneralPackage;
    setExtensionContext: typeof setExtensionContext;
    workSpace: 'server' | 'client' | 'preview';
    lang: string;
    get version(): string;
    private coreLoaded;
    init(workSpace: 'server' | 'client' | 'preview'): Promise<void>;
    readonly modes: Map<string, GameModeData>;
    readonly cardpacks: Map<string, CardPackData>;
    readonly cards: Map<GameCardId, GameCardData>;
    readonly carddatas: Map<string, CardData>;
    readonly generalpacks: Map<string, GeneralPackData>;
    readonly generals: Map<string, GeneralData>;
    readonly generalAssets: Map<string, GeneralAssetsData>;
    readonly skills: Map<string, SkillData>;
    readonly effects: Map<string, EffectData>;
    readonly skillsAssets: Map<string, SkillAsset>;
    /** 选择器预设（客户端据此渲染 UI） */
    readonly selectors: Map<string, any>;
    /** 牌的默认使用方式定义（牌名 → CardUseData） */
    readonly carduses: Map<string, CardUseData>;
    /** 翻译表 */
    readonly translations: {
        [lang: string]: {
            [key: string]: string;
        };
    };
    /** 游戏内显示的概念讲解。以翻译中出现对应的key值关键词为准 */
    readonly concept: {
        [lang: string]: {
            [key: string]: string;
        };
    };
    loadTranslation(
        ts?: {
            [key: string]: string;
        },
        lang?: string,
    ): void;
    getTranslation(source?: string, lang?: string): string;
    loadConcept(
        ts?: {
            [key: string]: string;
        },
        lang?: string,
    ): void;
    getConcept(source: string, lang?: string): string;
}
declare const sgs: RESGS;
declare global {
    var sgs: RESGS;
    var lodash: typeof _;
}
declare;
{
}

/** EffectBuilder 实例接口 */
declare interface EffectBuilder<T extends TimingTrigger = never> {
    readonly name: string;
    data: Record<string, any>;
    mark?: string | string[];
    tag: SkillTag[];
    priority: PriorityType;
    condition(fn: (this: Effect, room: Room, ctx?: EffectContext) => any): this;
    times(
        n:
            | number
            | ((this: Effect, room: Room, player: Player, data: any) => number),
    ): this;
    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U>;
    can_trigger(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => any,
    ): this;
    context(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => EffectContext,
    ): this;
    choose(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    cost(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    effect(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    select(name: string, ...configs: SelectorConfig[]): this;
    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this;
    refresh<U extends TimingTrigger>(data: TimingCallback<U, Effect>): this;
    settings(config: Partial<EffectSettings>): this;
    register(skillName: string): EffectData;
    distanceCorrect(
        fn: StateCallbackMap[StateEffectType.Distance_Correct],
    ): this;
    distanceFixed(fn: StateCallbackMap[StateEffectType.Distance_Fixed]): this;
    notCalcSeat(fn: StateCallbackMap[StateEffectType.NotCalcSeat]): this;
    notCalcDistance(
        fn: StateCallbackMap[StateEffectType.NotCalcDistance],
    ): this;
    maxHandInitial(fn: StateCallbackMap[StateEffectType.MaxHand_Initial]): this;
    maxHandCorrect(fn: StateCallbackMap[StateEffectType.MaxHand_Correct]): this;
    maxHandFixed(fn: StateCallbackMap[StateEffectType.MaxHand_Fixed]): this;
    maxHandExclude(fn: StateCallbackMap[StateEffectType.MaxHand_Exclude]): this;
    prohibitOpen(fn: StateCallbackMap[StateEffectType.Prohibit_Open]): this;
    prohibitClose(fn: StateCallbackMap[StateEffectType.Prohibit_Close]): this;
    prohibitDiscards(
        fn: StateCallbackMap[StateEffectType.Prohibit_Discards],
    ): this;
    prohibitObtainCards(
        fn: StateCallbackMap[StateEffectType.Prohibit_ObtainCards],
    ): this;
    prohibitRecoverHp(
        fn: StateCallbackMap[StateEffectType.Prohibit_RecoverHp],
    ): this;
    prohibitLoseHp(fn: StateCallbackMap[StateEffectType.Prohibit_LoseHp]): this;
    prohibitUseCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_UseCard],
    ): this;
    prohibitDropCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_DropCard],
    ): this;
    prohibitPindian(
        fn: StateCallbackMap[StateEffectType.Prohibit_Pindian],
    ): this;
    rangeInitial(fn: StateCallbackMap[StateEffectType.Range_Initial]): this;
    rangeCorrect(fn: StateCallbackMap[StateEffectType.Range_Correct]): this;
    rangeFixed(fn: StateCallbackMap[StateEffectType.Range_Fixed]): this;
    rangeWithin(fn: StateCallbackMap[StateEffectType.Range_Within]): this;
    rangeWithout(fn: StateCallbackMap[StateEffectType.Range_Without]): this;
    regardCardData(fn: StateCallbackMap[StateEffectType.Regard_CardData]): this;
    regardOnlyBig(fn: StateCallbackMap[StateEffectType.Regard_OnlyBig]): this;
    regardOnlyBigFixed(
        fn: StateCallbackMap[StateEffectType.Regard_OnlyBig_Fixed],
    ): this;
    regardKindom(fn: StateCallbackMap[StateEffectType.Regard_Kingdom]): this;
    targetModPassTimeCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassTimeCheck],
    ): this;
    targetModPassCountingTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassCountingTime],
    ): this;
    targetModCorrectTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_CorrectTime],
    ): this;
    targetModPassDistanceCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassDistanceCheck],
    ): this;
    targetModCardLimitChooseCount(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_ChooseCount],
    ): this;
    targetModCardLimitDistance(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_Distance],
    ): this;
    skillInvalidity(
        fn: StateCallbackMap[StateEffectType.Skill_Invalidity],
    ): this;
    likeHandToUse(fn: StateCallbackMap[StateEffectType.LikeHandToUse]): this;
    likeHandToDrop(fn: StateCallbackMap[StateEffectType.LikeHandToDrop]): this;
    ignoreHeadAndDeputy(
        fn: StateCallbackMap[StateEffectType.IgnoreHeadAndDeputy],
    ): this;
    fieldCardEyes(fn: StateCallbackMap[StateEffectType.FieldCardEyes]): this;
    regardArrayCondition(
        fn: StateCallbackMap[StateEffectType.Regard_ArrayCondition],
    ): this;
    regardPindianResult(
        fn: StateCallbackMap[StateEffectType.Regard_PindianResult],
    ): this;
}
/** EffectBuilder 工厂——无需 new */
declare function EffectBuilder<T extends TimingTrigger = never>(
    name: string,
): EffectBuilder<T>;

/** SkillBuilder 实例接口 */
declare interface SkillBuilder {
    name: string;
    data: Record<string, any>;
    is_rule: boolean;
    is_lord: boolean;
    attached_equip?: string;
    attached_kingdom?: string;
    addEffect(effect: string | EffectBuilder): EffectBuilder;
    ai(config: any): this;
    condition(fn: (this: Skill, room: Room) => boolean): this;
    visible(fn: (this: Skill, room: Room) => boolean): this;
    global(fn: (this: Skill, room: Room, player: Player) => boolean): this;
    refresh<U extends TimingTrigger>(data: TimingCallback<U, Skill>): this;
    register(): SkillData;
}
/** SkillBuilder 工厂——无需 new */
declare function SkillBuilder(name: string): SkillBuilder;

declare class Effect implements MarkHost {
    readonly id: number;
    readonly room: Room;
    readonly skill?: Skill;
    readonly _jsonData: EffectData;
    readonly state: EffectState;
    readonly data: Record<string, any>;
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap: Map<string, Set<string>>;
    readonly options: EffectOptions;
    readonly audios: string[];
    constructor(
        id: number,
        player: Player | undefined,
        data: EffectData,
        room: Room,
        state: EffectState,
        options: EffectOptions,
        fromSkill?: Skill,
    );
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    set player(value: Player | undefined);
    get player(): Player | undefined;
    get name(): string;
    get skillName(): string;
    get hasTrigger(): boolean;
    get hasState(): boolean;
    get isViewAsOrPlayPhase(): boolean;
    setInvalids(reason: string, state?: boolean): void;
    get isInvalid(): boolean;
    get preshow(): boolean;
    /** 所属武将牌是否明置 */
    isOpen(): boolean;
    /** 移除自身，委托到 SkillManager */
    removeSelf(removeSkill?: boolean): Promise<void>;
    hasTag(tag?: SkillTag): boolean;
    get isLock(): boolean;
    get isLimit(): boolean;
    get isAwake(): boolean;
    get isLord(): boolean;
    get isArray(): boolean;
    /**
     * 效果是否可用。
     * 触发类：需额外检查 limit/awake 标记 + head/deputy 位置。
     * 状态类：仅检查自身及关联技能未被禁用。
     */
    check(data?: TimingData<any>): boolean;
    /**
     * 解析最大发动次数。状态类效果无次数概念，返回默认 1。
     * number=固定值，function=根据实时数据计算，-1=无限制。
     */
    getMaxTimes(room: Room, player: Player, data: any): number;
    /**
     * 是否可以自动发动（无需询问玩家）。
     * 三个条件缺一不可：forced='mute' + selectors 中无 cost + 所属武将牌已明置（若有）。
     */
    canAutoExecute(): boolean;
    /**
     * 构建技能上下文。优先调用 EffectData.context 回调，无回调时返回最小上下文。
     */
    buildContext(
        room: Room,
        player: Player,
        data: TimingData<any> | Record<string, any>,
    ): EffectContext;
    /** 时机条件检测 */
    canTrigger(room: Room, player: Player, data: TimingData<any>): any;
    /** 是否有 choose 回调 */
    get hasChoose(): boolean;
    /** 执行发动前选择 */
    execChoose(
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ): Promise<any>;
    /** 是否有 cost 回调 */
    get hasCost(): boolean;
    /** 执行消耗 */
    execCost(
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ): Promise<any>;
    /** 是否有 effect 回调 */
    get hasEffect(): boolean;
    /** 执行效果 */
    execEffect(
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ): Promise<void>;
}

declare class Skill implements MarkHost {
    readonly id: number;
    readonly room: Room;
    readonly _jsonData: SkillData;
    readonly state: SkillState;
    readonly data: Record<string, any>;
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap: Map<string, Set<string>>;
    readonly options: SkillOptions;
    readonly trueName: string;
    readonly effects: Effect[];
    readonly audios: string[];
    private _sourceGeneral?;
    private _sourceEquip?;
    private _sourceEffect?;
    constructor(
        id: number,
        player: Player | undefined,
        data: SkillData,
        room: Room,
        state: SkillState,
        options: SkillOptions,
    );
    setMark: <T>(
        this: MarkHost,
        rawKey: string,
        value: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    getMark: <T>(this: MarkHost, rawKey: string) => T | undefined;
    removeMark: (this: MarkHost, rawKey: string) => void;
    hasMark: (this: MarkHost, rawKey: string) => boolean;
    countMark: (
        this: MarkHost,
        rawKey: string,
        value: number,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    pushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    unpushMark: <T>(
        this: MarkHost,
        rawKey: string,
        item: T,
        options?: import('../mark/MarkTypes').MarkOptions,
    ) => void;
    clearMark: (this: MarkHost, tag?: string) => void;
    set player(value: Player | undefined);
    get player(): Player | undefined;
    get name(): string;
    set sourceGeneral(value: General);
    get sourceGeneral(): General | undefined;
    set sourceEquip(value: GameCard);
    get sourceEquip(): GameCard | undefined;
    set sourceEffect(value: Effect);
    get sourceEffect(): Effect | undefined;
    setInvalids(reason: string, state?: boolean): void;
    get isInvalid(): boolean;
    set preshow(value: boolean);
    get preshow(): boolean;
    /** 所属武将牌是否明置 */
    isOpen(): boolean;
    /** 技能是否可用：未被禁用 + 条件满足 + 武将明置 */
    check(): boolean;
    /** 移除自身，委托到 SkillManager */
    removeSelf(): Promise<void>;
    visible(): boolean;
    global(player: Player): boolean;
    hasLockEffect(): boolean;
    canPreshow(): boolean;
    getGlobalAvatarAsset(): void;
}

declare type SkillId = number;
declare type EffectId = number;
declare type TimingCallback<T extends TimingTrigger, This> = {
    trigger: T;
    position: 'before' | 'after';
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<any>;
};
declare type AutoRemoveCallback<T extends TimingTrigger, This> = {
    trigger: T;
    position: 'before' | 'after';
    fn: (this: This, room: Room, data: TimingData<T>) => boolean;
};
declare function autoRemove<T extends TimingTrigger, This>(
    trigger: T,
    position: 'before' | 'after',
    fn: (this: This, room: Room, data: TimingData<T>) => boolean,
): AutoRemoveCallback<T, This>;
declare function refresh<T extends TimingTrigger, This>(
    trigger: T,
    position: 'before' | 'after',
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<any>,
): TimingCallback<T, This>;
declare interface SkillOptions {
    source?: string;
    showui?: 'none' | 'default' | 'other' | 'mark' | 'card';
    skipLordCheck?: boolean;
    logOnObtain?: boolean;
    data?: Record<string, any>;
    autoRemove?: Array<AutoRemoveCallback<any, Skill>>;
    refreshs?: Array<TimingCallback<any, Skill>>;
}
declare interface EffectOptions {
    source?: string;
    data?: Record<string, any>;
    autoRemove?: Array<AutoRemoveCallback<any, Effect>>;
    refreshs?: Array<TimingCallback<any, Effect>>;
}
declare enum PriorityType {
    /** 武将技能 */
    General = 1,
    /** 装备技能 */
    Equip = 2,
    /** 卡牌技能 */
    Card = 3,
    /** 规则技能 */
    Rule = 4,
}
declare enum SkillTag {
    None = 0,
    /** 锁定技 */
    Lock = 1,
    /** 主将技 */
    Head = 2,
    /** 副将技 */
    Deputy = 3,
    /** 觉醒技 */
    Awake = 4,
    /** 限定技 */
    Limit = 5,
    /** 主公技/君主技 */
    Lord = 6,
    /** 阵法技-围攻 */
    Array = 7,
    /** 奥秘技 */
    Secret = 8,
    /** 持恒技 */
    Eternal = 9,
    /** 使命技 */
    Mission = 10,
    ZhuShuai = 11,
    QianFeng = 12,
}
declare enum StateEffectType {
    Distance_Correct = 1,
    Distance_Fixed = 2,
    NotCalcSeat = 3,
    NotCalcDistance = 4,
    MaxHand_Initial = 5,
    MaxHand_Correct = 6,
    MaxHand_Fixed = 7,
    MaxHand_Exclude = 8,
    Prohibit_Open = 9,
    Prohibit_Close = 10,
    Prohibit_Discards = 11,
    Prohibit_ObtainCards = 12,
    Prohibit_RecoverHp = 13,
    Prohibit_LoseHp = 14,
    Prohibit_UseCard = 15,
    Prohibit_DropCard = 16,
    Prohibit_Pindian = 17,
    Range_Initial = 18,
    Range_Correct = 19,
    Range_Fixed = 20,
    /** 视为在攻击范围内 */
    Range_Within = 21,
    /** 视为不在攻击范围内 */
    Range_Without = 22,
    /** 卡牌基本信息视为其他信息 */
    Regard_CardData = 23,
    /** 视为唯一大势力 */
    Regard_OnlyBig = 24,
    /** 视为唯一大势力_最终结果 */
    Regard_OnlyBig_Fixed = 25,
    /** 无次数限制 */
    TargetMod_PassTimeCheck = 26,
    /** 不计入次数的限制 */
    TargetMod_PassCountingTime = 27,
    /** 修改次数限制 */
    TargetMod_CorrectTime = 28,
    /** 无距离限制 */
    TargetMod_PassDistanceCheck = 29,
    /** 修改卡牌选择数量限制 */
    TargetMod_CardLimit_ChooseCount = 30,
    /** 修改卡牌选择距离限制 */
    TargetMod_CardLimit_Distance = 31,
    /** 技能失效 */
    Skill_Invalidity = 32,
    /** 如手牌般使用 */
    LikeHandToUse = 33,
    /** 如手牌般打出 */
    LikeHandToDrop = 34,
    /** 忽略主副将标签的条件 */
    IgnoreHeadAndDeputy = 35,
    /** 卡牌永远可见 */
    FieldCardEyes = 36,
    /** 视为满足阵法条件 */
    Regard_ArrayCondition = 37,
    /** 拼点结果视为 */
    Regard_PindianResult = 38,
    /** 视为某势力 */
    Regard_Kingdom = 39,
}
declare interface SkillAsset {
    name: string;
    lang_name: string;
    lang_desc: string;
    lang_desc2: string;
    audios: {
        url: string;
        translation: string;
    }[];
}
declare interface SkillData {
    /** 技能名称 等同于技能id */
    name: string;
    /** 自定义数据 */
    data: Record<string, any>;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能，仅用于势力技 */
    attached_kingdom?: string;
    /** 基础技能条件 */
    condition: (this: Skill, room: Room) => boolean;
    /** 是否可见 */
    visible?: (this: Skill, room: Room) => boolean;
    /** 全局技能哪些玩家显示按钮 */
    global?: (this: Skill, room: Room, player: Player) => boolean;
    /** 效果 */
    effects: EffectData[];
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<{
        trigger: TimingTrigger;
        position: 'before' | 'after';
        fn: (this: Skill, room: Room, data: any) => Promise<boolean>;
    }>;
    /** 智能体 */
    ai?: any;
}
declare interface EffectData {
    /** 是否为触发类效果（与 has_state 互斥） */
    has_trigger: boolean;
    /** 是否为状态类效果（与 has_trigger 互斥） */
    has_state: boolean;
    /** 效果名 */
    name: string;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果设置 */
    settings?: EffectSettings;
    /** 选择器 */
    selectors?: EffectSelectors;
    /** 自定义数据 */
    data: Record<string, any>;
    /** 发动条件 该函数一般用于可被忽略觉醒条件（神郭嘉）  注：can_trigger一般用于时机条件的检测；condition的设计是用于非时机条件的检测 */
    condition: (this: Effect, room: Room, ctx?: EffectContext) => any;
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<{
        trigger: TimingTrigger;
        position: 'before' | 'after';
        fn: (this: Effect, room: Room, data: any) => Promise<boolean>;
    }>;
    /**
     * 最大发动次数。number=固定值，函数=根据实时数据计算（签名同context，用于计数型技能如〖明哲②〗）。
     * 默认 1，-1 表示无限制。扫描阶段直接读取此字段，不会为获取 maxTimes 而调用 context()。
     */
    times?:
        | number
        | ((this: Effect, room: Room, player: Player, data: any) => number);
    /** 效果优先级 */
    priority: PriorityType;
    trigger?: TimingTrigger;
    /** 触发条件。返回任意真值即为可以发动 */
    can_trigger?: (this: Effect, room: Room, player: Player, data: any) => any;
    /** 在执行消耗和选择之前执行。可以在这里定义本次发动上下文的内容 */
    context?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
    ) => EffectContext;
    /** 技能选择 注：晚于selector中的cost定义 。该函数返回任意真值，才会发动技能。紧接着会处理明置，动画，log。然后才会执行技能消耗。
     * 对于需要明置的模式，消耗前的选择应该尽量在cost和这里完成，以保证合法的发动技能并且亮将
     * 但需要注意，最好不要对相关的selector的thinkprompt进行赋值，该方法里的选择询问不会自动处理暗将信息。
     * 如果该函数返回任意假值，技能视为未发动过
     */
    choose?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ) => Promise<any>;
    /** 技能消耗 */
    cost?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        context: EffectContext,
    ) => Promise<any>;
    /** 技能效果 */
    effect?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        context: EffectContext,
    ) => Promise<any>;
    stateCallbacks?: Partial<StateCallbackMap>;
}
declare interface EffectSelectors {
    cost?: SelectorConfig[];
    [name: string]: SelectorConfig[] | undefined;
}
declare interface EffectSettings {
    /** 默认为mute，在未定义skill_cost选择方法时自动发动（国战模式下未明置的武将牌也会询问等同于设置为cost的效果）。
     * 设置为cost可以让该技能套一层询问是否发动。
     * 出牌阶段技能被设置为cost之后表示该技能必须要在出牌阶段发动。拥有此类技能将不能结束出牌阶段，除非删除该技能
     */
    forced?: 'mute' | 'cost';
    /** 发动技能时播放的配音地址，如果有多个则按随机顺序依次播放
     * 默认值为extends(继承技能，循环随机播放技能所设置的语音)
     * 注：使用皮肤后将会在generals下按照皮肤根目录寻找同名文件进行播放(地址中最后一个/后面的内容为文件名)
     */
    audios?: string[] | 'extends';
    /** 阵法技类型 */
    arraytype?: 'quene' | 'single';
    /** 临时效果 在获得技能时不获得 默认值为false */
    temp?: boolean;
    /** 发动技能时播放的动画 默认值为text，播放文字动画*/
    ani?: string;
    /** 发动技能时是否自动log 默认值为true */
    log?: boolean;
    /** 发动技能时是否弹出提示 默认值为true */
    toast?: boolean;
    /** 是否对技能目标排序 默认为true */
    sort?: boolean;
    /** 发动技能时对所有目标播放指向线 默认值为1(0为不播放) 该值等同于播放指向线的类型*/
    directline?: number;
    /** 播放限定技特效 默认值为true 只在拥有限定技标签时有效 */
    limitAni?: boolean;
    /** 播放觉醒技特效 默认值为true 只在拥有觉醒技标签时有效 */
    awakeAni?: boolean;
    /** 是否将使用的卡牌设置为转化牌 默认值为true 只在需要使用/打出时的技能有效 */
    viewas?: boolean;
    /** 是否检测所有人 默认值为false 只检测拥有者 */
    global?: boolean;
}
declare interface EffectContext {
    from: Player;
    /** 触发此技能的源事件（技能中可通过它调用 prevent/transfer 等方法） */
    event?: import('../event/EventProcess').EventProcess;
    /** 是否终止此时机——设为 true 则跳出 trigger 循环，不再询问其他玩家 */
    endTiming?: boolean;
    cost?: any;
    selections?: Record<string, Record<string, any[]>>;
    [key: string]: any;
}
declare interface StateCallbackMap {
    /**
     * 距离修正值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 修正值
     * @description 所有修正值会累计到最终距离，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Correct]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => number;
    /**
     * 距离终值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 终值 返回undefined无用
     * @description 计算距离时会直接返回终值，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Fixed]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => number;
    /** 不计入座次计算 */
    [StateEffectType.NotCalcSeat]: (this: Effect, from: Player) => boolean;
    /** 不计入距离限制 */
    [StateEffectType.NotCalcDistance]: (this: Effect, from: Player) => boolean;
    /**
     * 手牌上限初始值
     * @param from 计算手牌上限的玩家
     * @returns 手牌上限初始值
     * @description 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Initial]: (this: Effect, from: Player) => number;
    /**
     * 手牌上限修正值
     * @param from 计算手牌上限的玩家
     * @returns 修正值
     * @description 所有修正值会累计到手牌上限中，但无论经过怎样的计算，手牌上限最小为0
     */
    [StateEffectType.MaxHand_Correct]: (this: Effect, from: Player) => number;
    /**
     * 手牌上限终值
     * @param from 计算手牌上限的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表手牌上限无限大
     * @description 计算手牌上限时会直接返回终值，但无论经过怎样的计算，手牌上限最小为0。如果有多个修改终值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Fixed]: (this: Effect, from: Player) => number;
    /**
     * 不计入手牌上限
     * @param from 计算手牌上限的玩家
     * @param card 检测的卡牌
     * @returns 布尔值 指定卡牌是否不计入手牌上限
     * @description 不计入手牌上限的牌在弃牌阶段计算需要弃置多少张牌时视为该牌不存在，同时弃牌时也不能选中该牌
     */
    [StateEffectType.MaxHand_Exclude]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /**
     * 不能明置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 明置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Open]: (
        this: Effect,
        player: Player,
        generals: General[],
        reason: string,
    ) => boolean;
    /**
     * 不能暗置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 暗置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Close]: (
        this: Effect,
        player: Player,
        generals: General[],
        reason: string,
    ) => boolean;
    /**
     * 不能弃置
     * @param player 弃牌的角色
     * @param card 弃置的牌
     * @param reason 弃置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Discards]: (
        this: Effect,
        player: Player,
        card: GameCard,
        reason: string,
    ) => boolean;
    /**
     * 不能获得
     * @param player 弃牌的角色
     * @param card 弃置的牌
     * @param reason 弃置的原因
     * @returns
     */
    [StateEffectType.Prohibit_ObtainCards]: (
        this: Effect,
        player: Player,
        card: GameCard,
        reason: string,
    ) => boolean;
    /** 不能回复体力 */
    [StateEffectType.Prohibit_RecoverHp]: (
        this: Effect,
        player: Player,
        number: number,
        reason: string,
    ) => boolean;
    /** 不能失去体力 */
    [StateEffectType.Prohibit_LoseHp]: (
        this: Effect,
        player: Player,
        number: number,
        reason: string,
    ) => boolean;
    /**
     * 不能使用卡牌
     * @param from 使用者
     * @param card 使用的卡牌
     * @param target 检测的目标
     * @param response 响应的目标牌 这个数据仅用于判断角色是否能响应借刀杀人等。客户端是没有这个数据的，所以对于不能响应指定卡牌的效果需要在服务端判断并跳过需要使用牌询问
     * @param reason 使用原因
     * @returns
     */
    [StateEffectType.Prohibit_UseCard]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player | VirtualCard,
        response: VirtualCard | undefined,
        reason: string,
    ) => boolean;
    /**
     * 不能打出卡牌
     * @param from 打出者
     * @param card 打出的卡牌
     * @param response 响应的目标牌 这个数据仅用于判断角色是否能响应南蛮万剑等。客户端是没有这个数据的，所以对于不能响应指定卡牌的效果需要在服务端判断并跳过需要打出牌询问
     * @param reason 打出的原因
     * @returns
     */
    [StateEffectType.Prohibit_DropCard]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        response: VirtualCard | undefined,
        reason: string,
    ) => boolean;
    /**
     * 不能拼点
     * @param player 拼点发起者
     * @param targets 拼点的目标
     * @param reason 拼点的原因
     * @returns
     */
    [StateEffectType.Prohibit_Pindian]: (
        this: Effect,
        player: Player,
        targets: Player[],
        reason: string,
    ) => boolean;
    /**
     * 攻击范围初始值
     * @param from 计算攻击范围的玩家
     * @returns 攻击范围初始值
     * @description 一般只有武器技能会用到这个属性 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.Range_Initial]: (this: Effect, from: Player) => number;
    /**
     * 攻击范围修正值
     * @param from 计算攻击范围的玩家
     * @returns 修正值
     * @description 所有修正值会累计到攻击范围中，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Correct]: (this: Effect, from: Player) => number;
    /**
     * 攻击范围终值
     * @param self 技能本身
     * @param from 计算攻击范围的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表攻击范围无限大
     * @description 计算攻击范围时会直接返回终值，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Fixed]: (this: Effect, from: Player) => number;
    /**
     * 视为在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定在from的攻击范围内
     */
    [StateEffectType.Range_Within]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => boolean;
    /**
     * 视为不在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定不在from的攻击范围内，当此效果与一个攻击范围状态的within冲突时，以without(本函数)为准。
     */
    [StateEffectType.Range_Without]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => boolean;
    [StateEffectType.Regard_CardData]: (
        this: Effect,
        card: GameCard,
        property: string,
        source: any,
    ) => any;
    [StateEffectType.Regard_OnlyBig]: (this: Effect, player: Player) => boolean;
    [StateEffectType.Regard_OnlyBig_Fixed]: (
        this: Effect,
        player: Player,
        result: string[],
    ) => boolean;
    /** 视为某势力 */
    [StateEffectType.Regard_Kingdom]: (this: Effect, player: Player) => string;
    /** 无次数限制 */
    [StateEffectType.TargetMod_PassTimeCheck]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 不计入次数的限制 */
    [StateEffectType.TargetMod_PassCountingTime]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 修改次数限制 */
    [StateEffectType.TargetMod_CorrectTime]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => number;
    /** 无距离限制 */
    [StateEffectType.TargetMod_PassDistanceCheck]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 修改卡牌的选择数量限制 */
    [StateEffectType.TargetMod_CardLimit_ChooseCount]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
    ) => SelectCount;
    [StateEffectType.TargetMod_CardLimit_Distance]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
    ) => number;
    /** 技能失效 */
    [StateEffectType.Skill_Invalidity]: (
        this: Effect,
        effect: Effect,
    ) => boolean;
    /** 如手牌般使用 */
    [StateEffectType.LikeHandToUse]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 如手牌般打出 */
    [StateEffectType.LikeHandToDrop]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 忽略主副将技标签的条件 */
    [StateEffectType.IgnoreHeadAndDeputy]: (
        this: Effect,
        effect: Effect,
    ) => boolean;
    /** 指定卡牌对某玩家可见 */
    [StateEffectType.FieldCardEyes]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 视为满足阵法条件 */
    [StateEffectType.Regard_ArrayCondition]: (
        this: Effect,
        from: Player,
        to: Player,
        type: 'quene' | 'siege_from' | 'siege_to',
    ) => boolean;
    /** 拼点结果视为
     * @returns 若为数组，则表示没赢的角色，不在数组内的为赢的角色；若不为数组则表示赢的角色，不为该角色均没赢
     */
    [StateEffectType.Regard_PindianResult]: (
        this: Effect,
        cards: Map<Player, GameCard>,
        reason: string,
    ) => Player | Player[];
}

/**
 * 共享工具函数。
 */
/**
 * Fisher-Yates 原地洗牌，返回原数组引用。
 */
declare function shuffleArray<T>(arr: T[]): T[];
/**
 * 解析 AreaId（格式：`playerId.areaType` 或纯 `areaType`）。
 * @returns { playerId, areaType }，非玩家区域时 playerId 为空字符串
 */
declare function parseAreaId(areaId: string): {
    playerId: string;
    areaType: string;
};
/**
 * 从数组中随机采样 count 个不重复元素（部分 Fisher-Yates，不修改原数组）。
 * count >= arr.length 时返回全量打乱副本。
 */
declare function sampleRandom<T>(arr: readonly T[], count: number): T[];

// ===== sgs 全局对象 =====

declare var sgs: {
    TimingName: typeof TimingName;
    EventType: typeof EventType;
    DamageType: typeof DamageType;
    PriorityType: typeof PriorityType;
    SkillTag: typeof SkillTag;
    StateEffectType: typeof StateEffectType;
    CardAttr: typeof CardAttr;
    CardSuit: typeof CardSuit;
    CardNumber: typeof CardNumber;
    CardColor: typeof CardColor;
    CardType: typeof CardType;
    CardSubType: typeof CardSubType;
    EquipSubType: typeof EquipSubType;
    AreaType: typeof AreaType;
    Phase: typeof Phase;
    SelectorType: typeof SelectorType;
    PlayPhaseResult: typeof PlayPhaseResult;
    Gender: typeof Gender;
    SkillBuilder: typeof SkillBuilder;
    EffectBuilder: typeof EffectBuilder;
    GeneralBuilder: typeof GeneralBuilder;
    CardBuilder: typeof CardBuilder;
    ModeBuilder: typeof ModeBuilder;
    General: typeof General;
    CardConfig: typeof CardConfig;
    GameCard: typeof GameCard;
    GameMode: typeof GameMode;
    Skill: typeof Skill;
    Effect: typeof Effect;
    CardPackage: typeof CardPackage;
    GeneralPackage: typeof GeneralPackage;
    registerCards: typeof registerCards;
    setExtensionContext: typeof setExtensionContext;

    skills: Map<string, any>;
    effects: Map<string, any>;
    generals: Map<string, any>;
    generalAssets: Map<string, any>;
    cards: Map<string, any>;
    carddatas: Map<string, any>;
    cardpacks: Map<string, any>;
    generalpacks: Map<string, any>;
    modes: Map<string, any>;
    selectors: Map<string, any>;
    carduses: Map<string, any>;
    skillsAssets: Map<string, any>;
    translations: Record<string, Record<string, string>>;
};
