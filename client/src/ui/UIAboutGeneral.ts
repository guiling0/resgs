const { regClass } = Laya;
import { ServerConfig } from '../config';
import { General } from '../core/general/general';
import { ScenesEnum } from '../enums';
import { S } from '../singleton';
import { UIAboutGeneralBase } from './UIAboutGeneral.generated';
import { UICard } from './UICard';
import { UIInfoItem } from './UIInfoItem';
import { UIOptionButton } from './UIOptionButton';
import { UISkillAudio } from './UISkillAudio';

@regClass()
export class UIAboutGeneral extends UIAboutGeneralBase {
    public pkg_name: string[] = [];
    public pkgs_translation: string[] = [];
    public pkg_name2sub: { [key: string]: string[] } = {};
    public currentValue: string;

    protected translation_type = 1;

    onAwake(): void {
        sgs.packages.forEach((v) => {
            if (v.generals.length && !v.generals.every((g) => g.hidden)) {
                const pkg = v.name.split('.');
                const name = pkg.length > 1 ? pkg[0] : v.name;
                if (this.pkg_name.includes(name)) {
                    this.pkg_name2sub[name].push(v.name);
                } else {
                    this.pkg_name.push(name);
                    this.pkgs_translation.push(sgs.getTranslation(name));
                    this.pkg_name2sub[name] = [v.name];
                }
            }
        });
        this.pkgs.items = this.pkgs_translation;
        this.pkgs.values = this.pkg_name;
        this.pkgs.title = '请选择扩展包';
        this.pkgs.on(Laya.Event.CHANGED, this, this.onRender);

        this.back.on(Laya.Event.CLICK, this, () => {
            S.ui.closeScene(ScenesEnum.AboutGeneral);
        });

        this.ttype.on(Laya.Event.CLICK, () => {
            this.translation_type = this.translation_type === 1 ? 2 : 1;
            this.ttype.title =
                this.translation_type === 1 ? '标准描述' : '规则描述';
            this.showInfo(this.card.general);
        });

        this.set_avatar.on(Laya.Event.CLICK, () => {
            if (this.card.general) {
                S.client.updateAvatar(
                    `${ServerConfig.res_url}/${this.card.general.getAssetsUrl(
                        'image'
                    )}`
                );
            }
        });

        this.concept.on(Laya.Event.CLICK, this, () => {
            this.concept.visible = false;
        });
    }

    onRender() {
        if (this.pkgs.value !== this.currentValue) {
            const value = this.pkgs.value;
            this.currentValue = value;
            this.generals.children.forEach((v) => v.destroy());
            this.generals.removeChildren();
            const pkgs = this.pkg_name2sub[value];
            if (pkgs) {
                pkgs.forEach((v) => {
                    const txt = Laya.Pool.getItemByClass(
                        'ui.general.pack',
                        Laya.GTextField
                    );
                    txt.font = 'resources/font/FZLBGBK.ttf';
                    txt.fontSize = 40;
                    txt.color = '#ffffff';
                    txt.bold = true;
                    txt.text = sgs.getTranslation(v);
                    txt.size(1323, 50);
                    this.generals.addChild(txt);
                    sgs.getPackage(v).generals.forEach((general) => {
                        const ui = UICard.createGeneral(
                            new General(undefined, general),
                            true
                        );
                        this.generals.addChild(ui);
                        ui.on(Laya.Event.CLICK, () => {
                            this.showInfo(ui.general);
                        });
                    });
                });
            }
        }
    }

    showInfo(general: General) {
        if (!general) return;
        this.card.setGeneral(general);
        this.info_list.children.forEach((v) => v.destroy());
        this.info_list.removeChildren();
        this.infos
            .setVar('id', sgs.getTranslation(`@id:${general.id}`) ?? '0')
            .setVar(
                'title',
                sgs.getTranslation(`@title:${general.id}`) ?? '暂无'
            )
            .setVar(
                'designer',
                sgs.getTranslation(`@designer:${general.id}`) ?? '三国杀'
            )
            .setVar(
                'painter',
                sgs.getTranslation(`@painter:${general.id}`) ?? '三国杀'
            )
            .setVar('cv', sgs.getTranslation(`@cv:${general.id}`) ?? '三国杀')
            .setVar(
                'script',
                sgs.getTranslation(`@script:${general.id}`) ?? '归零'
            );
        this.g_enable.visible = !general.sourceData.enable;
        if (general.sourceData.isWars) {
            const zlbh = sgs.getTranslation(`@rs:${general.id}`);
            this.g_zhulianbihe.text = `珠联璧合：${zlbh === '' ? '无' : zlbh}`;
        } else {
            this.g_zhulianbihe.text = '';
        }
        const assets = sgs.generalAssets[general.name];
        //配音表
        general.skills.forEach((v) => {
            let name = v;
            if (v.at(0) === '#') name = v.slice(1);
            const ui = UIInfoItem.create();
            const skill_name = sgs.getTranslation(name);
            ui.skill.title.text = skill_name;
            if (this.translation_type === 1) {
                ui.skill_t.text = sgs.getTranslation(`@desc:${name}`);
            } else {
                ui.skill_t.text = sgs.getTranslation(`@desc2:${name}`);
            }
            const reg = new RegExp(
                `${Object.keys(sgs.concept[sgs.lang]).join('|')}`,
                'g'
            );
            ui.skill_t.text = ui.skill_t.text.replaceAll(reg, (match) => {
                return `<a href="${match}"><b>${match}</b></a>`;
            });
            ui.skill_t.on(Laya.Event.LINK, (e: any) => {
                this.concept.visible = true;
                this.concept.text = sgs.getConcept(e) + '\n(点击关闭)';
                Laya.GRoot.inst.showPopup(this.concept);
            });
            const audio = sgs.skillAssets[name]?.audios ?? [];
            audio?.forEach((a, i) => {
                const key = `@audio${i}:${name}`;
                const btn = UISkillAudio.create(
                    `${skill_name + i}\n${sgs.getTranslation(key)}`
                );
                ui.list.addChild(btn);
                btn.on(Laya.Event.CLICK, () => {
                    btn.mouseEnabled = false;
                    btn.grayed = true;
                    S.ui.playAudio(
                        `${ServerConfig.res_url}/${a}.mp3`,
                        Laya.Handler.create(this, () => {
                            btn.mouseEnabled = true;
                            btn.grayed = false;
                        })
                    );
                });
            });
            if (v.at(0) === '#') {
                ui.skill_t.text = `(衍生技)` + ui.skill_t.text;
            }
            this.info_list.addChild(ui);
        });
        const death = UIInfoItem.create();
        death.skill_t.text = '';
        death.skill.title.text = '阵亡';
        const btn = UISkillAudio.create(
            `阵亡\n${sgs.getTranslation(`@death:${general.name}`)}`
        );
        death.list.addChild(btn);
        btn.on(Laya.Event.CLICK, () => {
            btn.mouseEnabled = false;
            btn.grayed = true;
            S.ui.playAudio(
                `${ServerConfig.res_url}/${general.getAssetsUrl('death')}`,
                Laya.Handler.create(this, () => {
                    btn.mouseEnabled = true;
                    btn.grayed = false;
                })
            );
        });
        this.info_list.addChild(death);
    }
}
