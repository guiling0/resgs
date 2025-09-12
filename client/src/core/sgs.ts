import {
    CardNumber,
    CardSubType,
    CardSuit,
    CardType,
    CreateGameCard,
    GameCardData,
    GameCardId,
} from './card/card.types';
import { EventTriggers } from './event/triggers';
import {
    CreateGeneral,
    Gender,
    GeneralData,
    GeneralId,
} from './general/general.type';
import { CreateMode, GameModeData } from './mode/mode';
import { Package } from './package';
import { Utils } from './utils';
import { GameCard } from './card/card';
import { ICard } from './card/icard';
import { Custom } from './custom/custom';
import { General } from './general/general';
import { GameRoom } from './room/room';
import { RoomBroadCastMixin } from './room/mixins/room.broadcast';
import { RoomPlayerMixin } from './room/mixins/room.player';
import _ from 'lodash';
import { RoomGeneralMixin } from './room/mixins/room.general';
import { RoomSkillMixin } from './room/mixins/room.skill';
import { GamePlayer } from './player/player';
import {
    CreateSkill,
    CreateStateEffect,
    CreateTriggerEffect,
    EffectId,
    EffectType,
    PriorityType,
    SkillData,
    SkillId,
    StateEffectData,
    TriggerEffectData,
} from './skill/skill.types';
import {
    CardUseSkillData,
    CreateCardUseEquipSkill,
    CreateCardUseSkill,
} from './card/card.use';
import { RoomHistoryMixin } from './room/mixins/room.history';
import { RoomHandleMixin } from './room/mixins/room.handle';
import { RoomChooseMixin } from './room/mixins/room.choose';
import { RoomJsonMixin } from './room/mixins/room.json';
import { RoomCardMixin } from './room/mixins/room.card';
import { VirtualCard } from './card/vcard';
import {
    DrawCardsData,
    DropCardsData,
    GiveCardsData,
    MoveCardEvent,
    PutToCardsData,
} from './event/types/event.move';
import { Skill } from './skill/skill';
import { Effect } from './skill/effect';
import {
    ChainEvent,
    ChangeEvent,
    CloseEvent,
    OpenEvent,
    RemoveEvent,
    SkipEvent,
    StateChangeEvent,
} from './event/types/event.state';
import extensions from './extensions.config';
import { PhaseEvent, TurnEvent } from './event/types/event.turn';
import {
    NeedUseCardData,
    PreUseCardData,
    UseCardEvent,
    UseCardSpecialEvent,
    UseCardToCardEvent,
} from './event/types/event.use';
import { DieEvent, DyingEvent } from './event/types/event.die';
import { WatchGeneralData, WatchHandData } from './event/types/event.watch';
import { NeedPlayCardData, PlayCardEvent } from './event/types/event.play';
import {
    DamageEvent,
    LoseHpEvent,
    ReduceHpEvent,
} from './event/types/event.damage';
import { JudgeEvent } from './event/types/event.judge';
import { ChangeMaxHpEvent, RecoverHpEvent } from './event/types/event.hp';
import { UseSkillEvent } from './event/types/event.skill';

export type GeneralTranslationData = {
    id?: string;
    version?: string;
    /** 称号 */
    title?: string;
    /** 武将名前缀 如“界” */
    prefix?: string;
    /** 设计师 */
    designer?: string;
    /** 画师 */
    painter?: string;
    /** 配音 */
    cv?: string;
    /** 代码提供 */
    script?: string;
    /** 珠联璧合表 */
    rs?: string;
    /** 扩展包icon，默认使用所在的第一个扩展包的icon */
    extensions_url?: string;
    /** 死亡语音 */
    death_audio?: string;
    /** 插画地址。默认generals/{trueName}/image; */
    image_url?: string;
    /** 插画地址-特殊插画其他视角。默认generals/{trueName}/image.dual; */
    image_dual_url?: string;
    /** 插画地址-特殊插画主视角。默认generals/{trueName}/image.dual.self; */
    image_self_url?: string;
    /** 死亡语音地址。默认generals/{trueName}/death */
    death_url?: string;
    /** 技能配置 */
    skills?: { [key: string]: SkillTranslationData };
    /** 皮肤配置 */
    skins?: {
        /** 皮肤名 */
        name: string;
        /** 皮肤插画地址 */
        url?: string;
        /** 特殊插画的其他视角  */
        dual_url?: string;
        /** 特殊插画的主视角 */
        self_url?: string;
        /** 动态插画地址 */
        dynamic?: {
            BeiJing: {
                url: string;
                pos: { x: number; y: number };
                size: { w: number; h: number };
                anchor: { x: number; y: number };
                scale: { x: number; y: number };
                skinName?: string;
                aniName?: string;
            };
            XingXiang: {
                url: string;
                pos: { x: number; y: number };
                size: { w: number; h: number };
                anchor: { x: number; y: number };
                scale: { x: number; y: number };
                skinName?: string;
                aniName?: string;
            };
        };
    }[];
};

export type SkillTranslationData = {
    /** 技能名翻译 */
    name?: string;
    /** 标准描述 */
    desc?: string;
    /** 规则集描述 */
    desc2?: string;
    /** 配音配置 */
    audios?: {
        /** 配音文件地址 */
        url: string;
        /** 配音翻译 */
        lang: string;
    }[];
};

export type GeneralAssetsMappingType = {
    /** 扩展包icon，默认使用所在的第一个扩展包的icon */
    extensions_url?: string;
    /** 武将插画资源 默认为image */
    image: string;
    /** 特殊插画的其他视角 默认为image.dual.png */
    image_dual: string;
    /** 特殊插画主视角 默认为image.self.png */
    image_self: string;
    /** 死亡语音。默认为death.mp3 */
    death: string;
    skins?: {
        /** 皮肤名 */
        name: string;
        /** 皮肤插画地址 */
        url?: string;
        /** 特殊插画的其他视角  */
        dual_url?: string;
        /** 特殊插画的主视角 */
        self_url?: string;
        /** 动态插画地址 */
        dynamic?: {
            BeiJing: {
                url: string;
                pos: { x: number; y: number };
                size: { w: number; h: number };
                anchor: { x: number; y: number };
                scale: { x: number; y: number };
                skinName?: string;
                aniName?: string;
            };
            XingXiang: {
                url: string;
                pos: { x: number; y: number };
                size: { w: number; h: number };
                anchor: { x: number; y: number };
                scale: { x: number; y: number };
                skinName?: string;
                aniName?: string;
            };
        }[];
    }[];
};

export type SkillAssetsMappingType = {
    audios: string[];
};

class RESGS {
    private static instance: RESGS;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RESGS();
        }
        return this.instance;
    }

    public static loadScript_Dev(name: string) {
        const pkg = name.split('@')[0];
        require(`../extensions/${pkg}/index`);
        sgs.extensions.push(name);
    }

    private constructor() {}

    public side: string = 'preview';
    public lang: string = 'zh_CN';

    /** 工具函数 */
    public readonly utils = Utils;
    /** 所有数据类型 */
    public readonly DataType = {
        GameCard,
        GamePlayer,
        General,
        TurnEvent,
        PhaseEvent,
        NeedUseCardData,
        PreUseCardData,
        UseCardEvent,
        UseCardToCardEvent,
        UseCardSpecialEvent,
        NeedPlayCardData,
        PlayCardEvent,
        MoveCardEvent,
        PutToCardsData,
        OpenEvent,
        CloseEvent,
        RemoveEvent,
        DamageEvent,
        ReduceHpEvent,
        DyingEvent,
        DieEvent,
        JudgeEvent,
        WatchHandData,
        WatchGeneralData,
        DrawCardsData,
        RecoverHpEvent,
        UseSkillEvent,
        LoseHpEvent,
        ChangeMaxHpEvent,
        GiveCardsData,
        ChainEvent,
        DropCardsData,
        StateChangeEvent,
        ChangeEvent,
        SkipEvent,
    };

    public get version() {
        return '1.0.0';
    }
    private coreLoaded: boolean = false;
    public extensions: string[] = [];
    private gamecardids = 0;
    private effctids = 0;

    public loadPackage: (name: string) => void;

    public init(side: string, loadp: (name: string) => void) {
        if (this.coreLoaded) {
            console.log('The core library has already been initialized');
            return;
        }
        globalThis.sgs = RESGS.getInstance();
        globalThis.lodash = _;
        this.side = side;
        //mixins
        Utils.mixins(GameCard, [ICard, Custom]);
        Utils.mixins(VirtualCard, [ICard]);
        Utils.mixins(General, [Custom]);
        Utils.mixins(GamePlayer, [Custom]);
        Utils.mixins(GameRoom, [
            Custom,
            RoomBroadCastMixin,
            RoomPlayerMixin,
            RoomGeneralMixin,
            RoomSkillMixin,
            RoomHistoryMixin,
            RoomHandleMixin,
            RoomChooseMixin,
            RoomJsonMixin,
            RoomCardMixin,
        ]);
        Utils.mixins(Skill, [Custom]);
        Utils.mixins(Effect, [Custom]);

        //默认游戏规则
        const rules = this.Skill({
            name: 'default_rules',
        });

        //默认游戏模式
        this.modes.set(
            'default',
            this.GameMode({
                name: 'default',
                maxPlayer: 2,
                rules,
                settings: [],
            })
        );
        this.loadPackage = loadp;
        this.coreLoaded = true;
        //手动加载所有包
        if (this.side === 'preview') {
            require(`../extensions/standard/index`);
            require(`../extensions/shenhua/index`);
            require(`../extensions/yijiang/index`);
            require(`../extensions/mlongxuexuanhuang/index`);
            require(`../extensions/mxiuliqiankun/index`);
            require(`../extensions/wars/index`);
            require(`../extensions/doudizhu/index`);
            require(`../extensions/lang/index`);
        }
    }

    /** 所有扩展包 */
    public readonly packages: Map<string, Package> = new Map();
    /** 所有模式 */
    protected readonly modes: Map<string, GameModeData> = new Map();
    /** 所有游戏牌 */
    protected readonly cards: Map<GameCardId, GameCardData> = new Map();
    /** 所有武将牌 */
    public readonly generals: Map<GeneralId, GeneralData> = new Map();
    /** 所有卡牌使用技能 */
    protected readonly cardskills: Map<string, CardUseSkillData> = new Map();
    /** 技能 */
    protected readonly skills: SkillData[] = [];
    /** 效果 */
    protected readonly effects: (TriggerEffectData | StateEffectData)[] = [];

    public common_rules: Map<string, StateEffectData | TriggerEffectData> =
        new Map();

    public copy(
        data: TriggerEffectData | StateEffectData,
        new_data?: Partial<TriggerEffectData | StateEffectData>
    ): TriggerEffectData;
    public copy(
        data: TriggerEffectData,
        new_data?: Partial<TriggerEffectData>
    ): TriggerEffectData;
    public copy(
        data: StateEffectData,
        new_data?: Partial<StateEffectData>
    ): StateEffectData;
    public copy(data: SkillData, new_data?: Partial<SkillData>): SkillData;
    /** 复制一个数据 */
    public copy(data: any, new_data?: any): any {
        if (new_data) {
            return Object.assign(
                lodash.cloneDeep(data),
                lodash.cloneDeep(new_data)
            );
        } else {
            return lodash.cloneDeep(data);
        }
    }

    /** 创建一个扩展包 */
    public Package(name: string) {
        if (this.packages.has(name)) {
            console.log(
                `The package:${name} already exists and will be overwritten`
            );
        }
        const pkg = new Package(name);
        this.packages.set(name, pkg);
        return pkg;
    }

    /** 创建一张游戏牌 */
    public GameCard({
        name,
        suit = CardSuit.None,
        number = CardNumber.None,
        attr = [],
        derived = false,
    }: CreateGameCard): GameCardData {
        const card = {
            id: `00${this.gamecardids++}`,
            name,
            suit,
            number,
            attr,
            derived,
            package: 'defalut',
        };
        this.cards.set(card.id, card);
        return card;
    }

    /** 创建一张武将牌 */
    public General({
        name = 'sb',
        kingdom = 'none',
        hp = 4,
        gender = Gender.None,
        skills = [],
        lord = false,
        enable = true,
        hidden = false,
        isDualImage = false,
        isWars = false,
    }: CreateGeneral): GeneralData & {
        addSkill: (skill: SkillData | string, derivative?: boolean) => void;
    } {
        const general = {
            id: name,
            name,
            kingdom,
            hp,
            gender,
            skills,
            lord,
            enable,
            hidden,
            package: [] as any,
            isDualImage,
            isWars,
        };
        if (this.generals.get(general.id)) {
            console.log('重复的武将牌：', general.id);
        }
        this.generals.set(general.id, general);

        return Object.assign(general, {
            addSkill: (skill: SkillData | string, derivative = false) => {
                if (typeof skill === 'string') {
                    general.skills.push(derivative ? `#${skill}` : skill);
                } else {
                    general.skills.push(
                        derivative ? `#${skill.name}` : skill.name
                    );
                    if (!this.skills.includes(skill)) {
                        this.skills.push(skill);
                    }
                }
            },
        });
    }

    /** 创建一个游戏模式 */
    public GameMode({
        name = 'default',
        maxPlayer = 2,
        settings = [],
        rules = 'default_rules',
        mainProcess,
    }: CreateMode): GameModeData {
        if (this.modes.get(name)) {
            console.log(
                `The mode:${name} already exists and will be overwritten`
            );
        }
        const mode: GameModeData = {
            name,
            maxPlayer,
            settings,
            rules: typeof rules === 'string' ? rules : rules.name,
            mainProcess,
        };
        this.modes.set(name, mode);
        return mode;
    }

    /** 创建一个卡牌使用技能 */
    public CardUse({
        name = 'sha',
        method = 1,
        trigger = EventTriggers.None,
        sameTime = false,
        effects = [],
        prompt = function () {
            return {
                prompt: `@${this.name}`,
                thinkPrompt: `@@${this.name}`,
            };
        },
        condition = function () {
            return true;
        },
        timeCondition = function () {
            return Infinity;
        },
        distanceCondition = function () {
            return true;
        },
        target,
        onuse = async function () {},
        effect = async function () {},
    }: CreateCardUseSkill): CardUseSkillData & {
        addEffect: (
            effect: TriggerEffectData | StateEffectData | string
        ) => void;
    } {
        const key = `${name}.${method}`;
        if (this.cardskills.has(key)) {
            console.log(
                `The carduse:${key} already exists and will be overwritten`
            );
        }
        const skill: CardUseSkillData = {
            name,
            method,
            trigger,
            sameTime,
            effects,
            prompt,
            condition,
            timeCondition,
            distanceCondition,
            target,
            onuse,
            effect,
        };
        this.cardskills.set(key, skill);
        return Object.assign(skill, {
            addEffect: (
                effect: TriggerEffectData | StateEffectData | string
            ) => {
                if (typeof effect === 'string') {
                    skill.effects.push(effect);
                } else {
                    if (!effect.name)
                        effect.name = `${skill.name}${skill.method}${skill.effects.length}`;
                    skill.effects.push(effect.name);
                }
            },
        });
    }

    /** 创建一个装备卡牌的使用技能 */
    public CardUseEquip({
        name = 'sha',
        effects = [],
        condition = function () {
            return true;
        },
        timeCondition = function () {
            return Infinity;
        },
        distanceCondition = function () {
            return true;
        },
        onuse = async function () {},
    }: CreateCardUseEquipSkill): CardUseSkillData & {
        addEffect: (
            effect: TriggerEffectData | StateEffectData | string
        ) => void;
    } {
        return this.CardUse({
            name,
            method: 1,
            trigger: EventTriggers.PlayPhaseProceeding,
            effects,
            prompt: function (room, from, card) {
                return {
                    prompt: `@${card.name}`,
                    thinkPrompt: `@@${card.name}`,
                };
            },
            condition,
            timeCondition,
            distanceCondition,
            target: function (room, from, card) {
                return {
                    type: 'player',
                    count: 1,
                    filter: function (item, seletcted) {
                        return from === item;
                    },
                    auto: true,
                };
            },
            onuse,
            effect: async function () {},
        });
    }

    /** 创建一个技能 */
    public Skill({
        name,
        audio,
        condition = function () {
            return true;
        },
        global = function () {
            return false;
        },
        visible = function () {
            return true;
        },
        attached_kingdom,
        attached_equip,
        effects = [],
        regard_skills = [],
    }: CreateSkill): SkillData & {
        addEffect: (
            effect: TriggerEffectData | StateEffectData | string
        ) => void;
    } {
        const skill: SkillData = {
            name,
            audio,
            condition,
            global,
            visible,
            attached_kingdom,
            attached_equip,
            effects,
            regard_skills,
        };
        this.skills.push(skill);
        return Object.assign(skill, {
            addEffect: (
                effect: TriggerEffectData | StateEffectData | string
            ) => {
                if (typeof effect === 'string') {
                    skill.effects.push(effect);
                } else {
                    if (!effect.name)
                        effect.name = `${skill.name}${skill.effects.length}`;
                    skill.effects.push(effect.name);
                    if (!this.effects.includes(effect)) {
                        this.effects.push(effect);
                    }
                }
            },
        });
    }

    /** 创建一个触发效果 */
    public TriggerEffect({
        name,
        tag = [],
        mark = [],
        regard_skill,
        priorityType = PriorityType.General,
        trigger = EventTriggers.None,
        anim = 'text',
        audio,
        auto_sort = true,
        auto_log = 0,
        auto_directline = 0,
        exclues_limitAni = false,
        forced = 'mute',
        getSelectors = function () {
            return {};
        },
        can_trigger = function () {
            return false;
        },
        context,
        cost = async function () {
            return true;
        },
        effect = async function () {},
        lifecycle = [],
    }: CreateTriggerEffect): TriggerEffectData {
        const e: TriggerEffectData = {
            name,
            tag,
            mark,
            regard_skill,
            type: EffectType.Trigger,
            priorityType,
            trigger,
            anim,
            audio,
            auto_sort,
            auto_log,
            auto_directline,
            exclues_limitAni,
            forced,
            getSelectors,
            can_trigger,
            context,
            cost,
            effect,
            lifecycle,
        };
        this.effects.push(e);
        return e;
    }

    /** 创建一个状态效果 */
    public StateEffect(data: CreateStateEffect): StateEffectData {
        const e: StateEffectData = Object.assign({}, data, {
            type: EffectType.State,
        }) as any;
        if (!e.lifecycle) {
            e.lifecycle = [];
        }
        if (!e.tag) {
            e.tag = [];
        }
        if (!e.mark) {
            e.mark = [];
        }
        this.effects.push(e);
        return e;
    }

    /** 获取一个扩展包 */
    public getPackage(name?: string) {
        return this.packages.get(name);
    }

    /** 获取一个游戏模式 */
    public getGameMode(name: string) {
        return this.modes.get(name) ?? this.modes.get('default');
    }

    /** 获取一个技能 */
    public getSkill(name: string) {
        return this.skills.find((v) => v.name === name);
    }

    public getSkillByEquip(name: string) {
        return this.skills.find((v) => v.attached_equip === name);
    }

    /** 获取一个效果 */
    public getEffect(name: string) {
        return this.effects.find((v) => v.name === name);
    }

    /** 获取一个卡牌使用技能 */
    public getCardUse(name: string, method: number = 1) {
        return this.cardskills.get(`${name}.${method}`);
    }

    /** 获取一张卡牌的所有使用技能 */
    public getCardUseFromName(name: string): CardUseSkillData[] {
        const result: CardUseSkillData[] = [];
        this.cardskills.forEach((v) => {
            if (v.name === name) result.push(v);
        });
        return result;
    }

    public card2datas: {
        [key: string]: {
            type: CardType;
            subtype: CardSubType;
            damage: boolean;
            recover: boolean;
            length: number;
            rhyme: string;
        };
    } = {};

    public setCardData(
        card: string,
        {
            type = CardType.Basic,
            subtype = CardSubType.Basic,
            damage = false,
            recover = false,
            length = 1,
            rhyme = 'a',
        }: Partial<{
            type: CardType;
            subtype: CardSubType;
            damage: boolean;
            recover: boolean;
            length: number;
            rhyme: string;
        }> = {}
    ) {
        this.card2datas[card] = arguments[1];
    }

    /** 珠联璧合关系 */
    public relationships: [string, string][] = [];
    public setRelationship(id1: string, id2: string) {
        this.relationships.push([id1, id2]);
    }

    /** 翻译表 */
    public translations: { [lang: string]: { [key: string]: string } } = {};
    /** 游戏内显示的概念讲解。以翻译中出现对应的key值关键词为准 */
    public concept: { [lang: string]: { [key: string]: string } } = {};
    /** 武将资源映射表 */
    public generalAssets: { [key: string]: GeneralAssetsMappingType } = {};
    /** 技能资源映射表 */
    public skillAssets: { [key: string]: SkillAssetsMappingType } = {};

    public loadTranslation(
        ts: { [key: string]: string } = {},
        lang: string = this.lang
    ) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        for (let key in ts) {
            this.translations[lang][key] = ts[key];
        }
    }

    public getTranslation(source: string, lang: string = this.lang) {
        if (!source) return '';
        return this.translations[lang]?.[source] ?? source;
    }

    public loadConcept(
        ts: { [key: string]: string } = {},
        lang: string = this.lang
    ) {
        if (!this.concept[lang]) {
            this.concept[lang] = {};
        }
        for (let key in ts) {
            this.concept[lang][key] = ts[key];
        }
    }

    public getConcept(source: string, lang: string = this.lang) {
        if (!source) return '';
        return this.concept[lang]?.[source] ?? source;
    }

    public GeneralAssetMapping(
        key: GeneralData | string,
        map: Partial<GeneralAssetsMappingType>
    ) {
        const name = typeof key === 'string' ? key : key.name;
        const tureName = name.split('.').at(-1);
        let oldmap = this.generalAssets[name];
        const defalut_dual = `generals/${tureName}/image.dual`;
        const defalut_self = `generals/${tureName}/image.dual/self`;
        const {
            extensions_url = oldmap?.extensions_url,
            image = oldmap?.image ?? `generals/${tureName}/image`,
            image_dual = oldmap?.image_dual ?? defalut_dual,
            image_self = oldmap?.image_self ?? defalut_self,
            death = oldmap?.death ?? `generals/${tureName}/death`,
            skins = oldmap?.skins ?? [],
        } = map;
        this.generalAssets[name] = {
            extensions_url,
            image,
            image_dual,
            image_self,
            death,
            skins,
        };
    }

    public SkillAssetMapping(
        key: SkillData | string,
        map: Partial<SkillAssetsMappingType>
    ) {
        const name = typeof key === 'string' ? key : key.name;
        let oldmap = this.skillAssets[name];
        const { audios = oldmap?.audios ?? [] } = map;
        this.skillAssets[name] = {
            audios,
        };
    }

    /** 武将信息 */
    public GeneralSetting(
        general: GeneralData | string,
        data: GeneralTranslationData = {}
    ) {
        const name = typeof general === 'string' ? general : general.name;
        const {
            id,
            version,
            title,
            prefix,
            painter,
            cv,
            script,
            rs,
            extensions_url,
            death_audio,
            image_url,
            image_dual_url,
            image_self_url,
            death_url,
            skills,
            skins,
        } = data;
        this.loadTranslation({
            [`@id:${name}`]: id,
            [`@title:${name}`]: title,
            [`@prefix:${name}`]: prefix,
            [`@painter:${name}`]: painter,
            [`@cv:${name}`]: cv,
            [`@rs:${name}`]: rs,
            [`@script:${name}`]: script,
            [`@death:${name}`]: death_audio,
            [`@version:${name}`]: version,
        });
        this.GeneralAssetMapping(general, {
            extensions_url: extensions_url,
            image: image_url,
            death: death_url,
            image_dual: image_dual_url,
            image_self: image_self_url,
        });
        //技能部分
        if (skills) {
            for (const key in skills) {
                this.SkillSetting(key, skills[key]);
            }
        }
        //皮肤部分
        if (skins) {
            // this.AssetMapping(general, {
            //     skins,
            // });
            //皮肤名称
            //@skinname_{皮肤ID}:{武将名}
            //皮肤死亡
            //@skindeath_{皮肤ID}:{武将名}
            //皮肤配音翻译
            //@skinaudio{原皮配音序号}_{皮肤ID}:{技能名}
        }
    }

    public SkillSetting(
        skill: SkillData | string,
        data: SkillTranslationData = {}
    ) {
        const name = typeof skill === 'string' ? skill : skill.name;
        this.loadTranslation({
            [name]: data.name,
            [`@desc:${name}`]: data.desc,
            [`@desc2:${name}`]: data.desc2,
        });
        const audio_urls: string[] = [];
        data.audios?.forEach((v, i) => {
            this.loadTranslation({
                [`@audio${i}:${name}`]: v.lang,
            });
            audio_urls.push(v.url);
        });
        this.SkillAssetMapping(skill, { audios: audio_urls });
    }

    public cac_skill(skill: string) {
        return `是否发动技能[b]${this.getTranslation(skill)}[/b]`;
    }
}

export const sgs = RESGS.getInstance();

declare global {
    var sgs: RESGS;
    var lodash: typeof _;
}
