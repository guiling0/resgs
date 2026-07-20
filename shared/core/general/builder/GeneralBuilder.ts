import { Gender, GeneralData, GeneralHp, GeneralKingdom } from '../GeneralType';

export class GeneralBuilder {
    /** 武将名（即武将 ID） */
    readonly name: string;

    private _kingdom: GeneralKingdom = 'qun';
    private _hp: GeneralHp = 3;
    private _gender: Gender = Gender.Male;
    private _skills: string[] = [];
    private _lord: boolean = false;
    private _enable: boolean = true;
    private _hidden: boolean = false;
    private _isWars: boolean = false;
    private _rs?: string[];

    constructor(name: string) {
        this.name = name;
    }

    /** 势力（支持逗号分隔多势力，如 'wei,shu'） */
    kingdom(k: GeneralKingdom): this {
        this._kingdom = k;
        return this;
    }

    /** 体力值——number 为固定值，[初始,上限] 或 [初始,上限,护盾] */
    hp(h: GeneralHp): this {
        this._hp = h;
        return this;
    }

    /** 性别 */
    gender(g: Gender): this {
        this._gender = g;
        return this;
    }

    /** 技能名列表 */
    skills(s: string[]): this {
        this._skills = s;
        return this;
    }

    /** 是否为主公/君主（默认 false） */
    lord(l: boolean = true): this {
        this._lord = l;
        return this;
    }

    /** 是否启用（默认 true） */
    enable(e: boolean = true): this {
        this._enable = e;
        return this;
    }

    /** 是否在武将一览中隐藏（默认 false） */
    hidden(h: boolean = true): this {
        this._hidden = h;
        return this;
    }

    /** 是否为国战武将（默认 false） */
    isWars(w: boolean = true): this {
        this._isWars = w;
        return this;
    }

    /** 珠联璧合表 */
    rs(r: string[]): this {
        this._rs = r;
        return this;
    }

    /**
     * 构建 GeneralData 并写入 sgs.generals。
     * 幂等——重复调用不重复注册，返回已注册的数据。
     */
    register(): GeneralData {
        const existing = sgs.generals.get(this.name);
        if (existing) {
            return existing;
        }
        const data: GeneralData = {
            name: this.name,
            kingdom: this._kingdom,
            hp: this._hp,
            gender: this._gender,
            skills: this._skills,
            lord: this._lord,
            enable: this._enable,
            hidden: this._hidden,
            isWars: this._isWars,
            rs: this._rs,
        };
        sgs.generals.set(this.name, data);
        return data;
    }
}
