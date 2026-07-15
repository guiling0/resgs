import path from 'path';
import fs from 'fs';
import { CardPackData, GeneralPackData } from './core/packs/types';
import { logger } from './logger/index';
import { CardData } from './core/card/types';
import { GeneralAssetsData, GeneralData } from './core/general/type';
import { SkillAsset } from './core/skill/types';

export class DataManager {
    public static async load() {
        if (!sgs) {
            logger.warn('The core library is not initialized');
            return;
        }
        //服务端不用加载翻译
        // this.loadTranslation();
        this.loadCards();
        this.loadGenerals();
    }

    /** 加载翻译 */
    private static loadTranslation() {
        const urls = ['lang.json', 'name.json', 'card.json', 'command.json'];
        urls.forEach((url) => {
            const data = JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, 'datas', 'lang', url),
                    'utf-8',
                ),
            );
            sgs.loadTranslation(data);
        });

        const concept = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, 'datas', 'lang', 'concepts.json'),
                'utf-8',
            ),
        );
        sgs.loadConcept(concept);
    }

    /** 加载卡牌数据 */
    private static loadCards() {
        const cardpacks = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, 'datas', 'cards', 'cards.json'),
                'utf-8',
            ),
        );

        const orders = cardpacks.orders as string[];
        const datas = cardpacks.datas as { [key: string]: CardPackData };

        orders.forEach((order) => {
            const data = datas[order];
            data.cards.forEach((card) => {
                sgs.cards.set(card.id, card);
            });
            sgs.cardpacks.set(data.name, data);
        });

        const carddatas = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, 'datas', 'cards', 'cardsdata.json'),
                'utf-8',
            ),
        ) as { [key: string]: CardData };

        for (const card in carddatas) {
            sgs.carddatas.set(card, carddatas[card]);
            // sgs.loadTranslation({
            //     [card]: carddatas[card].lang_name,
            //     [`@acronym:${card}`]:
            //         carddatas[card].acronym ??
            //         carddatas[card].lang_name ??
            //         card,
            //     [`@equiptip:${card}`]: carddatas[card].equiptip ?? '',
            //     [`@desc:${card}`]: carddatas[card].lang_desc,
            //     [`@desc2:${card}`]: carddatas[card].lang_desc2,
            // });
        }
    }

    private static loadGenerals() {
        const packs = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, 'datas', 'generals', 'index.json'),
                'utf-8',
            ),
        );

        const orders = packs.orders as string[];
        const datas = packs.packs as { [key: string]: GeneralPackData };

        const loadJsons: string[] = [];

        orders.forEach((order) => {
            const data = datas[order];
            data.subpacks.forEach((pack) => {
                const jsons = pack.json;
                jsons.forEach((json_url) => {
                    if (!loadJsons.includes(json_url)) {
                        //general
                        const general_datas = JSON.parse(
                            fs.readFileSync(
                                path.join(
                                    __dirname,
                                    'datas',
                                    'generals',
                                    `${json_url}.json`,
                                ),
                                'utf-8',
                            ),
                        ) as { [key: string]: GeneralData };
                        for (const key in general_datas) {
                            sgs.generals.set(key, general_datas[key]);
                        }
                        //info
                        const info_datas = JSON.parse(
                            fs.readFileSync(
                                path.join(
                                    __dirname,
                                    'datas',
                                    'assets',
                                    'generals',
                                    `${json_url}.json`,
                                ),
                                'utf-8',
                            ),
                        ) as { [key: string]: GeneralAssetsData };
                        for (const key in info_datas) {
                            sgs.generalAssets.set(key, info_datas[key]);
                            // sgs.loadTranslation({
                            //     [`@id:${key}`]: info_datas[key].info.id ?? '',
                            //     [`@version:${key}`]:
                            //         info_datas[key].info.version ?? '',
                            //     [`@title:${key}`]:
                            //         info_datas[key].info.title ?? '',
                            //     [`@prefix:${key}`]:
                            //         info_datas[key].info.prefix ?? '',
                            //     [`@designer:${key}`]:
                            //         info_datas[key].info.designer ?? '',
                            //     [`@script:${key}`]:
                            //         info_datas[key].info.script ?? '',
                            //     [`@skin0.painter:${key}`]:
                            //         info_datas[key].skins[0].painter ??
                            //         '',
                            //     [`@skin0.cv:${key}`]:
                            //         info_datas[key].skins[0].cv ?? '',
                            //     [`@skin0.cv_designer:${key}`]:
                            //         info_datas[key].skins[0]
                            //             .cv_designer ?? '',
                            // });
                        }
                        //skill
                        const skill_datas = JSON.parse(
                            fs.readFileSync(
                                path.join(
                                    __dirname,
                                    'datas',
                                    'assets',
                                    'skills',
                                    `${json_url}.json`,
                                ),
                                'utf-8',
                            ),
                        ) as { [key: string]: SkillAsset };
                        for (const key in skill_datas) {
                            sgs.skillsAssets.set(key, skill_datas[key]);
                            // sgs.loadTranslation({
                            //     [`${key}`]: skill_datas[key].name ?? '',
                            //     [`@desc:${key}`]:
                            //         skill_datas[key].lang_desc ?? '',
                            //     [`@desc2:${key}`]:
                            //         skill_datas[key].lang_desc2 ?? '',
                            // });
                        }
                        loadJsons.push(json_url);
                    }
                });
            });
            sgs.generalpacks.set(data.name, data);
        });
    }
}
