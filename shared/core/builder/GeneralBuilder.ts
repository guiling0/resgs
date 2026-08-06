import { Gender, type GeneralData, type GeneralHp, type GeneralKingdom } from '../types/GeneralTypes';
import type { GeneralConfig } from '../types/AssetsTypes';

/** GeneralBuilder 实例接口——链式构建武将数据，不负责注册；name 为必传构造参数 */
export interface GeneralBuilder {
    readonly name: string;
    /** 设置势力（可用逗号分割多势力） */
    kingdom(k: GeneralKingdom): this;
    /** 设置体力（number 或 [体力, 上限, 护盾]） */
    hp(h: GeneralHp): this;
    /** 设置性别 */
    gender(g: Gender): this;
    /** 设置技能名列表 */
    skills(s: string[]): this;
    /** 标记为主公/君主 */
    lord(l?: boolean): this;
    /** 设置是否启用 */
    enable(e?: boolean): this;
    /** 设置在武将一览中隐藏 */
    hidden(h?: boolean): this;
    /** 标记为国战武将 */
    isWars(w?: boolean): this;
    /** 设置珠联璧合表 */
    rs(r: string[]): this;
    /** 设置默认皮肤名 */
    defaultSkin(d: string): this;
    /** 设置武将资源配置（注册武将时一并注册信息/技能翻译/皮肤） */
    config(d: GeneralConfig): this;
    /** 构建武将数据 */
    build(): GeneralData;
}

/** GeneralBuilder 工厂（sgs.GeneralBuilder）——无需 new */
export function GeneralBuilder(name: string): GeneralBuilder {
    return new _GeneralBuilder(name);
}

class _GeneralBuilder implements GeneralBuilder {
    readonly name: string;
    /** 势力 */
    private _kingdom: GeneralKingdom = 'qun';
    /** 体力 */
    private _hp: GeneralHp = 3;
    /** 性别 */
    private _gender: Gender = Gender.Male;
    /** 技能名列表 */
    private _skills: string[] = [];
    /** 是否为主公/君主 */
    private _lord: boolean = false;
    /** 是否启用 */
    private _enable: boolean = true;
    /** 是否在武将一览中隐藏 */
    private _hidden: boolean = false;
    /** 是否为国战武将 */
    private _isWars: boolean = false;
    /** 珠联璧合表 */
    private _rs?: string[];
    /** 默认皮肤名 */
    private _defaultSkin: string = 'default';
    /** 武将资源配置 */
    private _config?: GeneralConfig;

    constructor(name: string) {
        this.name = name;
    }

    kingdom(k: GeneralKingdom): this {
        this._kingdom = k;
        return this;
    }

    hp(h: GeneralHp): this {
        this._hp = h;
        return this;
    }

    gender(g: Gender): this {
        this._gender = g;
        return this;
    }

    skills(s: string[]): this {
        this._skills = s;
        return this;
    }

    lord(l: boolean = true): this {
        this._lord = l;
        return this;
    }

    enable(e: boolean = true): this {
        this._enable = e;
        return this;
    }

    hidden(h: boolean = true): this {
        this._hidden = h;
        return this;
    }

    isWars(w: boolean = true): this {
        this._isWars = w;
        return this;
    }

    rs(r: string[]): this {
        this._rs = r;
        return this;
    }

    defaultSkin(d: string): this {
        this._defaultSkin = d;
        return this;
    }

    config(d: GeneralConfig): this {
        this._config = d;
        return this;
    }

    build(): GeneralData {
        return {
            name: this.name,
            kingdom: this._kingdom,
            hp: this._hp,
            gender: this._gender,
            skills: [...this._skills],
            lord: this._lord,
            enable: this._enable,
            hidden: this._hidden,
            isWars: this._isWars,
            rs: this._rs ? [...this._rs] : undefined,
            defaultSkin: this._defaultSkin,
            config: this._config,
        };
    }
}

/** 构建并注册武将数据（sgs.General）——name 必传，内部经 GeneralBuilder 复用默认值；已注册则直接返回已有数据 */
export function General(input: Pick<GeneralData, 'name'> & Partial<GeneralData>): GeneralData {
    if (sgs.generals.has(input.name)) {
        return sgs.generals.get(input.name)!;
    }
    const b = GeneralBuilder(input.name);
    if (input.kingdom !== undefined) b.kingdom(input.kingdom);
    if (input.hp !== undefined) b.hp(input.hp);
    if (input.gender !== undefined) b.gender(input.gender);
    if (input.skills !== undefined) b.skills(input.skills);
    if (input.lord !== undefined) b.lord(input.lord);
    if (input.enable !== undefined) b.enable(input.enable);
    if (input.hidden !== undefined) b.hidden(input.hidden);
    if (input.isWars !== undefined) b.isWars(input.isWars);
    if (input.rs !== undefined) b.rs(input.rs);
    if (input.defaultSkin !== undefined) b.defaultSkin(input.defaultSkin);
    if (input.config !== undefined) b.config(input.config);
    const data = b.build();
    sgs.generals.set(data.name, data);
    if (data.config) {
        const trueName = data.name.split('.').at(-1) || data.name;
        sgs.registerGeneralAssets({ [trueName]: { ...data.config, name: data.name } });
    }
    return data;
}
