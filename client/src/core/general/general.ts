import { Area } from '../area/area';
import { CardPut } from '../card/card.types';
import { Custom, SetMark } from '../custom/custom';
import { GameRoom } from '../room/room';
import { Gender, GeneralData, GeneralId } from './general.type';

export class General {
    public constructor(room: GameRoom, protected data: GeneralData) {
        this.room = room;
        this.id = data.id;
        this.sourceData = {
            id: data.id,
            name: data.name,
            trueName: data.name.split('.').at(-1),
            kingdom: 'none',
            kingdom2: 'none',
            hp: 0,
            hpmax: 0,
            shield: 0,
            gender: data.gender,
            skills: data.skills.slice(),
            lord: data.lord,
            isDualImage: data.isDualImage,
            isWars: data.isWars ?? false,
            enable: data.enable,
            packages: data.package.slice(),
        };
        //kingdom
        if (Array.isArray(this.data.kingdom)) {
            this.sourceData.kingdom = this.data.kingdom[0];
            this.sourceData.kingdom2 = this.data.kingdom[1];
        } else {
            this.sourceData.kingdom = this.sourceData.kingdom2 =
                this.data.kingdom;
        }
        //hp
        if (Array.isArray(this.data.hp)) {
            this.sourceData.hp = this.data.hp[0];
            this.sourceData.hpmax = this.data.hp[1];
            this.sourceData.shield =
                this.data.hp.length > 2 ? this.data.hp[2] : 0;
        } else {
            this.sourceData.hp = this.sourceData.hpmax = this.data.hp;
            this.sourceData.shield = 0;
        }
    }

    public readonly sourceData: {
        id: GeneralId;
        name: string;
        trueName: string;
        kingdom: string;
        kingdom2: string;
        hp: number;
        hpmax: number;
        shield: number;
        gender: Gender;
        skills: string[];
        lord: boolean;
        isDualImage: boolean;
        isWars: boolean;
        enable: boolean;
        packages: string[];
    };

    /** 所属房间 */
    public readonly room: GameRoom;

    /** DataID */
    public readonly id: GeneralId;

    /** 所处区域 */
    public area: Area;

    /** 放置方式 */
    public put: CardPut;

    /** 可见角色 */
    public visibles: string[] = [];

    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void = (data) => {
        this.room.markChanges.push({
            objType: 'general',
            objId: this.id,
            key: data.key,
            value: data.value,
            options: data.options,
        });
    };

    /** 武将名 */
    public get name() {
        return this.sourceData.name;
    }

    public get trueName() {
        return this.sourceData.trueName;
    }

    /** 武将势力 */
    public get kingdom() {
        return this.sourceData.kingdom;
    }

    /** 武将副势力 */
    public get kingdom2() {
        return this.sourceData.kingdom2;
    }

    /** 初始体力值 */
    public get hp() {
        return this.sourceData.hp;
    }

    /** 初始体力上限 */
    public get hpmax() {
        return this.sourceData.hpmax;
    }

    /** 初始护盾 */
    public get shield() {
        return this.sourceData.shield;
    }

    /** 武将性别 */
    public get gender() {
        return this.sourceData.gender;
    }

    /** 武将技能 */
    public get skills() {
        return this.sourceData.skills;
    }

    /** 是否为双势力武将 */
    public isDual() {
        return this.kingdom !== this.kingdom2;
    }

    /** 是否与一张武将牌势力相同 */
    public sameAs(to: General) {
        let thisKindom: string[] = [],
            toKingdom: string[] = [];
        if (this.isDual()) {
            thisKindom = [this.kingdom, this.kingdom2];
        } else {
            thisKindom = [this.kingdom];
        }
        if (to.isDual()) {
            toKingdom = [to.kingdom, to.kingdom2];
        } else {
            toKingdom = [to.kingdom];
        }
        return lodash.intersection(thisKindom, toKingdom).length > 0;
    }

    isShibing() {
        return this.name.includes('shibing');
    }

    isLord() {
        return this.sourceData.lord;
    }

    /** 获取资源地址 */
    public getAssetsUrl(
        type: 'image' | 'dual_image' | 'self_image' | 'death'
    ): string {
        let data = sgs.generalAssets[this.name];
        if (!data) {
            data = {
                image: `generals/${this.trueName}/image`,
                image_dual: `generals/${this.trueName}/image.dual`,
                image_self: `generals/${this.trueName}/image.dual/self`,
                death: `generals/${this.trueName}/death`,
            };
        }
        if (type === 'death') {
            return `${data.death}.mp3`;
        }
        if (type === 'image') {
            return `${data.image}.png`;
        }
        if (type === 'dual_image') {
            return `${data.image_dual}.png`;
        }
        if (type === 'self_image') {
            return `${data.image_self}.png`;
        }
    }
}

export interface General extends Custom {}
