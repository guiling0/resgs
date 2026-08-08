/**
 * sgs 全局类型声明（全量）。
 * 由 scripts/build-types.ts 自动生成——勿手动编辑。
 * 生成时间：2026-08-06T01:59:13.231Z
 * 源文件：64 个 .d.ts
 */



/** CardBuilder 实例接口——链式构建实体牌数据，不负责注册 */
declare interface CardBuilder {
    readonly name: string;
    /** 设置花色 */
    suit(s: CardSuit): this;
    /** 设置点数 */
    number(n: CardNumber): this;
    /** 设置属性列表 */
    attr(a: CardAttr[]): this;
    /** 设置颜色（未设置时按花色推断） */
    color(c: CardColor): this;
    /** 标记为衍生牌 */
    derived(d?: boolean): this;
    /** 构建实体牌数据（id 留空，由注册扩展包时分配） */
    build(): GameCardData;
}
/** CardBuilder 工厂（sgs.CardBuilder）——无需 new */
declare declare function CardBuilder(name: string): CardBuilder;
/** 全可选字段构建实体牌数据（sgs.createCard）——内部经 CardBuilder 复用默认值与派生逻辑 */
declare declare function Card(input?: Partial<GameCardData>): GameCardData;



/** EffectBuilder 实例接口——链式构建效果数据，不负责注册；name 为必传构造参数 */
declare interface EffectBuilder<T extends TimingTrigger = TimingTrigger> {
    readonly name: string;
    /** 自定义数据 */
    data: Record<string, unknown>;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果优先级 */
    priority: PriorityType;
    /** 设置状态回调（按状态类型写入 state） */
    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this;
    /** 设置发动条件（非时机条件检测） */
    condition(fn: (this: EffectEntity, room: Room, ctx?: EffectContext) => boolean): this;
    /** 设置最大发动次数（number=固定值，function=实时计算，-1=无限制） */
    times(n: number | ((this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => number)): this;
    /** 设置触发时机（收窄 data 推断类型） */
    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U>;
    /** 设置时机条件检测 */
    can_trigger(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => boolean): this;
    /** 构建本次发动上下文 */
    context(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => EffectContext): this;
    /** 设置发动前选择（返回选择会话数据，id 由选择系统赋予） */
    choose(fn: (this: EffectEntity, room: Room, player: Player, ctx: EffectContext) => Omit<ChooseSession, 'id'>): this;
    /** 设置技能消耗 */
    cost(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this;
    /** 设置技能效果 */
    effect(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this;
    /** 设置效果设置 */
    settings(config: Partial<EffectSettings>): this;
    /** 添加刷新回调 */
    refresh<U extends TimingTrigger>(data: TimingCallback<U, EffectEntity>): this;
    /** 构建效果数据（skillName 提供时效果名带技能前缀） */
    build(skillName?: string): EffectData;
    /** 注册到 sgs.effects（幂等） */
    register(skillName?: string): EffectData;
}
/** EffectBuilder 工厂（sgs.EffectBuilder）——无需 new */
declare declare function EffectBuilder<T extends TimingTrigger = TimingTrigger>(name: string): EffectBuilder<T>;
/** 构建并注册效果数据（sgs.createEffect）——name 必传，内部经 EffectBuilder 复用默认值；已注册则直接返回已有数据 */
declare declare function Effect(input: Pick<EffectData, 'name'> & Partial<EffectData>): EffectData;



/** GeneralBuilder 实例接口——链式构建武将数据，不负责注册；name 为必传构造参数 */
declare interface GeneralBuilder {
    readonly name: string;
    /** 设置势力（可用逗号分割多势力） */
    kingdom(k: GeneralKingdom): this;
    /** 设置体力（number 或 [体力, 上限, 护盾]） */
    hp(h: GeneralHp): this;
    /** 设置性别 */
    gender(g: Gender): this;
    /** 设置技能名列表 */
    skills(s: string[]): this;
    /** 标记为主公/君主 */
    lord(l?: boolean): this;
    /** 设置是否启用 */
    enable(e?: boolean): this;
    /** 设置在武将一览中隐藏 */
    hidden(h?: boolean): this;
    /** 标记为国战武将 */
    isWars(w?: boolean): this;
    /** 设置珠联璧合表 */
    rs(r: string[]): this;
    /** 设置默认皮肤名 */
    defaultSkin(d: string): this;
    /** 设置武将资源配置（注册武将时一并注册信息/技能翻译/皮肤） */
    config(d: GeneralConfig): this;
    /** 构建武将数据 */
    build(): GeneralData;
}
/** GeneralBuilder 工厂（sgs.GeneralBuilder）——无需 new */
declare declare function GeneralBuilder(name: string): GeneralBuilder;
/** 构建并注册武将数据（sgs.createGeneral）——name 必传，内部经 GeneralBuilder 复用默认值；已注册则直接返回已有数据 */
declare declare function General(input: Pick<GeneralData, 'name'> & Partial<GeneralData>): GeneralData;



/** SkillBuilder 实例接口——链式构建技能数据，不负责注册；name 为必传构造参数 */
declare interface SkillBuilder {
    readonly name: string;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能（仅势力技） */
    attached_kingdom?: string;
    /** 自定义数据 */
    data: Record<string, unknown>;
    /** 添加效果（按效果名或已有 builder） */
    addEffect(effect: string | EffectBuilder): EffectBuilder;
    /** 设置智能体配置 */
    ai(config: SkillAI): this;
    /** 设置基础技能条件（非时机条件检测） */
    condition(fn: (this: SkillEntity, room: Room) => boolean): this;
    /** 设置是否可见 */
    visible(fn: (this: SkillEntity, room: Room) => boolean): this;
    /** 设置全局技能显示按钮的玩家 */
    global(fn: (this: SkillEntity, room: Room, player: Player) => boolean): this;
    /** 添加刷新回调 */
    refresh<T extends TimingTrigger>(data: TimingCallback<T, SkillEntity>): this;
    /** 构建技能数据 */
    build(): SkillData;
    /** 注册到 sgs.skills（幂等） */
    register(): SkillData;
}
/** SkillBuilder 工厂（sgs.SkillBuilder）——无需 new */
declare declare function SkillBuilder(name: string): SkillBuilder;
/** 构建并注册技能数据（sgs.createSkill）——name 必传，内部经 SkillBuilder 复用默认值并连带注册效果；已注册则直接返回已有数据 */
declare declare function Skill(input: Pick<SkillData, 'name'> & Partial<SkillData>): SkillData;


/** 通用 console 日志实现（ILogger 的 console 适配） */
declare declare class ConsoleLogger implements ILogger {
    debug(message: string, extra?: LogMeta): void;
    info(message: string, extra?: LogMeta): void;
    warn(message: string, extra?: LogMeta): void;
    error(message: string, extra?: LogMeta): void;
}
/** 默认日志实例（Room 构造缺省使用） */
declare declare const consoleLogger: ConsoleLogger;



/**
 * 区域——放置实体牌与武将牌的场所（公共区域或玩家私有区域）。
 * 无可同步属性，不继承 StateNode。
 */
declare declare class Area {
    /** 区域类型 */
    readonly type: AreaType;
    /** 所属房间 */
    readonly room: Room;
    /** 所属玩家（公共区域为 undefined） */
    readonly player?: Player;
    /** 默认放置方式（牌进入区域时的面朝方向） */
    defaultPut: CardPut;
    /** 是否废除（封印） */
    disable: boolean;
    private readonly _cards;
    private readonly _generals;
    constructor(room: Room, type: AreaType, player?: Player, defaultPut?: CardPut);
    /** 区域 id（玩家私有：'{playerId}.{type}'，公共：'{type}'） */
    get areaId(): AreaId;
    /** 区域内的实体牌（副本） */
    get cards(): GameCard[];
    /** 区域内的武将牌（副本） */
    get generals(): General[];
    /** 实体牌数量 */
    get count(): number;
    /** 武将牌数量 */
    get generalCount(): number;
    /** 是否为公共区域 */
    get isPublic(): boolean;
    /** 是否为玩家私有区域 */
    get isPrivate(): boolean;
    /** 是否为玩家角色区域（手牌/装备/判定区） */
    get isPlayer(): boolean;
    /** 向区域加入牌（默认置底；top/bottom/random/指定下标） */
    add(cards: (GameCard | General)[], pos?: 'top' | 'bottom' | 'random' | number): void;
    private pushOne;
    /** 从区域移除牌 */
    remove(cards: (GameCard | General)[]): void;
    private removeOne;
    /** 区域中是否含指定牌 */
    has(card: GameCard | General): boolean;
    /** 获取牌：按类型/位置/过滤条件取 count 张（不足时返回已有部分） */
    get<T extends GameCard | General>(count: number, type: new (...args: never[]) => T, pos?: 'top' | 'bottom' | 'random', filter?: (card: T) => boolean): T[];
    /** 获取一张牌（参数同 get） */
    getOne<T extends GameCard | General>(type: new (...args: never[]) => T, pos?: 'top' | 'bottom' | 'random', filter?: (card: T) => boolean): T | undefined;
    /** 洗牌：kind 限定仅洗实体牌或仅洗武将牌（不提供洗全部）；cards 提供时仅打乱这些牌 */
    shuffle(kind?: 'cards' | 'generals', cards?: (GameCard | General)[]): void;
}



/**
 * 效果——继承 Mark 具备标记能力，按类别派生 TriggerEffect/StateEffect。
 * 固定数据（id/name/来源引用）经创建消息传递，无运行时同步字段。
 */
declare declare abstract class Effect extends Mark {
    readonly room: Room;
    /** 效果自增 id（房间内唯一） */
    id: number;
    /** 效果名 */
    name: string;
    /** 所属技能 */
    skill?: Skill;
    /** 所属玩家 */
    player?: Player;
    /** 效果类别（触发/状态） */
    type: EffectType;
    /** 自定义数据（运行时选项注入） */
    data: Record<string, unknown>;
    /** 源数据（注册构建的效果定义，外部可读；触发/状态配置经此获取） */
    readonly sourceData: EffectData;
    constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, type?: EffectType, options?: EffectOptions);
    /** 是否为触发类效果 */
    get hasTrigger(): boolean;
    /** 是否为状态类效果 */
    get hasState(): boolean;
    /** 是否失效（仅效果自身失效状态；源技能失效由所属技能判定） */
    get isInvalid(): boolean;
    /** 是否拥有指定技能标签（未传时判断是否有任意标签） */
    hasSkillTag(tag?: SkillTag): boolean;
    /** 是否锁定技效果 */
    get isLock(): boolean;
    /** 是否限定技效果 */
    get isLimit(): boolean;
    /** 是否觉醒技效果 */
    get isAwake(): boolean;
    /** 是否主公技效果 */
    get isLord(): boolean;
    /** 是否阵法技效果 */
    get isArray(): boolean;
    /** 所属武将牌是否明置（武将牌数据未就绪时默认明置） */
    isOpen(): boolean;
    /**
     * 效果是否可用（通用检测）：自身失效、源技能失效、标签固定检测。
     * 触发时机条件检测见 TriggerEffect.canTrigger。
     */
    check(): boolean;
    /** 移除自身（含关联技能）——TODO(R3): 技能管理器（SkillManager）实现后接线 */
    removeSelf(_removeSkill?: boolean): Promise<void>;
}



/**
 * 实体牌——游戏牌实体，牌面能力继承自 ICard。
 * 源数据（sourceData）保留并对外可读，属性经 getter 动态暴露。
 * 同步挂载场景属 R1 区域管理。
 */
declare declare class GameCard extends ICard {
    readonly room: Room;
    /** 源数据（注册构建的实体牌数据，外部可读；状态效果修正直接改此数据） */
    readonly sourceData: GameCardData;
    /** 放置方式（true=正面朝上，false=背面朝上）——TODO(R1): 区域管理的放置同步语义细化 */
    put: boolean;
    /** 关联虚拟牌（使用/打出结算中的临时关联）——TODO(R1): 区域管理维护 */
    vcard?: VirtualCard;
    constructor(room: Room, data: GameCardData);
    /** 实体牌 id */
    get id(): GameCardId;
    /** 卡牌名 */
    get name(): string;
    /** 花色 */
    get suit(): CardSuit;
    /** 点数 */
    get number(): CardNumber;
    /** 属性列表（副本） */
    get attr(): CardAttr[];
    /** 是否为衍生牌 */
    get derived(): boolean;
    /** 设置放置方式（正面/背面） */
    turnTo(put: boolean): void;
    /** 生成以本牌为子牌的虚拟牌数据（判定/展示场景用） */
    formatVirtualCardData(): VirtualCardData;
    /** 牌资源（未注册返回 undefined） */
    get resources(): CardAssets | undefined;
    /** 牌图（完整 url） */
    getImage(): string;
    /** 配音（完整 url；animationName 指定动画分支时取该分支专属配音，未命中走默认配音） */
    getAudio(gender: CardGender, animationName?: string): string;
    /** 动画分支 */
    getAnimation(name: string): CardAnimation | undefined;
}



/**
 * 武将——继承 Mark 具备标记能力。
 * 源数据（sourceData）在构造时解析（hp 数组展开/多势力分割/trueName），属性经 getter 动态暴露。
 */
declare declare class General extends Mark {
    readonly room: Room;
    /** 当前使用的皮肤名（默认取源数据 defaultSkin，可经 setSkin 切换） */
    private _skin;
    /** 放置方式（true=明置，false=暗置）——TODO(R8): 国战明置机制同步语义细化 */
    put: boolean;
    /** 解析后的源数据（外部可读，状态效果修正直接改此数据） */
    readonly sourceData: {
        id: string;
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
        /** 默认皮肤名 */
        defaultSkin?: string;
    };
    constructor(room: Room, data: GeneralData);
    /** 武将 id（即武将名） */
    get id(): string;
    /** 武将名 */
    get name(): string;
    /** 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） */
    get trueName(): string;
    /** 主势力 */
    get kingdom(): string;
    /** 次势力（双势力武将，单势力时同主势力） */
    get kingdom2(): string;
    /** 势力列表（多势力分割） */
    get kingdoms(): string[];
    /** 当前体力值 */
    get hp(): number;
    /** 体力上限 */
    get hpmax(): number;
    /** 护盾值 */
    get shield(): number;
    /** 性别 */
    get gender(): Gender;
    /** 技能名列表（副本） */
    get skills(): string[];
    /** 是否为主公/君主 */
    get lord(): boolean;
    /** 是否为国战武将 */
    get isWars(): boolean;
    /** 是否启用 */
    get enable(): boolean;
    /** 是否为双势力武将 */
    isDual(): boolean;
    /** 是否与目标武将势力有交集 */
    sameAs(to: General): boolean;
    /** 是否为主公 */
    isLord(): boolean;
    /** 设置放置方式（明置/暗置） */
    turnTo(put: boolean): void;
    /** 皮肤列表（按武将真名共享，未注册返回 undefined） */
    get resources(): GeneralSkin[] | undefined;
    /** 切换当前使用的皮肤 */
    setSkin(skinName: string): void;
    /** 指定皮肤（缺省当前使用的皮肤） */
    getSkin(skinName?: string): GeneralSkin | undefined;
    /** 插画（完整 url） */
    getImage(skinName?: string): string;
    /** 特殊插画-他人视角（未配置回退插画） */
    getDualImage(skinName?: string): string;
    /** 特殊插画-自己视角（未配置回退他人视角） */
    getDualImageSelf(skinName?: string): string;
    /** 阵亡语音（完整 url；audios.death 第一条为阵亡语音） */
    getDeathAudio(skinName?: string): string;
    /** 阵亡语音文字（翻译表） */
    getDeathText(skinName?: string): string;
}



/**
 * 卡牌抽象基类——实体牌与虚拟牌的共同牌面能力，继承 Mark 具备标记能力。
 * 子类实现 name/suit/number/attr；color 由花色派生（虚拟牌可覆盖为按源牌计算），type/subtype 由注册表按牌名派生。
 */
declare declare abstract class ICard extends Mark {
    /** 卡牌名（子类实现） */
    abstract readonly name: string;
    /** 花色（子类实现） */
    abstract readonly suit: CardSuit;
    /** 点数（子类实现） */
    abstract readonly number: CardNumber;
    /** 属性列表（子类实现） */
    abstract readonly attr: CardAttr[];
    /** 颜色（由花色派生） */
    get color(): CardColor;
    /** 卡牌类别（按牌名查 sgs.carddatas，未注册默认基本牌） */
    get type(): CardType;
    /** 卡牌副类别（按牌名查 sgs.carddatas，未注册默认基本牌） */
    get subtype(): CardSubType;
    /** 是否含指定属性 */
    hasAttr(attr: CardAttr): boolean;
    /** 是否为普通杀（无火/雷属性） */
    isCommonSha(): boolean;
    /** 是否为伤害卡牌 */
    isDamageCard(): boolean;
    /** 是否为回复类卡牌 */
    isRecoverCard(): boolean;
    /** 是否为基本牌 */
    isBasic(): boolean;
    /** 是否为锦囊牌 */
    isScroll(): boolean;
    /** 是否为装备牌 */
    isEquip(): boolean;
    /** 是否为延时锦囊牌 */
    isDelayedScroll(): boolean;
    /** 是否为即时锦囊牌 */
    isInstantScroll(): boolean;
    /** 是否为武器 */
    isWeapon(): boolean;
    /** 是否为防具 */
    isArmor(): boolean;
    /** 是否为防御坐骑 */
    isDefensiveMount(): boolean;
    /** 是否为进攻坐骑 */
    isOffensiveMount(): boolean;
    /** 是否为特殊坐骑 */
    isSpecialMount(): boolean;
    /** 是否为宝物 */
    isTreasure(): boolean;
    /** 是否为坐骑牌 */
    isMount(): boolean;
}



/** 解析后的标签 */
declare interface MarkTag {
    name: string;
    data?: string;
}
/** 生命周期 */
declare interface MarkLife {
    when: string;
    before: boolean;
}
/** 标记键解析结果 */
declare interface ParsedMarkKey {
    originalKey: string;
    tags: MarkTag[];
    life?: MarkLife;
}
/** 拆解标记键：key[@tag[:data]...][-when | --when] */
declare declare function parseMarkKey(rawKey: string): ParsedMarkKey;
/**
 * 标记抽象类——需要标记能力的实体继承本类（Room/Player/GameCard/General/Skill/Effect）。
 * 标记键格式：key[@tag[:data]...][-when | --when]，见 docs/develop/mark-key.md。
 * data 为运行时值快照（不序列化），marks 经 @syncMap 自动同步（全量传给镜像端，可见性仅影响 UI 显示）。
 */
declare declare abstract class Mark extends StateNode {
    /** 运行时值快照（原始键 → 值，仅权威端读） */
    data: Record<string, unknown>;
    /** 标记容器（key 为含标签全键，value 为可序列化值） */
    marks: StateMap<string, unknown>;
    /** 原始键 → 最新全键（含标签）索引 */
    _markKeyMap: Map<string, string>;
    /** 部分可见：原始键 → 可见玩家列表（仅权威端，UI 显示过滤用） */
    _visibility: Map<string, string[]>;
    /** 拆解标记键 */
    parseKey(rawKey: string): ParsedMarkKey;
    /** 是否存在标签 */
    hasTag(rawKey: string, tagName: string): boolean;
    /** 读取标签数据 */
    getTagData(rawKey: string, tagName: string): string | undefined;
    /** 写入标记：@card/@general 值对象转 id 存储，原对象（数组浅拷贝）备份至 data；@ref 存 true 占位 */
    setMark<T>(rawKey: string, value: T, visible?: string[]): void;
    /**
     * 读取标记（忽略标签与生命周期，按原始键读取；@ref 依赖区域与卡牌实体，待实现）
     * @param assert 类型/值断言：传构造函数（如 GameCard）仅确定 T；传值则同时作为标记不存在时的默认值
     */
    getMark<T>(rawKey: string, assert?: T | (new (...args: never[]) => T)): T | undefined;
    /** 是否存在标记（忽略标签） */
    hasMark(rawKey: string): boolean;
    /** 删除标记（同原始键的带标签变体） */
    removeMark(rawKey: string): void;
    /** 数值加减标记 */
    countMark(rawKey: string, delta: number): void;
    /** 数组去重追加 */
    pushMark<T>(rawKey: string, item: T): void;
    /** 数组移除 */
    unpushMark<T>(rawKey: string, item: T): void;
    /** 按标签清理标记；无标签时清理全部非 @never 标记 */
    clearMark(tag?: string): void;
    /** 按生命周期时机清理（该时机后 / 该时机前），优先级高于 @never */
    clearMarkByLife(when: string, before: boolean): void;
    /** 设置部分可见玩家（覆盖 key 默认显示语义，仅权威端） */
    setVisible(rawKey: string, playerIds: string[]): void;
    /** 读取部分可见玩家列表 */
    getVisible(rawKey: string): string[] | undefined;
    /** 清除部分可见设置（恢复 key 标签默认显示语义） */
    clearVisible(rawKey: string): void;
}



/** 玩家实体 */
declare declare class Player extends Mark {
    readonly room: Room;
    /** 玩家 id（path 段用，不同步） */
    playerId: string;
    username: string;
    seat: number;
    hp: number;
    maxhp: number;
    /** 身份 */
    role: string;
    /** 势力 */
    kingdom: string;
    /** 性别 */
    gender: Gender;
    /** 是否死亡 */
    death: boolean;
    /** 当前阶段 */
    phase: Phase;
    /** 是否处于自己的回合内 */
    inturn: boolean;
    /** 连环状态（横置/重置） */
    chained: boolean;
    /** 翻面状态（跳过下个回合） */
    skip: boolean;
    /** 护盾值（扣减体力时优先吸收） */
    shield: number;
    /** 休整回合数（>0 表示正在休整） */
    rest: number;
    /** 手牌（元素仅简单类型：牌 id） */
    hand: StateArray<string>;
    constructor(room: Room, playerId: string);
    /** 是否存活 */
    get alive(): boolean;
    /** 安全体力（最小为 0） */
    get inthp(): number;
    /** 已损失体力 */
    get losshp(): number;
    /** 手牌上限（基础值 = 体力上限） */
    get handMax(): number;
    /** 攻击范围（基础值 1） */
    get attackRange(): number;
    /** 与目标的座次环形距离 */
    distanceTo(target: Player): number;
    /** 玩家私有区域 id */
    getAreaId(type: AreaType): AreaId;
    /** 手牌 */
    getHandCards(): GameCard[];
    /** 装备牌 */
    getEquipCards(): GameCard[];
    /** 判定区牌 */
    getJudgeCards(): GameCard[];
    /** 自己的牌（手牌 + 装备） */
    getSelfCards(): GameCard[];
    /** 区域内所有牌（手牌 + 装备 + 判定） */
    getAreaCards(): GameCard[];
}



/**
 * 房间——状态宿主（StateStore）与传输层（ITransport）的组合根。
 * path 以 Room 为根，如 `turnCount`、`player/p1/hp`。
 */
declare declare class Room extends Mark implements VirtualCardAbility {
    /** 实体段 → 集合字段与实体构造器（镜像端 path 解析与实体创建用） */
    static entitySegments: Record<string, {
        field: string;
        ctor?: new (...args: any[]) => object;
    }>;
    roomId: string;
    options: RoomOptions;
    mode: string;
    /** 状态存储（补丁收集） */
    readonly store: StateStore;
    /** 传输层（发送控制 + 通道） */
    readonly transport: ITransport;
    /** 日志接口（Room 级日志统一经此输出） */
    readonly logger: ILogger;
    /** 宿主引用（构造体指向 store） */
    _store?: StateStore;
    /** 根节点 path（空串） */
    _path: string | undefined;
    /** 总回合数 */
    turnCount: number;
    /** 当前回合玩家 id */
    currentPlayerId: string;
    /** 玩家集合（实体段名 player，条目值 Player 实体） */
    players: StateMap<string, Player>;
    /** 随机数种子（相同初始种子下，房间内所有随机操作结果一致） */
    randomSeed: number;
    /** 技能自增 id 计数器（仅权威端分配用，不同步） */
    skillIds: number;
    /** 效果自增 id 计数器（仅权威端分配用，不同步） */
    effectIds: number;
    /** 事件自增 id 计数器（仅权威端分配用，不同步） */
    eventIds: number;
    /** 游戏状态（waiting/gaming/ending）——TODO(R1): 由游戏流程维护 */
    private _gameState;
    /** 是否正在游戏中 */
    get isGaming(): boolean;
    /** 游戏是否正在结束 */
    get isEnding(): boolean;
    /** 牌的默认使用方式索引（牌名 → CardUseData，经 initCardUses 填充） */
    readonly carduses: Map<string, CardUseData>;
    /** 牌的默认使用方式索引（时机 → CardUseData[]） */
    readonly cardusesByTiming: Map<TimingName, CardUseData[]>;
    /** 房间主机能力（权威端注入 RoomHost；镜像端未注入，能力调用抛错） */
    host?: RoomHost;
    /** 区域集合（两端镜像一致：权威端变更结算，镜像端按移动消息 add/remove 同步） */
    readonly areas: Map<AreaId, Area>;
    /** 对局内实体牌索引（创建时登记，两端镜像一致；查询经 getCard/getCards） */
    readonly cards: Map<GameCardId, GameCard>;
    /** 对局内牌名列表（去重，不含衍生牌；查询经 getCardNames） */
    readonly cardNames: string[];
    /** 卡牌类别 → 牌名集合（对局内出现的非衍生牌） */
    readonly cardNamesToType: Map<CardType, Set<string>>;
    /** 卡牌副类别 → 牌名集合（对局内出现的非衍生牌） */
    readonly cardNamesToSubType: Map<CardSubType, Set<string>>;
    /** 对局内武将索引（创建时登记，id = 武将全名；查询经 getGeneral/getGenerals） */
    readonly generals: Map<string, General>;
    /** 对局内武将真名列表（去重；查询经 getGeneralNames） */
    readonly generalNames: string[];
    /** 对局内技能索引（创建时登记，key = 自增 id；查询经 getSkill/getSkills） */
    readonly skills: Map<number, Skill>;
    /** 技能名索引（技能全名 → 同名技能集合，如多玩家同技能） */
    readonly skillsByName: Map<string, Set<Skill>>;
    /** 对局内效果索引（创建时登记，key = 自增 id；查询经 getEffect/getEffects） */
    readonly effects: Map<number, Effect>;
    /** 效果名索引（效果全名 → 同名效果集合） */
    readonly effectsByName: Map<string, Set<Effect>>;
    /** 触发效果索引（自增 id → 效果，TriggerEffect 构造登记） */
    readonly triggerEffectsById: Map<number, TriggerEffect>;
    /** 状态效果索引（自增 id → 效果，StateEffect 构造登记） */
    readonly stateEffectsById: Map<number, StateEffect>;
    /** 触发效果按时机与优先级索引（时机 → 优先级 → 全局/按玩家分组，TriggerEffect 构造登记） */
    readonly triggerEffectsByTiming: Map<TimingName, Map<PriorityType, {
        global: TriggerEffect[];
        player: Map<string, TriggerEffect[]>;
    }>>;
    /** 状态效果按状态类型索引 */
    readonly stateEffectsByType: Map<StateEffectType, StateEffect[]>;
    constructor(roomId: string, options: RoomOptions, transport: ITransport, logger?: ILogger);
    /** 洗牌（使用房间随机数种子，每次随机操作推进种子） */
    shuffle<T>(arr: T[]): T[];
    /** 生成 [min, max] 区间内的随机整数（使用房间随机数种子并推进） */
    randomInt(min: number, max: number): number;
    /** 按 id 获取玩家（不存在返回 undefined） */
    getPlayer(id: string): Player | undefined;
    /** 批量获取玩家（过滤无效 id，保持顺序） */
    getPlayers(ids: string[]): Player[];
    /** 获取玩家 id 数组（默认全部玩家） */
    getPlayerIds(players?: Player[]): string[];
    /** 存活玩家列表 */
    get alives(): Player[];
    /** 按条件筛选玩家（includeDead 为 true 时含死亡玩家） */
    filterPlayer(fn: (player: Player) => boolean, includeDead?: boolean): Player[];
    /** 按条件统计角色数（includeDead 为 true 时含死亡玩家） */
    getPlayerCount(fn: (player: Player) => boolean, includeDead?: boolean): number;
    /**
     * 按座次排序（返回新数组）。
     * clockwise=false（默认）逆时针序（正常回合顺序），clockwise=true 顺时针序；
     * 以 start 为起点，缺省从 seat=1 开始。
     */
    sortPlayer(players?: Player[], start?: Player, clockwise?: boolean): Player[];
    /** 按响应顺序排序（从当前回合玩家开始逆时针；无当前回合玩家时从 seat=1 开始） */
    sortResponse(players?: Player[]): Player[];
    /** 按顺时针排序（从当前回合玩家开始；无当前回合玩家时从 seat=1 开始） */
    sortClockwise(players?: Player[]): Player[];
    /** 牌堆 */
    get drawArea(): Area | undefined;
    /** 弃牌堆 */
    get discardArea(): Area | undefined;
    /** 处理区 */
    get processingArea(): Area | undefined;
    /** 仓廪 */
    get granaryArea(): Area | undefined;
    /** 府库 */
    get treasuryArea(): Area | undefined;
    /** 后备区 */
    get reserveArea(): Area | undefined;
    /** 按 id 获取实体牌（不存在返回 undefined） */
    getCard(id: GameCardId): GameCard | undefined;
    /** 批量获取实体牌（过滤无效 id，保持顺序） */
    getCards(ids: GameCardId[]): GameCard[];
    /** 获取实体牌 id 数组（保持顺序） */
    getCardIds(cards: GameCard[]): GameCardId[];
    /** 对局内牌名列表（副本，不含衍生牌） */
    getCardNames(): string[];
    /** 按卡牌类别取牌名列表（未出现返回空数组） */
    getCardNamesByType(type: CardType): string[];
    /** 按卡牌副类别取牌名列表（未出现返回空数组） */
    getCardNamesBySubType(subtype: CardSubType): string[];
    /** 按 id 获取武将（不存在返回 undefined） */
    getGeneral(id: string): General | undefined;
    /** 批量获取武将（过滤无效 id，保持顺序） */
    getGenerals(ids: string[]): General[];
    /** 获取武将 id 数组（保持顺序） */
    getGeneralIds(generals: General[]): string[];
    /** 对局内武将真名列表（副本） */
    getGeneralNames(): string[];
    /** 按真名查找武将（多同名返回首个，不存在返回 undefined） */
    getGeneralByName(trueName: string): General | undefined;
    /** 按 id 获取技能（不存在返回 undefined） */
    getSkill(id: number): Skill | undefined;
    /** 批量获取技能（过滤无效 id，保持顺序） */
    getSkills(ids: number[]): Skill[];
    /** 获取技能 id 数组（保持顺序） */
    getSkillIds(skills: Skill[]): number[];
    /** 某玩家的技能列表 */
    getSkillsByPlayer(player: Player): Skill[];
    /** 按技能名取同名技能列表（同名技能可多份，如多人同技能） */
    getSkillsByName(name: string): Skill[];
    /** 按 id 获取效果（不存在返回 undefined） */
    getEffect(id: number): Effect | undefined;
    /** 批量获取效果（过滤无效 id，保持顺序） */
    getEffects(ids: number[]): Effect[];
    /** 获取效果 id 数组（保持顺序） */
    getEffectIds(effects: Effect[]): number[];
    /** 某玩家的效果列表 */
    getEffectsByPlayer(player: Player): Effect[];
    /** 按效果名取同名效果列表（同名效果可多份） */
    getEffectsByName(name: string): Effect[];
    /** 按 id 获取触发效果（不存在返回 undefined） */
    getTriggerEffect(id: number): TriggerEffect | undefined;
    /** 按 id 获取状态效果（不存在返回 undefined） */
    getStateEffect(id: number): StateEffect | undefined;
    /** 某时机应触发的效果列表：全局效果 + 指定玩家的私有效果（未指定玩家仅全局；跨优先级合并） */
    getTriggerEffects(timing: TimingName, playerId?: string): TriggerEffect[];
    /** 按状态类型取状态效果列表（未注册返回空数组） */
    getStateEffectsByType(type: StateEffectType): StateEffect[];
    /** 事件管理器（触发调度/事件创建） */
    get event(): EventManager;
    /** 当前事件栈（host 运行态；镜像端返回空数组） */
    get eventStack(): EventProcess[];
    /** 回合栈（host 运行态） */
    get turnStack(): TurnEvent[];
    /** 阶段栈（host 运行态） */
    get phaseStack(): PhaseEvent[];
    /** 当前回合（栈顶，host 运行态） */
    get currentTurn(): TurnEvent | undefined;
    /** 当前阶段（栈顶，host 运行态） */
    get currentPhase(): PhaseEvent | undefined;
    /** 延迟明置队列（host 运行态） */
    get deferredOpens(): EventProcess[];
    /** 复活回调队列（host 运行态） */
    get fuhuos(): Array<() => Promise<void>>;
    /** 记录事件到历史（host 运行态） */
    insertHistory(event: EventProcess): void;
    /** 注册牌的使用方式定义（从 sgs.carduses 拷贝到本地索引，host 运行态） */
    initCardUses(): void;
    /** 查询最后一个指定类型的历史事件（host 运行态） */
    getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T) => boolean): T | undefined;
    /** 造成伤害 */
    damage(opts: DamageEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DamageEvent>;
    /** 失去体力 */
    loseHp(opts: LoseHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<LoseHpEvent>;
    /** 扣减体力 */
    reduceHp(opts: ReduceHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ReduceHpEvent>;
    /** 回复体力 */
    recover(opts: RecoverHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<RecoverHpEvent>;
    /** 改变体力上限 */
    changeMaxHp(opts: ChangeMaxHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ChangeMaxHpEvent>;
    /** 进入濒死 */
    dying(opts: DyingEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DyingEvent>;
    /** 死亡 */
    die(opts: DeathEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DeathEvent>;
    /** 判定 */
    judge(opts: JudgeEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<JudgeEvent>;
    /** 状态改变（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ChangeStateEvent>;
    /** 明置武将 */
    open(player: Player, generals: General[]): Promise<ChangeStateEvent>;
    /** 暗置武将 */
    close(player: Player, generals: General[]): Promise<ChangeStateEvent>;
    /** 横置/重置武将（toState 缺省取当前状态取反） */
    chain(player: Player, toState?: boolean): Promise<ChangeStateEvent>;
    /** 翻面（toState 缺省取当前状态取反） */
    skip(player: Player, toState?: boolean): Promise<ChangeStateEvent>;
    /** 变更武将——TODO(R8): 主副将数据就绪后生效 */
    change(player: Player, general: General | 'head' | 'deputy', toGeneral: General): Promise<ChangeStateEvent>;
    /** 移除武将——TODO(R8): 主副将数据就绪后生效 */
    remove(player: Player, general: General): Promise<ChangeStateEvent>;
    /** 移动卡牌（cards 第一参数，toArea 第二参数） */
    moveCards(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>;
    /** 移动卡牌（完整数据数组，复杂移动场景用） */
    moveCardsRaw(datas: MoveCardData[], opts?: {
        getMoveLabel?: (data: MoveCardData) => RichString;
        log?: (data: MoveCardData) => RichString;
    }): Promise<MoveCardEvent>;
    /** 使用牌（直接触发 UseCardEvent；询问版签名 TODO(R2) 选择系统） */
    useCard(player: Player, card: VirtualCard, targets?: Player[]): Promise<UseCardEvent | null>;
    /** 打出牌（直接触发 DropCardEvent） */
    dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent>;
    /** 从牌堆获取 N 张牌（不足时自动洗牌，仍不够返回空） */
    getNCards(count: number, pos?: 'top' | 'bottom'): Promise<GameCard[]>;
    /** 洗牌：弃牌堆洗混后置入牌堆底部 */
    shuffleDiscardToDraw(): Promise<void>;
    /** 置于牌：将牌直接移动到目标区域（reason 默认 'put'） */
    putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent>;
    /** 摸牌：从牌堆摸 count 张到玩家手牌 */
    draw(player: Player, count?: number, pos?: 'top' | 'bottom', opts?: MoveCardOpts): Promise<unknown>;
    /** 弃牌：将牌移动到弃牌堆 */
    discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent>;
    /** 获得牌：将牌移动到操作者手牌区 */
    obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 */
    give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 交换牌：两批牌同时经处理区互换区域 */
    swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 重铸：置入弃牌堆后摸等量牌 */
    recast(player: Player, cards: GameCard[], drawOneAlways?: boolean, opts?: MoveCardOpts): Promise<unknown>;
    /** 展示牌：通知客户端显示卡牌（无实际区域移动）——TODO(R9): 可见性 */
    showCards(player: Player | undefined, cards: GameCard[]): Promise<void>;
    /** 亮出牌：牌堆牌移入处理区，其他牌等同展示 */
    flashCards(player: Player | undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<unknown>;
    /** 移存牌：将牌移动到后备区 */
    removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 游戏延迟等待（供玩家观察）——TODO(R9): 客户端延时消息 */
    delay(_seconds: number, _showProgressBar?: boolean): Promise<void>;
    /** 检测 loseHp 是否可执行：存活且体力值 ≥ number */
    canLoseHp(player: Player, number?: number): boolean;
    /** 检测 recover 是否可执行：存活且还有已损失体力可回复 */
    canRecover(player: Player, number?: number): boolean;
    /** 检测 changeMaxHp 是否可执行（number 为负时减少上限） */
    canChangeMaxHp(player: Player, number?: number): boolean;
    /** 使用牌合法性检测：canUse 额外条件 + 合法目标数检测 */
    canUseCard(player: Player, cardName: string, target?: Player): boolean;
    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    destroyVirtualCard(vc: VirtualCard): void;
    /** host 未注入（镜像端）时调用能力方法的兜底 */
    private failHost;
}



/**
 * 技能——继承 Mark 具备标记能力。
 * 同步字段仅运行时变化项（preshow/showui/invalids）；固定数据经创建消息传递。
 */
declare declare class Skill extends Mark {
    readonly room: Room;
    /** 技能自增 id（房间内唯一） */
    id: number;
    /** 技能全名 */
    name: string;
    /** 所属玩家 */
    player?: Player;
    /** 来源武将（装备技能为空） */
    sourceGeneral?: General;
    /** 来源装备牌（武将技能为空） */
    sourceEquip?: GameCard;
    /** 来源效果（化身等技能派生） */
    sourceEffect?: Effect;
    /** 失效原因列表（非空即失效） */
    invalids: StateArray<string>;
    /** 是否可预览 */
    preshow: boolean;
    /** 按钮显示方式 */
    showui: string;
    /** 自定义数据（运行时选项注入） */
    data: Record<string, unknown>;
    /** 源数据（注册构建的技能定义，外部可读；触发配置/回调经此获取） */
    readonly sourceData: SkillData;
    constructor(room: Room, data: SkillData, player?: Player, options?: SkillOptions);
    /** 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） */
    get trueName(): string;
    /** 是否失效 */
    get isInvalid(): boolean;
    /** 所属武将牌是否明置（明置状态数据未就绪，默认明置） */
    isOpen(): boolean;
    /** 技能是否可用：未被禁用且来源正常 */
    check(): boolean;
    /** 设置失效（同一原因不重复添加） */
    setInvalids(reason: string, state?: boolean): void;
    /** 移除自身（含关联效果）——TODO(R3): 技能管理器（SkillManager）实现后接线 */
    removeSelf(_removeSkill?: boolean): Promise<void>;
}



/**
 * 状态类效果——持续生效的修正效果，状态回调由 state 配置承载。
 */
declare declare class StateEffect extends Effect {
    constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions);
}



/**
 * 触发类效果——响应事件时机的效果。
 * 触发配置执行（can_trigger/choose/cost/effect 回调）与发动行为判定在此类。
 */
declare declare class TriggerEffect extends Effect {
    constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions);
    /**
     * 解析最大发动次数。number=固定值，function=实时计算，-1=无限制。
     */
    getMaxTimes(player: Player, data: TimingData<TimingTrigger>): number;
    /**
     * 是否可以自动发动（无需询问玩家）。
     * 三个条件缺一不可：forced='mute' + 无 choose 回调 + 来源武将牌已明置（若有）。
     */
    canAutoExecute(): boolean;
    /** 是否为使用/打出/出牌阶段类效果（需要牌相关询问流程） */
    get isViewAsOrPlayPhase(): boolean;
    /** 时机条件检测（无回调默认通过） */
    canTrigger(player: Player, data: TimingData<TimingTrigger>): boolean;
    /** 构建本次发动上下文（无回调返回最小上下文） */
    buildContext(player: Player, data: TimingData<TimingTrigger>): EffectContext;
    /** 是否有发动前选择回调 */
    get hasChoose(): boolean;
    /** 执行发动前选择回调 */
    execChoose(player: Player, ctx: EffectContext): Promise<unknown>;
    /** 是否有技能消耗回调 */
    get hasCost(): boolean;
    /** 执行技能消耗 */
    execCost(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown>;
    /** 是否有技能效果回调 */
    get hasEffect(): boolean;
    /** 执行技能效果 */
    execEffect(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown>;
}



/** 虚拟牌牌面覆盖项（refresh 用，未提供字段按实体牌派生） */
declare interface VirtualCardOverrides {
    suit?: CardSuit;
    color?: CardColor;
    number?: CardNumber;
    attr?: CardAttr[];
}
/**
 * 虚拟牌——使用/打出的结算对象，链接实体牌（subcards）派生牌面属性。
 * 仅权威端创建使用（结算瞬态对象），镜像端只消费 toData 导出的 VirtualCardData。
 * 单实体牌继承其花色/点数/属性；多实体牌花色点数取无，颜色按子牌同色判定。
 */
declare declare class VirtualCard extends ICard {
    readonly room: Room;
    readonly name: string;
    /** 实体牌列表 */
    readonly subcards: GameCard[];
    /** 是否已销毁（销毁后不可再参与结算） */
    destroyed: boolean;
    /** 花色 */
    private _suit;
    /** 点数 */
    private _number;
    /** 属性列表 */
    private _attr;
    /** 颜色（refresh 计算） */
    private _color;
    constructor(room: Room, name: string, subcards?: GameCard[], overrides?: VirtualCardOverrides);
    /** 花色 */
    get suit(): CardSuit;
    /** 点数 */
    get number(): CardNumber;
    /** 属性列表（副本） */
    get attr(): CardAttr[];
    /** 颜色（覆盖项优先，否则按实体牌派生） */
    get color(): CardColor;
    /** 实体牌 ID 列表 */
    get cardIds(): string[];
    /** 导出虚拟牌数据（供权威端发消息，镜像端消费此类型） */
    toData(): VirtualCardData;
    /** 是否挂有实体牌 */
    hasSubCards(): boolean;
    /** 添加实体牌（去重） */
    addSubCards(cards: GameCard[]): void;
    /** 移除实体牌 */
    delSubCard(card: GameCard): void;
    /** 清空实体牌 */
    clearSubCards(): void;
    /** 刷新牌面属性：显式覆盖优先，未提供时按实体牌派生 */
    refresh(overrides?: VirtualCardOverrides): void;
    /** 派生颜色：单实体牌继承；多实体牌全黑→黑、全红→红、混合→无色 */
    private defaultColor;
}

/**
 * 日志结构化元数据（可选附加字段）。
 */
declare interface LogMeta {
    roomId?: string;
    playerId?: string;
    event?: string;
    [key: string]: unknown;
}
/** 日志抽象接口（Room 级日志统一经构造注入的 logger 输出） */
declare interface ILogger {
    debug(message: string, extra?: LogMeta): void;
    info(message: string, extra?: LogMeta): void;
    warn(message: string, extra?: LogMeta): void;
    error(message: string, extra?: LogMeta): void;
}



/**
 * 根据数据形状推断 ChangeState 的子类型。
 * - `toGeneral` 存在 → Change
 * - `general` 存在 → Remove
 * - `damageType` 存在 → Chain
 * - `toState` + `generals` → Open/Close（toState=true→Open, false→Close）
 * - `toState` 单独存在 → Skip
 */
declare declare function detectChangeStateType(data: ChangeStateData): ChangeStateType;
/**
 * 武将牌状态改变事件。统一处理 6 种状态变更：
 *   Open（明置）、Close（暗置）、Chain（连环）、Skip（翻面）、Change（变更）、Remove（移除）
 * 执行流程：ChangeState → ChangeStateAfter（执行实际变更）→ ChangeStateEnd（公共）
 * Open 额外在 ChangeStateAfter 中将事件推入 deferredOpens（明置时机延后分发）。
 */
declare declare class ChangeStateEvent extends EventProcess<ChangeStateType> {
    constructor(room: Room, data: ChangeStateData & {
        _type?: ChangeStateType;
    });
    get player(): Player;
    private _buildTriggers;
    check(): boolean;
    /** ChangeStateAfter 之前：执行实际状态变更 */
    private _onChangeStateAfter;
    private _applyOpen;
    private _applyClose;
    private _applyChain;
    private _applySkip;
    /** 防止状态改变（仅在 ChangeState 时机可调用） */
    prevent(): Promise<this>;
    /** 连环/翻面：toState 未指定时取当前状态取反 */
    private _checkToggle;
    /**
     * 明置/暗置：过滤已在目标状态的武将（明置检查未明置的，暗置检查已明置的），
     * 过滤后数量不变且 >0 才通过。
     */
    private _checkGeneralFilter;
}



/**
 * 伤害事件。
 * 执行流程：DamageStart → Cause1 → Cause2 → Inflict1 → Inflict2 → Inflict3
 *   → CauseAfter（扣减体力）→ InflictAfter → DamageEnd（复活队列 + 连环传导）
 */
declare declare class DamageEvent extends EventProcess<EventType.Damage> {
    /** 是否触发连环伤害（默认 false；ReduceHpEvent 连环处理时标记） */
    triggerChain: boolean;
    constructor(room: Room, data: DamageEventData);
    /** 伤害来源 */
    get player(): Player | undefined;
    set player(v: Player | undefined);
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
    private _buildTriggers;
    /** DamageCauseAfter 之前：执行扣减体力 */
    private _onCauseDamaged;
    /** DamageEnd 之后：处理复活队列 + 连环传导 */
    private _onDamageEnd;
    check(): boolean;
    checkEvent(): boolean;
    /** 防止伤害（仅在防止时机内可调用） */
    prevent(): Promise<this>;
    /** 转移伤害（仅在防止时机内可调用，目标不能是自身） */
    transfer(to: Player): Promise<this>;
}
/**
 * 失去体力事件。
 * 执行流程：LoseHpStart → LoseHp（扣减体力）→ LoseHpEnd（复活队列）
 */
declare declare class LoseHpEvent extends EventProcess<EventType.LoseHp> {
    constructor(room: Room, data: LoseHpEventData);
    /** 失去体力的角色 */
    get player(): Player;
    set player(v: Player);
    /** 失去的体力数值 */
    get number(): number;
    set number(v: number);
    private _buildTriggers;
    /** LoseHp 之前：执行扣减体力 */
    private _onLoseHp;
    /** LoseHpEnd 之后：处理复活队列 */
    private _onLoseHpEnd;
    check(): boolean;
    checkEvent(): boolean;
    /** 防止失去体力（仅在 LoseHpStart 时机可调用） */
    prevent(): Promise<this>;
}
/**
 * 扣减体力事件。
 * 执行流程：ReduceHpStart → ReduceHp → ReduceHpAfter（实际扣减）→ ReduceHpEnd（濒死检查）
 * 连环处理在 init() 中早于所有时机执行。
 */
declare declare class ReduceHpEvent extends EventProcess<EventType.ReduceHp> {
    constructor(room: Room, data: ReduceHpEventData);
    /** 扣减体力的角色 */
    get player(): Player;
    set player(v: Player);
    /** 扣减数值 */
    get number(): number;
    set number(v: number);
    protected init(): Promise<void>;
    /** 处理连环状态的解除与传导标记 */
    private _handleChain;
    private _buildTriggers;
    /** ReduceHpAfter 之后：实际修改 hp（护盾优先吸收） */
    private _onReduceHpAfter;
    /** ReduceHpEnd 之后：检查是否需要进入濒死 */
    private _onReduceHpEnd;
    check(): boolean;
    checkEvent(): boolean;
    /** 获取关联的伤害事件 */
    private _getDamage;
    /** 获取关联的失去体力事件 */
    private _getLoseHp;
}



/**
 * 打出牌事件（无目标、固定时序）。
 * 执行流程：Declare（before: 实体牌移入处理区）→ Droped → End（after: 虚拟牌消失）
 */
declare declare class DropCardEvent extends EventProcess<EventType.DropCard> {
    constructor(room: Room, data: DropCardEventData);
    get player(): Player;
    get card(): VirtualCard;
    private _buildTriggers;
    check(): boolean;
    checkEvent(): boolean;
    /** Declare 之前：实体牌移入处理区 */
    private _onDeclare;
    /** End 之后：虚拟牌消失 */
    private _onEnd;
}



/**
 * 濒死事件。
 * 执行流程：DyingEntry → DyingEntryAfter → Dying（求桃）→ DyingEnd
 *   → 若 hp 仍 ≤0 则创建 DeathEvent（含 killer 追溯）
 */
declare declare class DyingEvent extends EventProcess<EventType.Dying> {
    constructor(room: Room, data: DyingEventData);
    get player(): Player;
    /** 造成濒死的角色 */
    get killer(): Player | undefined;
    set killer(v: Player | undefined);
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    checkEvent(): boolean;
    /** Dying 之前：求桃阶段，显式触发 Dying 时机 */
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
 * 执行流程：DeathBefore → DeathConfirmRole（确认死亡）→ Death → DeathAfter（弃牌清标记）→ DeathEnd（移除技能效果）
 */
declare declare class DeathEvent extends EventProcess<EventType.Death> {
    constructor(room: Room, data: DeathEventData);
    get player(): Player;
    /** 击杀者（优先使用 DyingEvent 传入的值） */
    get killer(): Player | undefined;
    set killer(v: Player | undefined);
    private _buildTriggers;
    protected init(): Promise<void>;
    check(): boolean;
    /** DeathConfirmRole 之前：确认死亡、确定击杀者 */
    private _onConfirmRole;
    /** DeathAfter 之后：弃置所有牌、清除标记 */
    private _onDeathAfter;
    /** DeathEnd 之后：移除该角色所有技能和效果 */
    private _onDeathEnd;
}



/** refreshs 回调条目（fn 已 bind，this 指向 source） */
declare interface RefreshEntry {
    source: Skill | Effect;
    fn: (room: Room, data: unknown) => Promise<unknown>;
}
/**
 * 事件管理器——事件创建、触发调度、refreshs 注册、复活队列（logic 层，RoomHost 持有）。
 * 权威端经 room.event 访问（host 注入后可用）。
 */
declare declare class EventManager {
    readonly room: Room;
    constructor(room: Room);
    /** 当前正在执行的 Effect（UseSkillEvent 执行 cost/effect 期间设置，嵌套栈） */
    _currentEffect?: Effect;
    /** refreshs 回调索引（时机 → before/after，事件触发前注入） */
    readonly refreshsByTiming: Map<TimingName, {
        before: RefreshEntry[];
        after: RefreshEntry[];
    }>;
    /**
     * 泛型事件工厂：创建事件 → 注入元数据（source/effect/reason）→ 执行 → 返回。
     * 未显式传入 effect/reason 时自动取当前技能上下文（_currentEffect）。
     */
    create<T extends EventProcess, D>(EventClass: new (room: Room, data: D) => T, eventData: D, opts?: {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<T>;
    /** 创建并执行伤害事件 */
    damage(opts: DamageEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DamageEvent>;
    /** 创建并执行失去体力事件 */
    loseHp(opts: LoseHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<LoseHpEvent>;
    /** 创建并执行扣减体力事件 */
    reduceHp(opts: ReduceHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ReduceHpEvent>;
    /** 创建并执行濒死事件 */
    dying(opts: DyingEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DyingEvent>;
    /** 创建并执行死亡事件 */
    die(opts: DeathEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<DeathEvent>;
    /** 创建并执行回复体力事件 */
    recover(opts: RecoverHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<RecoverHpEvent>;
    /** 创建并执行体力上限改变事件 */
    changeMaxHp(opts: ChangeMaxHpEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ChangeMaxHpEvent>;
    /** 创建并执行状态改变事件（自动检测 Open/Close/Chain/Skip/Change/Remove 子类型） */
    changeState(opts: ChangeStateData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<ChangeStateEvent>;
    /** 创建并执行判定事件 */
    judge(opts: JudgeEventData & {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
    }): Promise<JudgeEvent>;
    /** 创建并执行移动卡牌事件 */
    moveCards(datas: MoveCardData[], opts?: {
        source?: EventProcess;
        reason?: string;
        effect?: Effect;
        getMoveLabel?: (data: MoveCardData) => RichString;
        log?: (data: MoveCardData) => RichString;
    }): Promise<MoveCardEvent>;
    /** 将事件记录到历史（委托 room.insertHistory → host） */
    insertHistory(event: EventProcess): void;
    /** 异步处理所有待执行的复活回调 */
    drainFuhuos(): Promise<void>;
    /** 注册技能/效果的 refreshs 到时机索引 */
    registerRefreshs<T extends Skill | Effect>(source: T, refreshs: Array<TimingCallback<never, T>> | undefined): void;
    /** 注销技能/效果的 refreshs */
    unregisterRefreshs<T extends Skill | Effect>(source: T, refreshs: Array<TimingCallback<never, T>> | undefined): void;
    /**
     * 触发一个时机——按优先级调度触发效果。
     * 顺序：当前回合角色逆时针，每名角色从武将技→装备技→卡牌技→规则技，
     * 每发动一个技能后同玩家同优先级重新扫描。
     *
     * @param skipRefreshs 事件流程中已注入 refreshs 时传 true 避免重复分发；独立调用传默认 false。
     */
    trigger(timingName: TimingName, data: EventProcess | Record<string, unknown>, skipRefreshs?: boolean): Promise<void>;
    /** 取某时机某优先级下玩家的可发动效果（过滤 check/canTrigger/次数限制） */
    private _getAvailable;
    /** 创建 UseSkillEvent 并执行。返回 false 表示「时机结束」信号（ctx.endTiming） */
    private _invokeSkill;
    private _orderToPriority;
}



/** 创建 Timing 对象的便捷工厂（各事件子类统一使用） */
declare declare function createTiming(name: TimingName, before?: Array<(room: Room, data: any) => Promise<unknown>>, after?: Array<(room: Room, data: any) => Promise<unknown>>): Timing<TimingTrigger>;
/**
 * 事件执行基类——权威端结算流程载体（logic 层，仅 host 注入后运行）。
 * 子类在构造函数填充 eventTriggers/endTriggers（Timing[]），
 * exec() 按顺序执行各时机：before → 触发调度（room.event.trigger）→ after。
 * 事件栈、历史、fuhuos/deferredOpens 均经 room.host 运行态访问（镜像端为空）。
 */
declare declare abstract class EventProcess<T extends EventType = EventType> {
    /** 所属房间 */
    readonly room: Room;
    /** 事件类型 */
    readonly type: T;
    /** 事件自增 id */
    readonly id: number;
    /** 预设事件数据（按事件类型推导） */
    readonly eventData: EventData<T>;
    /** 进行中的时机序列 */
    eventTriggers: Timing<TimingTrigger>[];
    /** 结束时的时机序列 */
    endTriggers: Timing<TimingTrigger>[];
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
    /** 运行时自定义数据（effect/reason 等注入） */
    data: Record<string, unknown>;
    /** 移动到处理区的牌及其原因（processCompleted 中清理） */
    private _processingCards;
    /** 将牌移动到处理区时的回调，基类自动收集 */
    _trackProcessingCard(card: GameCard, reason: string): void;
    constructor(room: Room, type: T, eventData: EventData<T>);
    /** 事件合法性检查（返回 false 则不执行） */
    check(): boolean;
    /** 每轮触发前检查是否继续 */
    checkEvent(): boolean;
    /** 初始化：设置 source → 推入事件栈（Turn→turnStack，Phase→phaseStack，其余→eventStack） */
    protected init(): Promise<void>;
    /** 主执行循环：eventTriggers → endTriggers → processCompleted */
    exec(): Promise<this>;
    /** 触发单个时机：注入 refreshs → before → 触发调度 → after */
    triggerFunc(timing: Timing<TimingTrigger>, step?: number): Promise<void>;
    /** 将时机匹配的 refreshs 注入到 Timing 的 before/after */
    private injectRefreshs;
    /** 事件完成后的清理：出栈 + 处理区牌清理 + fuhuos/deferredOpens 排空 + AllEventEnd */
    processCompleted(): Promise<void>;
    /** 在区域集合中查找牌所在区域 */
    findArea(card: GameCard): {
        type: AreaType;
        areaId: AreaId;
    } | undefined;
    /**
     * 在时机序列中插入新时机。
     * @param timings 插入的时机（TimingName 自动构建为无回调 Timing）
     * @param appoint 在此时机名之后插入，不指定则插到最前
     */
    insert(timings: (TimingName | Timing<TimingTrigger>)[], appoint?: string): void;
    /** 在指定时机的 before 列表注册回调（时机不存在则自动创建），this 绑定当前事件 */
    registerBefore(timingName: string, fn: (room: Room, data: unknown) => Promise<unknown>): void;
    /** 在指定时机的 after 列表注册回调（时机不存在则自动创建），this 绑定当前事件 */
    registerAfter(timingName: string, fn: (room: Room, data: unknown) => Promise<unknown>): void;
    /** 从 before/after 中移除指定回调（传入原始未 bind 的函数引用） */
    removeCallback(timingName: string, fn: (...args: unknown[]) => unknown): void;
    /** 包装 bind 并标记原始函数引用，便于 removeCallback 匹配 */
    protected bindWithMark(fn: Function): (room: Room, data: unknown) => Promise<unknown>;
    /** 查找或创建一个 Timing（优先查 eventTriggers，再查 endTriggers） */
    private findOrCreate;
    /** 结束事件（isEnd=true，triggerable=false） */
    end(): Promise<this>;
    /** 强制完成事件 */
    complete(): Promise<this>;
}



/**
 * 回复体力事件。
 * 执行流程：RecoverHpStart → RecoverHpAfter（实际回复）→ RecoverHpEnd
 */
declare declare class RecoverHpEvent extends EventProcess<EventType.RecoverHp> {
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
 * 执行流程：ChangeMaxHpStart → ChangeMaxHpAfter（实际修改）→ ChangeMaxHpEnd
 * 上限降至 ≤0 时触发死亡。
 */
declare declare class ChangeMaxHpEvent extends EventProcess<EventType.ChangeMaxHp> {
    constructor(room: Room, data: ChangeMaxHpEventData);
    get player(): Player;
    /** 变化值（正=增加，负=减少） */
    get number(): number;
    private _buildTriggers;
    check(): boolean;
    checkEvent(): boolean;
    /** ChangeMaxHpAfter 之前：修改体力上限并裁剪当前体力 */
    private _onChangeMaxHpAfter;
}



/**
 * 判定事件。
 * 执行流程：Judge（取判定牌）→ JudgeCard（改判）→ JudgeResult1 → JudgeResult2
 *   → JudgeResultAfter1 → JudgeResultAfter2 → JudgeEnd
 */
declare declare class JudgeEvent extends EventProcess<EventType.Judge> {
    /** 当前判定是否成功（由 setCard/resetSuccess 设置） */
    success: boolean;
    constructor(room: Room, data: JudgeEventData);
    get player(): Player;
    get card(): GameCard | undefined;
    set card(v: GameCard | undefined);
    get result(): VirtualCardData | undefined;
    set result(v: VirtualCardData | undefined);
    get isSuccess(): ((result: VirtualCardData) => boolean) | undefined;
    private _buildTriggers;
    check(): boolean;
    /** Judge 之后：从牌堆取牌 → 移到处理区 → setCard */
    private _onJudgeAfter;
    /** JudgeResultAfter1 之前：广播判定结果 */
    private _onJudgeResultAfter1Before;
    /**
     * 设置判定牌（改判技能调用）。
     * 若已有旧判定牌且在处理区，先将其移入弃牌堆；然后为新牌生成判定结果。
     */
    setCard(card: GameCard): Promise<void>;
    /** 重新评估判定是否成功（改判后调用） */
    resetSuccess(): void;
}



/**
 * 移动卡牌事件。
 * 执行流程：MoveCardFixed → Before1 → Before2 → After1（实际移动）→ After2 → MoveCardEnd
 * 在 MoveCardBefore1/2 期间可调用 cancel()/preventMove() 取消或阻止移动。
 */
declare declare class MoveCardEvent extends EventProcess<EventType.Move> {
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
    /** MoveCardAfter1 之前：执行实际卡牌移动 */
    private _onMoveCardAfter1;
    /** 移动后处理虚拟牌关联 */
    protected handleVirtualCard(card: GameCard, _fromArea: AreaId, toArea: AreaId): Promise<void>;
    /**
     * 对移动数据分类赋默认值并归类。
     * 每条移动数据：填充默认值 → fromArea 自动取牌所在区域 → 相同设置（player/from/to/reason/put 等）合并分组。
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
    getCards(filter?: (data: MoveCardData, card: GameCard) => boolean): GameCard[];
    /** 获取本次移动中符合条件的牌（返回第一张，短路查找） */
    getCard(filter?: (data: MoveCardData, card: GameCard) => boolean): GameCard | undefined;
    /** 获取符合条件的移动数据 */
    filter(filter: (data: MoveCardData, card: GameCard) => boolean): MoveCardData[];
    /** 移动中是否包含符合条件的数据 */
    has_filter(filter: (data: MoveCardData, card: GameCard) => boolean): boolean;
    /** 获取移动的总牌数 */
    getMoveCount(): number;
    /**
     * 获取某玩家因指定原因会失去的牌的数据。
     * 失去 = 原区域是该玩家的手牌/装备区，目标区域不是该玩家的手牌/装备区。
     */
    getLoseByReason(player: Player, reason: string, pos?: string): MoveCardData[];
    /** getLoseByReason 的 GameCard[] 版本 */
    getLoseCardsByReason(player: Player, reason: string, pos?: string): GameCard[];
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
     * 取消移动（仅在 MoveCardBefore1/2 时机可调用）。
     * @param cards 要取消移动的牌。不提供则等同于 preventMove()
     * @param prevent 取消后若所有牌都被取消，是否自动阻止事件
     */
    cancel(cards?: GameCard[], prevent?: boolean): Promise<this>;
    /** 阻止整个移动事件（仅在 MoveCardBefore1/2 时机可调用） */
    preventMove(): Promise<this>;
    /** 在区域集合中查找牌所在区域 */
    private findAreaOf;
}



/**
 * 回合事件。
 * 执行流程：TurnStartBefore（休整/翻面处理）→ TurnStart → TurnStartAfter（生成阶段）
 *   → [各阶段 PhaseEvent 依次执行] → TurnEnd（清 inturn/酒状态）→ TurnEndAfter
 */
declare declare class TurnEvent extends EventProcess<EventType.Turn> {
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
    /** 跳过指定阶段（或当前阶段） */
    skipPhase(phase?: Phase | Phase[]): Promise<void>;
    /** 结束当前回合（含跳过剩余阶段） */
    end(): Promise<this>;
    isNotSkip(phase: Phase): boolean;
    private _skipTurn;
    private _findCurrentPhaseEvent;
}
/**
 * 阶段事件。
 * 每个阶段 3 个 eventTriggers + 1 个 endTrigger：{Phase}StartBefore → {Phase}Start → {Phase} → {Phase}End
 * 摸牌阶段的 DrawPhaseStart1/Start2 提供两次修正摸牌数的时机。
 */
declare declare class PhaseEvent extends EventProcess<EventType.Phase> {
    /** draw_start1 归零后锁定，阻止 draw_start2 再修改 */
    private _drawCountLocked;
    constructor(room: Room, data: PhaseEventData);
    get player(): Player;
    get phase(): Phase;
    get isExtraPhase(): boolean;
    get drawCount(): number;
    set drawCount(value: number);
    /** draw_start1 类效果：额定摸牌数改为 0，锁定后续 draw_start2 修改 */
    zeroDrawCount(): void;
    private _buildTriggers;
    private _phaseTiming;
    checkEvent(): boolean;
    /** 跳过当前阶段 */
    skip(): Promise<this>;
    isExecutor(player: Player, phase?: Phase): boolean;
}



/**
 * 牌的使用事件。
 * 目标扩展与使用结算采用**生成式**时序——每个时机完成后根据当前状态即时生成下一个时机。
 * 流程：预结算固定段（Declare → DeclareAfter → ChooseTarget → Used）
 *   → 目标扩展段（逐阶段 × 逐个当前目标）→ Ready（移除死者）
 *   → 结算段（按 effectTimes 轮询：EffectStart → EffectBefore(offset 检查) → Effect → EffectAfter）
 *   → 结束后固定段（End1 → End2 → End3 虚拟牌消失）
 */
declare declare class UseCardEvent extends EventProcess<EventType.UseCard> {
    /** 目标自增 id——仅用于同玩家时稳定排序，不回写 */
    private _targetId;
    /** 各目标已完成的目标扩展阶段（index → 已完成时机名集合） */
    private _doneTargetPhases;
    constructor(room: Room, data: UseCardEventData);
    get player(): Player;
    get card(): VirtualCard;
    get targets(): Player[];
    get targetList(): TargetEntry[];
    private _buildTriggers;
    private _settlingTarget?;
    check(): boolean;
    checkEvent(): boolean;
    exec(): Promise<this>;
    /** 执行固定段的 eventTriggers */
    private _runFixedTriggers;
    /** 执行单个 timing */
    private _runTiming;
    /** 完成事件：执行 endTriggers + processCompleted */
    private _finish;
    /** 逐阶段 × 逐个当前目标，生成式执行四阶段。每阶段第一个目标设置 isFirstTarget=true */
    private _runTargetPhases;
    private _hasDonePhase;
    private _markDonePhase;
    /** BecomeTarget 阶段全部完成后定型使用关系 */
    private _finalizeBecomeTarget;
    /** 按 effectTimes 轮询结算。每轮的第一个目标设置 isFirstTarget=true */
    private _runSettleLoop;
    /** 结算单个目标的一次 */
    private _settleOneTarget;
    /** UseCardDeclare 之前：实体牌移入处理区 */
    private _onUseCardDeclare;
    /** UseCardUsed 之前：重排序目标 */
    private _onUseCardUsed;
    /** BecomeTarget before（每个目标）时机钩子 */
    private _onBecomeTarget;
    /** UseCardReady 之前：移除死者并重排序 */
    private _onUseCardReady;
    /** 响应路径：对被响应的牌设置 offset */
    private _applyResponse;
    /** EffectAfter 之后：执行牌面效果（经 carduses 定义） */
    private _onEffectAfter;
    /** UseCardEnd3 之后：虚拟牌消失 */
    private _onUseCardEnd3;
    /**
     * 对目标列表排序。
     * - 从当前回合角色（或其下家）开始逆时针（默认）/ 顺时针
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
    /** 标记被抵消 */
    offsetTarget(target: Player, offsetEvent: EventProcess): void;
}



/**
 * 技能使用事件——技能发动流程编排（不使用时序驱动，重写 exec()）。
 * 流程：排序目标 → choose → 明置武将 → 历史 → limit/awake 标记
 *   → cost → Cost 时机 → effect → Effect 时机
 */
declare declare class UseSkillEvent extends EventProcess<EventType.UseSkill> {
    constructor(room: Room, data: UseSkillEventData);
    get effect(): TriggerEffect;
    get context(): EffectContext;
    get used(): boolean;
    private _prevEffect?;
    protected init(): Promise<void>;
    exec(): Promise<this>;
    private _finalize;
}



/**
 * 房间主机——权威端房间业务逻辑聚合（仅权威端运行时存在）。
 * 能力经 mixin 组合注入：vcard（虚拟牌）+ event（事件系统：管理器 + 事件栈 + 历史 + 移动族）。
 */
declare declare class RoomHost implements VirtualCardAbility {
    readonly room: Room;
    /** vCard 能力（mixin 注入） */
    readonly vcard: VirtualCardHost;
    /** 事件管理器（触发调度/事件创建/refreshs） */
    readonly event: EventManager;
    /** 当前事件栈（执行中的事件链，不含 Turn/Phase） */
    readonly eventStack: EventProcess[];
    /** 回合栈 */
    readonly turnStack: TurnEvent[];
    /** 阶段栈 */
    readonly phaseStack: PhaseEvent[];
    /** 延迟明置队列（事件栈排空后按序触发 Open 时机） */
    readonly deferredOpens: EventProcess[];
    /** 复活回调队列（伤害/失去体力结束后排空） */
    readonly fuhuos: Array<() => Promise<void>>;
    /** 事件历史（insertHistory/getLastOneHistory） */
    private readonly _history;
    /** 当前回合（栈顶） */
    get currentTurn(): TurnEvent | undefined;
    /** 当前阶段（栈顶） */
    get currentPhase(): PhaseEvent | undefined;
    constructor(room: Room);
    /** 记录事件到历史 */
    insertHistory(event: EventProcess): void;
    /** 查询最后一个指定类型的历史事件 */
    getLastOneHistory<T extends EventProcess>(type: string, filter?: (event: T) => boolean): T | undefined;
    /**
     * 从牌堆获取 N 张牌。不足时自动洗牌（弃牌堆→牌堆），仍不够则返回空。
     */
    getNCards(count: number, pos?: 'top' | 'bottom'): Promise<GameCard[]>;
    /** 洗牌：弃牌堆洗混后经 MoveCardEvent 置入牌堆底部（原牌堆顺序不变） */
    shuffleDiscardToDraw(): Promise<void>;
    /** 摸牌：从牌堆摸 count 张到玩家手牌 */
    draw(player: Player, count?: number, pos?: 'top' | 'bottom', opts?: MoveCardOpts): Promise<void>;
    /** 弃牌：将牌移动到弃牌堆 */
    discard(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent>;
    /** 获得牌：将牌移动到操作者手牌区 */
    obtain(player: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 交给牌：将 fromPlayer 的牌移动到 toPlayer 手牌区 */
    give(fromPlayer: Player, toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 交换牌：两批牌同时置入处理区后分别移动到对方区域 */
    swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /** 重铸：置入弃牌堆后摸等量牌 */
    recast(player: Player, cards: GameCard[], drawOneAlways?: boolean, opts?: MoveCardOpts): Promise<void>;
    /** 展示牌：通知客户端显示卡牌（无实际区域移动）——TODO(R9): 可见性 */
    showCards(_player: Player | undefined, _cards: GameCard[]): Promise<void>;
    /** 亮出牌：牌堆牌移入处理区，其他牌等同展示 */
    flashCards(player: Player | undefined, cards: GameCard[], opts?: MoveCardOpts): Promise<void>;
    /** 移存牌：将牌移动到后备区 */
    removeToReserve(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined>;
    /**
     * 注册牌的使用方式定义（从 sgs.carduses 拷贝到房间索引）。
     * 按时机索引 cardusesByTiming：timing → CardUseData[]；
     * 按牌名索引 carduses：同名首个用 name，后续用 name.timing。
     */
    initCardUses(): void;
    /** 使用牌（直接触发 UseCardEvent） */
    useCard(player: Player, card: VirtualCard, targets?: Player[]): Promise<UseCardEvent>;
    /** 打出牌（直接触发 DropCardEvent） */
    dropCard(player: Player, card: VirtualCard): Promise<DropCardEvent>;
    /** 在区域集合中查找牌所在区域 */
    private _findArea;
    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    destroyVirtualCard(vc: VirtualCard): void;
}



/** 虚拟牌能力接口——宿主（如 RoomHost）经此声明 vCard 能力 */
declare interface VirtualCardAbility {
    /** 创建虚拟牌（重载）：按名+子牌 / 单实体牌 / 无子牌 / 从数据恢复 */
    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    /** 销毁虚拟牌：断子牌链接并标记销毁 */
    destroyVirtualCard(vc: VirtualCard): void;
}
/**
 * 虚拟牌宿主——权威端虚拟牌创建/销毁能力实现（结算瞬态对象）。
 * 不维护全局列表：实例由事件/调用方持有引用，结算完调用 destroyVirtualCard。
 */
declare declare class VirtualCardHost {
    readonly room: Room;
    constructor(room: Room);
    create(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createFromCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createByNone(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createFromData(data: VirtualCardData): VirtualCard;
    destroyVirtualCard(vc: VirtualCard): void;
}



declare class RESGS {
    private static instance;
    /** 日志接口（构造注入） */
    private readonly logger;
    static getInstance(logger?: ILogger): RESGS;
    private constructor();
    /** 运行环境 */
    workSpace: 'server' | 'client' | 'preview';
    /** 当前语言 */
    lang: string;
    get version(): string;
    /** 内核是否已加载 */
    private coreLoaded;
    /** 初始化内核——挂载 globalThis.sgs */
    init(workSpace: 'server' | 'client' | 'preview'): Promise<void>;
    /** 游戏模式 */
    readonly modes: Map<string, unknown>;
    /** 卡牌扩展包 */
    readonly cardpacks: Map<string, CardPackageData>;
    /** 游戏牌（实体牌数据，id → 数据） */
    readonly cards: Map<string, GameCardData>;
    /** 卡牌定义数据（牌名 → 定义，供类别/副类别派生） */
    readonly carddatas: Map<string, CardData>;
    /** 武将扩展包 */
    readonly generalpacks: Map<string, GeneralPackData>;
    /** 武将牌（武将数据，武将名 → 数据） */
    readonly generals: Map<string, GeneralData>;
    /** 技能 */
    readonly skills: Map<string, SkillData>;
    /** 效果 */
    readonly effects: Map<string, EffectData>;
    /** 牌的默认使用方式定义（同名多方式以 timing 区分；经 CardUse 注册，开局 initCardUses 拷贝到房间） */
    readonly carduses: CardUseData[];
    /** 卡牌资源（牌名 → 资源） */
    readonly cardAssets: Map<string, CardAssets>;
    /** 武将信息（武将全名 → 信息） */
    readonly generalInfoMap: Map<string, GeneralInfo>;
    /** 武将皮肤（武将真名 → 皮肤列表，重复注册 push 且皮肤名去重） */
    readonly generalSkinMap: Map<string, GeneralSkin[]>;
    /** 时机枚举 */
    readonly TimingName: typeof TimingName;
    /** 事件类型枚举 */
    readonly EventType: typeof EventType;
    /** 伤害类型枚举 */
    readonly DamageType: typeof DamageType;
    /** 效果类别枚举 */
    readonly EffectType: typeof EffectType;
    /** 触发优先级枚举 */
    readonly PriorityType: typeof PriorityType;
    /** 技能标签枚举 */
    readonly SkillTag: typeof SkillTag;
    /** 状态效果类型枚举 */
    readonly StateEffectType: typeof StateEffectType;
    /** 卡牌属性枚举 */
    readonly CardAttr: typeof CardAttr;
    /** 卡牌花色枚举 */
    readonly CardSuit: typeof CardSuit;
    /** 卡牌点数枚举 */
    readonly CardNumber: typeof CardNumber;
    /** 卡牌颜色枚举 */
    readonly CardColor: typeof CardColor;
    /** 卡牌类别枚举 */
    readonly CardType: typeof CardType;
    /** 卡牌副类别枚举 */
    readonly CardSubType: typeof CardSubType;
    /** 装备副类别枚举 */
    readonly EquipSubType: typeof EquipSubType;
    /** 区域类型枚举 */
    readonly AreaType: typeof AreaType;
    /** 阶段枚举 */
    readonly Phase: typeof Phase;
    /** 性别枚举 */
    readonly Gender: typeof Gender;
    /** 选择器类型枚举 */
    readonly SelectorType: typeof SelectorType;
    /** 出牌阶段操作枚举 */
    readonly PlayPhaseResult: typeof PlayPhaseResult;
    /** AI 策略类型枚举 */
    readonly StrategyType: typeof StrategyType;
    /** 游戏状态枚举 */
    readonly GameState: typeof GameState;
    /** 实体牌类 */
    readonly GameCard: typeof GameCard;
    /** 虚拟牌类 */
    readonly VirtualCard: typeof VirtualCard;
    /** 武将类 */
    readonly General: typeof General;
    /** 玩家类 */
    readonly Player: typeof Player;
    /** 技能类 */
    readonly Skill: typeof Skill;
    /** 效果抽象类 */
    readonly Effect: typeof Effect;
    /** 触发效果类 */
    readonly TriggerEffect: typeof TriggerEffect;
    /** 状态效果类 */
    readonly StateEffect: typeof StateEffect;
    /** 房间类 */
    readonly Room: typeof Room;
    /** 区域类 */
    readonly Area: typeof Area;
    /** 卡牌抽象基类 */
    readonly ICard: typeof ICard;
    /** 标记抽象基类 */
    readonly Mark: typeof Mark;
    /** 实体牌数据构建器（链式，sgs.CardBuilder('sha')） */
    readonly CardBuilder: typeof cardBuilderFactory;
    /** 实体牌数据构建（全可选字段，sgs.createCard({ name: 'sha' })） */
    readonly createCard: typeof buildCardData;
    /** 武将数据构建器（链式，name 必传，sgs.GeneralBuilder('caocao')） */
    readonly GeneralBuilder: typeof generalBuilderFactory;
    /** 武将数据构建（name 必传，其余可选，sgs.createGeneral({ name: 'caocao' })） */
    readonly createGeneral: typeof buildGeneralData;
    /** 技能数据构建器（链式，name 必传，sgs.SkillBuilder('jianxiong')） */
    readonly SkillBuilder: typeof skillBuilderFactory;
    /** 技能数据构建（name 必传，其余可选，sgs.createSkill({ name: 'jianxiong' })） */
    readonly createSkill: typeof buildSkillData;
    /** 效果数据构建器（链式，name 必传，sgs.EffectBuilder('jianxiong.draw')） */
    readonly EffectBuilder: typeof effectBuilderFactory;
    /** 效果数据构建（name 必传，其余可选，sgs.createEffect({ name: 'jianxiong.draw' })） */
    readonly createEffect: typeof buildEffectData;
    /**
     * 注册牌的默认使用方式（幂等：同名同时机已存在则跳过）。
     * 使用方式定义牌在出牌/响应阶段的行为（合法目标/距离条件/牌面效果），
     * 开局经 room.initCardUses 拷贝到房间索引。
     */
    CardUse(data: CardUseData): CardUseData;
    /**
     * 注册卡牌扩展包：为包内全部实体牌分配 ID（{扩展名}.{扩展内自增序号}）并注册到 sgs.cards。
     * 自增序号在扩展包内共享递增；重复注册同扩展包被跳过。
     */
    registerCardPack(name: string, cards: GameCardData[]): CardPackageData;
    /**
     * 注册武将扩展包：包内武将（武将名即 id）注册到 sgs.generals，扩展包登记到 sgs.generalpacks。
     * 重复注册同扩展包被跳过。
     */
    registerGeneralPack(name: string, generals: GeneralData[]): GeneralPackData;
    /** 注册卡牌资源（牌名 → 资源，同名共享） */
    registerCardAssets(assets: Record<string, CardAssets>): void;
    /**
     * 注册武将资源配置（按武将真名，同名武将共享皮肤）。
     * info 按武将全名入 generalInfoMap 并全字段注入翻译表（general.{武将名}.{字段}）；
     * skills 只写入翻译表（skill.{技能全名}.name/desc/desc2）；
     * skins 按武将真名入 generalSkinMap（重复注册 push 且皮肤名去重），配音文字写入翻译表。
     */
    registerGeneralAssets(assets: Record<string, GeneralConfig>): void;
    /** 翻译表（语言 → 文案） */
    readonly translations: {
        [lang: string]: {
            [key: string]: string;
        };
    };
    /** 概念表（语言 → 定义） */
    readonly concept: {
        [lang: string]: {
            [key: string]: string;
        };
    };
    /** 加载翻译表 */
    loadTranslation(ts?: {
        [key: string]: string;
    }, lang?: string): void;
    /** 读取翻译（无翻译时返回原文） */
    getTranslation(source?: string, lang?: string): string;
    /** 加载概念表 */
    loadConcept(ts?: {
        [key: string]: string;
    }, lang?: string): void;
    /** 读取概念（无定义时返回原文） */
    getConcept(source: string, lang?: string): string;
}
declare declare const sgs: RESGS;
declare global {
    var sgs: RESGS;
}
declare {};


/**
 * 将补丁应用到镜像端状态树（按 path 定位赋值）。
 * 段0 命中实体段映射 → 集合+id 定位实体；否则视为 Room 字段。
 */
declare declare function applyPatches(root: object, patches: StatePatch[]): void;

/** @sync 简单字段（number/string/boolean）；挂载后赋值产生 set 补丁 */
declare declare function sync(): PropertyDecorator;
/**
 * @syncMap key-value 容器。
 * @param segment path 段名（默认字段名；实体集合可自定义，如玩家集合段为 `player`）
 */
declare declare function syncMap(segment?: string): PropertyDecorator;
/**
 * @syncArray 数组容器（元素仅限简单类型）。
 * @param segment path 段名（默认字段名）
 */
declare declare function syncArray(segment?: string): PropertyDecorator;

/** state 层集中导出 */
declare type { Primitive, SyncValue, StatePatch, SyncFieldMeta, StateStoreHost } from './StateTypes';
declare { collectSyncMeta, isSyncNode, joinPath, toSyncValue } from './StateTypes';
declare { StateNode } from './StateNode';
declare { StateMap } from './StateMap';
declare { StateArray } from './StateArray';
declare { StateStore } from './StateStore';
declare { sync, syncMap, syncArray } from './decorators';
declare { applyPatches } from './applyPatches';



/**
 * 数组同步容器（@syncArray 的运行时形态），元素仅限简单类型（number/string/boolean 或联合类型）。
 * insert/remove/replace 产生 arr.insert / arr.remove / arr.replace 补丁。
 */
declare declare class StateArray<T extends Primitive> extends StateNode {
    private _arr;
    get length(): number;
    at(index: number): T | undefined;
    /** 拷贝为普通数组 */
    toArray(): T[];
    /** 快照（序列化用） */
    snapshot(): unknown[];
    /** 在 index 处插入元素：产生 arr.insert 补丁 */
    insert(index: number, value: T): void;
    /** 移除 index 处元素：产生 arr.remove 补丁 */
    remove(index: number): void;
    /** 替换 index 处元素：产生 arr.replace 补丁 */
    replace(index: number, value: T): void;
    /** 尾部追加 */
    push(value: T): void;
    /** 尾部弹出 */
    pop(): T | undefined;
    /** 清空全部元素 */
    clear(): void;
}


/**
 * key-value 同步容器（@syncMap 的运行时形态）。
 * set/delete/clear 产生 map.add / map.remove 补丁；值为同步节点时自动挂载（注入宿主与 path）。
 */
declare declare class StateMap<K extends string, V> extends StateNode {
    private _map;
    get size(): number;
    has(key: K): boolean;
    get(key: K): V | undefined;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    forEach(fn: (value: V, key: K) => void): void;
    /** 快照（序列化用） */
    snapshot(): Record<string, unknown>;
    /** 设置条目：同步节点自动挂载；产生 map.add 补丁 */
    set(key: K, value: V): this;
    /** 删除条目：产生 map.remove 补丁 */
    delete(key: K): boolean;
    /** 清空全部条目 */
    clear(): void;
}


/** 同步节点基类（挂载后注入宿主 `_store` 与自身完整 path `_path`） */
declare declare class StateNode {
    /** 节点标记（isSyncNode 判定用） */
    readonly __isSyncNode = true;
    /** 宿主状态存储（挂载后注入；未挂载为 undefined） */
    _store?: StateStoreHost;
    /** 自身完整 path（挂载后注入；未挂载为 undefined） */
    _path: string | undefined;
}



/**
 * 状态存储：节点挂载与补丁收集。
 * 由 Room 持有（`room.store`），节点挂载后 `_store` 指向本实例。
 */
declare declare class StateStore implements StateStoreHost {
    private _pending;
    private readonly logger;
    constructor(logger?: ILogger);
    /** 挂载节点：注入宿主与 path，递归挂载已有容器字段 */
    attach(node: StateNode, path: string): void;
    /** 收集脏补丁 */
    markDirty(patch: StatePatch): void;
    /** 产出并清空待发补丁（无变化返回空数组） */
    flush(): StatePatch[];
}

/**
 * 状态同步基础类型：补丁联合、宿主接口、path 工具、快照序列化。
 * path 形如 `player/p1/hp`、`player/p1/marks/guanxing`。
 */

/** 简单值：number / string / boolean */
declare type Primitive = number | string | boolean;
/** 可同步值（可 JSON 序列化） */
declare type SyncValue = Primitive | null | SyncValue[] | {
    [key: string]: SyncValue;
};
/** 状态变更补丁（六种） */
declare type StatePatch = {
    kind: 'set';
    path: string;
    value: SyncValue;
} | {
    kind: 'map.add';
    path: string;
    key: string;
    value: SyncValue;
} | {
    kind: 'map.remove';
    path: string;
    key: string;
} | {
    kind: 'arr.insert';
    path: string;
    index: number;
    value: Primitive;
} | {
    kind: 'arr.remove';
    path: string;
    index: number;
} | {
    kind: 'arr.replace';
    path: string;
    index: number;
    value: Primitive;
};
/** 同步字段元信息（装饰器挂载到原型） */
declare interface SyncFieldMeta {
    /** 字段名 */
    key: string;
    /** path 段名（容器可自定义段名，如玩家集合段为 player） */
    segment: string;
}
/** 状态存储宿主接口 */
declare interface StateStoreHost {
    /** 挂载节点：注入宿主与 path，递归挂载已有容器字段 */
    attach(node: StateNode, path: string): void;
    /** 收集脏补丁 */
    markDirty(patch: StatePatch): void;
}
/** 拼接 path 段（根 path 为空时直接返回段名） */
declare declare function joinPath(base: string | undefined, seg: string): string;
/** 节点标记：可挂载/可同步 */
declare declare function isSyncNode(v: unknown): boolean;
/** 收集原型链上的同步字段元信息 */
declare declare function collectSyncMeta(instance: unknown): SyncFieldMeta[];
/** 节点 → 可同步值（快照；容器走 snapshot()，实体走同步字段） */
declare declare function toSyncValue(v: unknown): SyncValue;


/** 序列化：消息 → JSON 字符串 */
declare declare function serialize(msg: Message): string;
/** 反序列化：JSON 字符串 → 消息 */
declare declare function deserialize(data: string): Message;

declare type { Message, Envelope, EnvelopePayload } from './messages';
declare { MessageType } from './messages';
declare { ITransport } from './ITransport';
declare { IPlayerInput } from './IPlayerInput';
declare { LocalTransport } from './LocalTransport';
declare { serialize, deserialize } from './codec';


/**
 * 玩家输入接口（传输层，入站方向）。
 * 服务端经此接口向客户端发送选择请求；响应经 ChooseManager.respond() 回传（网络层收到客户端消息后调用）。
 */
declare interface IPlayerInput {
    /**
     * 向客户端发送选择请求。
     * @returns Promise<void> 表示消息已发送（不等待玩家响应）
     */
    requestChoice(playerId: string, session: ChooseSession): Promise<void>;
}



/**
 * 传输层抽象类——承担发送控制：帧级 flush（16ms）+ 事务批次 + 待发队列。
 * flush 时取出接入 StateStore 的补丁，与业务事件合并组消息投递；
 * 同一事务批次可同时含状态变化（patches）与业务消息（event），合并为一条 batch 消息。
 * 子类实现 deliver 完成实际投递。
 */
declare declare abstract class ITransport {
    /** 已接入的状态存储（flush 时自动取补丁） */
    protected _store?: StateStore;
    /** 待发业务事件队列 */
    private _events;
    private _inBatch;
    private _seq;
    private _eventId;
    private _timer;
    /** 日志接口（可由 Room 构造同步覆盖） */
    protected logger: ILogger;
    constructor(logger?: ILogger);
    /** 子类实现：实际投递一条消息（应序列化副本，不共享引用） */
    protected abstract deliver(msg: Message): void;
    /** 覆盖日志接口（Room 构造时同步权威 logger） */
    attachLogger(logger: ILogger): void;
    /** 接入状态存储：此后 flush 时自动取 store 产出的补丁 */
    attachStore(store: StateStore): void;
    /** 业务事件入队（自动赋业务序号 id） */
    sendEvent(type: MessageType | (string & {}), data: EnvelopePayload): void;
    /** 开启事务批次（帧 tick 遇批次跳过） */
    beginBatch(): void;
    /** 结束事务批次：归零时强制发送（批内载荷合并为一条消息） */
    endBatch(): void;
    /** 立即发送：取状态补丁 + 出队业务事件，按载荷组合消息投递 */
    flush(): void;
    /** 启动帧级发送（默认 16ms，遇批次跳过） */
    startTicking(intervalMs?: number): void;
    /** 停止帧级发送 */
    stopTicking(): void;
}



type MessageHandler = (msg: Message) => void;
/**
 * 单机直连传输——host 与 mirror 通过内存通道通信。
 * deliver 经 serialize/deserialize 生成副本投递，镜像端不共享引用。
 */
declare declare class LocalTransport extends ITransport {
    private _handlers;
    private _peer;
    constructor(logger?: ILogger);
    /** 建立双向连接 */
    connect(peer: LocalTransport): void;
    /** 断开连接 */
    disconnect(): void;
    /** 注册消息处理器，返回取消注册函数 */
    onMessage(handler: MessageHandler): () => void;
    /** 实际投递：序列化副本交给对端 */
    protected deliver(msg: Message): void;
    private _deliver;
}
declare {};


/** 业务消息类型常量（Envelope 路由判别符，与 EnvelopePayload 联合成员对应） */
declare declare enum MessageType {
    None = "none"
}
/** 业务消息体联合（判别联合；成员带 type 判别符，Envelope.data 使用） */
declare type EnvelopePayload = {
    type: MessageType.None;
};
/** 业务消息信封：{type: 业务类型, id: 序号, data: 消息体} */
declare interface Envelope {
    /** 业务消息类型（判别符） */
    type: MessageType | (string & {});
    /** 消息序号 */
    id: number;
    /** 消息体 */
    data: EnvelopePayload;
}
/**
 * 传输消息联合（host↔client 通道消息）：snapshot / patches / event / batch。
 * batch 为事务批次产物，一条消息携带混合载荷（patches + events）。
 */
declare type Message = {
    kind: 'snapshot';
    seq: number;
    state: unknown;
} | {
    kind: 'patches';
    seq: number;
    patches: StatePatch[];
} | {
    kind: 'event';
    seq: number;
    event: Envelope;
} | {
    kind: 'batch';
    seq: number;
    patches?: StatePatch[];
    events?: Envelope[];
};



/** 策略类型：对应不同游戏询问 */
declare declare enum StrategyType {
    /** 出牌阶段 */
    PlayPhase = "PlayPhase",
    /** 使用牌 */
    UseCard = "UseCard",
    /** 打出牌 */
    PlayCard = "PlayCard",
    /** 主动技 */
    Active = "Active",
    /** 响应 */
    Respond = "Respond",
    /** 选牌 */
    ChooseCards = "ChooseCards",
    /** 选目标 */
    ChooseTargets = "ChooseTargets",
    /** 选角色 */
    ChoosePlayers = "ChoosePlayers",
    /** 询问发动 */
    Invoke = "Invoke"
}
/** AI 上下文 */
declare interface AIContext {
    /** AI 玩家 */
    player: Player;
    /** 所属房间 */
    room: Room;
    /** 技能名 */
    skillName: string;
    /** 触发选择的事件数据 */
    eventData?: any;
}
/** 技能 AI 配置（技能注册时附带） */
declare interface SkillAI {
    /** 策略类型 */
    type: StrategyType | StrategyType[];
    /** 濒死时可对自己使用（桃类） */
    save?: boolean;
    /** 可救别人（视为桃类） */
    respondTao?: boolean;
    /** 可响应闪（视为闪类） */
    respondShan?: boolean;
    /** 可响应杀（视为杀类） */
    respondSha?: boolean;
    /** 是卖血技 */
    maixie?: boolean;
    /** 出牌阶段优先级（同类型比较，数值高先评估） */
    order?: number | ((ctx: AIContext) => number);
    /** 卡牌保留价值（弃牌时用，低价值的先弃） */
    keepValue?: number | ((card: GameCard) => number);
    /** 卡牌使用价值（出牌阶段评估用） */
    useValue?: number | ((card: GameCard) => number);
    /** 是否该发动这个技能 */
    shouldUse?: (ctx: AIContext) => boolean;
    /** 选择目标时的排序函数 */
    chooseTarget?: (ctx: AIContext, targets: Player[]) => Player[];
    /** 选择牌时的排序函数 */
    chooseCards?: (ctx: AIContext, cards: GameCard[]) => GameCard[];
    /** 视为技能的前置条件 */
    skillTagFilter?: (ctx: AIContext) => boolean;
}

/** 区域 ID——格式：'{playerId}.{type}'（玩家私有）或 '{type}'（公共） */
declare type AreaId = string;
/** 牌放置方式（面朝方向）：true 正面朝上（Up），false 背面朝上（Down） */
declare type CardPut = boolean;
/** 区域类型 */
declare declare enum AreaType {
    Unknown = "unknown",
    /** 牌堆 */
    Draw = "draw",
    /** 弃牌堆 */
    Discard = "discard",
    /** 处理区 */
    Processing = "processing",
    /** 仓廪 */
    Granary = "granary",
    /** 府库 */
    Treasury = "treasury",
    /** 后备区 */
    Reserve = "reserve",
    /** 手牌区 */
    Hand = "hand",
    /** 装备区 */
    Equip = "equip",
    /** 判定区 */
    Judge = "judge",
    /** 武将牌上 */
    Up = "up",
    /** 武将牌旁 */
    Side = "side"
}

/** 卡牌动画分支（含该分支专属配音） */
declare interface CardAnimation {
    /** 分支名（约定如 fire-sha/thunder-sha） */
    name: string;
    /** 动画完整 url */
    url: string;
    /** 男声配音（完整 url，缺省走默认配音） */
    audioMale?: string;
    /** 女声配音 */
    audioFemale?: string;
}
/** 游戏牌资源（未配置字段走默认路径模板） */
declare interface CardAssets {
    /** 牌图（完整 url，默认 image/cards/{name}.png） */
    image?: string;
    /** 动画多分支（配音随动画分支配置） */
    animations?: CardAnimation[];
}
/** 配音条目（武将皮肤下配置，数组顺序即语音序号） */
declare interface AudioData {
    /** 语音完整 url（默认 generals/{武将真名}/{皮肤}/{技能真名}{序号}.mp3，序号=数组下标；death 键为 generals/{武将真名}/{皮肤}/death.mp3） */
    url?: string;
    /** 语音文字（写入翻译表） */
    text?: string;
}
/** 技能翻译（GeneralConfig.skills 下按技能全名配置，只写入翻译表） */
declare interface SkillTranslation {
    /** 技能名 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}
/** 武将皮肤（default 为原画） */
declare interface GeneralSkin {
    /** 皮肤名 */
    name: string;
    /** 插画（默认 generals/{武将真名}/{skin}/image.png） */
    image?: string;
    /** 特殊插画-他人视角（缺省回退 image） */
    imageDual?: string;
    /** 特殊插画-自己视角（缺省回退 imageDual） */
    imageDualSelf?: string;
    /** 皮肤配音（键固定 death 为阵亡语音，其余键为技能真名；值按顺序为多条语音） */
    audios?: Record<string, AudioData[]>;
}
/** 武将信息（按武将全名入 generalInfoMap，全字段注入翻译表） */
declare interface GeneralInfo {
    /** 编号 */
    id?: string;
    /** 版本 */
    version?: string;
    /** 称号 */
    title?: string;
    /** 前缀（如"界"） */
    prefix?: string;
    /** 设计师 */
    designer?: string;
    /** 代码提供 */
    script?: string;
}
/** 武将资源配置（注册武将时一并提供：信息/技能翻译/皮肤） */
declare interface GeneralConfig {
    /** 武将全名（generalInfoMap 键与 info 翻译键使用，如 standard.caocao；缺省取注册键真名） */
    name?: string;
    /** 武将信息（按武将全名入 generalInfoMap，全字段注入翻译表） */
    info?: GeneralInfo;
    /** 技能翻译（键为技能全名，只写入翻译表） */
    skills?: Record<string, SkillTranslation>;
    /** 皮肤列表（按武将真名入 generalSkinMap，重复注册 push 且皮肤名去重） */
    skins: GeneralSkin[];
}

/** 实体牌 ID——格式：{扩展名}.{自增序号}，保证跨扩展不冲突 */
declare type GameCardId = string;
/** 虚拟牌 ID */
declare type VirtualCardId = number;
/** 实体牌数据（仅用于 sgs 注册；id 由注册扩展包时分配） */
declare interface GameCardData {
    /** 实体牌 id（注册时分配，构建阶段为空串） */
    id: GameCardId;
    /** 卡牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色（由花色派生，可覆盖） */
    color: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性列表 */
    attr: CardAttr[];
    /** 是否为衍生牌（不注册牌名索引） */
    derived: boolean;
}
/** 虚拟牌数据（使用/打出的结算对象数据，subcards 为实体牌 id 列表） */
declare interface VirtualCardData {
    /** 虚拟牌名 */
    name: string;
    /** 花色 */
    suit: CardSuit;
    /** 颜色 */
    color: CardColor;
    /** 点数 */
    number: CardNumber;
    /** 属性列表 */
    attr: CardAttr[];
    /** 实体牌 id 列表 */
    subcards: GameCardId[];
    /** 自定义数据 */
    data: Record<string, unknown>;
}
/** 卡牌定义数据（按牌名注册到 sgs.carddatas，供类别/副类别派生与 UI 展示） */
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
    /** 卡牌名翻译 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}
/** 卡牌属性 */
declare declare enum CardAttr {
    /** 火属性（杀专属） */
    Fire = 1,
    /** 雷属性（杀专属） */
    Thunder = 2,
    /** 国属性（国战无懈可击专属） */
    Country = 3,
    /** 可重铸 */
    Recastable = 4,
    /** 可合纵 */
    Transferable = 5,
    /** 鏖战 */
    Aozhan = 6
}
/** 卡牌花色 */
declare declare enum CardSuit {
    None = 0,
    /** 黑桃 */
    Spade = 1,
    /** 红桃 */
    Heart = 2,
    /** 梅花 */
    Club = 3,
    /** 方片 */
    Diamond = 4
}
/** 卡牌点数 */
declare declare enum CardNumber {
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
    JOKER_RED = 14
}
/** 卡牌颜色 */
declare declare enum CardColor {
    None = 0,
    /** 红色 */
    Red = 1,
    /** 黑色 */
    Black = 2
}
/** 卡牌类别 */
declare declare enum CardType {
    None = 0,
    /** 基本牌 */
    Basic = 1,
    /** 锦囊牌 */
    Scroll = 2,
    /** 装备牌 */
    Equip = 3
}
/** 卡牌副类别 */
declare declare enum CardSubType {
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
    Treasure = 36
}
/** 装备牌副类别 */
declare declare enum EquipSubType {
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
    Treasure = 36
}



/** 选择数量约束：精确数量 或 [最小, 最大]（负数 max = 无上限） */
declare type ChooseCount = number | [number, number];
/** 选择器类型 */
declare declare enum SelectorType {
    /** 选择卡牌 */
    Card = "Card",
    /** 选择玩家 */
    Player = "Player",
    /** 选择武将牌 */
    General = "General",
    /** 选择选项 */
    Option = "Option",
    /** 选择指令 */
    Command = "Command",
    /** 确认 */
    Confirm = "Confirm"
}
/** 选择器配置（UI 层概念） */
declare interface SelectorConfig<T = any> {
    /** 选择器名称 */
    name: string;
    /** 选择器类型 */
    type: SelectorType;
    /** 选择数量约束 */
    count: ChooseCount;
    /** 是否自动选择 */
    auto?: boolean;
    /** 可选项列表 */
    selectable: (ctx: SelectorContext) => T[];
    /** 过滤已选项 */
    filter?: (item: T, selected: T[], ctx: SelectorContext) => boolean;
    /** 生命周期回调 */
    life?: SelectorLifecycle<T>;
    /** 窗口配置 */
    window?: SelectorWindow;
}
/** 选择器生命周期回调 */
declare interface SelectorLifecycle<T = any> {
    /** 初始化（传入合法候选项，返回覆盖配置） */
    onInit?: (ctx: SelectorContext, validCandidates: T[]) => Partial<SelectorConfig>;
    /** 选中选项时（返回覆盖配置） */
    onSelect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    /** 取消选项时（返回覆盖配置） */
    onDeselect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    /** 完成选择时（返回校验结果） */
    onComplete?: (selected: T[], ctx: SelectorContext) => boolean;
}
/** 选择器窗口配置 */
declare interface SelectorWindow {
    /** 窗口类型 */
    type: string;
    /** 窗口选项 */
    options?: any;
    /** 过滤选项 */
    filter?: (item: string, selected: string[], ctx: SelectorContext) => boolean;
    /** 是否全部显示 */
    isAllShow?: boolean;
}
/** 选择器上下文 */
declare interface SelectorContext {
    /** 进行选择的玩家 */
    player: Player;
    /** 所属房间 */
    room: Room;
    /** 已完成步骤的选择结果 */
    results?: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResults?: Record<string, string[]>;
    /** 触发选择的事件数据 */
    eventData?: any;
    /** 技能名 */
    skillName?: string;
    [key: string]: any;
}
/** 一次选择步骤的数据（多类型选择器可并存） */
declare interface ChooseData {
    /** 选择器列表 */
    selectors: SelectorConfig[];
}
/** 选择会话 */
declare interface ChooseSession {
    /** 会话 id */
    id: string;
    /** 目标玩家 id */
    player: string;
    /** 有序选择步骤 */
    data: ChooseData[];
    /** 上下文（含 player/room 引用，toWire 时剥离） */
    context: SelectorContext;
    /** 提示文本 */
    prompt?: {
        main?: RichString;
        side?: RichString;
    };
    /** 是否可取消 */
    canCancel?: boolean;
    /** 是否显示确认/取消按钮 */
    showConfirmButton?: boolean;
    /** 是否显示倒计时 UI */
    showTimer?: boolean;
    /** 超时时间（秒）。未设置时使用 room.options.responseTime，仍未设置则默认 15 秒 */
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
/** 选择结果 */
declare interface ChooseResult {
    /** 会话 id */
    id: string;
    /** 是否取消 */
    cancelled: boolean;
    /** 是否超时 */
    timeout?: boolean;
    /** 各选择器的结果（key = SelectorConfig.name） */
    results: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResult?: Record<string, string[]>;
    /** 出牌阶段操作类型 */
    playPhaseResult?: PlayPhaseResult;
    /** 使用的牌 */
    useCard?: VirtualCardData;
    /** 打出的牌 */
    playCard?: VirtualCardData;
    /** 选中的技能名 */
    skillName?: string;
}
/** 出牌阶段操作类型 */
declare declare enum PlayPhaseResult {
    None = 0,
    /** 使用牌 */
    UseCard = 1,
    /** 使用技能 */
    UseSkill = 2,
    /** 重铸牌 */
    Recast = 3,
    /** 明置主将 */
    OpenHead = 4,
    /** 明置副将 */
    OpenDeputy = 5,
    /** 结束 */
    End = 6
}



/** 时机枚举——全部触发时机（技能触发/事件调度共用） */
declare declare enum TimingName {
    /** 登场前 */
    GameStageBefore = "game_stage_before",
    /** 登场时 */
    GameStage = "game_stage",
    /** 登场后 */
    GameStageAfter = "game_stage_after",
    /** 游戏开始前 */
    GameStartBefore = "game_start_before",
    /** 游戏开始 */
    GameStart = "game_start",
    /** 游戏结束 */
    GameEnd = "game_end",
    /** 轮次开始 */
    RoundStart = "round_start",
    /** 轮次结束 */
    RoundEnd = "round_end",
    /** 休整开始 */
    RestStart = "rest_start",
    /** 休整结束 */
    RestEnd = "rest_end",
    /** 回合开始前 */
    TurnStartBefore = "turn_start_before",
    /** 回合开始 */
    TurnStart = "turn_start",
    /** 回合开始后 */
    TurnStartAfter = "turn_start_after",
    /** 回合结束 */
    TurnEnd = "turn_end",
    /** 回合结束后 */
    TurnEndAfter = "turn_end_after",
    /** 准备阶段开始前 */
    ReadyPhaseStartBefore = "ready_start_before",
    /** 准备阶段开始 */
    ReadyPhaseStart = "ready_start",
    /** 准备阶段 */
    ReadyPhase = "ready_phase",
    /** 准备阶段结束 */
    ReadyPhaseEnd = "ready_end",
    /** 判定阶段开始前 */
    JudgePhaseStartBefore = "judge_start_before",
    /** 判定阶段开始 */
    JudgePhaseStart = "judge_start",
    /** 判定阶段 */
    JudgePhase = "judge_phase",
    /** 判定阶段结束 */
    JudgePhaseEnd = "judge_phase_end",
    /** 摸牌阶段开始前 */
    DrawPhaseStartBefore = "draw_start_before",
    /** 摸牌阶段开始1 */
    DrawPhaseStart1 = "draw_start1",
    /** 摸牌阶段开始2 */
    DrawPhaseStart2 = "draw_start2",
    /** 摸牌阶段 */
    DrawPhase = "draw_phase",
    /** 摸牌阶段结束 */
    DrawPhaseEnd = "draw_end",
    /** 出牌阶段开始前 */
    PlayPhaseStartBefore = "play_start_before",
    /** 出牌阶段开始 */
    PlayPhaseStart = "play_start",
    /** 出牌阶段 */
    PlayPhase = "play_phase",
    /** 出牌阶段结束 */
    PlayPhaseEnd = "play_end",
    /** 弃牌阶段开始前 */
    DiscardPhaseStartBefore = "discard_start_before",
    /** 弃牌阶段开始 */
    DiscardPhaseStart = "discard_start",
    /** 弃牌阶段 */
    DiscardPhase = "discard_phase",
    /** 弃牌阶段结束 */
    DiscardPhaseEnd = "discard_end",
    /** 结束阶段开始前 */
    EndPhaseStartBefore = "end_start_before",
    /** 结束阶段开始 */
    EndPhaseStart = "end_start",
    /** 结束阶段 */
    EndPhase = "end_phase",
    /** 结束阶段结束 */
    EndPhaseEnd = "end_end",
    /** 固定移动牌 */
    MoveCardFixed = "movecard_fixed",
    /** 移动牌前1 */
    MoveCardBefore1 = "movecard_before1",
    /** 移动牌前2 */
    MoveCardBefore2 = "movecard_before2",
    /** 移动牌后1 */
    MoveCardAfter1 = "movecard_after1",
    /** 移动牌后2 */
    MoveCardAfter2 = "movecard_after2",
    /** 移动牌结束 */
    MoveCardEnd = "movecard_end",
    /** 需要使用牌1 */
    UseCardNeed1 = "usecard_need1",
    /** 需要使用牌2 */
    UseCardNeed2 = "usecard_need2",
    /** 声明使用牌 */
    UseCardDeclare = "usecard_declare",
    /** 声明使用牌后 */
    UseCardDeclareAfter = "usecard_declare_after",
    /** 选择使用牌目标 */
    UseCardChooseTarget = "usecard_choose_target",
    /** 牌被使用时 */
    UseCardUsed = "usecard_used",
    /** 指定目标时 */
    UseCardAssignTarget = "usecard_assign_target",
    /** 成为目标时 */
    UseCardBecomeTarget = "usecard_become_target",
    /** 指定目标后 */
    UseCardAssignTargetAfter = "usecard_assign_target_after",
    /** 成为目标后 */
    UseCardBecomeTargetAfter = "usecard_become_target_after",
    /** 使用结算准备工作结束时 */
    UseCardReady = "usecard_ready",
    /** 对当前目标结算开始时 */
    UseCardEffectStart = "usecard_effect_start",
    /** 对当前目标生效前 */
    UseCardEffectBefore = "usecard_effect_before",
    /** 被抵消后 */
    UseCardOffset = "usecard_offset",
    /** 对当前目标生效时 */
    UseCardEffect = "usecard_effect",
    /** 对当前目标生效后 */
    UseCardEffectAfter = "usecard_effect_after",
    /** 使用结算结束后1 */
    UseCardEnd1 = "usecard_end1",
    /** 使用结算结束后2 */
    UseCardEnd2 = "usecard_end2",
    /** 使用结算结束后3 */
    UseCardEnd3 = "usecard_end3",
    /** 需要打出牌时1 */
    DropCardNeed1 = "dropcard_need1",
    /** 需要打出牌时2 */
    DropCardNeed2 = "dropcard_need2",
    /** 声明打出牌 */
    DropCardDeclare = "dropcard_declare",
    /** 打出牌后 */
    DropCardDroped = "dropcard_droped",
    /** 打出牌结束 */
    DropCardEnd = "dropcard_end",
    /** 拼点时 */
    Pindian = "pindian",
    /** 拼点牌被亮出时 */
    PindianCardShow = "pindian_card_show",
    /** 拼点结果确定后 */
    PindianResult = "pindian_result",
    /** 拼点结算结束后 */
    PindianEnd = "pindian_end",
    /** 牌状态改变时 */
    ChangeState = "change_state",
    /** 牌状态改变后 */
    ChangeStateAfter = "change_state_after",
    /** 明置后 */
    Open = "open",
    /** 判定时 */
    Judge = "judge",
    /** 成为判定牌后 */
    JudgeCard = "judge_card",
    /** 判定结果确定前1 */
    JudgeResult1 = "judge_result1",
    /** 判定结果确定前2 */
    JudgeResult2 = "judge_result2",
    /** 判定结果确定后1 */
    JudgeResultAfter1 = "judge_result_after1",
    /** 判定结果确定后2 */
    JudgeResultAfter2 = "judge_result_after2",
    /** 判定结算结束后 */
    JudgeEnd = "judge_end",
    /** 伤害开始 */
    DamageStart = "damage_start",
    /** 造成伤害时1 */
    DamageCause1 = "damage_cause1",
    /** 造成伤害时2 */
    DamageCause2 = "damage_cause2",
    /** 受到伤害时1 */
    DamageInflict1 = "damage_inflict1",
    /** 受到伤害时2 */
    DamageInflict2 = "damage_inflict2",
    /** 受到伤害时3 */
    DamageInflict3 = "damage_inflict3",
    /** 造成伤害后 */
    DamageCauseAfter = "damage_cause_after",
    /** 受到伤害后 */
    DamageInflictAfter = "damage_inflict_after",
    /** 伤害结算结束后 */
    DamageEnd = "damage_end",
    /** 失去体力开始 */
    LoseHpStart = "losehp_start",
    /** 失去体力时 */
    LoseHp = "losehp",
    /** 失去体力后 */
    LoseHpAfter = "losehp_after",
    /** 失去体力结束 */
    LoseHpEnd = "losehp_end",
    /** 扣减体力开始 */
    ReduceHpStart = "reducehp_start",
    /** 扣减体力时 */
    ReduceHp = "reducehp",
    /** 扣减体力后 */
    ReduceHpAfter = "reducehp_after",
    /** 扣减体力结束 */
    ReduceHpEnd = "reducehp_end",
    /** 回复体力开始 */
    RecoverHpStart = "recoverhp_start",
    /** 回复体力时 */
    RecoverHp = "recoverhp",
    /** 回复体力后 */
    RecoverHpAfter = "recoverhp_after",
    /** 回复体力结束 */
    RecoverHpEnd = "recoverhp_end",
    /** 体力上限改变开始 */
    ChangeMaxHpStart = "change_maxhp_start",
    /** 体力上限改变时 */
    ChangeMaxHp = "change_maxhp",
    /** 体力上限改变后 */
    ChangeMaxHpAfter = "change_maxhp_after",
    /** 体力上限改变结束 */
    ChangeMaxHpEnd = "change_maxhp_end",
    /** 进入濒死状态时 */
    DyingEntry = "dying_entry",
    /** 进入濒死状态后 */
    DyingEntryAfter = "dying_entry_after",
    /** 处于濒死状态时 */
    Dying = "dying",
    /** 濒死结束 */
    DyingEnd = "dying_end",
    /** 死亡前 */
    DeathBefore = "death_before",
    /** 确认死亡角色 */
    DeathConfirmRole = "death_confirm_role",
    /** 死亡时 */
    Death = "death",
    /** 死亡后 */
    DeathAfter = "death_after",
    /** 死亡结束 */
    DeathEnd = "death_end",
    /** 获得技能时 */
    SkillObtain = "skill_obtain",
    /** 失去技能时 */
    SkillLose = "skill_lose",
    /** 获得效果时 */
    EffectObtain = "effect_obtain",
    /** 失去效果时 */
    EffectLose = "effect_lose",
    /** 执行消耗后 */
    Cost = "cost",
    /** 发动技能后 */
    Effect = "effect",
    /** 事件结束 */
    EventEnd = "event_end",
    /** 所有事件结束 */
    AllEventEnd = "all_event_end"
}
/** 触发时机（内置时机名或自定义时机名） */
declare type TimingTrigger = TimingName | string;
/** 事件类型 */
declare declare enum EventType {
    /** 登场 */
    Ready = "Ready",
    /** 回合 */
    Turn = "Turn",
    /** 阶段 */
    Phase = "Phase",
    /** 移动 */
    Move = "Move",
    /** 使用牌 */
    UseCard = "UseCard",
    /** 打出牌 */
    DropCard = "DropCard",
    /** 拼点 */
    Pindian = "Pindian",
    /** 明置 */
    Open = "Open",
    /** 暗置 */
    Close = "Close",
    /** 连环 */
    Chain = "Chain",
    /** 跳过 */
    Skip = "Skip",
    /** 更换 */
    Change = "Change",
    /** 移除 */
    Remove = "Remove",
    /** 判定 */
    Judge = "Judge",
    /** 伤害 */
    Damage = "Damage",
    /** 失去体力 */
    LoseHp = "LoseHp",
    /** 扣减体力 */
    ReduceHp = "ReduceHp",
    /** 回复体力 */
    RecoverHp = "RecoverHp",
    /** 体力上限改变 */
    ChangeMaxHp = "ChangeMaxHp",
    /** 濒死 */
    Dying = "Dying",
    /** 死亡 */
    Death = "Death",
    /** 使用技能 */
    UseSkill = "UseSkill"
}
/** 登场事件数据 */
declare interface ReadyEventData {
}
/** 回合事件数据 */
declare interface TurnEventData {
    /** 回合 id */
    turnId: number;
    /** 回合玩家 */
    player: Player;
    /** 是否为额外回合 */
    isExtraTurn: boolean;
    /** 该回合是否因翻面而被跳过 */
    isSkipped: boolean;
    /** 将要执行的阶段 */
    phases: {
        player?: Player;
        phase: Phase;
        isExtraPhase: boolean;
    }[];
    /** 已被跳过的阶段 */
    skippedPhases: Phase[];
    /** 是否为新的一轮开始 */
    isRoundStart: boolean;
    /** 是否为一轮结束 */
    isRoundEnd: boolean;
}
/** 阶段事件数据 */
declare interface PhaseEventData {
    /** 阶段 id */
    phaseId: number;
    /** 阶段玩家 */
    player: Player;
    /** 阶段 */
    phase: Phase;
    /** 是否为额外阶段 */
    isExtraPhase: boolean;
    /** 额定摸牌数 */
    drawCount: number;
}
/** 单条移动数据——描述一批卡牌的移动方式 */
declare interface MoveCardData {
    /** 移动主体 */
    player?: Player;
    /** 移动的卡牌 */
    cards: GameCard[];
    /** 原区域（自动赋值为卡牌所在区域，提供后仅移动该区域的牌） */
    fromArea?: AreaId;
    /** 目标区域 */
    toArea: AreaId;
    /** 目标区域存放位置 */
    pos?: 'top' | 'bottom' | 'random' | number;
    /** 移动原因（draw/discard/obtain...，默认 'put'） */
    reason?: string;
    /** 移动方式（true=正面朝上，false=背面朝上，默认卡牌当前放置方式） */
    moveType?: boolean;
    /** 放置方式（到目标区域后的放置方式，默认手牌区=false 其他=true） */
    putType?: boolean;
    /** 是否播放动画（默认 true，仅客户端用） */
    animation?: boolean;
    /** 动画可见角色（默认 [] = 全部可见，仅客户端用） */
    visiblePlayers?: Player[];
    /** 移动后牌的可见角色（暂未实现） */
    cardVisiblePlayers?: Player[];
    /** 移动后为每张牌执行的操作 */
    handler?: (card: GameCard) => Promise<void>;
    /** 标签文本（仅客户端用） */
    label?: RichString;
    /** 战报文本（仅客户端用） */
    log?: RichString;
    /** 是否同时将 log 进行提示（仅客户端用） */
    toast?: boolean;
    /** 视为信息（仅客户端用） */
    viewas?: VirtualCardData;
    /** 自定义数据 */
    _data?: Record<string, unknown>;
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
    _data?: Record<string, unknown>;
}
/** 移动事件数据——可包含多条移动，每条描述一批卡牌的移动方式 */
declare interface MoveEventData {
    /** 移动数据列表 */
    datas: MoveCardData[];
    /** 获取移动标签（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString;
    /** 获取战报文本（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString;
}
/** 使用牌目标条目 */
declare interface TargetEntry {
    /** 自增 id——仅用于同玩家时稳定排序，不回写 */
    index: number;
    /** 目标角色 */
    target: Player;
    /** 借刀子目标（不进目标列表、不触发 assign/become 时机） */
    subTargets?: Player[];
    /** 此牌对此目标无效（跳过生效时机） */
    invalid?: boolean;
    /** 抵消此牌的事件（闪/无懈 → 使用流程结束） */
    offset?: unknown;
    /** 生效次数（默认取事件的 effectTimes，可单独修改） */
    effectTimes?: number;
    /** 已结算次数 */
    settleCount?: number;
}
/** 统一的使用牌事件数据 */
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
    /** 是否自动排序目标角色（默认 true） */
    autoSort?: boolean;
    /** 采用顺时针结算（默认 false，逆时针） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 */
    effectCorrection?: unknown;
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
    /** 被响应的牌（闪响应杀、无懈响应锦囊时设置） */
    responseTo?: VirtualCard;
    /** 当前结算目标索引 */
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
    distanceCondition?: (room: Room, player: Player, target: Player, card: VirtualCard) => boolean;
    /** 牌面效果 */
    effect: (room: Room, target: Player, event: UseCardEventData) => Promise<void>;
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
/** 打出牌事件数据 */
declare interface DropCardEventData {
    /** 打出者 */
    player: Player;
    /** 打出的虚拟牌 */
    card: VirtualCard;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
}
/** 拼点事件数据 */
declare interface PindianEventData {
    /** 拼点发起者 */
    player: Player;
    /** 拼点目标 */
    targets: Player[];
    /** 各角色的拼点牌 */
    cards: Map<Player, GameCard>;
    /** 选择卡牌时的限制 */
    card_limits?: Map<Player, string[]>;
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 当前结算角色 */
    settleTarget?: Player;
    /** 当前结算赢的角色 */
    settleWinner?: Player;
    /** 当前结算没赢的角色 */
    settleLoser?: Player[];
    /** 发起者与每名目标的结果 */
    settleResults?: Map<Player, {
        winner?: Player;
        loser?: Player[];
    }>;
}
/** 明置事件数据 */
declare interface OpenEventData {
    /** 明置角色 */
    player: Player;
    /** 将要明置的武将牌 */
    generals: General[];
    /** true=明置 */
    toState: true;
}
/** 暗置事件数据 */
declare interface CloseEventData {
    /** 暗置角色 */
    player: Player;
    /** 将要暗置的武将牌 */
    generals: General[];
    /** false=暗置 */
    toState: false;
}
/** 连环事件数据 */
declare interface ChainEventData {
    /** 进入/脱离连环的角色 */
    player: Player;
    /** true=进入连环，false=脱离连环 */
    toState: boolean;
    /** 连环伤害类型 */
    damageType: DamageType;
}
/** 跳过事件数据 */
declare interface SkipEventData {
    /** 被跳过的角色 */
    player: Player;
    /** true=跳过，false=不跳过 */
    toState: boolean;
}
/** 更换武将牌事件数据 */
declare interface ChangeEventData {
    /** 更换角色 */
    player: Player;
    /** 被更换的武将牌（'head'/'deputy' 表示主/副将） */
    general: General | 'head' | 'deputy';
    /** 更换后的武将牌 */
    toGeneral: General;
}
/** 移除武将牌事件数据 */
declare interface RemoveEventData {
    /** 移除角色 */
    player: Player;
    /** 被移除的武将牌 */
    general: General;
}
/** ChangeState 六种子类型 */
declare type ChangeStateType = EventType.Open | EventType.Close | EventType.Chain | EventType.Skip | EventType.Change | EventType.Remove;
/** ChangeState 联合数据类型 */
declare type ChangeStateData = OpenEventData | CloseEventData | ChainEventData | SkipEventData | ChangeEventData | RemoveEventData;
/** 判定事件数据 */
declare interface JudgeEventData {
    /** 判定角色 */
    player: Player;
    /** 判定牌 */
    card?: GameCard;
    /** 判定结果（虚拟牌数据） */
    result?: VirtualCardData;
    /** 判定结果是否成功 */
    isSuccess?: (result: VirtualCardData) => boolean;
}
/** 伤害事件数据 */
declare interface DamageEventData {
    /** 伤害来源 */
    player?: Player;
    /** 受伤角色 */
    target: Player;
    /** 伤害类型 */
    damageType: DamageType;
    /** 伤害点数 */
    number: number;
    /** 伤害渠道（卡牌或效果） */
    channel?: VirtualCard | string;
    /** 是否为连环伤害（默认 false） */
    isChain?: boolean;
}
/** 失去体力事件数据 */
declare interface LoseHpEventData {
    /** 角色 */
    player: Player;
    /** 失去点数 */
    number: number;
}
/** 扣减体力事件数据 */
declare interface ReduceHpEventData {
    /** 角色 */
    player: Player;
    /** 扣减点数 */
    number: number;
}
/** 回复体力事件数据 */
declare interface RecoverHpEventData {
    /** 角色 */
    player: Player;
    /** 回复点数 */
    number: number;
}
/** 体力上限改变事件数据 */
declare interface ChangeMaxHpEventData {
    /** 角色 */
    player: Player;
    /** 改变点数 */
    number: number;
}
/** 濒死事件数据 */
declare interface DyingEventData {
    /** 濒死角色 */
    player: Player;
    /** 造成濒死的角色 */
    killer?: Player;
}
/** 死亡事件数据 */
declare interface DeathEventData {
    /** 死亡角色 */
    player: Player;
    /** 击杀者 */
    killer?: Player;
}
/** 技能使用事件数据 */
declare interface UseSkillEventData {
    /** 发动的效果 */
    effect?: TriggerEffect;
    /** 技能上下文 */
    context?: EffectContext;
    /** 是否发动成功 */
    used?: boolean;
}
/** 登场数据 */
declare interface StageData {
    /** 登场角色 */
    player: Player;
    /** 登场武将牌 */
    generals: General[];
}
/** 需要使用牌数据 */
declare interface NeedUseCardData {
    /** 需要出牌的角色 */
    player: Player;
    /** 可使用的牌名与方法 */
    cards: {
        name: string;
        method: number;
    }[];
    /** 被响应的牌 */
    response?: VirtualCard;
    /** 选择卡牌时的限制 */
    card_limits?: string[];
    /** 选择目标时的限制 */
    target_limits?: string[];
    /** 是否可以发动技能（默认 true） */
    canUseSkill?: boolean;
    /** 可以使用的技能 */
    skills?: string[];
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 生成的使用牌事件数据 */
    useCardEventData?: UseCardEventData;
    /** 是否立即进行使用结算 */
    immediateSettle?: boolean;
    /** 不播放指向线 */
    noPlayDirectLine?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
    /** 是否自动排序目标角色（默认 true） */
    autoSort?: boolean;
    /** 采用顺时针结算（默认 true） */
    clockwise?: boolean;
    /** 对卡牌效果进行修正 */
    effectCorrection?: unknown;
    /** 结算次数 */
    settleCount?: number;
    /** 伤害值基数 */
    damageBase?: number;
    /** 回复值基数 */
    recoverBase?: number;
}
/** 需要打出牌数据 */
declare interface NeedDropCardData {
    /** 需要打出牌的角色 */
    player: Player;
    /** 可打出的牌名 */
    cards: string[];
    /** 被响应的牌 */
    response?: VirtualCard;
    /** 选择卡牌时的限制 */
    card_limits?: string[];
    /** 是否可以发动技能（默认 true） */
    canUseSkill?: boolean;
    /** 可以使用的技能 */
    skills?: string[];
    /** 发起询问时的选项 */
    reqOptions: unknown;
    /** 生成的打出牌事件数据 */
    dropCardEventData?: DropCardEventData;
    /** 是否立即进行打出结算 */
    immediateSettle?: boolean;
    /** 强制播放卡牌语音 */
    forcePlayCardVoice?: boolean;
}
/** 事件类型到事件数据的映射 */
declare interface EventDataMap {
    [EventType.Ready]: ReadyEventData;
    [EventType.Turn]: TurnEventData;
    [EventType.Phase]: PhaseEventData;
    [EventType.Move]: MoveEventData;
    [EventType.UseCard]: UseCardEventData;
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
/** 事件数据（按事件类型取值） */
declare type EventData<T extends EventType> = EventDataMap[T];
/** 时机到所属事件类型的映射 */
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
    [TimingName.ChangeState]: EventType.Open | EventType.Close | EventType.Chain | EventType.Skip | EventType.Change | EventType.Remove;
    [TimingName.ChangeStateAfter]: EventType.Open | EventType.Close | EventType.Chain | EventType.Skip | EventType.Change | EventType.Remove;
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
/** 时机到事件数据的直接映射（未接入事件系统的特殊时机） */
declare interface TimingDataMap {
    [TimingName.GameStageBefore]: StageData;
    [TimingName.GameStage]: StageData;
    [TimingName.GameStageAfter]: StageData;
    [TimingName.GameStartBefore]: {};
    [TimingName.GameStart]: {};
    [TimingName.GameEnd]: {};
    [TimingName.RoundStart]: {
        round: number;
        turn: unknown;
    };
    [TimingName.RoundEnd]: {
        round: number;
        turn: unknown;
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
}
/** 时机对应的事件数据（时机 → 事件类型 → 事件数据 的两级推断） */
declare type TimingData<T extends TimingTrigger> = T extends keyof TimingEventMap ? EventDataMap[TimingEventMap[T]] : T extends keyof TimingDataMap ? TimingDataMap[T] : Record<string, unknown>;
/** 时机定义：名称 + before/after 回调 */
declare interface Timing<T extends TimingTrigger = 'none'> {
    /** 时机名称 */
    name: TimingTrigger;
    /** 在事件触发之前执行 */
    before?: Array<(room: Room, data: TimingData<T>) => Promise<unknown>>;
    /** 在事件触发之后执行 */
    after?: Array<(room: Room, data: TimingData<T>) => Promise<unknown>>;
}
/** 伤害类型 */
declare declare enum DamageType {
    None = 0,
    /** 火焰伤害 */
    Fire = 1,
    /** 雷电伤害 */
    Thunder = 2
}

/** 房间游戏状态 */
declare declare enum GameState {
    Waiting = "waiting",
    Playing = "playing",
    Over = "over"
}


/** 武将 ID（武将名即 id） */
declare type GeneralId = string;
/** 武将势力（可用逗号分割多势力，如 "wei,shu"） */
declare type GeneralKingdom = string;
/** 武将体力（number 或 [初始体力, 上限, 护盾]） */
declare type GeneralHp = number | [number, number] | [number, number, number];
/** 性别 */
declare declare enum Gender {
    /** 无性别 */
    None = 0,
    /** 男 */
    Male = 1,
    /** 女 */
    Female = 2,
    /** 双性 */
    Doublesex = 9
}
/** 武将数据（注册到 sgs.generals，武将名即 id） */
declare interface GeneralData {
    /** 武将名（唯一标识） */
    name: string;
    /** 势力（可用逗号分割多势力） */
    kingdom: GeneralKingdom;
    /** 体力（number 或 [初始体力, 上限, 护盾]） */
    hp: GeneralHp;
    /** 性别 */
    gender: Gender;
    /** 技能名列表 */
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
    /** 默认皮肤名（同名武将共享皮肤配置，仅默认皮肤不同） */
    defaultSkin?: string;
    /** 武将资源配置（注册武将时一并注册，可选） */
    config?: GeneralConfig;
}



/** 卡牌扩展包数据（注册到 sgs.cardpacks） */
declare interface CardPackageData {
    /** 扩展包名（实体牌 ID 前缀，如 standard） */
    name: string;
    /** 扩展包内全部实体牌数据（id 已分配） */
    cards: GameCardData[];
}
/** 武将扩展包数据（注册到 sgs.generalpacks） */
declare interface GeneralPackData {
    /** 扩展包名（如 standard） */
    name: string;
    /** 扩展包内全部武将数据 */
    generals: GeneralData[];
}

/** 玩家阶段 */
declare declare enum Phase {
    None = 0,
    /** 准备阶段 */
    Ready = 1,
    /** 判定阶段 */
    Judge = 2,
    /** 摸牌阶段 */
    Draw = 3,
    /** 出牌阶段 */
    Play = 4,
    /** 弃牌阶段 */
    Drop = 5,
    /** 结束阶段 */
    End = 6,
    /** 叫地主 */
    JiaoDiZhu = 100,
    /** 确认分数 */
    ConfirmScore = 101,
    /** 不叫分 */
    NotScore = 102
}


/** 富文本（纯文本或带值模板，渲染由客户端解析） */
declare type RichString = string | {
    text: string;
    values: Record<string, RichStringValue>;
};
/** 富文本模板值 */
declare type RichStringValue = {
    player: string;
} | {
    players: string[];
} | {
    card: string;
} | {
    cards: string[];
} | {
    number: number;
} | {
    text: RichString;
} | {
    texts: RichString[];
} | {
    cardData: string;
} | {
    cardDatas: string[];
} | {
    vcard: VirtualCardData;
} | {
    vcards: VirtualCardData[];
} | {
    area: string;
};

declare interface RoomOptions {
    responseTime: number;
    spectate?: boolean;
}



/** 技能 id（房间内自增） */
declare type SkillId = number;
/** 效果 id（房间内自增） */
declare type EffectId = number;
/** 效果类别（触发类与状态类互斥） */
declare declare enum EffectType {
    /** 触发类效果 */
    Trigger = "trigger",
    /** 状态类效果 */
    State = "state"
}
/** 效果优先级 */
declare declare enum PriorityType {
    /** 武将技能 */
    General = 1,
    /** 装备技能 */
    Equip = 2,
    /** 卡牌技能 */
    Card = 3,
    /** 规则技能 */
    Rule = 4
}
/** 技能标签 */
declare declare enum SkillTag {
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
    /** 阵法技 */
    Array = 7,
    /** 奥秘技 */
    Secret = 8,
    /** 持恒技 */
    Eternal = 9,
    /** 使命技 */
    Mission = 10,
    /** 主帅技 */
    ZhuShuai = 11,
    /** 前锋技 */
    QianFeng = 12
}
/** 状态效果类型 */
declare declare enum StateEffectType {
}
/** 刷新回调（注册到时机 before/after，data 按 trigger 推断事件数据） */
declare interface TimingCallback<T extends TimingTrigger, This> {
    /** 触发时机 */
    trigger: T;
    /** 时机位置（前/后） */
    position: 'before' | 'after';
    /** 回调（执行刷新逻辑） */
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<void>;
}
/** 自动移除回调（返回 true 时移除临时效果，data 按 trigger 推断事件数据） */
declare interface AutoRemoveCallback<T extends TimingTrigger, This> {
    /** 触发时机 */
    trigger: T;
    /** 时机位置（前/后） */
    position: 'before' | 'after';
    /** 回调 */
    fn: (this: This, room: Room, data: TimingData<T>) => boolean;
}
/** 技能运行时选项 */
declare interface SkillOptions {
    /** 来源（武将/装备/效果，构造时推断 sourceGeneral/sourceEquip/sourceEffect） */
    source?: General | GameCard | Effect;
    /** 按钮显示方式 */
    showui?: 'none' | 'default' | 'other' | 'mark' | 'card';
    /** 跳过主公检查 */
    skipLordCheck?: boolean;
    /** 获得时是否写战报 */
    logOnObtain?: boolean;
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 自动移除回调 */
    autoRemove?: Array<AutoRemoveCallback<TimingTrigger, Skill>>;
    /** 刷新回调 */
    refreshs?: Array<TimingCallback<TimingTrigger, Skill>>;
}
/** 效果运行时选项 */
declare interface EffectOptions {
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 自动移除回调 */
    autoRemove?: Array<AutoRemoveCallback<TimingTrigger, Effect>>;
    /** 刷新回调 */
    refreshs?: Array<TimingCallback<TimingTrigger, Effect>>;
}
/** 技能定义数据（注册到 sgs.skills，技能全名即 id） */
declare interface SkillData {
    /** 技能名（等同技能 id） */
    name: string;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能（仅势力技） */
    attached_kingdom?: string;
    /** 基础技能条件（非时机条件检测） */
    condition: (this: Skill, room: Room) => boolean;
    /** 是否可见 */
    visible?: (this: Skill, room: Room) => boolean;
    /** 全局技能显示按钮的玩家 */
    global?: (this: Skill, room: Room, player: Player) => boolean;
    /** 效果定义列表 */
    effects: EffectData[];
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<TimingCallback<TimingTrigger, Skill>>;
    /** 自定义数据（添加技能后注入到技能的 data） */
    data?: Record<string, unknown>;
    /** 智能体配置 */
    ai?: SkillAI;
}
/** 效果设置 */
declare interface EffectSettings {
    /** 发动方式：mute=自动发动，cost=询问是否发动 */
    forced?: 'mute' | 'cost';
    /** 发动时配音地址（多个则随机顺序播放；默认 extends 继承技能语音） */
    audios?: string[] | 'extends';
    /** 阵法技类型 */
    arraytype?: 'quene' | 'single';
    /** 临时效果（获得技能时不获得） */
    temp?: boolean;
    /** 发动时动画（默认 text） */
    ani?: string;
    /** 发动时是否自动写战报（默认 true） */
    log?: boolean;
    /** 发动时是否弹出提示（默认 true） */
    toast?: boolean;
    /** 是否对技能目标排序（默认 true） */
    sort?: boolean;
    /** 发动时对所有目标播放指向线（0 不播放，默认 1） */
    directline?: number;
    /** 限定技特效（默认 true，仅在限定技标签时有效） */
    limitAni?: boolean;
    /** 觉醒技特效（默认 true，仅在觉醒技标签时有效） */
    awakeAni?: boolean;
    /** 使用的卡牌是否设置为转化牌（默认 true，仅在使用/打出类技能有效） */
    viewas?: boolean;
    /** 是否检测所有人（默认 false，只检测拥有者） */
    global?: boolean;
}
/** 技能发动上下文 */
declare interface EffectContext {
    /** 发动者 */
    from: Player;
    /** 触发此技能的源事件（可通过它调用 prevent/transfer 等方法） */
    event?: unknown;
    /** 消耗结果 */
    cost?: unknown;
    /** 选择结果（选择器名 → 目标 → 结果列表） */
    selections?: Record<string, Record<string, unknown[]>>;
    [key: string]: unknown;
}
/** 触发类效果数据（data 按 T 推断事件数据） */
declare interface TriggerEffectData<T extends TimingTrigger = TimingTrigger> {
    /** 效果优先级 */
    priority: PriorityType;
    /** 触发时机 */
    trigger?: T;
    /** 时机条件检测（返回真值即可以发动） */
    can_trigger?: (this: Effect, room: Room, player: Player, data: TimingData<T>) => boolean;
    /** 最大发动次数：number=固定值，function=实时计算，-1=无限制（默认 1） */
    times?: number | ((this: Effect, room: Room, player: Player, data: TimingData<T>) => number);
    /** 构建本次发动上下文（在消耗与选择前执行） */
    context?: (this: Effect, room: Room, player: Player, data: TimingData<T>) => EffectContext;
    /** 发动前选择（返回选择会话数据，id 由选择系统赋予；无事件数据参数） */
    choose?: (this: Effect, room: Room, player: Player, ctx: EffectContext) => Omit<ChooseSession, 'id'>;
    /** 技能消耗（返回 falsy 视为未发动） */
    cost?: (this: Effect, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>;
    /** 技能效果 */
    effect?: (this: Effect, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>;
}
/** 状态类效果数据（状态回调直接继承） */
declare interface StateEffectData extends Partial<StateCallbackMap> {
}
/** 效果定义数据（注册到 sgs.effects） */
declare interface EffectData {
    /** 效果全名 */
    name: string;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果设置 */
    settings?: EffectSettings;
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 发动条件（非时机条件检测；时机条件检测用 can_trigger） */
    condition: (this: Effect, room: Room, ctx?: EffectContext) => boolean;
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<TimingCallback<TimingTrigger, Effect>>;
    /** 触发类效果数据 */
    trigger?: TriggerEffectData;
    /** 状态类效果数据 */
    state?: StateEffectData;
}
/** 状态回调签名映射 */
declare interface StateCallbackMap {
    [key: string]: unknown;
}



/** 解析区域 ID：返回区域类型与所属玩家 id（公共区域无玩家） */
declare declare function parseAreaId(areaId: AreaId): {
    type: AreaType;
    playerId?: string;
};

/** 卡牌配音性别 */
declare type CardGender = 'male' | 'female';
/** 牌图默认路径 */
declare declare function defaultCardImage(name: string): string;
/** 卡牌默认配音路径（无动画分支专属配音时使用） */
declare declare function defaultCardAudio(name: string, gender: CardGender): string;
/** 武将插画默认路径 */
declare declare function defaultGeneralImage(name: string, skin: string): string;
/** 武将特殊插画-他人视角默认路径 */
declare declare function defaultGeneralImageDual(name: string, skin: string): string;
/** 武将特殊插画-自己视角默认路径 */
declare declare function defaultGeneralImageDualSelf(name: string, skin: string): string;
/** 武将阵亡语音默认路径 */
declare declare function defaultGeneralDeath(name: string, skin: string): string;
/** 技能语音默认路径（{武将真名}/{皮肤}/{技能名}{序号}） */
declare declare function defaultSkillAudio(general: string, skin: string, skill: string, order: number): string;


/** 根据花色获取颜色（黑桃/梅花 → 黑，红桃/方片 → 红，其余无色） */
declare declare function getColorBySuit(suit: CardSuit): CardColor;

/**
 * 确定性伪随机数生成器（mulberry32）。
 * 相同种子产生相同序列，用于对局随机可复现。
 */
declare declare function createRandom(seed: number): () => number;
/** 洗牌（改变原数组）；提供 seed 时使用确定性伪随机，否则 Math.random */
declare declare function shuffle<T>(arr: T[], seed?: number): T[];
/** 生成 [min, max] 区间内的随机整数；提供 seed 时使用确定性伪随机，否则 Math.random */
declare declare function randomInt(min: number, max: number, seed?: number): number;


// ===== sgs 全局对象 =====

declare var sgs: {
    TimingName: typeof TimingName;
    EventType: typeof EventType;
    DamageType: typeof DamageType;
    EffectType: typeof EffectType;
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
    Gender: typeof Gender;
    SelectorType: typeof SelectorType;
    PlayPhaseResult: typeof PlayPhaseResult;
    StrategyType: typeof StrategyType;
    GameState: typeof GameState;
    CardBuilder: typeof CardBuilder;
    GeneralBuilder: typeof GeneralBuilder;
    SkillBuilder: typeof SkillBuilder;
    EffectBuilder: typeof EffectBuilder;
    createCard: (input?: any) => any;
    createGeneral: (input: any) => any;
    createSkill: (input: any) => any;
    createEffect: (input: any) => any;
    GameCard: typeof GameCard;
    VirtualCard: typeof VirtualCard;
    General: typeof General;
    Player: typeof Player;
    Skill: typeof Skill;
    Effect: typeof Effect;
    TriggerEffect: typeof TriggerEffect;
    StateEffect: typeof StateEffect;
    Room: typeof Room;
    Area: typeof Area;
    ICard: typeof ICard;
    Mark: typeof Mark;

    modes: Map<string, any>; cardpacks: Map<string, any>;
    cards: Map<string, any>; carddatas: Map<string, any>;
    generalpacks: Map<string, any>; generals: Map<string, any>;
    skills: Map<string, any>; effects: Map<string, any>;
    cardAssets: Map<string, any>; generalInfoMap: Map<string, any>;
    generalSkinMap: Map<string, any>;
    carduses: CardUseData[];
    translations: Record<string, Record<string, string>>;
    concept: Record<string, Record<string, string>>;
};
