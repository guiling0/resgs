import { Mark } from './Mark';
import type { Room } from './Room';
import { sync } from '../state/decorators';
import {
    defaultGeneralDeath,
    defaultGeneralImage,
    defaultGeneralImageDual,
    defaultGeneralImageDualSelf,
} from '../utils/AssetsUtils';
import type { GeneralSkin } from '../types/AssetsTypes';
import type { Gender, GeneralData } from '../types/GeneralTypes';

/**
 * 武将——继承 Mark 具备标记能力。
 * 源数据（sourceData）在构造时解析（hp 数组展开/多势力分割/trueName），属性经 getter 动态暴露。
 */
export class General extends Mark {
    readonly room: Room;
    /** 当前使用的皮肤名（默认取源数据 defaultSkin，可经 setSkin 切换） */
    private _skin: string;
    /** 放置方式（true=明置，false=暗置）——TODO(R8): 国战明置机制同步语义细化 */
    @sync() put: boolean = false;
    /** 解析后的源数据（外部可读，状态效果修正直接改此数据） */
    readonly sourceData: {
        id: string;
        name: string;
        trueName: string;
        kingdom: string;
        kingdom2: string;
        kingdoms: string[];
        hp: number;
        hpmax: number;
        shield: number;
        gender: Gender;
        skills: string[];
        lord: boolean;
        isWars: boolean;
        enable: boolean;
        /** 默认皮肤名 */
        defaultSkin?: string;
    };

    constructor(room: Room, data: GeneralData) {
        super();
        this.room = room;
        const kingdoms = data.kingdom.split(',');
        let hp: number;
        let hpmax: number;
        let shield: number;
        if (Array.isArray(data.hp)) {
            hp = data.hp[0];
            hpmax = data.hp[1];
            shield = data.hp[2] ?? 0;
        } else {
            hp = data.hp;
            hpmax = data.hp;
            shield = 0;
        }
        this.sourceData = {
            id: data.name,
            name: data.name,
            trueName: data.name.split('.').at(-1) || data.name,
            kingdom: kingdoms[0],
            kingdom2: kingdoms[1] ?? kingdoms[0],
            kingdoms,
            hp,
            hpmax,
            shield,
            gender: data.gender,
            skills: [...data.skills],
            lord: data.lord,
            isWars: data.isWars,
            enable: data.enable,
            defaultSkin: data.defaultSkin,
        };
        this._skin = data.defaultSkin ?? 'default';
        // 登记武将索引与真名列表
        room.generals.set(this.id, this);
        if (!room.generalNames.includes(this.trueName)) {
            room.generalNames.push(this.trueName);
        }
    }

    /** 武将 id（即武将名） */
    get id(): string {
        return this.sourceData.id;
    }

    /** 武将名 */
    get name(): string {
        return this.sourceData.name;
    }

    /** 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） */
    get trueName(): string {
        return this.sourceData.trueName;
    }

    /** 主势力 */
    get kingdom(): string {
        return this.sourceData.kingdom;
    }

    /** 次势力（双势力武将，单势力时同主势力） */
    get kingdom2(): string {
        return this.sourceData.kingdom2;
    }

    /** 势力列表（多势力分割） */
    get kingdoms(): string[] {
        return this.sourceData.kingdoms;
    }

    /** 当前体力值 */
    get hp(): number {
        return this.sourceData.hp;
    }

    /** 体力上限 */
    get hpmax(): number {
        return this.sourceData.hpmax;
    }

    /** 护盾值 */
    get shield(): number {
        return this.sourceData.shield;
    }

    /** 性别 */
    get gender(): Gender {
        return this.sourceData.gender;
    }

    /** 技能名列表（副本） */
    get skills(): string[] {
        return [...this.sourceData.skills];
    }

    /** 是否为主公/君主 */
    get lord(): boolean {
        return this.sourceData.lord;
    }

    /** 是否为国战武将 */
    get isWars(): boolean {
        return this.sourceData.isWars;
    }

    /** 是否启用 */
    get enable(): boolean {
        return this.sourceData.enable;
    }

    /** 是否为双势力武将 */
    isDual(): boolean {
        return this.kingdom !== this.kingdom2;
    }

    /** 是否与目标武将势力有交集 */
    sameAs(to: General): boolean {
        const a = this.isDual() ? [this.kingdom, this.kingdom2] : [this.kingdom];
        const b = to.isDual() ? [to.kingdom, to.kingdom2] : [to.kingdom];
        return a.some((k) => b.includes(k));
    }

    /** 是否为主公 */
    isLord(): boolean {
        return this.lord;
    }

    /** 设置放置方式（明置/暗置） */
    turnTo(put: boolean): void {
        if (this.put === put) return;
        this.put = put;
    }

    // ===== 动态资源（按武将真名共享皮肤，未配置走默认路径模板） =====

    /** 皮肤列表（按武将真名共享，未注册返回 undefined） */
    get resources(): GeneralSkin[] | undefined {
        return sgs.generalSkinMap.get(this.trueName);
    }

    /** 切换当前使用的皮肤 */
    setSkin(skinName: string): void {
        this._skin = skinName;
    }

    /** 指定皮肤（缺省当前使用的皮肤） */
    getSkin(skinName: string = this._skin): GeneralSkin | undefined {
        return this.resources?.find((s) => s.name === skinName);
    }

    /** 插画（完整 url） */
    getImage(skinName: string = this._skin): string {
        return this.getSkin(skinName)?.image ?? defaultGeneralImage(this.trueName, skinName);
    }

    /** 特殊插画-他人视角（未配置回退插画） */
    getDualImage(skinName: string = this._skin): string {
        return this.getSkin(skinName)?.imageDual ?? this.getImage(skinName);
    }

    /** 特殊插画-自己视角（未配置回退他人视角） */
    getDualImageSelf(skinName: string = this._skin): string {
        return this.getSkin(skinName)?.imageDualSelf ?? this.getDualImage(skinName);
    }

    /** 阵亡语音（完整 url；audios.death 第一条为阵亡语音） */
    getDeathAudio(skinName: string = this._skin): string {
        return this.getSkin(skinName)?.audios?.death?.[0]?.url ?? defaultGeneralDeath(this.trueName, skinName);
    }

    /** 阵亡语音文字（翻译表） */
    getDeathText(skinName: string = this._skin): string {
        return sgs.getTranslation(`general.${this.trueName}.${skinName}.death`);
    }
}
