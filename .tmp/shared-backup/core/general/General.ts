import { MapSchema } from '@colyseus/schema';
import { Room } from '../room/Room';
import { GeneralState } from '../schema/GeneralState';
import { MarkState } from '../schema/MarkState';
import {
    Gender,
    GeneralAssetsData,
    GeneralData,
    GeneralId,
} from './GeneralType';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { AreaId } from '../card/CardTypes';
import { RichString } from '../RichText';

export class General implements MarkHost {
    readonly id: GeneralId;
    readonly room: Room;
    readonly _jsondata: GeneralData;
    readonly state: GeneralState;
    readonly data: Record<string, any> = {};
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap = new Map<string, Set<string>>();

    readonly sourceData: {
        id: GeneralId;
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
        source: GeneralData;
    };

    constructor(data: GeneralData, room: Room, state: GeneralState) {
        this.id = data.name;
        this.room = room;
        this._jsondata = data;
        this.state = state;
        this.state.id = data.name;
        this.marksMap = state.markStates;

        const kingdoms = data.kingdom.split(',');

        let hp: number, hpmax: number, shield: number;
        if (Array.isArray(data.hp)) {
            hp = data.hp[0];
            hpmax = data.hp[1];
            shield = data.hp.length > 2 ? (data.hp[2] as number) : 0;
        } else {
            hp = hpmax = data.hp;
            shield = 0;
        }

        this.sourceData = {
            id: data.name,
            name: data.name,
            trueName: data.name.split('.').at(-1) || data.name,
            kingdom: kingdoms[0],
            kingdom2: kingdoms.length > 1 ? kingdoms[1] : kingdoms[0],
            kingdoms,
            hp,
            hpmax,
            shield,
            gender: data.gender,
            skills: [...data.skills],
            lord: data.lord,
            isWars: data.isWars ?? false,
            enable: data.enable,
            source: data,
        };
    }

    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    get name(): string {
        return this.sourceData.name;
    }
    get trueName(): string {
        return this.sourceData.trueName;
    }
    get kingdom(): string {
        return this.sourceData.kingdom;
    }
    get kingdom2(): string {
        return this.sourceData.kingdom2;
    }
    get kingdoms(): string[] {
        return this.sourceData.kingdoms;
    }
    get hp(): number {
        return this.sourceData.hp;
    }
    get hpmax(): number {
        return this.sourceData.hpmax;
    }
    get shield(): number {
        return this.sourceData.shield;
    }
    get gender(): Gender {
        return this.sourceData.gender;
    }
    get skills(): string[] {
        return this.sourceData.skills;
    }
    get enable(): boolean {
        return this.sourceData.enable;
    }
    get isWars(): boolean {
        return this.sourceData.isWars;
    }
    get lord(): boolean {
        return this.sourceData.lord;
    }

    get area(): AreaId {
        return this.state.area;
    }

    get put() {
        return this.state.put;
    }

    turnTo(put: boolean) {
        this.state.put = put;
    }

    setLabel(label: RichString, area?: string) {
        if (area && area !== this.area) {
            return;
        }
        this.data.label = label;
    }

    isDual(): boolean {
        return this.kingdom !== this.kingdom2;
    }

    sameAs(to: General): boolean {
        const a = this.isDual()
            ? [this.kingdom, this.kingdom2]
            : [this.kingdom];
        const b = to.isDual() ? [to.kingdom, to.kingdom2] : [to.kingdom];
        return a.some((k) => b.includes(k));
    }

    isLord(): boolean {
        return this.sourceData.lord;
    }

    isShibing(): boolean {
        return this.name.includes('shibing');
    }

    isYexinjia(): boolean {
        return this.kingdom === 'ye' || this.kingdom2 === 'ye';
    }

    getAssetsUrl(
        type: 'image' | 'dual_image' | 'self_image' | 'death',
        skinName = 'default',
    ): string {
        const data = this.getSkinData(skinName);
        const base = `generals/${data?.baseUrl ?? this.name}`;

        switch (type) {
            case 'death':
                return data.audios?.death?.url
                    ? data.audios.death.url.includes('/')
                        ? `generals/${data.audios.death.url}.mp3`
                        : `${base}/${data.audios.death.url}.mp3`
                    : `${base}/death.mp3`;
            case 'image':
                return data.image?.includes('/')
                    ? `generals/${data.image}.png`
                    : `${base}/${data.image || 'image'}.png`;
            case 'dual_image':
                if (!data.isDualImage)
                    return this.getAssetsUrl('image', skinName);
                return data.image_dual?.includes('/')
                    ? `generals/${data.image_dual}.png`
                    : `${base}/${data.image_dual || 'image.dual'}.png`;
            case 'self_image':
                if (!data.isDualImage)
                    return this.getAssetsUrl('image', skinName);
                return data.image_dual2?.includes('/')
                    ? `generals/${data.image_dual2}.png`
                    : `${base}/${data.image_dual2 || 'image.dual.self'}.png`;
        }
    }

    private getSkinData(skinName: string) {
        const data = sgs.generalAssets.get(this.id);
        if (data && data.skins) {
            return (
                data.skins.find((k) => k.name === skinName) ?? {
                    name: 'default',
                    isDualImage: false,
                    dynamic: false,
                    baseUrl: this.name,
                    image: 'image',
                    image_dual: 'image.dual',
                    image_dual2: 'image.dual.self',
                    audios: { death: { url: 'death', translation: '死亡' } },
                }
            );
        } else {
            return {
                name: 'default',
                isDualImage: false,
                dynamic: false,
                baseUrl: this.name,
                image: 'image',
                image_dual: 'image.dual',
                image_dual2: 'image.dual.self',
                audios: { death: { url: 'death', translation: '死亡' } },
            };
        }
    }
}
