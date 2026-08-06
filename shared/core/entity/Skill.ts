import { Mark } from './Mark';
import type { Room } from './Room';
import type { Player } from './Player';
import { General } from './General';
import { GameCard } from './GameCard';
import { Effect } from './Effect';
import { sync, syncArray } from '../state/decorators';
import { StateArray } from '../state/StateArray';
import type { SkillOptions, SkillData } from '../types/SkillTypes';

/**
 * 技能——继承 Mark 具备标记能力。
 * 同步字段仅运行时变化项（preshow/showui/invalids）；固定数据经创建消息传递。
 */
export class Skill extends Mark {
    readonly room: Room;
    /** 技能自增 id（房间内唯一） */
    id: number = 0;
    /** 技能全名 */
    name: string = '';
    /** 所属玩家 */
    player?: Player;
    /** 来源武将（装备技能为空） */
    sourceGeneral?: General;
    /** 来源装备牌（武将技能为空） */
    sourceEquip?: GameCard;
    /** 来源效果（化身等技能派生） */
    sourceEffect?: Effect;
    /** 失效原因列表（非空即失效） */
    @syncArray() invalids: StateArray<string> = new StateArray();
    /** 是否可预览 */
    @sync() preshow: boolean = false;
    /** 按钮显示方式 */
    @sync() showui: string = 'none';
    /** 自定义数据（运行时选项注入） */
    data: Record<string, unknown> = {};
    /** 源数据（注册构建的技能定义，外部可读；触发配置/回调经此获取） */
    readonly sourceData: SkillData;

    constructor(
        room: Room,
        data: SkillData,
        player?: Player,
        options: SkillOptions = {},
    ) {
        super();
        this.room = room;
        const name = data.name;
        this.name = name;
        this.sourceData = { ...data };
        this.data = { ...options.data };
        this.id = ++room.skillIds;
        this.player = player;
        // 来源推断（武将/装备/效果）
        const source = options.source;
        if (source instanceof General) this.sourceGeneral = source;
        else if (source instanceof GameCard) this.sourceEquip = source;
        else if (source instanceof Effect) this.sourceEffect = source;
        this.showui = options.showui ?? 'none';
        // TODO(R3): refreshs 注册由技能管理器（SkillManager）在宿主注入后执行
        // 登记技能索引与同名集合（两端创建一致，纯内存索引）
        room.skills.set(this.id, this);
        let byName = room.skillsByName.get(name);
        if (!byName) {
            byName = new Set();
            room.skillsByName.set(name, byName);
        }
        byName.add(this);
        this.room.logger.debug('创建技能', { roomId: room.roomId, skill: name });
    }

    /** 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） */
    get trueName(): string {
        return this.name.split('.').at(-1) || this.name;
    }

    /** 是否失效 */
    get isInvalid(): boolean {
        return this.invalids.length > 0;
    }

    /** 所属武将牌是否明置（明置状态数据未就绪，默认明置） */
    isOpen(): boolean {
        return true;
    }

    /** 技能是否可用：未被禁用且来源正常 */
    check(): boolean {
        return !this.isInvalid && this.isOpen();
    }

    /** 设置失效（同一原因不重复添加） */
    setInvalids(reason: string, state: boolean = true): void {
        if (state) {
            if (!this.invalids.toArray().includes(reason)) {
                this.invalids.push(reason);
            }
        } else {
            const idx = this.invalids.toArray().indexOf(reason);
            if (idx !== -1) {
                this.invalids.remove(idx);
            }
        }
    }

    /** 移除自身（含关联效果）——TODO(R3): 技能管理器（SkillManager）实现后接线 */
    async removeSelf(_removeSkill: boolean = false): Promise<void> {
        // TODO(R3): 经 room 技能管理器注销索引与 refreshs
    }
}
