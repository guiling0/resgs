import { MapSchema } from '@colyseus/schema';
import { Room } from '../room/Room';
import { MarkState } from '../schema/MarkState';
import { PlayerState } from '../schema/PlayerState';
import { Gender } from '../general/GeneralType';
import { Phase } from './PlayerTypes';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { General } from '../general/General';
import { GameCard } from '../card/GameCard';
import { AreaId, AreaType } from '../card/CardTypes';

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
    }

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
    /** 主将 ID（写入时缓存待房间 generals Map 就绪后改为查表） */
    set headId(value: string) {
        this.state.headId = value;
        this._head = undefined; // TODO: this.room.generals.get(value)
    }
    get headId(): string {
        return this.state.headId;
    }
    /** 副将 ID */
    set deputyId(value: string) {
        this.state.deputyId = value;
        this._deputy = undefined; // TODO: this.room.generals.get(value)
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
}
