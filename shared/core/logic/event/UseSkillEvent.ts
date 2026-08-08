import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { Effect } from '../../entity/Effect';
import type { TriggerEffect } from '../../entity/TriggerEffect';
import { EventProcess } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type { TimingData, TimingTrigger, UseSkillEventData } from '../../types/EventTypes';
import type { EffectContext } from '../../types/SkillTypes';
import { SkillTag } from '../../types/SkillTypes';

/**
 * 技能使用事件
 * @rules events/use-skill
 * @description 技能发动流程编排（不使用时序驱动，重写 exec()）：排序目标 → choose → 明置武将 → 历史 → limit/awake 标记 → cost → Cost 时机 → effect → Effect 时机
 */
export class UseSkillEvent extends EventProcess<EventType.UseSkill> {
    constructor(room: Room, data: UseSkillEventData) {
        super(room, EventType.UseSkill, data);
        data.used = data.used ?? false;
    }

    // ===== 便捷访问器 =====

    get effect(): TriggerEffect {
        return this.eventData.effect!;
    }

    get context(): EffectContext {
        return this.eventData.context!;
    }

    get used(): boolean {
        return this.eventData.used ?? false;
    }

    // ===== _currentEffect 嵌套栈 =====

    private _prevEffect?: Effect;

    protected async init(): Promise<void> {
        await super.init();
        this.context.event = this.source;
        this._prevEffect = this.room.event._currentEffect;
        this.room.event._currentEffect = this.effect;
    }

    // ===== 主流程 =====

    async exec(): Promise<this> {
        await this.init();

        const timingData = (this.source?.eventData ?? {}) as TimingData<TimingTrigger>;
        const skill = this.effect.skill;
        const settings = this.effect.sourceData.settings ?? {};
        const ctx = this.context;

        try {
            // 1. 排序目标（按响应顺序）
            const targets = ctx.targets as Player[] | undefined;
            if (settings.sort !== false && targets?.length) {
                this.room.sortResponse(targets);
            }

            // 2. 执行 choose（无回调时默认为 true——无需选择即可发动）
            if (this.effect.hasChoose) {
                const result = await this.effect.execChoose(ctx.from, ctx);
                if (!result) {
                    await this._finalize();
                    return this;
                }
                ctx.choose = result;
            } else {
                ctx.choose = true;
            }

            // 3. 明置来源武将牌（非奥秘技）
            if (skill?.player && !this.effect.hasSkillTag(SkillTag.Secret)) {
                // TODO(R5/R8): 按主副将位置明置（player.head/deputy 数据就绪后细化）
                if (skill.sourceGeneral) {
                    skill.sourceGeneral.turnTo(true);
                }
            }

            // 4. 记录历史
            this.room.event.insertHistory(this);

            // TODO(R9): 发动动画/配音/战报/指向线/阵法广播

            // 5. 限定技 / 觉醒技标记（发动后不可再次发动）
            if (this.effect.isLimit && this.effect.player) {
                this.effect.player.setMark(`${this.effect.name}@limit`, 1);
            }
            if (this.effect.isAwake && this.effect.player) {
                this.effect.player.setMark(`${this.effect.name}@awake`, 1);
            }

            // 6. 执行消耗 → 触发 Cost 时机（无回调时默认为 true）
            if (this.effect.hasCost) {
                const costResult = await this.effect.execCost(timingData, ctx);
                if (!costResult) {
                    await this._finalize();
                    return this;
                }
                ctx.cost = costResult;
            } else {
                ctx.cost = true;
            }

            this.eventData.used = true;
            await this.room.event.trigger(TimingName.Cost, this);

            // 7. 执行效果 → 触发 Effect 时机
            if (this.effect.hasEffect) {
                await this.effect.execEffect(timingData, ctx);
            }
            await this.room.event.trigger(TimingName.Effect, this);
        } catch (e) {
            this.room.logger.error(
                `[UseSkillEvent] ${(e as Error)?.message ?? e}`,
                { roomId: this.room.roomId, playerId: this.effect.player?.playerId, event: `UseSkill:${this.id}` },
            );
        } finally {
            await this._finalize();
        }

        return this;
    }

    private async _finalize(): Promise<void> {
        this.isEnd = true;
        this.isComplete = true;
        this.room.event._currentEffect = this._prevEffect;
        await this.processCompleted();
    }
}
