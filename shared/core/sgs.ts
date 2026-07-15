import _ from 'lodash';
import { GameCardId, GameCardData, CardData } from './card/CardTypes';
import { GeneralData, GeneralAssetsData } from './general/GeneralType';
import { CardPackData, GeneralPackData } from './packs/types';
import { EffectData, SkillAsset, SkillData } from './skill/SkillTypes';

class RESGS {
    private static instance: RESGS;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RESGS();
        }
        return this.instance;
    }

    private constructor() {}

    public workSpace: 'server' | 'client' | 'preview' = 'preview';
    public lang: string = 'zh_CN';

    public get version() {
        return 'v3.0';
    }

    private coreLoaded: boolean = false;

    public async init(workSpace: 'server' | 'client' | 'preview') {
        if (this.coreLoaded) {
            // logger.error('The core library has already been initialized');
            return;
        }
        globalThis.sgs = this;
        globalThis.lodash = _;
        this.workSpace = workSpace;
        this.coreLoaded = true;
    }

    public readonly cardpacks: Map<string, CardPackData> = new Map();
    public readonly cards: Map<GameCardId, GameCardData> = new Map();
    public readonly carddatas: Map<string, CardData> = new Map();
    public readonly generalpacks: Map<string, GeneralPackData> = new Map();
    public readonly generals: Map<string, GeneralData> = new Map();
    public readonly generalAssets: Map<string, GeneralAssetsData> = new Map();
    public readonly skills: Map<string, SkillData> = new Map();
    public readonly effects: Map<string, EffectData> = new Map();
    public readonly skillsAssets: Map<string, SkillAsset> = new Map();

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
