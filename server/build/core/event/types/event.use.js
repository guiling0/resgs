"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseCardSpecialEvent = exports.UseCardToCardEvent = exports.UseCardEvent = exports.PreSameUseCardData = exports.PreUseCardData = exports.NeedUseCardData = void 0;
const data_1 = require("../data");
const event_1 = require("../event");
const event_die_1 = require("./event.die");
class NeedUseCardData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 出牌阶段的可使用技能 */
        this.playphase_skills = new Map();
        /** 不播放指向线 */
        this.noPlayDirectLine = false;
        /** 结算次数 */
        this.effectTimes = 1;
    }
    /** 检测是否是否包含指定的牌 */
    has(name, method) {
        return !!this.cards.find((v) => {
            if (!method)
                return v.name === name;
            else
                return v.name === name && v.method === method;
        });
    }
}
exports.NeedUseCardData = NeedUseCardData;
class PreUseCardData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 需要使用的牌
         * @description 该属性不能直接提供否则可能会导致不合法的使用牌。如果未确定使用的牌，则需要调用需要使用牌方法
         */
        this.can_use_cards = [];
        /** 出牌阶段的可使用技能 */
        this.playphase_skills = new Map();
        /** 不播放指向线 */
        this.noPlayDirectLine = false;
        /** 结算次数 */
        this.effectTimes = 1;
    }
    /** 获取特殊的prompt定义 */
    get_prompt() {
        //濒死
        if (this.source.is(event_die_1.DyingEvent) && this.reason === 'default_use') {
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
        if (this.has('shan') &&
            this.source.is(UseCardEvent) &&
            this.source.card.name === 'sha') {
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
            if (this.source.is(UseCardEvent) &&
                this.source.card.type === 2 /* CardType.Scroll */) {
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
            if (this.source.is(UseCardSpecialEvent) &&
                this.source.card.type === 2 /* CardType.Scroll */) {
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
            if (this.source.is(UseCardToCardEvent) &&
                this.source.card.name === 'wuxiekeji') {
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
    has(name, method) {
        return !!this.can_use_cards.find((v) => {
            if (!method)
                return v.name === name;
            else
                return v.name === name && v.method === method;
        });
    }
}
exports.PreUseCardData = PreUseCardData;
class PreSameUseCardData extends data_1.EventData {
    constructor() {
        super(...arguments);
        this.can_use_cards = [];
    }
    /** 获取特殊的prompt定义 */
    get_prompt() {
        //无懈可击
        if (this.has('wuxiekeji')) {
            if (this.source.is(UseCardEvent) &&
                this.source.card.type === 2 /* CardType.Scroll */) {
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
            if (this.source.is(UseCardSpecialEvent) &&
                this.source.card.type === 2 /* CardType.Scroll */) {
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
            if (this.source.is(UseCardToCardEvent) &&
                this.source.card.name === 'wuxiekeji') {
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
    has(name, method) {
        return !!this.can_use_cards.find((v) => {
            if (!method)
                return v.name === name;
            else
                return v.name === name && v.method === method;
        });
    }
}
exports.PreSameUseCardData = PreSameUseCardData;
/** 使用牌 */
class UseCardEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 不播放指向线 */
        this.noPlayDirectLine = false;
        /** 结算次数 */
        this.effectTimes = 1;
        /** 伤害值基数 */
        this.baseDamage = 1;
        /** 回复值基数 */
        this.baseRecover = 1;
        this.isFirstTarget = false;
        /** 目标列表的对应关系 */
        this.targetList = [];
        /** 目标自增ID */
        this.targetIndex = 1;
        /** 不能响应的角色 */
        this.cantResponse = [];
    }
    /** 目标角色数 */
    get targetCount() {
        return new Set(this.targetList.map((v) => v.target)).size;
    }
    async init() {
        await super.init();
        this.card_skill = sgs.getCardUse(this.card.name, this.card.custom.method);
        if (!this.card_skill)
            return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.eventTriggers = [
            "DeclareUseCard" /* EventTriggers.DeclareUseCard */,
            "ChooseTarget" /* EventTriggers.ChooseTarget */,
            "CardBeUse" /* EventTriggers.CardBeUse */,
            "UseCardReady" /* EventTriggers.UseCardReady */,
            //结算过程
        ];
        this.endTriggers = [
            "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
            "UseCardEnd2" /* EventTriggers.UseCardEnd2 */,
            "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas;
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
                    reason: 2 /* MoveCardReason.Use */,
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
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
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
    async [`${"CardBeUse" /* EventTriggers.CardBeUse */}_After`]() {
        //生成指定目标时
        this.isFirstTarget = true;
        this.generatorReady("AssignTarget" /* EventTriggers.AssignTarget */);
    }
    async [`${"AssignTarget" /* EventTriggers.AssignTarget */}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (this.targetList.every((v) => v.generator === "AssignTarget" /* EventTriggers.AssignTarget */)) {
            this.isFirstTarget = true;
            this.generatorReady("BecomeTarget" /* EventTriggers.BecomeTarget */);
        }
        else {
            this.isFirstTarget = false;
            this.generatorReady("AssignTarget" /* EventTriggers.AssignTarget */);
        }
    }
    async [`${"BecomeTarget" /* EventTriggers.BecomeTarget */}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (this.targetList.every((v) => v.generator === "BecomeTarget" /* EventTriggers.BecomeTarget */)) {
            this.isFirstTarget = true;
            this.generatorReady("AssignTargeted" /* EventTriggers.AssignTargeted */);
        }
        else {
            this.isFirstTarget = false;
            this.generatorReady("BecomeTarget" /* EventTriggers.BecomeTarget */);
        }
    }
    async [`${"AssignTargeted" /* EventTriggers.AssignTargeted */}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (this.targetList.every((v) => v.generator === "AssignTargeted" /* EventTriggers.AssignTargeted */)) {
            this.isFirstTarget = true;
            this.generatorReady("BecomeTargeted" /* EventTriggers.BecomeTargeted */);
        }
        else {
            this.isFirstTarget = false;
            this.generatorReady("AssignTargeted" /* EventTriggers.AssignTargeted */);
        }
    }
    async [`${"BecomeTargeted" /* EventTriggers.BecomeTargeted */}_After`]() {
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.sort();
        if (this.targetList.every((v) => v.generator === "BecomeTargeted" /* EventTriggers.BecomeTargeted */)) {
        }
        else {
            this.isFirstTarget = false;
            this.generatorReady("BecomeTargeted" /* EventTriggers.BecomeTargeted */);
        }
    }
    async [`${"UseCardReady" /* EventTriggers.UseCardReady */}_After`]() {
        await this.room.delay(0.5);
        //将已死亡的角色移出目标列表
        this.targetList.slice().forEach((v) => {
            if (v.target.death) {
                this.removeTarget(v.index);
            }
        });
        //延时锦囊牌
        if (this.card.subtype === 22 /* CardSubType.DelayedScroll */) {
            if (this.targetList.length > 0) {
                await this.room.moveCards({
                    source: this,
                    reason: 'use',
                    move_datas: [
                        {
                            cards: this.card.subcards,
                            toArea: this.targetList[0].target.judgeArea,
                            reason: 2 /* MoveCardReason.Use */,
                            animation: false,
                        },
                    ],
                });
            }
            else {
                this.room.deleteVirtualCard(this.card);
            }
            this.isEnd = true;
        }
        //装备牌
        else if (this.card.type === 3 /* CardType.Equip */) {
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
                                reason: 1 /* MoveCardReason.PutTo */,
                            },
                            {
                                cards: this.card.subcards,
                                toArea: this.targetList[0].target.equipArea,
                                reason: 2 /* MoveCardReason.Use */,
                                animation: false,
                            },
                        ],
                        getMoveLabel: (data) => {
                            if (data.reason === 1 /* MoveCardReason.PutTo */) {
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
                }
                else {
                    await this.room.moveCards({
                        source: this,
                        reason: 'use_equip',
                        move_datas: [
                            {
                                cards: this.card.subcards,
                                toArea: this.targetList[0].target.equipArea,
                                reason: 2 /* MoveCardReason.Use */,
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
    async [`${"CardEffectStart" /* EventTriggers.CardEffectStart */}_After`]() {
        if (this.current.invalid) {
            this.current.target.setProperty('inresponse', false);
            this.current = undefined;
            this.isFirstTarget = false;
            this.generatorEffect();
        }
        else {
            this.insert(["CardEffectBefore" /* EventTriggers.CardEffectBefore */]);
        }
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_Before`]() {
        this.triggerNot = true;
        if (!this.current.offset) {
            await this.room.trigger("CardEffectBefore" /* EventTriggers.CardEffectBefore */, this, this.room.playerAlives.filter((v) => !this.cantResponse.includes(v)));
        }
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_After`]() {
        this.triggerNot = false;
        if (this.current.offset) {
            if (this.current.wushuang.includes(this.from) &&
                this.card.name === 'sha') {
                lodash.remove(this.current.wushuang, (c) => c === this.from);
                this.current.offset = undefined;
                this.insert(["CardEffectBefore" /* EventTriggers.CardEffectBefore */]);
            }
            else {
                this.insert(["BeOffset" /* EventTriggers.BeOffset */]);
            }
        }
        else {
            this.insert(["CardEffect" /* EventTriggers.CardEffect */, "CardEffected" /* EventTriggers.CardEffected */]);
        }
    }
    async [`${"BeOffset" /* EventTriggers.BeOffset */}_After`]() {
        if (this.eventTriggers.length === 0) {
            this.current.target.setProperty('inresponse', false);
            this.current = undefined;
            this.isFirstTarget = false;
            this.generatorEffect();
        }
    }
    async [`${"CardEffected" /* EventTriggers.CardEffected */}_After`]() {
        if (this.effect) {
            await this.effect.call(this.card_skill, this.room, this.current, this);
        }
        else {
            await this.card_skill.effect.call(this.card_skill, this.room, this.current, this);
        }
        this.current.target.setProperty('inresponse', false);
        this.current = undefined;
        this.isFirstTarget = false;
        this.generatorEffect();
    }
    async processCompleted() {
        await super.processCompleted();
        if (this.card.type === 1 /* CardType.Basic */ ||
            this.card.subtype === 21 /* CardSubType.InstantScroll */) {
            this.room.deleteVirtualCard(this.card);
        }
    }
    /** 生成准备前的4个时机 */
    generatorReady(trigger) {
        const target = this.targetList.find((v) => v.generator !== trigger);
        if (target) {
            this.insert([trigger]);
            this.current = target;
            this.current.generator = trigger;
            this.current.target.setProperty('inresponse', true);
        }
        else {
            this.current = undefined;
        }
    }
    /** 生成结算时机 */
    generatorEffect() {
        const target = this.targetList.find((v) => v.generator !== "CardEffectStart" /* EventTriggers.CardEffectStart */ && !v.invalid);
        if (target) {
            target.generator = "CardEffectStart" /* EventTriggers.CardEffectStart */;
            this.insert(["CardEffectStart" /* EventTriggers.CardEffectStart */]);
            this.current = target;
            this.current.target.setProperty('inresponse', true);
        }
        else {
            this.current = undefined;
        }
    }
    /** 增加一个目标 */
    addTarget(target) {
        if (!target)
            return;
        this.targets.push(target);
        const item = {
            index: this.targetIndex++,
            target,
            generator: "None" /* EventTriggers.None */,
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
    removeTarget(target) {
        if (typeof target === 'number') {
            const _target = this.targetList.find((v) => v.index === target);
            if (_target) {
                lodash.remove(this.targets, (c) => c === _target.target);
                lodash.remove(this.targetList, (c) => c === _target);
            }
        }
        else {
            lodash.remove(this.targets, (c) => c === target);
            lodash.remove(this.targetList, (v) => v.target === target);
        }
    }
    /** 将对应关系的目标列表排序 */
    sort() {
        const targets = this.room.sortResponse([
            ...new Set(this.targetList.map((v) => v.target).filter((v) => v)),
        ]);
        const array = [];
        targets.forEach((v) => {
            array.push(...this.targetList
                .filter((t) => t.target === v)
                .sort((a, b) => {
                return a.index - b.index;
            }));
        });
        this.targetList = array;
    }
    check_event() {
        return !!this.card_skill && this.targets.length > 0;
    }
    /** 令当前目标无效 */
    async invalidCurrent() {
        this.current.invalid = true;
        return this;
    }
    /**
     * 取消当前目标
     * @description 只有在“成为目标时”这个时机可以进行取消操作
     */
    async cancleCurrent() {
        if (this.trigger === "BecomeTarget" /* EventTriggers.BecomeTarget */ ||
            this.trigger === "AssignTarget" /* EventTriggers.AssignTarget */) {
            this.removeTarget(this.current.index);
            this.triggerable = false;
        }
        return this;
    }
    /**
     * 取消目标
     * @description 只有在“成为目标时”这个时机可以进行取消操作
     */
    async cancle(targets) {
        if (this.trigger === "BecomeTarget" /* EventTriggers.BecomeTarget */ ||
            this.trigger === "AssignTarget" /* EventTriggers.AssignTarget */) {
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
    async transferCurrent(target) {
        if (target === this.current.target)
            return this;
        await this.cancleCurrent();
        this.addTarget(target);
        this.sort();
        return this;
    }
    /**
     * <X名角色>也成为<一张牌>的目标
     * @param targets 需要增加的目标
     */
    async becomTarget(targets) {
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
    async targetCantResponse(targets) {
        this.cantResponse.push(...targets.filter((v) => v));
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}
exports.UseCardEvent = UseCardEvent;
/** 使用目标为牌的牌 */
class UseCardToCardEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 不能响应的角色 */
        this.cantResponse = [];
    }
    async init() {
        await super.init();
        this.card_skill = sgs.getCardUse(this.card.name, this.card.custom.method);
        if (!this.card_skill)
            return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.current = {
            index: 1,
            target: this.targets,
            invalid: false,
            offset: undefined,
        };
        this.eventTriggers = [
            "DeclareUseCard" /* EventTriggers.DeclareUseCard */,
            "CardBeUse" /* EventTriggers.CardBeUse */,
            "UseCardReady" /* EventTriggers.UseCardReady */,
            "CardEffectStart" /* EventTriggers.CardEffectStart */,
            "CardEffectBefore" /* EventTriggers.CardEffectBefore */,
            "CardEffect" /* EventTriggers.CardEffect */,
            "CardEffected" /* EventTriggers.CardEffected */,
        ];
        this.endTriggers = [
            "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
            "UseCardEnd2" /* EventTriggers.UseCardEnd2 */,
            "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: 2 /* MoveCardReason.Use */,
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
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
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
    async [`${"UseCardReady" /* EventTriggers.UseCardReady */}_After`]() {
        if (this.current.invalid) {
            this.isEnd = true;
        }
    }
    async [`${"CardEffectStart" /* EventTriggers.CardEffectStart */}_After`]() {
        if (this.current.invalid) {
            this.isEnd = true;
        }
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_Before`]() {
        this.triggerNot = true;
        await this.room.trigger("CardEffectBefore" /* EventTriggers.CardEffectBefore */, this, this.room.playerAlives.filter((v) => !this.cantResponse.includes(v)));
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_After`]() {
        this.triggerNot = false;
        if (this.current.offset) {
            this.insert(["BeOffset" /* EventTriggers.BeOffset */]);
        }
    }
    async [`${"BeOffset" /* EventTriggers.BeOffset */}_After`]() {
        this.isEnd = true;
    }
    async [`${"CardEffected" /* EventTriggers.CardEffected */}_After`]() {
        if (this.effect) {
            await this.effect.call(this.card_skill, this.room, this.current, this);
        }
        else {
            await this.card_skill.effect.call(this.card_skill, this.room, this.current, this);
        }
        this.current = undefined;
    }
    check_event() {
        return !!this.card_skill;
    }
    /** 令当前目标无效 */
    async invalidCurrent() {
        this.current.invalid = true;
        return this;
    }
    /**
     * 令指定角色不可响应
     */
    async targetCantResponse(targets) {
        this.cantResponse.push(...targets);
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}
exports.UseCardToCardEvent = UseCardToCardEvent;
/** 判定阶段系统特殊使用牌 */
class UseCardSpecialEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 不能响应的角色 */
        this.cantResponse = [];
    }
    async init() {
        await super.init();
        this.card_skill = sgs.getCardUse(this.card.name, this.card.custom.method);
        if (!this.card_skill)
            return;
        this.room.players.forEach((v) => (v.skipWuxie = false));
        this.room.insertHistory(this);
        this.target = {
            index: 1,
            target: this.targets,
            generator: "None" /* EventTriggers.None */,
            invalid: false,
            offset: undefined,
            subTargets: [],
            wushuang: [],
            effectTimes: 1,
        };
        this.eventTriggers = [
            "CardEffectStart" /* EventTriggers.CardEffectStart */,
            "CardEffectBefore" /* EventTriggers.CardEffectBefore */,
            "CardEffect" /* EventTriggers.CardEffect */,
            "CardEffected" /* EventTriggers.CardEffected */,
        ];
        this.endTriggers = [
            "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
            "UseCardEnd2" /* EventTriggers.UseCardEnd2 */,
            "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
        ];
        await this.card_skill.onuse.call(this.card_skill, this.room, this);
        let viewas;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: 2 /* MoveCardReason.Use */,
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
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
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
    async [`${"CardEffectStart" /* EventTriggers.CardEffectStart */}_After`]() {
        if (this.target.invalid) {
            this.isEnd = true;
        }
        else {
            this.target.target.setProperty('inresponse', true);
        }
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_Before`]() {
        this.triggerNot = true;
        await this.room.trigger("CardEffectBefore" /* EventTriggers.CardEffectBefore */, this, this.room.playerAlives.filter((v) => !this.cantResponse.includes(v)));
    }
    async [`${"CardEffectBefore" /* EventTriggers.CardEffectBefore */}_After`]() {
        this.triggerNot = false;
        if (this.target.offset) {
            this.insert(["BeOffset" /* EventTriggers.BeOffset */]);
        }
    }
    async [`${"BeOffset" /* EventTriggers.BeOffset */}_After`]() {
        this.isEnd = true;
        this.target.target.setProperty('inresponse', false);
    }
    async [`${"CardEffected" /* EventTriggers.CardEffected */}_After`]() {
        await this.card_skill.effect.call(this.card_skill, this.room, this.target, this);
        this.target.target.setProperty('inresponse', false);
    }
    check_event() {
        return !!this.card_skill && this.targets.alive;
    }
    /**
     * 令指定角色不可响应
     */
    async targetCantResponse(targets) {
        this.cantResponse.push(...targets);
        this.cantResponse = [...new Set(this.cantResponse)];
        return this;
    }
}
exports.UseCardSpecialEvent = UseCardSpecialEvent;
