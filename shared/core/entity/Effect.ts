import { Mark } from './Mark';
import type { Room } from './Room';
import type { Skill } from './Skill';
import type { Player } from './Player';
import { EffectType, SkillTag } from '../types/SkillTypes';
import type { EffectOptions, EffectData } from '../types/SkillTypes';

/**
 * 效果——继承 Mark 具备标记能力，按类别派生 TriggerEffect/StateEffect。
 * 固定数据（id/name/来源引用）经创建消息传递，无运行时同步字段。
 * @rules terms/card-face-terms/skill
 * @description 效果类——技能能力的运行时载体
 */
export abstract class Effect extends Mark {
    readonly room: Room;
    /** 效果自增 id（房间内唯一） */
    id: number = 0;
    /** 效果名 */
    name: string = '';
    /** 所属技能 */
    skill?: Skill;
    /** 所属玩家 */
    player?: Player;
    /** 效果类别（触发/状态） */
    type: EffectType = EffectType.Trigger;
    /** 自定义数据（运行时选项注入） */
    data: Record<string, unknown> = {};
    /** 源数据（注册构建的效果定义，外部可读；触发/状态配置经此获取） */
    readonly sourceData: EffectData;

    constructor(
        room: Room,
        data: EffectData,
        skill?: Skill,
        player?: Player,
        type: EffectType = EffectType.Trigger,
        options: EffectOptions = {},
    ) {
        super();
        this.room = room;
        const name = data.name;
        this.name = name;
        this.sourceData = { ...data };
        this.data = { ...options.data };
        this.id = ++room.effectIds;
        this.skill = skill;
        this.player = player;
        this.type = type;
        // TODO(R3): refreshs 注册由技能管理器（SkillManager）在宿主注入后执行
        // 登记效果索引与同名集合（两端创建一致，纯内存索引）
        room.effects.set(this.id, this);
        let byName = room.effectsByName.get(name);
        if (!byName) {
            byName = new Set();
            room.effectsByName.set(name, byName);
        }
        byName.add(this);
        this.room.logger.debug('创建效果', { roomId: room.roomId, effect: name });
    }

    /** 是否为触发类效果 */
    get hasTrigger(): boolean {
        return this.type === EffectType.Trigger;
    }

    /** 是否为状态类效果 */
    get hasState(): boolean {
        return this.type === EffectType.State;
    }

    // ===== 行为判定 =====

    /**
     * 是否失效（仅效果自身失效状态；源技能失效由所属技能判定）
     * @rules terms/resolution-terms/invalid
     * @description 技能/效果无效，即所有角色于此时间段内不能发动且不能产生影响
     */
    get isInvalid(): boolean {
        // TODO(R3): 效果自身 invalids 独立失效状态实现（暂始终有效）
        return false;
    }

    /** 是否拥有指定技能标签（未传时判断是否有任意标签） */
    hasSkillTag(tag?: SkillTag): boolean {
        const tags = this.sourceData.tag;
        if (!tags || tags.length === 0) return false;
        return tag === undefined ? true : tags.includes(tag);
    }

    /** 是否锁定技效果 */
    get isLock(): boolean {
        return this.hasSkillTag(SkillTag.Lock) || this.isAwake;
    }

    /** 是否限定技效果 */
    get isLimit(): boolean {
        return this.hasSkillTag(SkillTag.Limit);
    }

    /** 是否觉醒技效果 */
    get isAwake(): boolean {
        return this.hasSkillTag(SkillTag.Awake);
    }

    /** 是否主公技效果 */
    get isLord(): boolean {
        return this.hasSkillTag(SkillTag.Lord);
    }

    /** 是否阵法技效果 */
    get isArray(): boolean {
        return this.hasSkillTag(SkillTag.Array);
    }

    /** 所属武将牌是否明置（武将牌数据未就绪时默认明置） */
    isOpen(): boolean {
        return this.skill?.isOpen() ?? true;
    }

    /**
     * 效果是否可用（通用检测）：自身失效、源技能失效、标签固定检测。
     * 触发时机条件检测见 TriggerEffect.canTrigger。
     */
    check(): boolean {
        if (this.isInvalid) return false;
        if (this.skill && !this.skill.check()) return false;
        if (this.isLimit || this.isAwake) {
            const count = this.player?.getMark<number>(this.name) ?? 0;
            if (count > 0) return false;
        }
        // TODO(R5/R8): head/deputy 标签检查（玩家主副将数据就绪后启用）
        return true;
    }

    /** 移除自身（含关联技能）——TODO(R3): 技能管理器（SkillManager）实现后接线 */
    async removeSelf(_removeSkill: boolean = false): Promise<void> {
        // TODO(R3): 经 room 技能管理器注销索引与 refreshs
    }
}
