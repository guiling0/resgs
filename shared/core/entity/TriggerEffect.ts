import { Effect } from './Effect';
import type { Room } from './Room';
import type { Skill } from './Skill';
import type { Player } from './Player';
import { EffectType, PriorityType } from '../types/SkillTypes';
import type { EffectOptions, EffectData, EffectContext } from '../types/SkillTypes';
import { TimingName } from '../types/EventTypes';
import type { TimingData, TimingTrigger } from '../types/EventTypes';

/**
 * 触发类效果——响应事件时机的效果。
 * 触发配置执行（can_trigger/choose/cost/effect 回调）与发动行为判定在此类。
 */
export class TriggerEffect extends Effect {
    constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions) {
        super(room, data, skill, player, EffectType.Trigger, options);
        // 登记触发效果索引
        room.triggerEffectsById.set(this.id, this);
        // 登记时机与优先级索引（settings.global 进全局组，否则按玩家分组）
        const timing = data.trigger?.trigger as TimingName | undefined;
        if (timing) {
            const priority = data.trigger?.priority ?? PriorityType.General;
            let byPriority = room.triggerEffectsByTiming.get(timing);
            if (!byPriority) {
                byPriority = new Map();
                room.triggerEffectsByTiming.set(timing, byPriority);
            }
            let entry = byPriority.get(priority);
            if (!entry) {
                entry = { global: [], player: new Map() };
                byPriority.set(priority, entry);
            }
            if (data.settings?.global) {
                entry.global.push(this);
            } else if (player) {
                let list = entry.player.get(player.playerId);
                if (!list) {
                    list = [];
                    entry.player.set(player.playerId, list);
                }
                list.push(this);
            }
        }
    }

    /**
     * 解析最大发动次数。number=固定值，function=实时计算，-1=无限制。
     */
    getMaxTimes(player: Player, data: TimingData<TimingTrigger>): number {
        const raw = this.sourceData.trigger?.times;
        if (raw == null) return 1;
        if (typeof raw === 'function') return raw.call(this, this.room, player, data) ?? 1;
        return raw;
    }

    /**
     * 是否可以自动发动（无需询问玩家）。
     * 三个条件缺一不可：forced='mute' + 无 choose 回调 + 来源武将牌已明置（若有）。
     */
    canAutoExecute(): boolean {
        if (this.sourceData.settings?.forced !== 'mute') return false;
        if (this.sourceData.trigger?.choose) return false;
        const sg = this.skill?.sourceGeneral;
        if (sg && !sg.put) return false;
        return true;
    }

    /** 是否为使用/打出/出牌阶段类效果（需要牌相关询问流程） */
    get isViewAsOrPlayPhase(): boolean {
        const t = this.sourceData.trigger?.trigger;
        return (
            t === TimingName.UseCardNeed1 ||
            t === TimingName.UseCardNeed2 ||
            t === TimingName.DropCardNeed1 ||
            t === TimingName.DropCardNeed2 ||
            t === TimingName.PlayPhase
        );
    }

    // ===== 触发配置执行 =====

    /** 时机条件检测（无回调默认通过） */
    canTrigger(player: Player, data: TimingData<TimingTrigger>): boolean {
        const fn = this.sourceData.trigger?.can_trigger;
        if (!fn) return true;
        return fn.call(this, this.room, player, data);
    }

    /** 构建本次发动上下文（无回调返回最小上下文） */
    buildContext(player: Player, data: TimingData<TimingTrigger>): EffectContext {
        const fn = this.sourceData.trigger?.context;
        if (fn) return fn.call(this, this.room, player, data);
        return { from: player };
    }

    /** 是否有发动前选择回调 */
    get hasChoose(): boolean {
        return !!this.sourceData.trigger?.choose;
    }

    /** 执行发动前选择回调 */
    execChoose(player: Player, ctx: EffectContext): Promise<unknown> {
        const result = this.sourceData.trigger!.choose!.call(this, this.room, player, ctx);
        return Promise.resolve(result);
    }

    /** 是否有技能消耗回调 */
    get hasCost(): boolean {
        return !!this.sourceData.trigger?.cost;
    }

    /** 执行技能消耗 */
    execCost(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown> {
        return this.sourceData.trigger!.cost!.call(this, this.room, ctx.from, data, ctx);
    }

    /** 是否有技能效果回调 */
    get hasEffect(): boolean {
        return !!this.sourceData.trigger?.effect;
    }

    /** 执行技能效果 */
    execEffect(data: TimingData<TimingTrigger>, ctx: EffectContext): Promise<unknown> {
        return this.sourceData.trigger!.effect!.call(this, this.room, ctx.from, data, ctx);
    }
}
