import type { Room } from './Room';
import type { GameCard } from './GameCard';
import type { General } from './General';
import { Mark } from './Mark';
import { sync, syncArray } from '../state/decorators';
import { StateArray } from '../state/StateArray';
import { AreaType } from '../types/AreaTypes';
import type { AreaId } from '../types/AreaTypes';
import type { ChangeStateEvent } from '../logic/event/ChangeStateEvent';
import type { MoveCardEvent } from '../logic/event/MoveCardEvent';
import type { UseCardEvent } from '../logic/event/UseCardEvent';
import type { DropCardEvent } from '../logic/event/DropCardEvent';
import type { JudgeEvent } from '../logic/event/JudgeEvent';
import type { PindianEvent } from '../logic/event/PindianEvent';
import type { DamageEvent, LoseHpEvent, ReduceHpEvent } from '../logic/event/DamageEvent';
import type { RecoverHpEvent, ChangeMaxHpEvent } from '../logic/event/HpEvent';
import type { DyingEvent, DeathEvent } from '../logic/event/DyingEvent';
import type { EventProcess } from '../logic/event/EventProcess';
import type { Effect } from './Effect';
import { DamageType } from '../types/EventTypes';
import type { EventOpts, JudgeEventData, MoveCardOpts, PindianEventData, DamageEventData, DeathEventData } from '../types/EventTypes';
import type { VirtualCard } from './VirtualCard';
import type { VirtualCardData, EquipSubType } from '../types/CardTypes';
import type { RichString } from '../types/RichText';
import { Skill } from './Skill';
import { Gender } from '../types/GeneralTypes';
import { Phase } from '../types/PlayerTypes';

/**
 * 玩家实体
 * @rules terms/game-flow-terms/player
 * @description 角色是玩家在游戏中的操控对象
 */
export class Player extends Mark {
    readonly room: Room;
    /** 玩家 id（path 段用，不同步） */
    playerId: string;

    @sync() username: string = '';
    @sync() seat: number = 0;
    /**
     * 体力
     * @rules terms/value-terms/hp
     * @description 角色的体力值，可能小于 0
     */
    @sync() hp: number = 4;
    /**
     * 体力上限
     * @rules terms/value-terms/maxHp
     * @description 角色的体力上限
     */
    @sync() maxhp: number = 4;
    /**
     * 身份
     * @rules terms/card-terms/Identity
     * @description 身份牌标识角色的身份
     */
    @sync() role: string = '';
    /** 势力 */
    @sync() kingdom: string = '';
    /** 性别 */
    @sync() gender: Gender = Gender.None;
    /** 是否死亡 */
    @sync() death: boolean = false;
    /** 当前阶段 */
    @sync() phase: Phase = Phase.None;
    /** 是否处于自己的回合内 */
    @sync() inturn: boolean = false;
    /**
     * 连环状态
     * @rules terms/general-op-terms/chained
     * @description 武将牌横放的角色即处于连环状态
     */
    @sync() chained: boolean = false;
    /** 翻面状态（跳过下个回合） */
    @sync() skip: boolean = false;
    /** 护盾值（扣减体力时优先吸收） */
    @sync() shield: number = 0;
    /** 休整回合数（>0 表示正在休整） */
    @sync() rest: number = 0;

    /** 手牌（元素仅简单类型：牌 id） */
    @syncArray() hand: StateArray<string> = new StateArray();

    /**
     * 判定区牌记录
     * @rules terms/zone-terms/judgeArea
     * @description 记录玩家判定区已有的判定牌的虚拟牌数据
     */
    // TODO: 后续使用消息体同步判定区牌到客户端
    judgeCards: VirtualCardData[] = [];

    /**
     * 装备记录
     * @rules terms/zone-terms/equipArea
     * @description 记录玩家的已有装备的虚拟牌数据（data.equipSkillId 记录获得的装备技能 id）
     */
    // TODO: 后续使用消息体同步装备到客户端
    equips: VirtualCardData[] = [];

    /**
     * 被废除的区域
     * @rules terms/zone-terms/area
     * @description 记录被废除的装备栏（EquipSubType）或判定区（AreaType.Judge），被废除区域内不能再放置牌
     */
    @syncArray() abolishAreas: StateArray<EquipSubType | AreaType.Judge> = new StateArray();

    /** 持有的妙计牌堆（去重，献策所得） */
    @syncArray() miaojis: StateArray<number> = new StateArray();

    constructor(room: Room, playerId: string) {
        super();
        this.playerId = playerId;
        this.room = room;
        this.room.logger.debug('创建玩家', { roomId: room.roomId, playerId });
    }

    // ===== 派生 getter（纯查询） =====

    /** 是否存活 */
    get alive(): boolean {
        return !this.death;
    }

    // ===== 座位关系 =====

    /** 右手边玩家（座位 +1 循环，不论死活） */
    get right(): Player {
        const n = this.room.players.size;
        const seat = this.seat === n ? 1 : this.seat + 1;
        return [...this.room.players.values()].find((p) => p.seat === seat)!;
    }

    /** 左手边玩家（座位 -1 循环，不论死活） */
    get left(): Player {
        const n = this.room.players.size;
        const seat = this.seat === 1 ? n : this.seat - 1;
        return [...this.room.players.values()].find((p) => p.seat === seat)!;
    }

    /**
     * 下家（行动顺序下一位）
     * @rules terms/game-flow-terms/neighbor
     * @description 下家是行动顺序中该角色的下一位角色
     */
    get next(): Player {
        // TODO: 完整跳过逻辑（死亡/休整）与回合内上/下家变更
        let p = this.right;
        while (p !== this && p.death) p = p.right;
        return p;
    }

    /**
     * 上家（行动顺序上一位）
     * @rules terms/game-flow-terms/neighbor
     * @description 上家是行动顺序中该角色的上一位角色
     */
    get prev(): Player {
        let p = this.left;
        while (p !== this && p.death) p = p.left;
        return p;
    }

    /**
     * 是否为大势力角色
     * @rules terms/description-terms/dashili
     * @description 大势力角色即所属势力为当前大势力的角色
     * @returns 是否为大势力角色
     */
    isBigKingdom(): boolean {
        return this.room.isBigKingdom(this);
    }

    /**
     * 是否为小势力角色
     * @rules terms/description-terms/xiaoshili
     * @description 小势力角色即有大势力存在时，所属势力不为大势力的角色；无大势力时任何角色均非小势力角色
     * @returns 是否为小势力角色
     */
    isSmallKingdom(): boolean {
        return this.room.isSmallKingdom(this);
    }

    /**
     * 是否与另一名角色相邻
     * @rules terms/description-terms/xianglin
     * @description 两名角色间没有其他角色，则称这两名角色相邻
     * @param other 另一名角色
     * @returns 是否相邻
     */
    isAdjacent(other: Player): boolean {
        return this.room.isAdjacent(this, other);
    }

    /**
     * 体力值
     * @rules terms/value-terms/hpValue
     * @description 安全体力值，最小为 0
     */
    get inthp(): number {
        return Math.max(0, this.hp);
    }

    /**
     * 已损失体力值
     * @rules terms/value-terms/lostHp
     * @description 已损失的体力值 = 体力上限 - 体力值
     */
    get losshp(): number {
        return this.maxhp - this.inthp;
    }

    /**
     * 是否已受伤
     * @rules terms/description-terms/injured
     * @description 体力值小于体力上限即已受伤；等于体力上限即未受伤
     */
    get hurt(): boolean {
        return this.hp < this.maxhp;
    }

    /**
     * 手牌上限
     * @rules terms/value-terms/handMax
     * @description 手牌上限初值 = 体力值；修正值与终值由状态效果实时计算
     */
    get handMax(): number {
        // TODO: 手牌上限修正值（+X/-X）与终值（视为 X）由状态效果实时计算
        return this.inthp;
    }

    /**
     * 攻击范围
     * @rules terms/value-terms/attackRange
     * @description 攻击范围初值：无武器牌为 1；修正值与终值由状态效果实时计算
     */
    get attackRange(): number {
        // TODO: 武器牌攻击范围、攻击范围修正值（+X/-X）与无限由状态效果实时计算
        return 1;
    }

    /**
     * 至目标的距离
     * @rules terms/value-terms/distance
     * @description 按存活角色座位顺序的环形最短步数；至自己为 0；修正值与终值由状态效果实时计算
     * @param target 目标角色
     * @returns 距离初值
     */
    distanceTo(target: Player): number {
        // 至自己的距离终值为 0
        if (target === this) return 0;
        // 死亡角色不参与距离初值的计算
        const alives = [...this.room.alives].sort((a, b) => a.seat - b.seat);
        const n = alives.length;
        if (n <= 1) return 0;
        const diff = Math.abs(alives.indexOf(this) - alives.indexOf(target));
        // TODO: 距离修正值（+X/-X）与终值（视为 X）由状态效果实时计算
        return Math.min(diff, n - diff);
    }

    // ===== 区域访问 =====

    /** 玩家私有区域 id */
    getAreaId(type: AreaType): AreaId {
        return `${this.playerId}.${type}`;
    }

    /** 手牌 */
    getHandCards(): GameCard[] {
        return this.room.areas.get(this.getAreaId(AreaType.Hand))?.cards ?? [];
    }

    /** 装备牌 */
    getEquipCards(): GameCard[] {
        return this.room.areas.get(this.getAreaId(AreaType.Equip))?.cards ?? [];
    }

    /** 判定区牌 */
    getJudgeCards(): GameCard[] {
        return this.room.areas.get(this.getAreaId(AreaType.Judge))?.cards ?? [];
    }

    /** 自己的牌（手牌 + 装备） */
    getSelfCards(): GameCard[] {
        return [...this.getHandCards(), ...this.getEquipCards()];
    }

    /** 区域内所有牌（手牌 + 装备 + 判定） */
    getAreaCards(): GameCard[] {
        return [...this.getHandCards(), ...this.getEquipCards(), ...this.getJudgeCards()];
    }

    /**
     * 设置判定区牌
     * @rules terms/zone-terms/judgeArea
     * @description 将判定牌加入判定区记录
     * @param card 判定牌的虚拟牌数据
     */
    setJudgeCard(card: VirtualCardData): void {
        // 同一虚拟牌对应多张实体牌时避免重复记录
        if (this.judgeCards.includes(card)) return;
        this.judgeCards.push(card);
        // TODO: 后续使用消息体同步到客户端
    }

    /**
     * 移除判定区牌
     * @rules terms/zone-terms/judgeArea
     * @description 将判定牌移出判定区记录
     * @param card 判定牌的虚拟牌数据
     */
    removeJudgeCard(card: VirtualCardData): void {
        const idx = this.judgeCards.indexOf(card);
        if (idx !== -1) this.judgeCards.splice(idx, 1);
        // TODO: 后续使用消息体同步到客户端
    }

    /**
     * 设置装备
     * @rules terms/zone-terms/equipArea
     * @description 将装备加入装备记录，获得对应装备名的装备技能
     * @param data 装备的虚拟牌数据（data.equipSkillId 记录获得的装备技能 id）
     */
    setEquip(data: VirtualCardData): void {
        this.equips.push(data);
        const skillData = sgs.skills.get(data.name);
        if (skillData) {
            const skill = new Skill(this.room, skillData, this, { fromEquip: true });
            data.data.equipSkillId = skill.id;
        }
        // TODO: 后续使用消息体同步到客户端
    }

    /**
     * 卸载装备
     * @rules terms/zone-terms/equipArea
     * @description 删除对应装备技能，将装备移出装备记录
     * @param data 装备的虚拟牌数据
     */
    removeEquip(data: VirtualCardData): void {
        const skillId = data.data.equipSkillId;
        if (typeof skillId === 'number') {
            const skill = this.room.getSkill(skillId);
            if (skill) void skill.removeSelf();
        }
        const idx = this.equips.indexOf(data);
        if (idx !== -1) this.equips.splice(idx, 1);
        // TODO: 后续使用消息体同步到客户端
    }

    /**
     * 置于/入：将牌按目标区域默认放置方式移至目标区域
     * @rules terms/card-op-terms/putTo
     * @description 玩家便捷置于入口，省略操作者直接调用房间置于
     * @param cards 被置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项
     * @returns 置于移动事件
     */
    putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.room.putTo(cards, toArea, opts);
    }

    /**
     * 扣置于/入：将牌移至目标区域且背面朝上放置
     * @rules terms/card-op-terms/putFaceDown
     * @description 玩家便捷扣置于入口，省略操作者直接调用房间扣置于
     * @param cards 被扣置于的牌
     * @param toArea 目标区域
     * @param opts 移动附加选项（putType 不可提供，强制为 false）
     * @returns 扣置于移动事件
     */
    putFaceDown(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.room.putFaceDown(cards, toArea, opts);
    }

    /**
     * 依次操作：重复执行操作 X 次（便捷入口）
     * @rules terms/description-terms/repeat
     * @description 玩家便捷依次操作入口，直接调用房间依次操作
     * @param times 重复次数 X
     * @param fn 每次执行的操作
     */
    repeat(times: number, fn: () => Promise<unknown>): Promise<void> {
        return this.room.repeat(times, fn);
    }

    /**
     * 各执行操作：玩家数组按响应顺序依次执行操作（便捷入口）
     * @rules terms/description-terms/for_each
     * @description 玩家便捷各执行操作入口，直接调用房间各执行操作
     * @param players 参与执行的角色数组
     * @param fn 每个角色执行的操作（参数为当前执行角色）
     * @param clockwise 是否按顺时针排序（默认 false 逆时针）
     */
    forEachPlayer(
        players: Player[],
        fn: (player: Player) => Promise<unknown>,
        clockwise: boolean = false,
    ): Promise<void> {
        return this.room.forEachPlayer(players, fn, clockwise);
    }

    /**
     * 阵法召唤（便捷入口）
     * @rules terms/description-terms/arraycall
     * @description 玩家便捷阵法召唤入口，省略发动者直接调用房间阵法召唤
     * @param type 阵法技类型（'queue' 队列 / 'siege' 围攻）
     */
    arraycall(type: 'queue' | 'siege'): Promise<void> {
        return this.room.arraycall(this, type);
    }

    /**
     * 选择：从多个选项中任选其一执行（便捷入口）
     * @rules terms/description-terms/choose
     * @description 选择是拥有选择权的角色从多个选项中选择其中任意一项执行，省略选择角色直接调用房间选择
     * @param options 询问选项（提示/能否取消等）
     * @param handles 选项列表或选项键映射（值含是否可选与执行回调）
     * @returns 选中的选项（键名或文本），取消/无可选时返回 false
     */
    choose(
        options: {
            canCancle?: boolean;
            prompt?: RichString;
            thinkPrompt?: RichString;
            toast?: boolean;
        },
        handles:
            | RichString[]
            | {
                  [key: string]: {
                      chooseable?: boolean;
                      handle?: () => Promise<void>;
                  };
              },
    ): Promise<false | string> {
        return this.room.choose(this, options, handles);
    }

    /**
     * 军令：发起者确定军令，执行者选择是否执行并结算（便捷入口）
     * @rules terms/description-terms/junling
     * @description 玩家便捷军令入口，省略发起者（自身）直接调用房间军令
     * @param to 执行者（B）
     * @param command 指定的军令（不传则随机抽取两张由自身二选一）
     */
    command(to: Player, command?: number): Promise<void> {
        return this.room.command(this, to, command);
    }

    /**
     * 献策：给执行者献计并结算（便捷入口）
     * @description 玩家便捷献策入口，省略发起者（自身）直接调用房间献策
     * @param to 执行者
     * @param miaoji 指定的妙计（不传则随机抽取一张）
     */
    xiance(to: Player, miaoji?: number): Promise<void> {
        return this.room.xiance(this, to, miaoji);
    }

    /**
     * 是否持有妙计
     * @description 持有妙计即待执行者的持有妙计牌堆非空
     * @returns 是否持有妙计
     */
    hasMiaoji(): boolean {
        return this.miaojis.length > 0;
    }

    /**
     * 失去所有武将技能（便捷入口）
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有武将技能即移除该角色除规则技能与装备技能外的所有技能
     */
    loseGeneralSkills(): Promise<void> {
        return this.room.loseGeneralSkills(this);
    }

    /**
     * 失去所有技能（便捷入口）
     * @rules terms/description-terms/shiqujineng
     * @description 失去所有技能即移除该角色拥有的全部技能（含规则技能与装备技能）
     */
    loseAllSkills(): Promise<void> {
        return this.room.loseAllSkills(this);
    }

    /**
     * 失去指定武将牌上的技能（便捷入口）
     * @rules terms/description-terms/shiqujineng
     * @description 失去指定武将牌上的技能即移除该角色由该武将牌获得的全部技能
     * @param general 来源武将牌
     */
    loseSkillsOfGeneral(general: General): Promise<void> {
        return this.room.loseSkillsOfGeneral(this, general);
    }

    /**
     * 摸牌：从牌堆摸 count 张到自身手牌
     * @rules terms/card-op-terms/draw
     * @description 玩家便捷摸牌入口，省略玩家参数直接调用房间摸牌
     * @param count 摸牌数量（默认 1）
     * @param pos 从牌堆顶部/底部摸取（默认顶部）
     * @param opts 移动附加选项
     * @returns 摸牌结果（移动事件或空）
     */
    draw(count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts): Promise<unknown> {
        return this.room.draw(this, count, pos, opts);
    }

    /**
     * 将牌补至X张：手牌数不足 X 时摸（X－手牌数）张牌
     * @rules terms/card-op-terms/drawTo
     * @description 玩家便捷补牌入口，省略补牌角色直接调用房间补至
     * @param count 补至的牌数 X
     */
    drawTo(count: number): Promise<void> {
        return this.room.drawTo(this, count);
    }

    /**
     * 弃牌：将指定牌弃置到弃牌堆
     * @rules terms/card-op-terms/discard
     * @description 玩家便捷弃牌入口，省略玩家参数直接调用房间弃牌
     * @param cards 被弃置的牌
     * @param opts 移动附加选项
     * @returns 弃牌移动事件
     */
    discard(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent> {
        return this.room.discard(this, cards, opts);
    }

    /**
     * 将牌弃置至X张：牌数大于 X 时弃置（牌数－X）张牌
     * @rules terms/card-op-terms/discardTo
     * @description 玩家便捷弃置至入口，省略弃牌角色直接调用房间弃置至（选择询问待实现）
     * @param cards 需要操作的牌数组
     * @param count 弃置至的牌数 X
     */
    discardTo(cards: GameCard[], count: number): Promise<void> {
        return this.room.discardTo(this, cards, count);
    }

    /**
     * 获得牌：将指定牌移至自身手牌区
     * @rules terms/card-op-terms/obtain
     * @description 玩家便捷获得入口，省略玩家参数直接调用房间获得
     * @param cards 被获得的牌
     * @param opts 移动附加选项
     * @returns 获得移动事件（无可获得牌时为 undefined）
     */
    obtain(cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        return this.room.obtain(this, cards, opts);
    }

    /**
     * 交给牌：将自身牌交给 toPlayer
     * @rules terms/card-op-terms/give
     * @description 玩家便捷交给入口，省略交出角色直接调用房间交给
     * @param toPlayer 接收的角色
     * @param cards 被交给的牌
     * @param opts 移动附加选项
     * @returns 交给移动事件（无可交给牌时为 undefined）
     */
    give(toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts): Promise<MoveCardEvent | undefined> {
        return this.room.give(this, toPlayer, cards, opts);
    }

    /**
     * 交换牌：两批牌同时经处理区互换区域
     * @rules terms/card-op-terms/swap
     * @description 玩家便捷交换入口，省略玩家参数（经 opts.player 传入自身）
     * @param cards1 第一批牌
     * @param toArea1 第一批牌的目标区域
     * @param cards2 第二批牌
     * @param toArea2 第二批牌的目标区域
     * @param opts 移动附加选项（player 自动设为自身）
     * @returns 交换移动事件（无有效牌时为 undefined）
     */
    swap(
        cards1: GameCard[],
        toArea1: AreaId,
        cards2: GameCard[],
        toArea2: AreaId,
        opts?: MoveCardOpts,
    ): Promise<MoveCardEvent | undefined> {
        return this.room.swap(cards1, toArea1, cards2, toArea2, { ...opts, player: this });
    }

    /**
     * 使用牌：触发牌的使用事件
     * @rules terms/card-op-terms/useCard
     * @description 玩家便捷使用入口，省略使用者直接调用房间使用
     * @param card 使用的虚拟牌
     * @param targets 使用目标（缺省为空）
     * @returns 使用事件（未成功触发时为 null）
     */
    useCard(card: VirtualCard, targets?: Player[]): Promise<UseCardEvent | null> {
        return this.room.useCard(this, card, targets);
    }

    /**
     * 打出牌：触发牌的打出事件
     * @rules terms/card-op-terms/dropCard
     * @description 玩家便捷打出入口，省略打出者直接调用房间打出
     * @param card 打出的虚拟牌
     * @returns 打出事件
     */
    dropCard(card: VirtualCard): Promise<DropCardEvent> {
        return this.room.dropCard(this, card);
    }

    /**
     * 重铸：将牌置入弃牌堆后摸等量牌
     * @rules terms/card-op-terms/recast
     * @description 玩家便捷重铸入口，省略重铸角色直接调用房间重铸
     * @param cards 被重铸的牌（须为自身拥有的牌）
     * @param drawOneAlways 是否无论张数始终摸一张（默认 false）
     * @param opts 移动附加选项
     * @returns 重铸结果（移动与摸牌）
     */
    recast(cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts): Promise<unknown> {
        return this.room.recast(this, cards, drawOneAlways, opts);
    }

    /**
     * 观看：查看相应牌（卡牌或武将牌）的牌面信息的操作
     * @rules terms/card-op-terms/watch
     * @description 玩家便捷观看入口，省略观看者直接调用房间观看
     * @param cards 被观看的牌（卡牌或武将牌）
     */
    watch(cards: (GameCard | General)[]): Promise<void> {
        return this.room.watch(this, cards);
    }

    /**
     * 展示牌：将指定牌翻转至正面朝上展示（无实际区域移动）
     * @rules terms/card-op-terms/showCards
     * @description 玩家便捷展示入口，省略展示者直接调用房间展示
     * @param cards 被展示的牌
     */
    showCards(cards: GameCard[]): Promise<void> {
        return this.room.showCards(this, cards);
    }

    /**
     * 亮出牌：牌堆牌置入处理区，其他牌等同展示
     * @rules terms/card-op-terms/flashCards
     * @description 玩家便捷亮出入口，省略亮出者直接调用房间亮出
     * @param cards 被亮出的牌
     * @param opts 移动附加选项
     */
    flashCards(cards: GameCard[], opts?: MoveCardOpts): Promise<unknown> {
        return this.room.flashCards(this, cards, opts);
    }

    // ===== 状态改变快捷方法 =====

    /**
     * 明置武将
     * @rules terms/general-op-terms/open
     * @description 玩家便捷明置入口，省略明置角色直接调用房间明置
     * @param generals 被明置的武将牌
     * @returns 状态改变事件
     */
    open(generals: General[]): Promise<ChangeStateEvent> {
        return this.room.open(this, generals);
    }

    /**
     * 暗置武将
     * @rules terms/general-op-terms/close
     * @description 玩家便捷暗置入口，省略暗置角色直接调用房间暗置
     * @param generals 被暗置的武将牌
     * @returns 状态改变事件
     */
    close(generals: General[]): Promise<ChangeStateEvent> {
        return this.room.close(this, generals);
    }

    /**
     * 横置：进入连环状态
     * @rules terms/general-op-terms/chain
     * @description 玩家便捷横置入口，省略横置角色直接调用房间横置
     * @returns 状态改变事件
     */
    chain(): Promise<ChangeStateEvent> {
        return this.room.chain(this);
    }

    /**
     * 重置：脱离连环状态
     * @rules terms/general-op-terms/reset
     * @description 玩家便捷重置入口，省略重置角色直接调用房间重置
     * @param damageType 连环伤害类型（默认 None）
     * @returns 状态改变事件
     */
    reset(damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        return this.room.reset(this, damageType);
    }

    /** 横置/重置：按当前连环状态取反 */
    chainOrReset(damageType: DamageType = DamageType.None): Promise<ChangeStateEvent> {
        return this.room.chainOrReset(this, damageType);
    }

    /**
     * 翻面
     * @rules terms/general-op-terms/skip
     * @description 玩家便捷翻面入口，省略翻面角色直接调用房间翻面
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    turnOver(toState?: boolean): Promise<ChangeStateEvent> {
        return this.room.skip(this, toState);
    }

    /**
     * 叠置：与翻面同一逻辑
     * @rules terms/general-op-terms/stack
     * @description 玩家便捷叠置入口，省略叠置角色直接调用房间叠置
     * @param toState 目标状态（缺省取当前状态取反）
     * @returns 状态改变事件
     */
    stack(toState?: boolean): Promise<ChangeStateEvent> {
        return this.room.stack(this, toState);
    }

    /**
     * 复原：按武将牌状态组合重置/翻面
     * @rules terms/general-op-terms/restore
     * @description 玩家便捷复原入口，省略复原角色直接调用房间复原
     */
    restore(): Promise<void> {
        return this.room.restore(this);
    }

    /**
     * 变更武将
     * @rules terms/general-op-terms/change
     * @description 玩家便捷变更入口，省略变更角色直接调用房间变更——TODO(R8): 主副将数据就绪后生效
     * @param general 被变更的武将牌（'head'/'deputy' 表示主/副将）
     * @param toGeneral 变更后的武将牌
     * @returns 状态改变事件
     */
    change(general: General | 'head' | 'deputy', toGeneral: General): Promise<ChangeStateEvent> {
        return this.room.change(this, general, toGeneral);
    }

    /**
     * 移除武将
     * @rules terms/general-op-terms/remove
     * @description 玩家便捷移除入口，省略移除角色直接调用房间移除——TODO(R8): 主副将数据就绪后生效
     * @param general 被移除的武将牌
     * @returns 状态改变事件
     */
    remove(general: General): Promise<ChangeStateEvent> {
        return this.room.remove(this, general);
    }

    /**
     * 造成伤害（便捷入口）
     * @rules terms/description-terms/damage
     * @description 玩家便捷造成伤害入口，省略来源直接调用房间造成伤害
     * @param target 受伤角色
     * @param number 伤害点数
     * @param damageType 伤害类型
     * @param opts 附加选项（渠道/连环/事件元数据/自由扩展字段）
     * @returns 伤害事件
     */
    damage(
        target: Player,
        number: number,
        damageType: DamageType,
        opts?: EventOpts & Partial<Omit<DamageEventData, 'player' | 'target' | 'number' | 'damageType'>>,
    ): Promise<DamageEvent> {
        return this.room.damage(this, target, number, damageType, opts);
    }

    /**
     * 受到伤害（便捷入口）
     * @rules terms/description-terms/damage
     * @description 玩家便捷受到伤害入口，省略受伤角色（自身）直接调用来源玩家的造成伤害；未指定来源时为无来源伤害
     * @param sieger 伤害来源（无来源伤害传 undefined）
     * @param number 伤害点数
     * @param damageType 伤害类型
     * @param opts 附加选项（渠道/连环/事件元数据/自由扩展字段）
     * @returns 伤害事件
     */
    bedamage(
        sieger: Player | undefined,
        number: number,
        damageType: DamageType,
        opts?: EventOpts & Partial<Omit<DamageEventData, 'player' | 'target' | 'number' | 'damageType'>>,
    ): Promise<DamageEvent> {
        if (sieger) {
            return sieger.damage(this, number, damageType, opts);
        }
        return this.room.damage(undefined, this, number, damageType, opts);
    }

    /** 失去体力（便捷入口） */
    loseHp(number: number, opts?: EventOpts): Promise<LoseHpEvent> {
        return this.room.loseHp(this, number, opts);
    }

    /**
     * 扣减体力（便捷入口）
     * @rules terms/description-terms/reduce_hp
     * @description 玩家便捷扣减体力入口，省略扣减角色直接调用房间扣减体力
     * @param number 扣减点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 扣减体力事件
     */
    reduceHp(number: number, opts?: EventOpts): Promise<ReduceHpEvent> {
        return this.room.reduceHp(this, number, opts);
    }

    /**
     * 回复体力（便捷入口）
     * @rules terms/description-terms/recover
     * @description 玩家便捷回复体力入口，省略回复角色直接调用房间回复体力
     * @param number 回复点数
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件
     */
    recover(number: number, opts?: EventOpts): Promise<RecoverHpEvent> {
        return this.room.recover(this, number, opts);
    }

    /**
     * 将体力回复至X点（便捷入口）
     * @rules terms/description-terms/recover_to
     * @description 玩家便捷回复至入口，省略回复角色直接调用房间回复至
     * @param toHp 回复至的体力值 X
     * @param opts 附加选项（事件元数据/自由扩展字段）
     * @returns 回复体力事件（不能执行时为 undefined）
     */
    recoverTo(toHp: number, opts?: EventOpts): Promise<RecoverHpEvent | undefined> {
        return this.room.recoverTo(this, toHp, opts);
    }

    /** 改变体力上限（便捷入口） */
    changeMaxHp(number: number, opts?: EventOpts): Promise<ChangeMaxHpEvent> {
        return this.room.changeMaxHp(this, number, opts);
    }

    /** 进入濒死（便捷入口） */
    dying(opts?: EventOpts): Promise<DyingEvent> {
        return this.room.dying(this, opts);
    }

    /** 死亡（便捷入口） */
    die(opts?: EventOpts & Partial<Omit<DeathEventData, 'player'>>): Promise<DeathEvent> {
        return this.room.die(this, opts);
    }

    /**
     * 判定：触发一个判定事件
     * @rules terms/card-op-terms/judge
     * @description 玩家便捷判定入口，直接调用房间判定
     * @param opts 判定事件数据（自由扩展字段）
     * @returns 判定事件
     */
    judge(opts?: EventOpts & Partial<Omit<JudgeEventData, 'player'>>): Promise<JudgeEvent> {
        return this.room.judge(this, opts);
    }

    /**
     * 拼点：触发一个拼点事件
     * @rules terms/card-op-terms/pindian
     * @description 玩家便捷拼点入口，直接调用房间拼点
     * @param targets 拼点目标
     * @param opts 拼点事件数据（自由扩展字段）
     * @returns 拼点事件
     */
    pindian(targets: Player[], opts?: EventOpts & Partial<Omit<PindianEventData, 'player' | 'targets'>>): Promise<PindianEvent> {
        return this.room.pindian(this, targets, opts);
    }
}
