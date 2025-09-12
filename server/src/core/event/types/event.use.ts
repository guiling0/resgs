import {
    CardPut,
    CardSubType,
    CardType,
    VirtualCardData,
} from '../../card/card.types';
import { CardUseSkillData } from '../../card/card.use';
import { VirtualCard } from '../../card/vcard';
import { RequestOptionData } from '../../choose/choose.types';
import { ChoosePlayerData } from '../../choose/types/choose.player';
import { CustomString } from '../../custom/custom.type';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { MoveCardReason } from '../../room/room.types';
import { TriggerEffect } from '../../skill/effect';
import { Skill } from '../../skill/skill';
import { TriggerEffectContext } from '../../skill/skill.types';
import { EventData } from '../data';
import { EventProcess } from '../event';
import { Triggers, EventTriggers } from '../triggers';
import { DyingEvent } from './event.die';
import { PlayCardEvent } from './event.play';

export type UseEvent = UseCardEvent | UseCardToCardEvent;

export type TargetListItem = {
    index: number;
    target: GamePlayer;
    generator: Triggers;
    invalid: boolean;
    offset: UseEvent | PlayCardEvent;
    subTargets: GamePlayer[];
    wushuang: GamePlayer[];
    effectTimes: number;
};

export type TargetCardListItem = {
    index: number;
    target: VirtualCard;
    invalid: boolean;
    offset: UseEvent | PlayCardEvent;
};

export class NeedUseCardData extends EventData {
    /** 使用者 */
    from: GamePlayer;
    /** 需要使用的牌及方法 */
    cards: {
        name: string;
        method?: number;
    }[];
    /** 目标的选择标准 详见牌的预使用事件*/
    targetSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 发起的使用牌询问的设置 详见牌的预使用事件 */
    reqOptions: RequestOptionData;
    /** 是否已经使用过牌 */
    used?: UseCardEvent | UseCardToCardEvent;
    /** 出牌阶段的可使用技能 */
    playphase_skills = new Map<TriggerEffect, TriggerEffectContext>();

    /** 不播放指向线 */
    noPlayDirectLine?: boolean = false;
    /** 结算次数 */
    effectTimes?: number = 1;

    /** 检测是否是否包含指定的牌 */
    has(name: string, method?: number) {
        return !!this.cards.find((v) => {
            if (!method) return v.name === name;
            else return v.name === name && v.method === method;
        });
    }
}

export class PreUseCardData extends EventData {
    /** 使用者 */
    from: GamePlayer;
    /** 需要使用的牌
     * @description 该属性不能直接提供否则可能会导致不合法的使用牌。如果未确定使用的牌，则需要调用需要使用牌方法
     */
    can_use_cards?: {
        name: string;
        method?: number;
    }[] = [];
    /** 可以使用的技能
     * @description 该属性不能直接提供否则可能会导致不合法的使用牌。如果未确定使用的牌，则需要调用需要使用牌方法
     */
    can_use_skills?: Map<TriggerEffect, TriggerEffectContext>;
    /** 出牌阶段的可使用技能 */
    playphase_skills = new Map<TriggerEffect, TriggerEffectContext>();
    /** 确定的使用的牌 */
    card: VirtualCard;
    /** 确定的目标 */
    targets?: GamePlayer[] | VirtualCard;
    /** 实体牌的选择标准及范围
     * @description 如不提供实体牌的选择标准及范围，则采用默认的标准和范围(手牌区里的一张与需要使用的牌同名的牌)。
     * 同时其可以发动需要使用牌时的技能(视为技)。
     */
    cardSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 目标的选择标准
     * @description 如果提供该属性，一名角色能否成为一张牌的目标除了牌本身的限制外，还需要通过该方法提供的检测方法
     * 注：只要提供该属性，除非显式提供excluesCardTimesLimit为false，否则会默认跳过次数检测
     */
    targetSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 发起的使用牌询问的设置 */
    reqOptions?: RequestOptionData;
    /** 是否已经使用过牌 */
    used?: UseCardEvent | UseCardToCardEvent;

    /** 不播放指向线 */
    noPlayDirectLine?: boolean = false;
    /** 结算次数 */
    effectTimes?: number = 1;
    transform: TriggerEffect;

    /** 获取特殊的prompt定义 */
    public get_prompt(): { prompt?: CustomString; thinkPrompt?: CustomString } {
        //濒死
        if (this.source.is(DyingEvent) && this.reason === 'default_use') {
            return {
                prompt: {
                    text: `@dying`,
                    values: [
                        { type: 'player', value: this.source.player.playerId },
                        { type: 'number', value: 1 - this.source.player.hp },
                    ],
                },
                thinkPrompt: '@@dying',
            };
        }
        //闪
        if (
            this.has('shan') &&
            this.source.is(UseCardEvent) &&
            this.source.card.name === 'sha'
        ) {
            return {
                prompt: {
                    text: `@shan`,
                    values: [
                        { type: 'player', value: this.source.from.playerId },
                    ],
                },
                thinkPrompt: `shan`,
            };
        }
        //无懈可击
        if (this.has('wuxiekeji')) {
            if (
                this.source.is(UseCardEvent) &&
                this.source.card.type === CardType.Scroll
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response1`,
                        values: [
                            {
                                type: 'player',
                                value: this.source.from.playerId,
                            },
                            { type: 'string', value: this.source.card.name },
                            {
                                type: 'player',
                                value: this.source.current.target.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
            if (
                this.source.is(UseCardSpecialEvent) &&
                this.source.card.type === CardType.Scroll
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response3`,
                        values: [
                            { type: 'string', value: this.source.card.name },
                            {
                                type: 'player',
                                value: this.source.target.target.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
            if (
                this.source.is(UseCardToCardEvent) &&
                this.source.card.name === 'wuxiekeji'
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response2`,
                        values: [
                            {
                                type: 'player',
                                value: this.source.from.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
        }
    }

    /** 检测是否是否包含指定的牌 */
    has(name: string, method?: number) {
        return !!this.can_use_cards.find((v) => {
            if (!method) return v.name === name;
            else return v.name === name && v.method === method;
        });
    }
}

export class PreSameUseCardData extends EventData {
    can_use_cards?: {
        name: string;
        method?: number;
    }[] = [];
    /** 可以使用的技能
     * @description 该属性不能直接提供否则可能会导致不合法的使用牌。如果未确定使用的牌，则需要调用需要使用牌方法
     */
    can_use_skills?: Map<TriggerEffect, TriggerEffectContext>;
    /** 确定的目标 */
    targets?: GamePlayer[] | VirtualCard;
    /** 实体牌的选择标准及范围
     * @description 如不提供实体牌的选择标准及范围，则采用默认的标准和范围(手牌区里的一张与需要使用的牌同名的牌)。
     * 同时其可以发动需要使用牌时的技能(视为技)。
     */
    cardSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 目标的选择标准
     * @description 如果提供该属性，一名角色能否成为一张牌的目标除了牌本身的限制外，还需要通过该方法提供的检测方法
     * 注：只要提供该属性，除非显式提供excluesCardTimesLimit为false，否则会默认跳过次数检测
     */
    targetSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 发起的使用牌询问的设置 */
    reqOptions?: RequestOptionData;
    /** 是否已经使用过牌 */
    used?: UseCardEvent | UseCardToCardEvent;

    /** 获取特殊的prompt定义 */
    public get_prompt(): { prompt?: CustomString; thinkPrompt?: CustomString } {
        //无懈可击
        if (this.has('wuxiekeji')) {
            if (
                this.source.is(UseCardEvent) &&
                this.source.card.type === CardType.Scroll
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response1`,
                        values: [
                            {
                                type: 'player',
                                value: this.source.from.playerId,
                            },
                            { type: 'string', value: this.source.card.name },
                            {
                                type: 'player',
                                value: this.source.current.target.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
            if (
                this.source.is(UseCardSpecialEvent) &&
                this.source.card.type === CardType.Scroll
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response3`,
                        values: [
                            { type: 'string', value: this.source.card.name },
                            {
                                type: 'player',
                                value: this.source.target.target.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
            if (
                this.source.is(UseCardToCardEvent) &&
                this.source.card.name === 'wuxiekeji'
            ) {
                return {
                    prompt: {
                        text: `@wuxiekeji_response2`,
                        values: [
                            {
                                type: 'player',
                                value: this.source.from.playerId,
                            },
                        ],
                    },
                    thinkPrompt: 'wuxiekeji',
                };
            }
        }
    }

    /** 检测是否是否包含指定的牌 */
    has(name: string, method?: number) {
        return !!this.can_use_cards.find((v) => {
            if (!method) return v.name === name;
            else return v.name === name && v.method === method;
        });
    }
}

/** 使用牌 */
export class UseCardEvent extends EventProcess {
    /** 使用者 */
    from: GamePlayer;
    /** 目标 */
    targets: GamePlayer[];
    /** 使用的牌 */
    card: VirtualCard;
    /** 不播放指向线 */
    noPlayDirectLine?: boolean = false;
    /** 结算次数 */
    effectTimes?: number = 1;
    /** 伤害值基数 */
    baseDamage?: number = 1;
    /** 回复值基数 */
    baseRecover?: number = 1;

    public isFirstTarget: boolean = false;
    /** 当前结算角色 */
    public current: TargetListItem;
    /** 目标列表的对应关系 */
    public targetList: TargetListItem[] = [];
    /** 使用牌的技能 */
    protected card_skill: CardUseSkillData;
    /** 目标自增ID */
    protected targetIndex = 1;
    /** 目标角色数 */
    public get targetCount() {
        return new Set(this.targetList.map((v) => v.target)).size;
    }
    /** 不能响应的角色 */
    public cantResponse: GamePlayer[] = [];

    /** 修改该牌的效果 */
    public effect: (
        this: CardUseSkillData,
        room: GameRoom,
        target: TargetListItem,
        data: UseCardEvent
    ) => Promise<void>;

    protected async init(): Promise<void> {
        await super.init();
        this.card_skill = sgs.getCardUse(
            this.card.name,
            this.card.custom.method
        );
        if (!this.card_skill) return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.eventTriggers = [
            EventTriggers.DeclareUseCard,
            EventTriggers.ChooseTarget,
            EventTriggers.CardBeUse,
            //指定目标时
            //成为目标时
            //指定目标后
            //成为目标后
            EventTriggers.UseCardReady,
            //结算过程
        ];
        this.endTriggers = [
            EventTriggers.UseCardEnd1,
            EventTriggers.UseCardEnd2,
            EventTriggers.UseCardEnd3,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas: VirtualCardData;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        this.data.subcards = this.card.subcards.slice();
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: MoveCardReason.Use,
                    animation: true,
                    viewas,
                    label: {
                        text: '#Move_Use',
                        values: [{ type: 'player', value: this.from.playerId }],
                    },
                },
            ],
            source: this,
            reason: 'use',
        });
        this.room.sortResponse(this.targets);
        //客户端播放相关动画
        //指向线
        if (!this.noPlayDirectLine) {
            this.room.directLine(this.from, this.targets);
        }
        //使用牌移动到处理区动画
        if (this.card.subcards.length === 0) {
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [this.card.vdata],
                        fromArea: this.from.handArea.areaId,
                        toArea: this.room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [
                                { type: 'player', value: this.from.playerId },
                            ],
                        },
                    },
                ],
            });
        }
        //语音和动画
        const a = this.from.getCardUseAniAndAudio(this.card.sourceData);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.from.playerId,
            ani: a.ani_name,
            audio: this.card.transform || this.skill ? undefined : a.audio_url,
            log: {
                text: '#UseCard',
                values: [
                    { type: 'player', value: this.from.playerId },
                    { type: 'vcard', value: this.card.vdata },
                    {
                        type: '[player]',
                        value: this.room.getPlayerIds(this.targets),
                    },
                ],
            },
        });
        //生成目标对应关系
        if (!this.targetList.length) {
            const targets = this.targets.slice();
            this.targets.length = 0;
            targets.forEach((v) => {
                this.addTarget(v);
            });
        }
    }

    protected async [`${EventTriggers.CardBeUse}_After`]() {
        //生成指定目标时
        this.isFirstTarget = true;
        this.generatorReady(EventTriggers.AssignTarget);
    }

    protected async [`${EventTriggers.AssignTarget}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (
            this.targetList.every(
                (v) => v.generator === EventTriggers.AssignTarget
            )
        ) {
            this.isFirstTarget = true;
            this.generatorReady(EventTriggers.BecomeTarget);
        } else {
            this.isFirstTarget = false;
            this.generatorReady(EventTriggers.AssignTarget);
        }
    }

    protected async [`${EventTriggers.BecomeTarget}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (
            this.targetList.every(
                (v) => v.generator === EventTriggers.BecomeTarget
            )
        ) {
            this.isFirstTarget = true;
            this.generatorReady(EventTriggers.AssignTargeted);
        } else {
            this.isFirstTarget = false;
            this.generatorReady(EventTriggers.BecomeTarget);
        }
    }

    protected async [`${EventTriggers.AssignTargeted}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (
            this.targetList.every(
                (v) => v.generator === EventTriggers.AssignTargeted
            )
        ) {
            this.isFirstTarget = true;
            this.generatorReady(EventTriggers.BecomeTargeted);
        } else {
            this.isFirstTarget = false;
            this.generatorReady(EventTriggers.AssignTargeted);
        }
    }

    protected async [`${EventTriggers.BecomeTargeted}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (
            this.targetList.every(
                (v) => v.generator === EventTriggers.BecomeTargeted
            )
        ) {
        } else {
            this.isFirstTarget = false;
            this.generatorReady(EventTriggers.BecomeTargeted);
        }
    }

    protected async [`${EventTriggers.UseCardReady}_After`]() {
        await this.room.delay(0.5);
        //将已死亡的角色移出目标列表
        this.targetList.slice().forEach((v) => {
            if (v.target.death) {
                this.removeTarget(v.index);
            }
        });
        //延时锦囊牌
        if (this.card.subtype === CardSubType.DelayedScroll) {
            if (this.targetList.length > 0) {
                await this.room.moveCards({
                    source: this,
                    reason: 'use',
                    move_datas: [
                        {
                            cards: this.card.subcards,
                            toArea: this.targetList[0].target.judgeArea,
                            reason: MoveCardReason.Use,
                            animation: false,
                        },
                    ],
                });
            } else {
                this.room.deleteVirtualCard(this.card);
            }
            this.isEnd = true;
        }
        //装备牌
        else if (this.card.type === CardType.Equip) {
            if (this.targetList.length > 0) {
                const old_equips = this.targetList[0].target
                    .getEquipCards()
                    .filter((v) => v.subtype === this.card.subtype);
                if (old_equips.length > 0) {
                    await this.room.moveCards({
                        source: this,
                        reason: 'use_equip',
                        move_datas: [
                            {
                                cards: old_equips,
                                toArea: this.room.discardArea,
                                reason: MoveCardReason.PutTo,
                            },
                            {
                                cards: this.card.subcards,
                                toArea: this.targetList[0].target.equipArea,
                                reason: MoveCardReason.Use,
                                animation: false,
                            },
                        ],
                        getMoveLabel: (data) => {
                            if (data.reason === MoveCardReason.PutTo) {
                                return {
                                    text: '#Move_PutTo',
                                    values: [
                                        {
                                            type: 'player',
                                            value: this.from.playerId,
                                        },
                                        {
                                            type: 'area',
                                            value: data.toArea.areaId,
                                        },
                                    ],
                                };
                            }
                        },
                    });
                } else {
                    await this.room.moveCards({
                        source: this,
                        reason: 'use_equip',
                        move_datas: [
                            {
                                cards: this.card.subcards,
                                toArea: this.targetList[0].target.equipArea,
                                reason: MoveCardReason.Use,
                                animation: false,
                            },
                        ],
                    });
                }
            }
            this.room.deleteVirtualCard(this.card);
            this.isEnd = true;
        }
        //其他
        else {
            this.sort();
            this.isFirstTarget = true;
            this.generatorEffect();
        }
    }

    protected async [`${EventTriggers.CardEffectStart}_After`]() {
        if (this.current.invalid) {
            this.current.target.setProperty('inresponse', false);
            this.current = undefined;
            this.isFirstTarget = false;
            this.generatorEffect();
        } else {
            this.insert([EventTriggers.CardEffectBefore]);
        }
    }

    protected async [`${EventTriggers.CardEffectBefore}_Before`]() {
        this.triggerNot = true;
        if (!this.current.offset) {
            await this.room.trigger(
                EventTriggers.CardEffectBefore,
                this,
                this.room.playerAlives.filter(
                    (v) => !this.cantResponse.includes(v)
                )
            );
        }
    }

    protected async [`${EventTriggers.CardEffectBefore}_After`]() {
        this.triggerNot = false;
        if (this.current.offset) {
            if (
                this.current.wushuang.includes(this.from) &&
                this.card.name === 'sha'
            ) {
                lodash.remove(this.current.wushuang, (c) => c === this.from);
                this.current.offset = undefined;
                this.insert([EventTriggers.CardEffectBefore]);
            } else {
                this.insert([EventTriggers.BeOffset]);
            }
        } else {
            this.insert([EventTriggers.CardEffect, EventTriggers.CardEffected]);
        }
    }

    protected async [`${EventTriggers.BeOffset}_After`]() {
        if (this.eventTriggers.length === 0) {
            this.current.target.setProperty('inresponse', false);
            this.current = undefined;
            this.isFirstTarget = false;
            this.generatorEffect();
        }
    }

    protected async [`${EventTriggers.CardEffected}_After`]() {
        if (this.effect) {
            await this.effect.call(
                this.card_skill,
                this.room,
                this.current,
                this
            );
        } else {
            await this.card_skill.effect.call(
                this.card_skill,
                this.room,
                this.current,
                this
            );
        }
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.isFirstTarget = false;
        this.generatorEffect();
    }

    public async processCompleted(): Promise<void> {
        await super.processCompleted();
        if (
            this.card.type === CardType.Basic ||
            this.card.subtype === CardSubType.InstantScroll
        ) {
            this.room.deleteVirtualCard(this.card);
        }
    }

    /** 生成准备前的4个时机 */
    protected generatorReady(trigger: EventTriggers) {
        const target = this.targetList.find((v) => v.generator !== trigger);
        if (target) {
            this.insert([trigger]);
            this.current = target;
            this.current.generator = trigger;
            this.current.target.setProperty('inresponse', true);
        } else {
            this.current = undefined;
        }
    }

    /** 生成结算时机 */
    protected generatorEffect() {
        const target = this.targetList.find(
            (v) => v.generator !== EventTriggers.CardEffectStart && !v.invalid
        );
        if (target) {
            target.generator = EventTriggers.CardEffectStart;
            this.insert([EventTriggers.CardEffectStart]);
            this.current = target;
            this.current.target.setProperty('inresponse', true);
        } else {
            this.current = undefined;
        }
    }

    /** 增加一个目标 */
    public addTarget(target: GamePlayer) {
        if (!target) return;
        this.targets.push(target);
        const item: TargetListItem = {
            index: this.targetIndex++,
            target,
            generator: EventTriggers.None,
            invalid: false,
            offset: undefined,
            subTargets: [],
            wushuang: [],
            effectTimes: this.effectTimes,
        };
        this.targetList.push(item);
        return item;
    }

    /** 删除一个目标 */
    public removeTarget(target: GamePlayer | number) {
        if (typeof target === 'number') {
            const _target = this.targetList.find((v) => v.index === target);
            if (_target) {
                lodash.remove(this.targets, (c) => c === _target.target);
                lodash.remove(this.targetList, (c) => c === _target);
            }
        } else {
            lodash.remove(this.targets, (c) => c === target);
            lodash.remove(this.targetList, (v) => v.target === target);
        }
    }

    /** 将对应关系的目标列表排序 */
    public sort() {
        const targets = this.room.sortResponse([
            ...new Set(this.targetList.map((v) => v.target).filter((v) => v)),
        ]);
        const array: typeof this.targetList = [];
        targets.forEach((v) => {
            array.push(
                ...this.targetList
                    .filter((t) => t.target === v)
                    .sort((a, b) => {
                        return a.index - b.index;
                    })
            );
        });
        this.targetList = array;
    }

    public check_event(): boolean {
        return !!this.card_skill && this.targets.length > 0;
    }

    /** 令当前目标无效 */
    public async invalidCurrent() {
        this.current.invalid = true;
        return this;
    }

    /**
     * 取消当前目标
     * @description 只有在“成为目标时”这个时机可以进行取消操作
     */
    public async cancleCurrent() {
        if (
            this.trigger === EventTriggers.BecomeTarget ||
            this.trigger === EventTriggers.AssignTarget
        ) {
            this.removeTarget(this.current.index);
            this.triggerable = false;
        }
        return this;
    }

    /**
     * 取消目标
     * @description 只有在“成为目标时”这个时机可以进行取消操作
     */
    public async cancle(targets: GamePlayer[]) {
        if (
            this.trigger === EventTriggers.BecomeTarget ||
            this.trigger === EventTriggers.AssignTarget
        ) {
            if (this.current && targets.includes(this.current.target)) {
                this.triggerable = false;
            }
            targets.forEach((v) => {
                this.removeTarget(v);
            });
        }
        return this;
    }

    /**
     * 转移当前目标
     * @param target 新的目标
     */
    public async transferCurrent(target: GamePlayer) {
        if (target === this.current.target) return this;
        await this.cancleCurrent();
        this.addTarget(target);
        this.sort();
        return this;
    }

    /**
     * <X名角色>也成为<一张牌>的目标
     * @param targets 需要增加的目标
     */
    public async becomTarget(targets: GamePlayer[]) {
        targets.forEach((v) => this.addTarget(v));
        if (!this.noPlayDirectLine) {
            this.room.directLine(this.from, targets, 1);
        }
        this.sort();
        return this;
    }

    /**
     * 令指定角色不可响应
     */
    public async targetCantResponse(targets: GamePlayer[]) {
        this.cantResponse.push(...targets.filter((v) => v));
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}

/** 使用目标为牌的牌 */
export class UseCardToCardEvent extends EventProcess {
    /** 使用者 */
    from: GamePlayer;
    /** 目标 */
    targets: VirtualCard;
    /** 使用的牌 */
    card: VirtualCard;

    /** 目标卡牌 */
    public current: TargetCardListItem;
    /** 使用牌的技能 */
    protected card_skill: CardUseSkillData;
    /** 不能响应的角色 */
    public cantResponse: GamePlayer[] = [];

    /** 修改该牌的效果 */
    public effect: (
        this: CardUseSkillData,
        room: GameRoom,
        target: TargetCardListItem,
        data: UseCardToCardEvent
    ) => Promise<void>;

    protected async init(): Promise<void> {
        await super.init();
        this.card_skill = sgs.getCardUse(
            this.card.name,
            this.card.custom.method
        );
        if (!this.card_skill) return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.current = {
            index: 1,
            target: this.targets,
            invalid: false,
            offset: undefined,
        };
        this.eventTriggers = [
            EventTriggers.DeclareUseCard,
            EventTriggers.CardBeUse,
            EventTriggers.UseCardReady,
            EventTriggers.CardEffectStart,
            EventTriggers.CardEffectBefore,
            EventTriggers.CardEffect,
            EventTriggers.CardEffected,
        ];
        this.endTriggers = [
            EventTriggers.UseCardEnd1,
            EventTriggers.UseCardEnd2,
            EventTriggers.UseCardEnd3,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas: VirtualCardData;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: MoveCardReason.Use,
                    animation: true,
                    viewas,
                    label: {
                        text: '#Move_Use',
                        values: [{ type: 'player', value: this.from.playerId }],
                    },
                },
            ],
            source: this,
            reason: 'use',
        });
        this.data.subcards = this.card.subcards.slice();
        //使用牌移动到处理区动画
        if (this.card.subcards.length === 0) {
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [this.card.vdata],
                        fromArea: this.from.handArea.areaId,
                        toArea: this.room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Use',
                            values: [
                                { type: 'player', value: this.from.playerId },
                            ],
                        },
                    },
                ],
            });
        }
        //语音和动画
        const a = this.from.getCardUseAniAndAudio(this.card.sourceData);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.from.playerId,
            ani: a.ani_name,
            audio: this.card.transform || this.skill ? undefined : a.audio_url,
            log: {
                text: '#UseCard',
                values: [
                    { type: 'player', value: this.from.playerId },
                    { type: 'vcard', value: this.card.vdata },
                    { type: 'vcard', value: this.current.target.vdata },
                ],
            },
        });
    }

    protected async [`${EventTriggers.UseCardReady}_After`]() {
        if (this.current.invalid) {
            this.isEnd = true;
        }
    }

    protected async [`${EventTriggers.CardEffectStart}_After`]() {
        if (this.current.invalid) {
            this.isEnd = true;
        }
    }

    protected async [`${EventTriggers.CardEffectBefore}_Before`]() {
        this.triggerNot = true;
        await this.room.trigger(
            EventTriggers.CardEffectBefore,
            this,
            this.room.playerAlives.filter((v) => !this.cantResponse.includes(v))
        );
    }

    protected async [`${EventTriggers.CardEffectBefore}_After`]() {
        this.triggerNot = false;
        if (this.current.offset) {
            this.insert([EventTriggers.BeOffset]);
        }
    }

    protected async [`${EventTriggers.BeOffset}_After`]() {
        this.isEnd = true;
    }

    protected async [`${EventTriggers.CardEffected}_After`]() {
        if (this.effect) {
            await this.effect.call(
                this.card_skill,
                this.room,
                this.current,
                this
            );
        } else {
            await this.card_skill.effect.call(
                this.card_skill,
                this.room,
                this.current,
                this
            );
        }
        this.current = undefined;
    }

    public check_event(): boolean {
        return !!this.card_skill;
    }

    /** 令当前目标无效 */
    public async invalidCurrent() {
        this.current.invalid = true;
        return this;
    }

    /**
     * 令指定角色不可响应
     */
    public async targetCantResponse(targets: GamePlayer[]) {
        this.cantResponse.push(...targets);
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}

/** 判定阶段系统特殊使用牌 */
export class UseCardSpecialEvent extends EventProcess {
    /** 目标 */
    targets: GamePlayer;
    /** 使用的牌 */
    card: VirtualCard;
    /** 目标 */
    public target: TargetListItem;
    /** 使用牌的技能 */
    protected card_skill: CardUseSkillData;

    /** 不能响应的角色 */
    public cantResponse: GamePlayer[] = [];

    protected async init(): Promise<void> {
        await super.init();
        this.card_skill = sgs.getCardUse(
            this.card.name,
            this.card.custom.method
        );
        if (!this.card_skill) return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.target = {
            index: 1,
            target: this.targets,
            generator: EventTriggers.None,
            invalid: false,
            offset: undefined,
            subTargets: [],
            wushuang: [],
            effectTimes: 1,
        };
        this.eventTriggers = [
            EventTriggers.CardEffectStart,
            EventTriggers.CardEffectBefore,
            EventTriggers.CardEffect,
            EventTriggers.CardEffected,
        ];
        this.endTriggers = [
            EventTriggers.UseCardEnd1,
            EventTriggers.UseCardEnd2,
            EventTriggers.UseCardEnd3,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas: VirtualCardData;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: MoveCardReason.Use,
                    animation: true,
                    viewas,
                    label: {
                        text: '#Move_UseSp',
                        values: [
                            { type: 'player', value: this.targets.playerId },
                        ],
                    },
                },
            ],
            source: this,
            reason: 'use',
        });
        this.data.subcards = this.card.subcards.slice();
        //使用牌移动到处理区动画
        if (this.card.subcards.length === 0) {
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [this.card.vdata],
                        fromArea: this.targets.judgeArea.areaId,
                        toArea: this.room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#UseCardSp',
                            values: [
                                {
                                    type: 'player',
                                    value: this.targets.playerId,
                                },
                            ],
                        },
                    },
                ],
            });
        }
    }

    protected async [`${EventTriggers.CardEffectStart}_After`]() {
        if (this.target.invalid) {
            this.isEnd = true;
        } else {
            this.target.target.setProperty('inresponse', true);
        }
    }

    protected async [`${EventTriggers.CardEffectBefore}_Before`]() {
        this.triggerNot = true;
        await this.room.trigger(
            EventTriggers.CardEffectBefore,
            this,
            this.room.playerAlives.filter((v) => !this.cantResponse.includes(v))
        );
    }

    protected async [`${EventTriggers.CardEffectBefore}_After`]() {
        this.triggerNot = false;
        if (this.target.offset) {
            this.insert([EventTriggers.BeOffset]);
        }
    }

    protected async [`${EventTriggers.BeOffset}_After`]() {
        this.isEnd = true;
        this.target.target.setProperty('inresponse', false);
    }

    protected async [`${EventTriggers.CardEffected}_After`]() {
        await this.card_skill.effect.call(
            this.card_skill,
            this.room,
            this.target,
            this
        );
        this.target.target.setProperty('inresponse', false);
    }

    public check_event(): boolean {
        return !!this.card_skill && this.targets.alive;
    }

    /**
     * 令指定角色不可响应
     */
    public async targetCantResponse(targets: GamePlayer[]) {
        this.cantResponse.push(...targets);
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}
