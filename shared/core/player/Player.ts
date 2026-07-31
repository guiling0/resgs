import { MapSchema } from '@colyseus/schema';
import { Room } from '../room/Room';
import { MarkState } from '../schema/MarkState';
import { PlayerState } from '../schema/PlayerState';
import { Gender } from '../general/GeneralType';
import { Phase } from './PlayerTypes';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { General } from '../general/General';
import { GameCard } from '../card/GameCard';
import { AreaId, AreaType, VirtualCardData } from '../card/CardTypes';
import { VirtualCard } from '../card/VirtualCard';
import { DamageType, MoveCardOpts } from '../event/EventTypes';
import { SelectCount, type SelectSession } from '../select/SelectTypes';

export class Player implements MarkHost {
    // ===== 客户端专项属性，服务端不引用 =====
    /** 是否是自己（客户端 UI 标识） */
    isSelf: boolean = false;

    /** 所属房间 */
    readonly room: Room;
    /** Colyseus 同步状态 */
    readonly state: PlayerState;
    /** 运行时自定义数据 */
    readonly data: Record<string, any> = {};
    /** 标记状态 Map（来自 state.markStates） */
    readonly marksMap: MapSchema<MarkState>;
    /** 标记 key→内容集合 索引（MarkHost） */
    readonly _markKeyMap = new Map<string, Set<string>>();
    constructor(playerId: string, room: Room, state: PlayerState) {
        this.room = room;
        this.state = state;
        this.state.playerId = playerId;
        this.marksMap = state.markStates;
        // 创建私有区域
        for (const type of [
            AreaType.Hand,
            AreaType.Equip,
            AreaType.Judge,
            AreaType.Up,
            AreaType.Side,
        ]) {
            this.room.area.initArea(this.getAreaId(type));
            this.room.area.initArea(this.getAreaId(type), true);
        }
    }

    // ===== MarkHost 标记方法（委托到 MarkMethods） =====

    // ===== MarkHost 标记方法（委托到 MarkMethods） =====
    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    // ===== 同步属性 get/set（代理到 PlayerState） =====
    /** 唯一玩家ID */
    get playerId(): string {
        return this.state.playerId;
    }
    /** 玩家名字 */
    get username(): string {
        return this.state.username;
    }
    /** 会话ID */
    get sessionId(): string {
        return this.state.sessionId;
    }
    /** 座次 */
    set seat(value: number) {
        this.state.seat = value;
    }
    get seat(): number {
        return this.state.seat;
    }
    /** 座位标签（游戏开始前用于确认身份，开始后随机分配时可能被修改） */
    get seattag(): string | undefined {
        return this.data.seattag;
    }
    set seattag(value: string | undefined) {
        this.data.seattag = value;
    }
    /** 身份（zhugong/zhongchen/fanzei/neijian） */
    set role(value: string) {
        this.state.role = value;
    }
    get role(): string {
        return this.state.role;
    }
    /** 身份牌是否明示 */
    set rolePut(value: boolean) {
        this.state.rolePut = value;
    }
    get rolePut(): boolean {
        return this.state.rolePut;
    }
    /** 势力 */
    set kingdom(value: string) {
        this.state.kingdom = value;
    }
    get kingdom(): string {
        return this.state.kingdom;
    }
    /** 性别 */
    set gender(value: Gender) {
        this.state.gender = value;
    }
    get gender(): Gender {
        return this.state.gender;
    }
    /** 体力值 */
    set hp(value: number) {
        this.state.hp = value;
    }
    get hp(): number {
        return this.state.hp;
    }
    /** 体力上限 */
    set maxhp(value: number) {
        this.state.maxhp = value;
    }
    get maxhp(): number {
        return this.state.maxhp;
    }
    /** 护甲值 */
    set shield(value: number) {
        this.state.shield = value;
    }
    get shield(): number {
        return this.state.shield;
    }
    /** 连环状态 */
    set chained(value: boolean) {
        this.state.chained = value;
    }
    get chained(): boolean {
        return this.state.chained;
    }
    /** 翻面状态 */
    set skip(value: boolean) {
        this.state.skip = value;
    }
    get skip(): boolean {
        return this.state.skip;
    }
    /** 是否死亡 */
    set death(value: boolean) {
        this.state.death = value;
    }
    get death(): boolean {
        return this.state.death;
    }
    /** 休整剩余轮次 */
    set rest(value: number) {
        this.state.rest = value;
    }
    get rest(): number {
        return this.state.rest;
    }
    /** 当前阶段 */
    set phase(value: Phase) {
        this.state.phase = value;
    }
    get phase(): Phase {
        return this.state.phase;
    }
    /** 是否处于自己的回合内（客户端 UI 需要） */
    set inturn(value: boolean) {
        this.state.inturn = value;
    }
    get inturn(): boolean {
        return this.state.inturn;
    }
    /** 主将 ID（写入时查找 room.generals 缓存实例） */
    set headId(value: string) {
        this.state.headId = value;
        this._head = value ? this.room.generals.get(value) : undefined;
    }
    get headId(): string {
        return this.state.headId;
    }
    /** 副将 ID */
    set deputyId(value: string) {
        this.state.deputyId = value;
        this._deputy = value ? this.room.generals.get(value) : undefined;
    }
    get deputyId(): string {
        return this.state.deputyId;
    }

    // ===== 计算属性 =====
    /** 显示用名称（武将名+座次+自己标识） */
    get gameName(): string {
        let name = '';
        if (this.hasHead() && this.headOpen) {
            name += sgs.getTranslation(this.head?.trueName);
        } else if (this.hasDeputy() && this.deputyOpen) {
            name += sgs.getTranslation(this.deputy?.trueName);
        } else if (this.seat > 0) {
            name += `${this.seat}号位`;
        }
        if (this.isSelf) {
            name += '(你)';
        }
        return name;
    }

    /** 是否存活 */
    get alive() {
        return !this.death;
    }
    /** 安全体力值（最小为 0，用于伤害计算等场景） */
    get inthp() {
        return Math.max(0, this.hp);
    }
    /** 已损失体力值 */
    get losshp() {
        return this.maxhp - this.inthp;
    }
    /** 起始手牌数 */
    get initHandCardCount(): number {
        return this.data.initHandCardCount ?? 4;
    }
    /** 备选武将数量 */
    get chooseGeneralCount(): number {
        return this.data.chooseGeneralCount ?? 5;
    }
    /** 预选武将名列表 */
    get preChooseGeneral(): string[] {
        return this.data.preChooseGeneral ?? [];
    }

    // ===== 座位关系 =====
    /** 右手边玩家（顺时针，不论死活） */
    public get right() {
        const seat = this.seat === this.room.players.length ? 1 : this.seat + 1;
        return this.room.players.find((v) => v.seat === seat);
    }
    /** 左手边玩家（逆时针，不论死活） */
    public get left() {
        const seat = this.seat === 1 ? this.room.players.length : this.seat - 1;
        return this.room.players.find((v) => v.seat === seat);
    }

    // ===== 卡牌访问 =====
    /** 获取玩家私有区域 ID */
    getAreaId(type: AreaType): AreaId {
        return `${this.playerId}.${type}`;
    }
    /** 从指定区域类型获取卡牌 */
    private _getCardsByArea(type: AreaType): GameCard[] {
        const ids = this.room.area.get(this.getAreaId(type));
        return ids ? this.room.card.gets([...ids]) : [];
    }
    getHandCards(): GameCard[] {
        return this._getCardsByArea(AreaType.Hand);
    }
    getEquipCards(): GameCard[] {
        return this._getCardsByArea(AreaType.Equip);
    }
    getJudgeCards(): GameCard[] {
        return this._getCardsByArea(AreaType.Judge);
    }
    /** 自己的所有牌（手牌+装备） */
    getSelfCards(): GameCard[] {
        return [...this.getHandCards(), ...this.getEquipCards()];
    }
    /** 自己区域内的所有牌（手牌+装备+判定） */
    getAreaCards(): GameCard[] {
        return [
            ...this.getHandCards(),
            ...this.getEquipCards(),
            ...this.getJudgeCards(),
        ];
    }

    // ===== 武将管理 =====
    private _head?: General;
    private _deputy?: General;

    /** 主将实例（设置时同步更新 state.headId） */
    set head(value: General | undefined) {
        this._head = value;
        this.state.headId = value?.id ?? '';
    }
    get head(): General | undefined {
        return this._head;
    }
    /** 副将实例 */
    set deputy(value: General | undefined) {
        this._deputy = value;
        this.state.deputyId = value?.id ?? '';
    }
    get deputy(): General | undefined {
        return this._deputy;
    }
    /** 主将是否明置 */
    get headOpen() {
        return this.head?.put;
    }
    /** 副将是否明置 */
    get deputyOpen() {
        return this.deputy?.put;
    }
    /** 是否拥有非士兵武将 */
    private _hasGeneral(g: General | undefined): boolean {
        return !!g && !g.name.includes('shibing');
    }
    hasHead() {
        return this._hasGeneral(this.head);
    }
    hasDeputy() {
        return this._hasGeneral(this.deputy);
    }
    /** 获取所有已明置的武将 */
    getOpenedGenerals() {
        const generals: General[] = [];
        if (this.hasHead() && this.headOpen) generals.push(this.head!);
        if (this.hasDeputy() && this.deputyOpen) generals.push(this.deputy!);
        return generals;
    }
    /** 获取所有暗置的武将 */
    getCloseGenerals() {
        const generals: General[] = [];
        if (this.hasHead() && !this.headOpen) generals.push(this.head!);
        if (this.hasDeputy() && !this.deputyOpen) generals.push(this.deputy!);
        return generals;
    }

    // ===== 事件快捷方法（省略 player 参数，技能中便捷调用）=====

    /** 作为伤害来源对 target 造成伤害 */
    async damage(
        target: Player,
        damageType = 0 as DamageType,
        number = 1,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ) {
        return this.room.damage(this, target, damageType, number, channel, isChain);
    }
    /** 作为目标受到伤害（source 可为 undefined 表示无来源） */
    async takeDamage(
        source: Player | undefined,
        damageType = 0 as DamageType,
        number = 1,
        channel?: VirtualCard | string,
        isChain?: boolean,
    ) {
        return this.room.damage(source, this, damageType, number, channel, isChain);
    }
    async loseHp(number = 1) {
        return this.room.loseHp(this, number);
    }
    async reduceHp(number = 1) {
        return this.room.reduceHp(this, number);
    }
    async recover(number = 1) {
        return this.room.recover(this, number);
    }
    /** 将体力恢复到目标值（自动计算回复量，最多到上限），委托到 Room */
    async recoverTo(targetHp: number) {
        return this.room.recoverTo(this, targetHp);
    }
    async changeMaxHp(number = 1) {
        return this.room.changeMaxHp(this, number);
    }
    async dying() {
        return this.room.dying(this);
    }
    async die(killer?: Player) {
        return this.room.die(this, killer);
    }

    // ===== canXxx 检测方法 =====

    canLoseHp(number: number = 1): boolean {
        return this.room.canLoseHp(this, number);
    }
    canRecover(number: number = 1): boolean {
        return this.room.canRecover(this, number);
    }
    canChangeMaxHp(number: number = 1): boolean {
        return this.room.canChangeMaxHp(this, number);
    }

    /**
     * 检测 targetPlayer 指定区域的牌中可被当前玩家弃置的数量是否 ≥ count。
     * @param targetPlayer 被检者
     * @param count 需要数量
     * @param pos 区域（h/e/j/u/s，默认 h）
     */
    canDiscard(targetPlayer: Player, count: number = 1, pos: string = 'h'): boolean {
        if (count <= 0) return false;
        // TODO Phase 7: 通过 StateEffectType.Prohibit_DropCards 过滤
        return this._getCardsByPos(targetPlayer, pos).length >= count;
    }

    /**
     * 检测 targetPlayer 指定区域的牌中可被当前玩家获得的数量是否 ≥ count。
     * @param targetPlayer 被检者
     * @param count 需要数量
     * @param pos 区域（h/e/j/u/s，默认 h）
     */
    canObtain(targetPlayer: Player, count: number = 1, pos: string = 'h'): boolean {
        if (count <= 0) return false;
        // TODO Phase 7: 通过 Prohibit_ObtainCards 状态效果过滤
        return this._getCardsByPos(targetPlayer, pos).length >= count;
    }

    // ===== 卡牌移动快捷方法（委托到 Room）=====

    async moveCards(
        cards: GameCard[],
        toArea: AreaId,
        opts?: MoveCardOpts,
    ) {
        return this.room.moveCards(cards, toArea, { ...opts, player: this });
    }

    async putTo(cards: GameCard[], toArea: AreaId, opts?: MoveCardOpts) {
        return this.room.putTo(cards, toArea, { ...opts, player: this });
    }

    async draw(count: number = 1, pos: 'top' | 'bottom' = 'top', opts?: MoveCardOpts) {
        return this.room.draw(this, count, pos, opts);
    }

    async discard(cards: GameCard[], opts?: MoveCardOpts) {
        return this.room.discard(this, cards, opts);
    }

    async obtain(cards: GameCard[], opts?: MoveCardOpts) {
        return this.room.obtain(this, cards, opts);
    }

    async recast(cards: GameCard[], drawOneAlways: boolean = false, opts?: MoveCardOpts) {
        return this.room.recast(this, cards, drawOneAlways, opts);
    }

    async give(toPlayer: Player, cards: GameCard[], opts?: MoveCardOpts) {
        return this.room.give(this, toPlayer, cards, opts);
    }

    async swap(cards1: GameCard[], toArea1: AreaId, cards2: GameCard[], toArea2: AreaId, opts?: MoveCardOpts) {
        return this.room.swap(cards1, toArea1, cards2, toArea2, opts);
    }

    // ===== 状态改变快捷方法 =====

    /** 明置自己的武将 */
    async open(generals: General[]) {
        return this.room.open(this, generals);
    }
    /** 暗置自己的武将 */
    async close(generals: General[]) {
        return this.room.close(this, generals);
    }
    /**
     * 横置/重置自己。
     * @param damageType 横置属性（toState=false 时用于解锁动画），默认 None
     */
    async chain(toState?: boolean, damageType: DamageType = DamageType.None) {
        return this.room.chain(this, toState, damageType);
    }
    /** 翻面 */
    async turnOver(toState?: boolean) {
        return this.room.skip(this, toState);
    }
    /** 变更自己的武将 */
    async change(general: General | 'head' | 'deputy', toGeneral: General) {
        return this.room.change(this, general, toGeneral);
    }
    /** 移除自己的武将 */
    async remove(general: General) {
        return this.room.remove(this, general);
    }

    async judge(
        isSuccess?: (result: VirtualCardData) => boolean,
    ) {
        return this.room.judge(this, isSuccess);
    }

    async showCards(cards: GameCard[]): Promise<void> {
        return this.room.showCards(this, cards);
    }

    async flashCards(cards: GameCard[], opts?: MoveCardOpts) {
        return this.room.flashCards(this, cards, opts);
    }

    async removeToReserve(cards: GameCard[], opts?: MoveCardOpts) {
        return this.room.removeToReserve(cards, opts);
    }

    // ===== 选择快捷方法（委托到 Room）=====

    async chooseCard(
        cards: GameCard[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<GameCard[]> {
        return this.room.chooseCard(this, cards, count, opts);
    }

    async choosePlayer(
        targets: Player[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<Player[]> {
        return this.room.choosePlayer(this, targets, count, opts);
    }

    async chooseGeneral(
        generals: General[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<General[]> {
        return this.room.chooseGeneral(this, generals, count, opts);
    }

    async chooseOption(
        options: string[],
        count: SelectCount = 1,
        opts?: Partial<SelectSession>,
    ): Promise<string[]> {
        return this.room.chooseOption(this, options, count, opts);
    }

    // ===== 内部辅助 =====

    /** 按位置字符获取目标玩家对应区域的牌 */
    private _getCardsByPos(targetPlayer: Player, pos: string): GameCard[] {
        const cards: GameCard[] = [];
        if (pos.includes('h')) cards.push(...targetPlayer.getHandCards());
        if (pos.includes('e')) cards.push(...targetPlayer.getEquipCards());
        if (pos.includes('j')) cards.push(...targetPlayer.getJudgeCards());
        return cards;
    }
}
