import { Card as buildCardData, CardBuilder as cardBuilderFactory } from './builder/CardBuilder';
import { General as buildGeneralData, GeneralBuilder as generalBuilderFactory } from './builder/GeneralBuilder';
import { Skill as buildSkillData, SkillBuilder as skillBuilderFactory } from './builder/SkillBuilder';
import { Effect as buildEffectData, EffectBuilder as effectBuilderFactory } from './builder/EffectBuilder';
import { consoleLogger } from './ConsoleLogger';
import type { ILogger } from './ILogger';
import type { CardData, GameCardData } from './types/CardTypes';
import type { GeneralData } from './types/GeneralTypes';
import type { CardPackageData, GeneralPackData } from './types/PackageTypes';
import type { EffectData, SkillData } from './types/SkillTypes';
import type { CardUseData } from './types/EventTypes';
import type { CardAssets, GeneralConfig, GeneralInfo, GeneralSkin } from './types/AssetsTypes';

class RESGS {
    private static instance: RESGS;
    /** 日志接口（构造注入） */
    private readonly logger: ILogger;

    public static getInstance(logger: ILogger = consoleLogger): RESGS {
        if (!this.instance) {
            this.instance = new RESGS(logger);
        }
        return this.instance;
    }

    private constructor(logger: ILogger) {
        this.logger = logger;
    }

    /** 运行环境 */
    public workSpace: 'server' | 'client' | 'preview' = 'preview';
    /** 当前语言 */
    public lang: string = 'zh_CN';

    public get version(): string {
        return 'v3.0';
    }

    /** 内核是否已加载 */
    private coreLoaded: boolean = false;

    /** 初始化内核——挂载 globalThis.sgs */
    public async init(
        workSpace: 'server' | 'client' | 'preview',
    ): Promise<void> {
        if (this.coreLoaded) return;
        globalThis.sgs = this;
        this.workSpace = workSpace;
        this.coreLoaded = true;
        this.logger.info('sgs 内核初始化', { workSpace });
    }

    // ===== 静态数据 =====

    /** 游戏模式 */
    public readonly modes: Map<string, unknown> = new Map();
    /** 卡牌扩展包 */
    public readonly cardpacks: Map<string, CardPackageData> = new Map();
    /** 游戏牌（实体牌数据，id → 数据） */
    public readonly cards: Map<string, GameCardData> = new Map();
    /** 卡牌定义数据（牌名 → 定义，供类别/副类别派生） */
    public readonly carddatas: Map<string, CardData> = new Map();
    /** 武将扩展包 */
    public readonly generalpacks: Map<string, GeneralPackData> = new Map();
    /** 武将牌（武将数据，武将名 → 数据） */
    public readonly generals: Map<string, GeneralData> = new Map();
    /** 技能 */
    public readonly skills: Map<string, SkillData> = new Map();
    /** 效果 */
    public readonly effects: Map<string, EffectData> = new Map();
    /** 牌的默认使用方式定义（同名多方式以 timing 区分；经 CardUse 注册，开局 initCardUses 拷贝到房间） */
    public readonly carduses: CardUseData[] = [];

    // ===== 动态资源 =====

    /** 卡牌资源（牌名 → 资源） */
    public readonly cardAssets: Map<string, CardAssets> = new Map();
    /** 武将信息（武将全名 → 信息） */
    public readonly generalInfoMap: Map<string, GeneralInfo> = new Map();
    /** 武将皮肤（武将真名 → 皮肤列表，重复注册 push 且皮肤名去重） */
    public readonly generalSkinMap: Map<string, GeneralSkin[]> = new Map();

    // ===== 卡牌构建与注册 =====

    /** 实体牌数据构建器（链式，sgs.CardBuilder('sha')） */
    public readonly CardBuilder = cardBuilderFactory;
    /** 实体牌数据构建（全可选字段，sgs.Card({ name: 'sha' })） */
    public readonly Card = buildCardData;
    /** 武将数据构建器（链式，name 必传，sgs.GeneralBuilder('caocao')） */
    public readonly GeneralBuilder = generalBuilderFactory;
    /** 武将数据构建（name 必传，其余可选，sgs.General({ name: 'caocao' })） */
    public readonly General = buildGeneralData;
    /** 技能数据构建器（链式，name 必传，sgs.SkillBuilder('jianxiong')） */
    public readonly SkillBuilder = skillBuilderFactory;
    /** 技能数据构建（name 必传，其余可选，sgs.Skill({ name: 'jianxiong' })） */
    public readonly Skill = buildSkillData;
    /** 效果数据构建器（链式，name 必传，sgs.EffectBuilder('jianxiong.draw')） */
    public readonly EffectBuilder = effectBuilderFactory;
    /** 效果数据构建（name 必传，其余可选，sgs.Effect({ name: 'jianxiong.draw' })） */
    public readonly Effect = buildEffectData;

    /**
     * 注册牌的默认使用方式（幂等：同名同时机已存在则跳过）。
     * 使用方式定义牌在出牌/响应阶段的行为（合法目标/距离条件/牌面效果），
     * 开局经 room.initCardUses 拷贝到房间索引。
     */
    public CardUse(data: CardUseData): CardUseData {
        const exists = this.carduses.some(
            (c) => c.name === data.name && c.timing === data.timing,
        );
        if (exists) {
            this.logger.warn('卡牌使用方式已存在——跳过', { name: data.name, timing: data.timing });
            return data;
        }
        this.carduses.push(data);
        this.logger.info('卡牌使用方式注册', { name: data.name, timing: data.timing });
        return data;
    }

    /**
     * 注册卡牌扩展包：为包内全部实体牌分配 ID（{扩展名}.{扩展内自增序号}）并注册到 sgs.cards。
     * 自增序号在扩展包内共享递增；重复注册同扩展包被跳过。
     */
    public registerCardPack(name: string, cards: GameCardData[]): CardPackageData {
        if (this.cardpacks.has(name)) {
            this.logger.warn('卡牌扩展包已注册——跳过', { pack: name });
            return this.cardpacks.get(name)!;
        }
        const registered = cards.map((card, i) => ({ ...card, id: `${name}.${i + 1}` }));
        for (const card of registered) {
            if (this.cards.has(card.id)) {
                this.logger.warn('实体牌已存在——跳过', { cardId: card.id });
                continue;
            }
            this.cards.set(card.id, card);
        }
        const pack: CardPackageData = { name, cards: registered };
        this.cardpacks.set(name, pack);
        this.logger.info('卡牌扩展包注册', { pack: name, count: registered.length });
        return pack;
    }

    /**
     * 注册武将扩展包：包内武将（武将名即 id）注册到 sgs.generals，扩展包登记到 sgs.generalpacks。
     * 重复注册同扩展包被跳过。
     */
    public registerGeneralPack(name: string, generals: GeneralData[]): GeneralPackData {
        if (this.generalpacks.has(name)) {
            this.logger.warn('武将扩展包已注册——跳过', { pack: name });
            return this.generalpacks.get(name)!;
        }
        for (const g of generals) {
            if (this.generals.has(g.name)) {
                this.logger.warn('武将已存在——跳过', { general: g.name });
                continue;
            }
            this.generals.set(g.name, g);
            if (g.config) {
                const trueName = g.name.split('.').at(-1) || g.name;
                this.registerGeneralAssets({ [trueName]: { ...g.config, name: g.name } });
            }
        }
        const pack: GeneralPackData = { name, generals };
        this.generalpacks.set(name, pack);
        this.logger.info('武将扩展包注册', { pack: name, count: generals.length });
        return pack;
    }

    // ===== 资源注册 =====

    /** 注册卡牌资源（牌名 → 资源，同名共享） */
    public registerCardAssets(assets: Record<string, CardAssets>): void {
        for (const [name, data] of Object.entries(assets)) {
            this.cardAssets.set(name, data);
        }
    }

    /**
     * 注册武将资源配置（按武将真名，同名武将共享皮肤）。
     * info 按武将全名入 generalInfoMap 并全字段注入翻译表（general.{武将名}.{字段}）；
     * skills 只写入翻译表（skill.{技能全名}.name/desc/desc2）；
     * skins 按武将真名入 generalSkinMap（重复注册 push 且皮肤名去重），配音文字写入翻译表。
     */
    public registerGeneralAssets(assets: Record<string, GeneralConfig>): void {
        for (const [trueName, data] of Object.entries(assets)) {
            const name = data.name ?? trueName;
            const info = data.info;
            if (info) {
                this.generalInfoMap.set(name, info);
                if (info.id) this.loadTranslation({ [`general.${name}.id`]: info.id });
                if (info.version) this.loadTranslation({ [`general.${name}.version`]: info.version });
                if (info.title) this.loadTranslation({ [`general.${name}.title`]: info.title });
                if (info.prefix) this.loadTranslation({ [`general.${name}.prefix`]: info.prefix });
                if (info.designer) this.loadTranslation({ [`general.${name}.designer`]: info.designer });
                if (info.script) this.loadTranslation({ [`general.${name}.script`]: info.script });
            }
            for (const [skillFullName, st] of Object.entries(data.skills ?? {})) {
                if (st.lang_name) this.loadTranslation({ [`skill.${skillFullName}.name`]: st.lang_name });
                if (st.lang_desc) this.loadTranslation({ [`skill.${skillFullName}.desc`]: st.lang_desc });
                if (st.lang_desc2) this.loadTranslation({ [`skill.${skillFullName}.desc2`]: st.lang_desc2 });
            }
            const skins = this.generalSkinMap.get(trueName) ?? [];
            for (const skin of data.skins) {
                if (skins.some((s) => s.name === skin.name)) continue;
                skins.push(skin);
                for (const [audioKey, audios] of Object.entries(skin.audios ?? {})) {
                    if (audioKey === 'death') {
                        if (audios[0]?.text) {
                            this.loadTranslation({ [`general.${trueName}.${skin.name}.death`]: audios[0].text });
                        }
                    } else {
                        audios.forEach((a, i) => {
                            if (a.text) {
                                this.loadTranslation({ [`skill.${trueName}.${skin.name}.${audioKey}${i}`]: a.text });
                            }
                        });
                    }
                }
            }
            this.generalSkinMap.set(trueName, skins);
        }
    }

    // ===== 翻译 =====

    /** 翻译表（语言 → 文案） */
    public readonly translations: {
        [lang: string]: { [key: string]: string };
    } = {
        zh_CN: {},
    };

    /** 概念表（语言 → 定义） */
    public readonly concept: { [lang: string]: { [key: string]: string } } = {
        zh_CN: {},
    };

    /** 加载翻译表 */
    public loadTranslation(
        ts: { [key: string]: string } = {},
        lang: string = this.lang,
    ): void {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        for (const key in ts) {
            this.translations[lang][key] = ts[key];
        }
    }

    /** 读取翻译（无翻译时返回原文） */
    public getTranslation(source?: string, lang: string = this.lang): string {
        if (!source) return '';
        return this.translations[lang]?.[source] ?? source;
    }

    /** 加载概念表 */
    public loadConcept(
        ts: { [key: string]: string } = {},
        lang: string = this.lang,
    ): void {
        if (!this.concept[lang]) {
            this.concept[lang] = {};
        }
        for (const key in ts) {
            this.concept[lang][key] = ts[key];
        }
    }

    /** 读取概念（无定义时返回原文） */
    public getConcept(source: string, lang: string = this.lang): string {
        if (!source) return '';
        return this.concept[lang]?.[source] ?? source;
    }
}

export const sgs = RESGS.getInstance();

// 全局 sgs（持有全部静态数据，扩展代码直接 sgs.xxx 访问）
globalThis.sgs = sgs;

declare global {
    var sgs: RESGS;
}
