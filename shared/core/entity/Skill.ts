import { Mark } from './Mark';
import type { Room } from './Room';
import type { Player } from './Player';
import { General } from './General';
import { Effect } from './Effect';
import { sync, syncArray } from '../state/decorators';
import { StateArray } from '../state/StateArray';
import { CardSubType } from '../types/CardTypes';
import { sgs } from '../sgs';
import type { SkillOptions, SkillData } from '../types/SkillTypes';

/**
 * 技能——继承 Mark 具备标记能力。
 * 同步字段仅运行时变化项（preshow/showui/invalids）；固定数据经创建消息传递。
 * @rules terms/card-face-terms/skill
 * @description 技能类——角色拥有的技能包括其武将技能和装备技能
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
    /** 是否来源于装备（装备技能为 true） */
    fromEquip: boolean = false;
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
        // 来源推断（武将/效果）
        const source = options.source;
        if (source instanceof General) this.sourceGeneral = source;
        else if (source instanceof Effect) this.sourceEffect = source;
        this.fromEquip = options.fromEquip ?? false;
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

    /** 附加装备牌名（attached_equip，装备技能所属的装备牌） */
    get attachedEquip(): string | undefined {
        return this.sourceData.attached_equip;
    }

    /** 是否为指定副类别装备的技能（如防具技能：isEquipSkill(CardSubType.Armor)） */
    isEquipSkill(subtype: CardSubType): boolean {
        const name = this.attachedEquip;
        if (!name) return false;
        return sgs.carddatas.get(name)?.subtype === subtype;
    }

    /**
     * 是否失效
     * @rules terms/resolution-terms/invalid
     * @description A的技能于一个时间段内无效，即所有角色于此时间段内不能发动A的技能且A的技能于此时间段内不能产生影响
     */
    get isInvalid(): boolean {
        return this.invalids.length > 0;
    }

    /** 所属武将牌是否明置（明置状态数据未就绪，默认明置） */
    isOpen(): boolean {
        return true;
    }

    /** 技能是否可用：未被禁用、未被无视且来源正常 */
    check(): boolean {
        return !this.isInvalid && this.isOpen() && !this._isIgnored();
    }

    /** 是否被无视：存在命中 filter 的无视记录且当前结算由无视者发起 */
    private _isIgnored(): boolean {
        if (!this.player) return false;
        for (const r of this.room.ignoreRecords) {
            if (r.target !== this.player) continue;
            if (r.filter && !r.filter(this)) continue;
            if (this._isInScope(r.source)) return true;
        }
        return false;
    }

    /** 当前结算是否由 source 发起：从事件栈顶向下找最近有发起者的事件 */
    private _isInScope(source: Player): boolean {
        for (let i = this.room.eventStack.length - 1; i >= 0; i--) {
            const owner = (this.room.eventStack[i] as { player?: Player | undefined }).player;
            if (owner) return owner === source;
        }
        return false;
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

    /**
     * 移除自身（含关联效果）
     * @description 从房间技能索引注销并解除所属玩家
     */
    async removeSelf(_removeSkill: boolean = false): Promise<void> {
        // TODO(R3): refreshs 注销与关联效果清理由技能管理器（SkillManager）实现
        this.room.skills.delete(this.id);
        this.room.skillsByName.get(this.name)?.delete(this);
        this.player = undefined;
    }
}
