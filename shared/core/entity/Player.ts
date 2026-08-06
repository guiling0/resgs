import type { Room } from './Room';
import type { GameCard } from './GameCard';
import { Mark } from './Mark';
import { sync, syncArray } from '../state/decorators';
import { StateArray } from '../state/StateArray';
import { AreaType } from '../types/AreaTypes';
import type { AreaId } from '../types/AreaTypes';
import { Gender } from '../types/GeneralTypes';
import { Phase } from '../types/PlayerTypes';

/** 玩家实体 */
export class Player extends Mark {
    readonly room: Room;
    /** 玩家 id（path 段用，不同步） */
    playerId: string;

    @sync() username: string = '';
    @sync() seat: number = 0;
    @sync() hp: number = 4;
    @sync() maxhp: number = 4;
    /** 身份 */
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
    /** 连环状态（横置/重置） */
    @sync() chained: boolean = false;
    /** 翻面状态（跳过下个回合） */
    @sync() skip: boolean = false;
    /** 护盾值（扣减体力时优先吸收） */
    @sync() shield: number = 0;
    /** 休整回合数（>0 表示正在休整） */
    @sync() rest: number = 0;

    /** 手牌（元素仅简单类型：牌 id） */
    @syncArray() hand: StateArray<string> = new StateArray();

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

    /** 安全体力（最小为 0） */
    get inthp(): number {
        return Math.max(0, this.hp);
    }

    /** 已损失体力 */
    get losshp(): number {
        return this.maxhp - this.inthp;
    }

    /** 手牌上限（基础值 = 体力上限） */
    get handMax(): number {
        return this.maxhp;
    }

    /** 攻击范围（基础值 1） */
    get attackRange(): number {
        return 1;
    }

    /** 与目标的座次环形距离 */
    distanceTo(target: Player): number {
        const n = this.room.players.size;
        if (n <= 1) return 1;
        const diff = Math.abs(this.seat - target.seat);
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
}
