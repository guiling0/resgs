import { Room } from '../room/Room';
import { Effect } from '../skill/Effect';
import { EffectContext, SkillTag } from '../skill/SkillTypes';
import { EventProcess } from './EventProcess';
import { EventType, TimingName, UseSkillEventData } from './EventTypes';

/**
 * 技能使用事件。
 *
 * 不使用 eventTriggers/endTriggers 的时序驱动，重写 exec() 编排流程：
 *   1. 排序目标 → 2. 执行 choose → 3. 明置武将 → 4. 记录历史
 *   → 5-11. 动画/战报/标记（TODO 通讯模块）
 *   → 12. cost → 触发 Cost 时机 → 13. effect → 触发 Effect 时机
 */
export class UseSkillEvent extends EventProcess<EventType.UseSkill> {
    constructor(room: Room, data: UseSkillEventData) {
        super(room, EventType.UseSkill, data);
        data.used = data.used ?? false;
    }

    // ===== 便捷访问器 =====

    get effect(): Effect {
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

        const timingData = this.source?.eventData ?? {};
        const skill = this.effect.skill;
        const settings = this.effect._jsonData.settings ?? {};
        const ctx = this.context;
        let costResult: any;

        try {
            // 1. 排序目标
            if (settings.sort !== false && ctx.targets?.length) {
                this.room.player.sortResponse(ctx.targets);
            }

            // 2. 执行 choose（无回调时默认为 true——无需选择即可发动）
            if (this.effect._jsonData.choose) {
                const result = await this.effect._jsonData.choose.call(
                    this.effect, this.room, ctx.from, timingData, ctx,
                );
                if (!result) { await this._finalize(); return this; }
                ctx.choose = result;
            } else {
                ctx.choose = true;
            }

            // 3. 明置武将牌（非 Secret 标签）
            if (skill?.player && !this.effect.hasTag(SkillTag.Secret)) {
                if (skill.sourceGeneral === skill.player.head) {
                    skill.player.head?.turnTo(true);
                }
                if (skill.sourceGeneral === skill.player.deputy) {
                    skill.player.deputy?.turnTo(true);
                }
            }

            // 4. 记录历史
            this.room.event.insertHistory(this);

            // 5-11. 动画/配音/战报/指向线/阵法/化身（TODO 通讯模块完成后补充）

            // 8. 限定技
            if (this.effect.hasTag(SkillTag.Limit) && this.effect.player) {
                this.effect.player.setMark(`@limit:${this.effect.id}`, '@limit-false');
            }

            // 9. 觉醒技
            if (this.effect.hasTag(SkillTag.Awake) && this.effect.player) {
                this.effect.player.setMark(`@awake:${this.effect.id}`, '@awake-false');
            }

            // 13. 执行消耗 → 触发 Cost 时机（无回调时默认 true——旧项目无消耗技模式）
            if (this.effect._jsonData.cost) {
                costResult = await this.effect._jsonData.cost.call(
                    this.effect, this.room, ctx.from, timingData, ctx,
                );
                if (!costResult) { await this._finalize(); return this; }
            } else {
                costResult = true;
            }

            ctx.cost = costResult;
            this.eventData.used = true;

            await this.room.event.trigger(TimingName.Cost, this);

            // 14. 执行效果 → 触发 Effect 时机
            if (this.effect._jsonData.effect) {
                await this.effect._jsonData.effect.call(
                    this.effect, this.room, ctx.from, timingData, ctx,
                );
            }

            await this.room.event.trigger(TimingName.Effect, this);

        } catch (e) {
            console.error('[UseSkillEvent]', e);
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
