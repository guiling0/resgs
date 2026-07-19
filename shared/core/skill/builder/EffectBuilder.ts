import { TimingData, TimingTrigger } from '../../event/EventTypes';
import { Player } from '../../player/Player';
import { Room } from '../../room/Room';
import { SelectorConfig } from '../../select/SelectTypes';
import { Effect } from '../Effect';
import {
    EffectContext,
    EffectData,
    EffectSelectors,
    EffectSettings,
    PriorityType,
    SkillTag,
    StateCallbackMap,
    StateEffectType,
    TimingCallback,
} from '../SkillTypes';

export class EffectBuilder<T extends TimingTrigger = never> {
    /** 自定义数据 */
    data: Record<string, any> = {};
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[] = [];

    private _name: string;
    /** 效果设置 */
    private _settings: EffectSettings = {
        forced: 'mute',
        audios: 'extends',
        temp: false,
        ani: 'text',
        log: true,
        toast: true,
        sort: true,
        directline: 1,
        limitAni: true,
        awakeAni: true,
        viewas: true,
        global: false,
    };
    private _selectors: EffectSelectors = {};
    private _condition?: (this: Effect, room: Room, ctx?: EffectContext) => any;
    private _refreshs: Array<TimingCallback<any, Effect>> = [];

    //==================触发技相关==================
    /** 最大发动次数（number=固定值，函数=实时计算，-1=无限制，默认1） */
    private _times?: number | ((this: Effect, room: Room, player: Player, data: any) => number);
    /** 效果优先级 */
    priority: PriorityType = PriorityType.General;
    private _trigger?: T;
    private _can_trigger?: (
        this: Effect,
        room: Room,
        player: Player,
        data: TimingData<T>,
    ) => any;
    private _context?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
    ) => EffectContext;
    private _choose?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ) => any;
    private _cost?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ) => any;
    private _effect?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ) => any;

    //==================状态技相关==================
    private _stateCallbacks: Partial<StateCallbackMap> = {};

    constructor(name: string) {
        this._name = name;
    }

    condition(
        fn: (this: Effect, room: Room, ctx?: EffectContext) => any,
    ): this {
        this._condition = fn;
        return this;
    }

    times(n: number | ((this: Effect, room: Room, player: Player, data: any) => number)): this {
        this._times = n;
        return this;
    }

    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U> {
        this._trigger = trigger as any;
        return this as any;
    }

    can_trigger(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => any,
    ): this {
        this._can_trigger = fn;
        return this;
    }

    context(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => EffectContext,
    ): this {
        this._context = fn;
        return this;
    }

    choose(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this {
        this._choose = fn;
        return this;
    }

    cost(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this {
        this._cost = fn;
        return this;
    }

    effect(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this {
        this._effect = fn;
        return this;
    }

    select(name: string, ...configs: SelectorConfig[]): this {
        this._selectors[name] = configs;
        return this;
    }

    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this {
        this._stateCallbacks[type] = fn;
        return this;
    }

    refresh<U extends TimingTrigger>(data: TimingCallback<U, Effect>): this {
        this._refreshs.push(data);
        return this;
    }

    settings(config: Partial<EffectSettings>): this {
        Object.assign(this._settings, config);
        return this;
    }

    build(skillName: string): EffectData {
        const fullName = `${skillName}.${this._name}`;
        const isTrigger = !!(
            this._trigger ||
            this._can_trigger ||
            this._context ||
            this._choose ||
            this._cost ||
            this._effect
        );
        const isState = Object.keys(this._stateCallbacks).length > 0;

        // ===== 互斥校验：触发类与状态类不可共存 =====
        if (isTrigger && isState) {
            throw new Error(
                `Effect "${fullName}": cannot be both trigger and state. ` +
                `Trigger is set by: on/can_trigger/context/choose/cost/effect. ` +
                `State is set by: state()/distanceCorrect()/maxHandCorrect()/etc. ` +
                `Split into two separate effects.`,
            );
        }

        return {
            has_trigger: isTrigger,
            has_state: isState,
            name: fullName,
            mark: this.mark,
            tag: this.tag,
            settings: { ...this._settings },
            selectors: this._selectors,
            data: this.data,
            condition: this._condition ?? (() => undefined),
            refreshs: this._refreshs,

            priority: this.priority,
            times: this._times ?? 1,
            trigger: this._trigger,
            can_trigger: this._can_trigger,
            context: this._context,
            choose: this._choose,
            cost: this._cost,
            effect: this._effect,
            stateCallbacks: this._stateCallbacks,
        };
    }

    //==================状态技相关==================
    distanceCorrect(
        fn: StateCallbackMap[StateEffectType.Distance_Correct],
    ): this {
        return this.state(StateEffectType.Distance_Correct, fn);
    }

    distanceFixed(fn: StateCallbackMap[StateEffectType.Distance_Fixed]): this {
        return this.state(StateEffectType.Distance_Fixed, fn);
    }

    notCalcSeat(fn: StateCallbackMap[StateEffectType.NotCalcSeat]): this {
        return this.state(StateEffectType.NotCalcSeat, fn);
    }

    notCalcDistance(
        fn: StateCallbackMap[StateEffectType.NotCalcDistance],
    ): this {
        return this.state(StateEffectType.NotCalcDistance, fn);
    }

    maxHandInitial(
        fn: StateCallbackMap[StateEffectType.MaxHand_Initial],
    ): this {
        return this.state(StateEffectType.MaxHand_Initial, fn);
    }

    maxHandCorrect(
        fn: StateCallbackMap[StateEffectType.MaxHand_Correct],
    ): this {
        return this.state(StateEffectType.MaxHand_Correct, fn);
    }

    maxHandFixed(fn: StateCallbackMap[StateEffectType.MaxHand_Fixed]): this {
        return this.state(StateEffectType.MaxHand_Fixed, fn);
    }

    maxHandExclude(
        fn: StateCallbackMap[StateEffectType.MaxHand_Exclude],
    ): this {
        return this.state(StateEffectType.MaxHand_Exclude, fn);
    }

    prohibitOpen(fn: StateCallbackMap[StateEffectType.Prohibit_Open]): this {
        return this.state(StateEffectType.Prohibit_Open, fn);
    }

    prohibitClose(fn: StateCallbackMap[StateEffectType.Prohibit_Close]): this {
        return this.state(StateEffectType.Prohibit_Close, fn);
    }

    prohibitDiscards(
        fn: StateCallbackMap[StateEffectType.Prohibit_Discards],
    ): this {
        return this.state(StateEffectType.Prohibit_Discards, fn);
    }

    prohibitObtainCards(
        fn: StateCallbackMap[StateEffectType.Prohibit_ObtainCards],
    ): this {
        return this.state(StateEffectType.Prohibit_ObtainCards, fn);
    }

    prohibitRecoverHp(
        fn: StateCallbackMap[StateEffectType.Prohibit_RecoverHp],
    ): this {
        return this.state(StateEffectType.Prohibit_RecoverHp, fn);
    }

    prohibitLoseHp(
        fn: StateCallbackMap[StateEffectType.Prohibit_LoseHp],
    ): this {
        return this.state(StateEffectType.Prohibit_LoseHp, fn);
    }

    prohibitUseCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_UseCard],
    ): this {
        return this.state(StateEffectType.Prohibit_UseCard, fn);
    }

    prohibitDropCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_DropCard],
    ): this {
        return this.state(StateEffectType.Prohibit_DropCard, fn);
    }

    prohibitPindian(
        fn: StateCallbackMap[StateEffectType.Prohibit_Pindian],
    ): this {
        return this.state(StateEffectType.Prohibit_Pindian, fn);
    }

    rangeInitial(fn: StateCallbackMap[StateEffectType.Range_Initial]): this {
        return this.state(StateEffectType.Range_Initial, fn);
    }

    rangeCorrect(fn: StateCallbackMap[StateEffectType.Range_Correct]): this {
        return this.state(StateEffectType.Range_Correct, fn);
    }

    rangeFixed(fn: StateCallbackMap[StateEffectType.Range_Fixed]): this {
        return this.state(StateEffectType.Range_Fixed, fn);
    }

    rangeWithin(fn: StateCallbackMap[StateEffectType.Range_Within]): this {
        return this.state(StateEffectType.Range_Within, fn);
    }

    rangeWithout(fn: StateCallbackMap[StateEffectType.Range_Without]): this {
        return this.state(StateEffectType.Range_Without, fn);
    }

    regardCardData(
        fn: StateCallbackMap[StateEffectType.Regard_CardData],
    ): this {
        return this.state(StateEffectType.Regard_CardData, fn);
    }

    regardOnlyBig(fn: StateCallbackMap[StateEffectType.Regard_OnlyBig]): this {
        return this.state(StateEffectType.Regard_OnlyBig, fn);
    }

    regardOnlyBigFixed(
        fn: StateCallbackMap[StateEffectType.Regard_OnlyBig_Fixed],
    ): this {
        return this.state(StateEffectType.Regard_OnlyBig_Fixed, fn);
    }

    regardKindom(fn: StateCallbackMap[StateEffectType.Regard_Kingdom]): this {
        return this.state(StateEffectType.Regard_Kingdom, fn);
    }

    targetModPassTimeCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassTimeCheck],
    ): this {
        return this.state(StateEffectType.TargetMod_PassTimeCheck, fn);
    }

    targetModPassCountingTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassCountingTime],
    ): this {
        return this.state(StateEffectType.TargetMod_PassCountingTime, fn);
    }

    targetModCorrectTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_CorrectTime],
    ): this {
        return this.state(StateEffectType.TargetMod_CorrectTime, fn);
    }

    targetModPassDistanceCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassDistanceCheck],
    ): this {
        return this.state(StateEffectType.TargetMod_PassDistanceCheck, fn);
    }

    targetModCardLimitChooseCount(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_ChooseCount],
    ): this {
        return this.state(StateEffectType.TargetMod_CardLimit_ChooseCount, fn);
    }

    targetModCardLimitDistance(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_Distance],
    ): this {
        return this.state(StateEffectType.TargetMod_CardLimit_Distance, fn);
    }

    skillInvalidity(
        fn: StateCallbackMap[StateEffectType.Skill_Invalidity],
    ): this {
        return this.state(StateEffectType.Skill_Invalidity, fn);
    }

    likeHandToUse(fn: StateCallbackMap[StateEffectType.LikeHandToUse]): this {
        return this.state(StateEffectType.LikeHandToUse, fn);
    }

    likeHandToDrop(fn: StateCallbackMap[StateEffectType.LikeHandToDrop]): this {
        return this.state(StateEffectType.LikeHandToDrop, fn);
    }

    ignoreHeadAndDeputy(
        fn: StateCallbackMap[StateEffectType.IgnoreHeadAndDeputy],
    ): this {
        return this.state(StateEffectType.IgnoreHeadAndDeputy, fn);
    }

    fieldCardEyes(fn: StateCallbackMap[StateEffectType.FieldCardEyes]): this {
        return this.state(StateEffectType.FieldCardEyes, fn);
    }

    regardArrayCondition(
        fn: StateCallbackMap[StateEffectType.Regard_ArrayCondition],
    ): this {
        return this.state(StateEffectType.Regard_ArrayCondition, fn);
    }

    regardPindianResult(
        fn: StateCallbackMap[StateEffectType.Regard_PindianResult],
    ): this {
        return this.state(StateEffectType.Regard_PindianResult, fn);
    }
}
