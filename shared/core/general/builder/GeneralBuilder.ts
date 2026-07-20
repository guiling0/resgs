import { Gender, GeneralData, GeneralHp, GeneralKingdom } from '../GeneralType';

/** GeneralBuilder 实例接口 */
export interface GeneralBuilder {
    readonly name: string;
    kingdom(k: GeneralKingdom): this;
    hp(h: GeneralHp): this;
    gender(g: Gender): this;
    skills(s: string[]): this;
    lord(l?: boolean): this;
    enable(e?: boolean): this;
    hidden(h?: boolean): this;
    isWars(w?: boolean): this;
    rs(r: string[]): this;
    register(): GeneralData;
}

/** GeneralBuilder 工厂——无需 new */
export function GeneralBuilder(name: string): GeneralBuilder {
    return new _GeneralBuilder(name);
}

class _GeneralBuilder implements GeneralBuilder {
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

    register(): GeneralData {
        const existing = sgs.generals.get(this.name);
        if (existing) {
            console.warn(`[GeneralBuilder] 武将 "${this.name}" 已存在——跳过重复注册`);
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
