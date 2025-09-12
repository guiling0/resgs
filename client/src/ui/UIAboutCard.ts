const { regClass } = Laya;
import { ServerConfig } from '../config';
import {
    CardAttr,
    CardType,
    GameCardData,
    VirtualCardData,
} from '../core/card/card.types';
import { ScenesEnum } from '../enums';
import { S } from '../singleton';
import { UIAboutCardBase } from './UIAboutCard.generated';
import { UICard } from './UICard';

@regClass()
export class UIAboutCard extends UIAboutCardBase {
    public pkg_name: string[] = [];
    public pkgs_translation: string[] = [];
    public currentValue: string;

    protected translation_type = 1;

    onAwake(): void {
        sgs.packages.forEach((v) => {
            if (v.cards.length) {
                this.pkg_name.push(v.name);
                this.pkgs_translation.push(sgs.getTranslation(v.name));
            }
        });
        this.pkgs.items = this.pkgs_translation;
        this.pkgs.values = this.pkg_name;
        this.pkgs.title = '请选择扩展包';
        this.pkgs.on(Laya.Event.CHANGED, this, this.onRender);

        this.back.on(Laya.Event.CLICK, () => {
            S.ui.closeScene(ScenesEnum.AboutCard);
        });

        this.ttype.on(Laya.Event.CLICK, () => {
            this.translation_type = this.translation_type === 1 ? 2 : 1;
            this.ttype.title =
                this.translation_type === 1 ? '标准描述' : '规则集描述';
            this.showInfo(this.card.vcard);
        });

        this.audio_effect.on(Laya.Event.CLICK, () => {
            if (
                this.card.vcard &&
                sgs.utils.getCardType(this.card.vcard.name) === CardType.Equip
            ) {
                this.audio_effect.mouseEnabled = false;
                this.audio_effect.grayed = true;
                S.ui.playAudio(
                    `${ServerConfig.res_url}/audio/equip/${this.card.vcard.name}.mp3`,
                    Laya.Handler.create(this, () => {
                        this.audio_effect.mouseEnabled = true;
                        this.audio_effect.grayed = false;
                    })
                );
            }
        });

        this.audio_male.on(Laya.Event.CLICK, () => {
            if (
                this.card.vcard &&
                sgs.utils.getCardType(this.card.vcard.name) !== CardType.Equip
            ) {
                this.audio_male.mouseEnabled = false;
                this.audio_male.grayed = true;
                S.ui.playAudio(
                    `${ServerConfig.res_url}/audio/card/male/${this.card.vcard.name}.mp3`,
                    Laya.Handler.create(this, () => {
                        this.audio_male.mouseEnabled = true;
                        this.audio_male.grayed = false;
                    })
                );
            }
        });

        this.audio_female.on(Laya.Event.CLICK, () => {
            if (
                this.card.vcard &&
                sgs.utils.getCardType(this.card.vcard.name) !== CardType.Equip
            ) {
                this.audio_female.mouseEnabled = false;
                this.audio_female.grayed = true;
                S.ui.playAudio(
                    `${ServerConfig.res_url}/audio/card/female/${this.card.vcard.name}.mp3`,
                    Laya.Handler.create(this, () => {
                        this.audio_female.mouseEnabled = true;
                        this.audio_female.grayed = false;
                    })
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
            this.cards.children.forEach((v) => v.destroy());
            this.cards.removeChildren();
            sgs.getPackage(value)?.cards.forEach((v) => {
                const ui = UICard.createCard(
                    {
                        id: '',
                        name: v.name,
                        suit: v.suit,
                        color: sgs.utils.getColorBySuit(v.suit),
                        number: v.number,
                        attr: v.attr.slice(),
                        subcards: [],
                        custom: {},
                    },
                    true
                );
                this.cards.addChild(ui);
                ui.on(Laya.Event.CLICK, () => {
                    this.showInfo(ui.vcard);
                });
            });
        }
    }

    showInfo(card: VirtualCardData) {
        if (!card) return;
        this.card.setCard(card, true);
        if (this.translation_type === 1) {
            this.skill_t.text = sgs.getTranslation(`@desc:${card.name}`);
        } else {
            this.skill_t.text = sgs.getTranslation(`@desc2:${card.name}`);
        }
        if (card.attr.includes(CardAttr.Recastable)) {
            this.skill_t.text += `\n※此牌可用于重铸`;
        }
        if (card.attr.includes(CardAttr.Transferable)) {
            this.skill_t.text += `\n※此牌可用于合纵`;
        }
        const reg = new RegExp(
            `${Object.keys(sgs.concept[sgs.lang]).join('|')}`,
            'g'
        );
        this.skill_t.text = this.skill_t.text.replaceAll(reg, (match) => {
            return `<a href="${match}"><b>${match}</b></a>`;
        });
        this.skill_t.on(Laya.Event.LINK, (e: any) => {
            this.concept.visible = true;
            this.concept.text = sgs.getConcept(e) + '\n(点击关闭)';
            Laya.GRoot.inst.showPopup(this.concept);
        });
        const type = sgs.utils.getCardType(card.name);
        if (type === CardType.Equip) {
            this.audio_effect.visible = true;
            this.audio_male.visible = false;
            this.audio_female.visible = false;
        } else {
            this.audio_effect.visible = false;
            this.audio_male.visible = true;
            this.audio_female.visible = true;
        }
    }
}
