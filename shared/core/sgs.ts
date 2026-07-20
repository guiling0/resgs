import _ from 'lodash';
import {
    GameCardId,
    GameCardData,
    CardData,
    CardAttr,
    CardSuit,
    CardNumber,
    CardColor,
    CardType,
    CardSubType,
    EquipSubType,
    AreaType,
} from './card/CardTypes';
import { GeneralData, GeneralAssetsData, Gender } from './general/GeneralType';
import { CardPackData, GeneralPackData } from './packs/types';
import { EffectData, SkillAsset, SkillData, PriorityType, SkillTag, StateEffectType } from './skill/SkillTypes';
import { GameMode } from './room/GameMode';
import { CardUseData, TimingName, EventType, DamageType } from './event/EventTypes';
import { Phase } from './player/PlayerTypes';
import { SelectorType, PlayPhaseResult } from './select/SelectTypes';
import { SkillBuilder } from './skill/builder/SkillBuilder';
import { EffectBuilder } from './skill/builder/EffectBuilder';
import { registerCore } from './register';

class RESGS {
    private static instance: RESGS;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RESGS();
        }
        return this.instance;
    }

    private constructor() {}

    // ===== 核心枚举（由 registerCore 在 init() 中注入） =====
    // 事件
    public TimingName!: typeof TimingName;
    public EventType!: typeof EventType;
    public DamageType!: typeof DamageType;
    // 技能
    public PriorityType!: typeof PriorityType;
    public SkillTag!: typeof SkillTag;
    public StateEffectType!: typeof StateEffectType;
    // 卡牌
    public CardAttr!: typeof CardAttr;
    public CardSuit!: typeof CardSuit;
    public CardNumber!: typeof CardNumber;
    public CardColor!: typeof CardColor;
    public CardType!: typeof CardType;
    public CardSubType!: typeof CardSubType;
    public EquipSubType!: typeof EquipSubType;
    public AreaType!: typeof AreaType;
    // 玩家
    public Phase!: typeof Phase;
    // 选择
    public SelectorType!: typeof SelectorType;
    public PlayPhaseResult!: typeof PlayPhaseResult;
    // 武将
    public Gender!: typeof Gender;
    // Builder 类
    public SkillBuilder!: typeof SkillBuilder;
    public EffectBuilder!: typeof EffectBuilder;

    public workSpace: 'server' | 'client' | 'preview' = 'preview';
    public lang: string = 'zh_CN';

    public get version() {
        return 'v3.0';
    }

    private coreLoaded: boolean = false;

    public async init(workSpace: 'server' | 'client' | 'preview') {
        if (this.coreLoaded) {
            return;
        }
        globalThis.sgs = this;
        globalThis.lodash = _;
        this.workSpace = workSpace;
        registerCore(this);
        this.coreLoaded = true;
    }

    public readonly modes: Map<string, GameMode> = new Map();
    public readonly cardpacks: Map<string, CardPackData> = new Map();
    public readonly cards: Map<GameCardId, GameCardData> = new Map();
    public readonly carddatas: Map<string, CardData> = new Map();
    public readonly generalpacks: Map<string, GeneralPackData> = new Map();
    public readonly generals: Map<string, GeneralData> = new Map();
    public readonly generalAssets: Map<string, GeneralAssetsData> = new Map();
    public readonly skills: Map<string, SkillData> = new Map();
    public readonly effects: Map<string, EffectData> = new Map();
    public readonly skillsAssets: Map<string, SkillAsset> = new Map();
    /** 选择器预设（客户端据此渲染 UI） */
    public readonly selectors: Map<string, any> = new Map();
    /** 牌的默认使用方式定义（牌名 → CardUseData） */
    public readonly carduses: Map<string, CardUseData> = new Map();

    /** 翻译表 */
    public readonly translations: {
        [lang: string]: { [key: string]: string };
    } = {
        zh_CN: {},
    };
    /** 游戏内显示的概念讲解。以翻译中出现对应的key值关键词为准 */
    public readonly concept: { [lang: string]: { [key: string]: string } } = {
        zh_CN: {},
    };

    public loadTranslation(
        ts: { [key: string]: string } = {},
        lang: string = this.lang,
    ) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        for (let key in ts) {
            this.translations[lang][key] = ts[key];
        }
    }

    public getTranslation(source?: string, lang: string = this.lang) {
        if (!source) return '';
        return this.translations[lang]?.[source] ?? source;
    }

    public loadConcept(
        ts: { [key: string]: string } = {},
        lang: string = this.lang,
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
}

export const sgs = RESGS.getInstance();

declare global {
    var sgs: RESGS;
    var lodash: typeof _;
}
