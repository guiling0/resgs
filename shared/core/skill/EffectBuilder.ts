import { TimingData, TimingTrigger } from '../event/EventTypes';
import { Player } from '../player/Player';
import { Room } from '../room/Room';
import { SelectorConfig } from '../select/SelectTypes';
import { Effect } from './Effect';
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
} from './SkillTypes';

/** EffectBuilder 实例接口 */
export interface EffectBuilder<T extends TimingTrigger = never> {
    readonly name: string;
    data: Record<string, any>;
    mark?: string | string[];
    tag: SkillTag[];
    priority: PriorityType;

    condition(fn: (this: Effect, room: Room, ctx?: EffectContext) => any): this;
    times(
        n:
            | number
            | ((this: Effect, room: Room, player: Player, data: any) => number),
    ): this;
    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U>;
    can_trigger(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => any,
    ): this;
    context(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
        ) => EffectContext,
    ): this;
    choose(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    cost(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    effect(
        fn: (
            this: Effect,
            room: Room,
            player: Player,
            data: TimingData<T>,
            ctx: EffectContext,
        ) => any,
    ): this;
    select(name: string, ...configs: SelectorConfig[]): this;
    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this;
    refresh<U extends TimingTrigger>(data: TimingCallback<U, Effect>): this;
    settings(config: Partial<EffectSettings>): this;
    register(skillName: string): EffectData;

    // 状态类效果便捷方法
    distanceCorrect(
        fn: StateCallbackMap[StateEffectType.Distance_Correct],
    ): this;
    distanceFixed(fn: StateCallbackMap[StateEffectType.Distance_Fixed]): this;
    notCalcSeat(fn: StateCallbackMap[StateEffectType.NotCalcSeat]): this;
    notCalcDistance(
        fn: StateCallbackMap[StateEffectType.NotCalcDistance],
    ): this;
    maxHandInitial(fn: StateCallbackMap[StateEffectType.MaxHand_Initial]): this;
    maxHandCorrect(fn: StateCallbackMap[StateEffectType.MaxHand_Correct]): this;
    maxHandFixed(fn: StateCallbackMap[StateEffectType.MaxHand_Fixed]): this;
    maxHandExclude(fn: StateCallbackMap[StateEffectType.MaxHand_Exclude]): this;
    prohibitOpen(fn: StateCallbackMap[StateEffectType.Prohibit_Open]): this;
    prohibitClose(fn: StateCallbackMap[StateEffectType.Prohibit_Close]): this;
    prohibitDiscards(
        fn: StateCallbackMap[StateEffectType.Prohibit_Discards],
    ): this;
    prohibitObtainCards(
        fn: StateCallbackMap[StateEffectType.Prohibit_ObtainCards],
    ): this;
    prohibitRecoverHp(
        fn: StateCallbackMap[StateEffectType.Prohibit_RecoverHp],
    ): this;
    prohibitLoseHp(fn: StateCallbackMap[StateEffectType.Prohibit_LoseHp]): this;
    prohibitUseCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_UseCard],
    ): this;
    prohibitDropCard(
        fn: StateCallbackMap[StateEffectType.Prohibit_DropCard],
    ): this;
    prohibitPindian(
        fn: StateCallbackMap[StateEffectType.Prohibit_Pindian],
    ): this;
    rangeInitial(fn: StateCallbackMap[StateEffectType.Range_Initial]): this;
    rangeCorrect(fn: StateCallbackMap[StateEffectType.Range_Correct]): this;
    rangeFixed(fn: StateCallbackMap[StateEffectType.Range_Fixed]): this;
    rangeWithin(fn: StateCallbackMap[StateEffectType.Range_Within]): this;
    rangeWithout(fn: StateCallbackMap[StateEffectType.Range_Without]): this;
    regardCardData(fn: StateCallbackMap[StateEffectType.Regard_CardData]): this;
    regardOnlyBig(fn: StateCallbackMap[StateEffectType.Regard_OnlyBig]): this;
    regardOnlyBigFixed(
        fn: StateCallbackMap[StateEffectType.Regard_OnlyBig_Fixed],
    ): this;
    regardKindom(fn: StateCallbackMap[StateEffectType.Regard_Kingdom]): this;
    targetModPassTimeCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassTimeCheck],
    ): this;
    targetModPassCountingTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassCountingTime],
    ): this;
    targetModCorrectTime(
        fn: StateCallbackMap[StateEffectType.TargetMod_CorrectTime],
    ): this;
    targetModPassDistanceCheck(
        fn: StateCallbackMap[StateEffectType.TargetMod_PassDistanceCheck],
    ): this;
    targetModCardLimitChooseCount(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_ChooseCount],
    ): this;
    targetModCardLimitDistance(
        fn: StateCallbackMap[StateEffectType.TargetMod_CardLimit_Distance],
    ): this;
    skillInvalidity(
        fn: StateCallbackMap[StateEffectType.Skill_Invalidity],
    ): this;
    likeHandToUse(fn: StateCallbackMap[StateEffectType.LikeHandToUse]): this;
    likeHandToDrop(fn: StateCallbackMap[StateEffectType.LikeHandToDrop]): this;
    ignoreHeadAndDeputy(
        fn: StateCallbackMap[StateEffectType.IgnoreHeadAndDeputy],
    ): this;
    fieldCardEyes(fn: StateCallbackMap[StateEffectType.FieldCardEyes]): this;
    regardArrayCondition(
        fn: StateCallbackMap[StateEffectType.Regard_ArrayCondition],
    ): this;
    regardPindianResult(
        fn: StateCallbackMap[StateEffectType.Regard_PindianResult],
    ): this;
}

/** EffectBuilder 工厂——无需 new */
export function EffectBuilder<T extends TimingTrigger = never>(
    name: string,
): EffectBuilder<T> {
    return new _EffectBuilder<T>(name);
}

class _EffectBuilder<
    T extends TimingTrigger = never,
> implements EffectBuilder<T> {
    readonly name: string;
    data: Record<string, any> = {};
    mark?: string | string[];
    tag: SkillTag[] = [];
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

    private _times?:
        | number
        | ((this: Effect, room: Room, player: Player, data: any) => number);
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

    private _stateCallbacks: Partial<StateCallbackMap> = {};

    constructor(name: string) {
        this.name = name;
    }

    condition(
        fn: (this: Effect, room: Room, ctx?: EffectContext) => any,
    ): this {
        this._condition = fn;
        return this;
    }

    times(
        n:
            | number
            | ((this: Effect, room: Room, player: Player, data: any) => number),
    ): this {
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

    register(skillName: string): EffectData {
        const fullName = `${skillName}.${this.name}`;
        const isTrigger = !!(
            this._trigger ||
            this._can_trigger ||
            this._context ||
            this._choose ||
            this._cost ||
            this._effect
        );
        const isState = Object.keys(this._stateCallbacks).length > 0;

        if (isTrigger && isState) {
            throw new Error(
                `Effect "${fullName}": cannot be both trigger and state. ` +
                    `Split into two separate effects.`,
            );
        }

        const data: EffectData = {
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
        if (sgs.effects.has(fullName)) {
            console.warn(
                `[EffectBuilder] 效果 "${fullName}" 已存在——跳过重复注册`,
            );
            return sgs.effects.get(fullName)!;
        }
        sgs.effects.set(fullName, data);
        return data;
    }

    // ===== 状态类效果便捷方法 =====

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
