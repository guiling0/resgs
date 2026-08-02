class RESGS {
    private static instance: RESGS;

    public static getInstance(): RESGS {
        if (!this.instance) {
            this.instance = new RESGS();
        }
        return this.instance;
    }

    private constructor() {}

    /** 运行环境 */
    public workSpace: 'server' | 'client' | 'preview' = 'preview';
    /** 当前语言 */
    public lang: string = 'zh_CN';

    public get version(): string {
        return 'v3.0';
    }

    private coreLoaded: boolean = false;

    /** 初始化内核——挂载 globalThis.sgs */
    public async init(
        workSpace: 'server' | 'client' | 'preview',
    ): Promise<void> {
        if (this.coreLoaded) return;
        globalThis.sgs = this;
        this.workSpace = workSpace;
        this.coreLoaded = true;
    }

    // ===== 静态数据 =====

    /** 游戏模式 */
    public readonly modes: Map<string, unknown> = new Map();
    /** 卡牌扩展包 */
    public readonly cardpacks: Map<string, unknown> = new Map();
    /** 游戏牌 */
    public readonly cards: Map<string, unknown> = new Map();
    /** 卡牌数据 */
    public readonly carddatas: Map<string, unknown> = new Map();
    /** 武将扩展包 */
    public readonly generalpacks: Map<string, unknown> = new Map();
    /** 武将牌 */
    public readonly generals: Map<string, unknown> = new Map();
    /** 技能 */
    public readonly skills: Map<string, unknown> = new Map();
    /** 效果 */
    public readonly effects: Map<string, unknown> = new Map();

    // ===== 翻译 =====

    public readonly translations: {
        [lang: string]: { [key: string]: string };
    } = {
        zh_CN: {},
    };

    public readonly concept: { [lang: string]: { [key: string]: string } } = {
        zh_CN: {},
    };

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

    public getTranslation(source?: string, lang: string = this.lang): string {
        if (!source) return '';
        return this.translations[lang]?.[source] ?? source;
    }

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

    public getConcept(source: string, lang: string = this.lang): string {
        if (!source) return '';
        return this.concept[lang]?.[source] ?? source;
    }
}

export const sgs = RESGS.getInstance();

declare global {
    var sgs: RESGS;
}
