import path from 'path';
import { CardData } from '../core/card/CardTypes';
import { CardPackData, GeneralPackData } from '../core/packs/types';
import { PREFAB_URLS, RES_URLS, SCENE_CONFIGS } from '../data/res_list';
import { ResManager } from '../ResManager';
import { SceneManager } from '../SceneManager';
import { GeneralAssetsData, GeneralData } from '../core/general/GeneralType';
import { SkillAsset } from '../core/skill/SkillTypes';

const { regClass } = Laya;

const LoadBg: string[] = [
    'resources/background/loading/1.png',
    'resources/background/loading/3.png',
    'resources/background/loading/4.png',
    'resources/background/loading/5.png',
    'resources/background/loading/7.png',
    'resources/background/loading/8.png',
    'resources/background/loading/9.png',
    'resources/background/loading/11.png',
    'resources/background/loading/12.png',
    'resources/background/loading/13.png',
    'resources/background/loading/14.png',
    'resources/background/loading/15.png',
    'resources/background/loading/16.png',
    'resources/background/loading/17.png',
    'resources/background/loading/66.png',
    'resources/background/loading/67.png',
    'resources/background/loading/68.png',
];

@regClass()
export class LoadComp extends Laya.Script {
    private _img: Laya.GImage;
    private _pb: Laya.GProgressBar;
    private _txt: Laya.GTextField;

    async onAwake() {
        const o = this.owner as Laya.GWidget;
        this._img = o.getChild('img') as Laya.GImage;
        this._pb = o.getChild('pb') as Laya.GProgressBar;
        this._txt = o.getChild('txt') as Laya.GTextField;
        this._pb.value = 0;
        this._pb.max = RES_URLS.length;
        this._txt
            .setVar('text', '正在准备加载')
            .setVar('value', '')
            .setVar('max', '');

        await ResManager.bindSkin(this._img, LoadBg[1], () => {
            this.startPreload();
        });
    }

    private async startPreload(): Promise<void> {
        //基础资源
        this._txt.setVar('text', '基础资源').setVar('max', RES_URLS.length);
        let loaded = 0;
        for (const url of RES_URLS) {
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[LoadComp] load failed:', url, e);
            }
            loaded++;
            this._pb.value = loaded;
            this._txt.setVar('value', loaded);
        }

        //添加预制资源的加载逻辑
        this._txt.setVar('text', 'UI资源').setVar('max', PREFAB_URLS.length);
        loaded = 0;
        for (const url of PREFAB_URLS) {
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[LoadComp] load failed:', url, e);
            }
            loaded++;
            this._pb.value = loaded;
            this._txt.setVar('value', loaded);
        }

        //构建场景
        this._txt.setVar('text', '场景资源').setVar('max', 1);
        loaded = 0;
        for (const data of Object.keys(SCENE_CONFIGS)) {
            const url = SCENE_CONFIGS[data].prefabUrl;
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[LoadComp] load failed:', url, e);
            }
            loaded++;
            this._pb.value = loaded;
            this._txt.setVar('value', loaded);
        }
        SceneManager.registerAll(SCENE_CONFIGS);

        await this.loadTranslation();
        await this.loadCards();
        await this.loadGenerals();

        this.onLoadComplete();
    }

    private onLoadComplete(): void {
        console.log('[LoadComp] preload complete, total:', RES_URLS.length);
        this._pb.max = this._pb.value = 1;
        this._txt.text = '加载完成';
        this.owner.timerOnce(1800, this, () => {
            SceneManager.enter('entry');
        });
    }

    /** 加载翻译 */
    private async loadTranslation() {
        const urls = ['lang.json', 'name.json', 'card.json', 'command.json'];
        this._txt.setVar('text', '翻译资源').setVar('max', urls.length + 1);
        let loaded = 0;
        for (let i = 0; i < urls.length; i++) {
            const data = await Laya.loader.load(
                `./datas/lang/${urls[i]}`,
                Laya.Loader.JSON,
            );
            sgs.loadTranslation(data.data);
            loaded++;
            this._pb.value = loaded;
            this._txt.setVar('value', loaded);
        }

        const concept = await Laya.loader.load(
            `./datas/lang/concepts.json`,
            Laya.Loader.JSON,
        );
        sgs.loadConcept(concept.data);
        loaded++;
        this._pb.value = loaded;
        this._txt.setVar('value', loaded);
    }

    /** 加载卡牌数据 */
    private async loadCards() {
        this._txt.setVar('text', '卡牌扩展').setVar('max', 1);
        let loaded = 0;
        const cardpacks = (
            await Laya.loader.load(`./datas/cards/cards.json`, Laya.Loader.JSON)
        ).data;

        const orders = cardpacks.orders as string[];
        const datas = cardpacks.datas as { [key: string]: CardPackData };

        orders.forEach((order) => {
            const data = datas[order];
            data.cards.forEach((card) => {
                sgs.cards.set(card.id, card);
            });
            sgs.cardpacks.set(data.name, data);
        });
        loaded++;
        this._pb.value = loaded;
        this._txt.setVar('value', loaded);
        this._txt.setVar('text', '卡牌数据').setVar('max', 1);
        loaded = 0;
        const carddatas = (
            await Laya.loader.load(
                `./datas/cards/cardsdata.json`,
                Laya.Loader.JSON,
            )
        ).data as { [key: string]: CardData };

        for (const card in carddatas) {
            sgs.carddatas.set(card, carddatas[card]);
            sgs.loadTranslation({
                [card]: carddatas[card].lang_name,
                [`@acronym:${card}`]:
                    carddatas[card].acronym ??
                    carddatas[card].lang_name ??
                    card,
                [`@equiptip:${card}`]: carddatas[card].equiptip ?? '',
                [`@desc:${card}`]: carddatas[card].lang_desc,
                [`@desc2:${card}`]: carddatas[card].lang_desc2,
            });
        }
        loaded++;
        this._pb.value = loaded;
        this._txt.setVar('value', loaded);
    }

    private async loadGenerals() {
        this._txt.setVar('text', '武将扩展').setVar('max', 1);
        let loaded = 0;
        const packs = (
            await Laya.loader.load(
                `./datas/generals/index.json`,
                Laya.Loader.JSON,
            )
        ).data;

        const orders = packs.orders as string[];
        const datas = packs.packs as { [key: string]: GeneralPackData };

        const jsons: string[] = [];

        orders.forEach((order) => {
            const data = datas[order];
            data.subpacks.forEach((pack) => {
                pack.json.forEach((json_url) => {
                    if (!jsons.includes(json_url)) {
                        jsons.push(json_url);
                    }
                });
            });
            sgs.generalpacks.set(data.name, data);
        });
        loaded++;
        this._pb.value = loaded;
        this._txt.setVar('value', loaded);

        this._txt.setVar('text', '武将数据').setVar('max', 1);
        loaded = 0;

        for (let i = 0; i < jsons.length; i++) {
            const json_url = jsons[i];
            //general
            const general_datas = (
                await Laya.loader.load(
                    `./datas/generals/${json_url}.json`,
                    Laya.Loader.JSON,
                )
            ).data as { [key: string]: GeneralData };
            for (const key in general_datas) {
                sgs.generals.set(key, general_datas[key]);
                loaded++;
                this._pb.value = loaded;
                this._txt.setVar('value', loaded);
            }
            //info
            const info_datas = (
                await Laya.loader.load(
                    `./datas/assets/generals/${json_url}.json`,
                    Laya.Loader.JSON,
                )
            ).data as { [key: string]: GeneralAssetsData };
            for (const key in info_datas) {
                sgs.generalAssets.set(key, info_datas[key]);
                sgs.loadTranslation({
                    [`@id:${key}`]: info_datas[key].info.id ?? '',
                    [`@version:${key}`]: info_datas[key].info.version ?? '',
                    [`@title:${key}`]: info_datas[key].info.title ?? '',
                    [`@prefix:${key}`]: info_datas[key].info.prefix ?? '',
                    [`@designer:${key}`]: info_datas[key].info.designer ?? '',
                    [`@script:${key}`]: info_datas[key].info.script ?? '',
                    [`@skin0.painter:${key}`]:
                        info_datas[key].skins[0].painter ?? '',
                    [`@skin0.cv:${key}`]: info_datas[key].skins[0].cv ?? '',
                    [`@skin0.cv_designer:${key}`]:
                        info_datas[key].skins[0].cv_designer ?? '',
                });
                loaded++;
                this._pb.value = loaded;
                this._txt.setVar('value', loaded);
            }
        }

        this._txt.setVar('text', '技能数据').setVar('max', 1);
        loaded = 0;

        for (let i = 0; i < jsons.length; i++) {
            const json_url = jsons[i];
            //skill
            const skill_datas = (
                await Laya.loader.load(
                    `./datas/assets/skills/${json_url}.json`,
                    Laya.Loader.JSON,
                )
            ).data as { [key: string]: SkillAsset };
            for (const key in skill_datas) {
                sgs.skillsAssets.set(key, skill_datas[key]);
                sgs.loadTranslation({
                    [`${key}`]: skill_datas[key].name ?? '',
                    [`@desc:${key}`]: skill_datas[key].lang_desc ?? '',
                    [`@desc2:${key}`]: skill_datas[key].lang_desc2 ?? '',
                });
                loaded++;
                this._pb.value = loaded;
                this._txt.setVar('value', loaded);
            }
        }
    }

    onDestroy(): void {
        ResManager.clearSkin(this._img);
    }
}
