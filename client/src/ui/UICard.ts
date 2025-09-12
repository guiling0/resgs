import { Bezier } from '../Bezier';
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { ServerConfig } from '../config';
import { CardAni } from '../core/ani.config';
import { GameCard } from '../core/card/card';
import {
    VirtualCardData,
    SourceData,
    CardSuit,
    CardNumber,
    CardAttr,
    CardColor,
} from '../core/card/card.types';
import { VirtualCard } from '../core/card/vcard';
import { General } from '../core/general/general';
import { GeneralData } from '../core/general/general.type';
import { Skill } from '../core/skill/skill';
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { ObjectPoolItem } from '../types';
import { AssetsUrlMapping } from '../urlmap';
import { UICardBase } from './UICard.generated';
import { UIGeneralHp } from './UIGeneralHp';

const { regClass } = Laya;

@regClass()
export class UICard extends UICardBase implements ObjectPoolItem {
    private static prefab: Laya.HierarchyResource;

    /** 创建一张游戏牌
     * @param card 卡牌对象
     * @param visible 是否可见
     * @param data 不可见时要显示的数据
     */
    public static createCard(
        card: GameCard | VirtualCard | VirtualCardData,
        visible: boolean = true,
        data: Partial<SourceData> = { name: 'back' }
    ) {
        const node = this._create();
        node.setCard(card, visible, data);
        return node;
    }
    /** 创建一张武将牌 */
    public static createGeneral(card: General, visible: boolean = true) {
        const node = this._create();
        node.setGeneral(card, visible);
        return node;
    }
    /** 创建一张军令牌 */
    public static createCommand(card: number, visible: boolean = true) {
        const node = this._create();
        node.setCommand(card, visible);
        return node;
    }
    /** 创建一张技能牌 */
    public static createSkill(card: Skill) {
        const node = this._create();
        node.setSkill(card);
        return node;
    }

    protected static _create() {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/card/card.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Card, () => {
            return this.prefab.create() as UICard;
        }) as UICard;
        return node;
    }

    public card: GameCard;
    public vcard: VirtualCardData;
    public general: General;
    public command: number;
    public skill: Skill;

    public set type(value: 'card' | 'general' | 'command') {
        this.getController('type').selectedPage = value;
    }
    public get type() {
        return this.getController('type').selectedPage as
            | 'card'
            | 'general'
            | 'command';
    }

    public refresh(visible: boolean) {
        if (this.type === 'card') {
            if (this.card) this.setCard(this.card, visible);
            if (this.vcard) this.setCard(this.vcard, visible);
        }
        if (this.type === 'general') this.setGeneral(this.general, visible);
        if (this.type === 'command') this.setCommand(this.command, visible);
    }

    public item: ChooseItemComp;
    public panding_ani: Laya.Spine2DRenderNode;

    /** 在手牌区是否折叠 */
    public flow: boolean = false;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);
        this.panding_ani = this.panding.getComponent(Laya.Spine2DRenderNode);
    }

    /** 设置卡牌 */
    public setCard(
        card: GameCard | VirtualCard | VirtualCardData,
        visible: boolean,
        data: Partial<SourceData> = {}
    ) {
        this.type = 'card';
        this.skill = undefined;
        if (card instanceof GameCard) {
            this.setCardData(
                visible
                    ? Object.assign(
                          {},
                          card.sourceData,
                          card.name === 'aozhan' ? { name: 'aozhan' } : {}
                      )
                    : data
            );
            this.card = card;
            this.vcard = undefined;
            if (
                (card.name !== card.sourceData.name &&
                    card.name !== 'aozhan') ||
                card.suit !== card.sourceData.suit ||
                card.number !== card.sourceData.number ||
                card.color !== card.sourceData.color
            ) {
                this.setViewAs(card);
            }
        } else if (card instanceof VirtualCard) {
            this.setCardData(visible ? card : data);
            this.vcard = card.vdata;
            this.card = undefined;
        } else {
            this.setCardData(visible ? card : data);
            this.vcard = card;
            this.card = undefined;
        }
    }

    /** 直接根据数据设置卡牌数据 */
    public setCardData(data: Partial<SourceData>) {
        if (this.type !== 'card') return;
        const {
            name = 'back',
            attr = [],
            suit = CardSuit.None,
            color = undefined,
            number = CardNumber.None,
        } = data;
        //name
        if (name === 'back') {
            this.card_image.loadImage(
                `resources/card/texture/card/card-back-guozhan.png`
            );
        } else if (attr.includes(CardAttr.Aozhan)) {
            this.card_image.loadImage(
                `${ServerConfig.res_url}/image/cards/aozhan.png`
            );
        } else {
            let _name = name;
            if (name === 'sha') {
                if (attr.includes(CardAttr.Fire)) {
                    _name += '_fire';
                }
                if (attr.includes(CardAttr.Thunder)) {
                    _name += '_thunder';
                }
            }
            if (name === 'wuxiekeji') {
                if (attr.includes(CardAttr.Country)) {
                    _name += '_country';
                }
            }
            this.card_image.loadImage(
                `${ServerConfig.res_url}/image/cards/${_name}.png`
            );
        }
        //suit
        if (suit === CardSuit.None) {
            this.suit.texture = undefined;
            if (color === undefined) {
                this.color.texture = undefined;
            } else {
                this.color.loadImage(AssetsUrlMapping.color[color]);
            }
        } else {
            this.color.texture = undefined;
            this.suit.loadImage(AssetsUrlMapping.suit[suit]);
        }
        //number
        if (number < 1 || number > 13) {
            this.number.texture = undefined;
        } else {
            const _color =
                color === undefined ||
                color === CardColor.None ||
                color === CardColor.Black
                    ? 'black'
                    : 'red';
            this.number.loadImage(
                `resources/card/texture/card/number/${_color}/${number}.png`
            );
        }
        //transferable
        this.transferable.visible = attr.includes(CardAttr.Transferable);
    }

    renderMark() {}

    /** 设置卡牌的视为属性 */
    public setViewAs(data: Partial<SourceData>) {
        if (data) {
            if (this.type !== 'card') return;
            this.viewas.visible = true;
            const {
                name = '',
                attr = [],
                suit = CardSuit.None,
                color = undefined,
                number = CardNumber.None,
            } = data;
            let attr_text = '';
            if (name === 'sha') {
                if (attr.includes(CardAttr.Thunder)) {
                    attr_text = '雷';
                } else if (attr.includes(CardAttr.Fire)) {
                    attr_text = '火';
                }
            } else if (name === 'wuxiekeji') {
                if (attr.includes(CardAttr.Country)) {
                    attr_text = '国';
                }
            }
            this.viewas.viewas_name.text = `${attr_text}${sgs.getTranslation(
                name
            )}`;
            if (suit === CardSuit.None) {
                this.viewas.viewas_suit.texture = undefined;
            } else {
                this.viewas.viewas_suit.loadImage(AssetsUrlMapping.suit[suit]);
            }
            if (number < 1 || number > 13) {
                this.viewas.viewas_number.texture = undefined;
            } else {
                if (color !== undefined) {
                    const _color =
                        color === CardColor.None ||
                        color === undefined ||
                        color === CardColor.Red
                            ? 'red'
                            : 'black';
                    this.viewas.viewas_number.loadImage(
                        `resources/card/texture/card/number/${_color}/${number}.png`
                    );
                } else {
                    const _color =
                        sgs.utils.getColorBySuit(suit) === CardColor.Red
                            ? 'red'
                            : 'black';
                    this.viewas.viewas_number.loadImage(
                        `resources/card/texture/card/number/${_color}/${number}.png`
                    );
                }
            }
        } else {
            this.viewas.visible = false;
        }
    }

    /** 设置卡牌显示的文本 */
    public setLabel(label: string) {
        this.label.text = label;
    }

    /** 播放卡牌动画 */
    public playAni(type: CardAni) {
        switch (type) {
            case CardAni.None:
                this.panding.visible = false;
                this.pindianlose.visible = false;
                this.pindianwin.visible = false;
                break;
            case CardAni.PrePanding:
                this.panding.visible = true;
                this.panding_ani.play('play', true);
                break;
            case CardAni.PrePandingGood:
                this.panding.visible = true;
                this.panding_ani.play('play2', true);
                break;
            case CardAni.PrePandingBad:
                this.panding.visible = true;
                this.panding_ani.play('play3', true);
                break;
            case CardAni.PandingGood:
                this.panding.visible = true;
                this.panding_ani.play('play4', false);
                this.panding_ani.templet.once(Laya.Event.STOPPED, () => {
                    this.panding.visible = false;
                });
                break;
            case CardAni.PandingBad:
                this.panding.visible = true;
                this.panding_ani.play('play5', false);
                this.panding_ani.templet.once(Laya.Event.STOPPED, () => {
                    this.panding.visible = false;
                });
                break;
            case CardAni.PindianWin:
                this.pindianwin.visible = true;
                this.pindianwin.index = 0;
                this.pindianwin.play();
                this.pindianwin.once(Laya.Event.COMPLETE, () => {
                    this.pindianwin.visible = false;
                });
                break;
            case CardAni.PindianLose:
                this.pindianlose.visible = true;
                this.pindianlose.index = 0;
                this.pindianlose.play();
                this.pindianlose.once(Laya.Event.COMPLETE, () => {
                    this.pindianlose.visible = false;
                });
                break;
        }
    }

    /** 设置武将牌数据 */
    public setGeneral(general: General, visible: boolean = true) {
        this.type = 'general';
        this.general = general;
        if (!general) return;
        this.general_back.visible = !visible;
        if (!visible) return;
        //武将名
        const prefix = sgs.getTranslation(`prefix:${general.id}`);
        const prefix_text = prefix.includes('prefix:') ? '' : prefix;
        this.general_name
            .setVar('prefix', prefix_text)
            .setVar('name', sgs.getTranslation(general.trueName));
        //包名
        // this.pkgname.text = sgs.getTranslation(
        //     general.sourceData.packages.at(0)
        // );
        this.pkg_icon.loadImage(
            `${
                ServerConfig.res_url
            }/image/icon/${general.sourceData.packages.at(0)}.png`
        );
        //边框
        // this.border.loadImage(
        //     general.isLord()
        //         ? 'resources/card/texture/general/general_border_0.png'
        //         : 'resources/card/texture/general/general_border.png'
        // );
        //武将图
        this.general_image.loadImage(
            `${ServerConfig.res_url}/${general.getAssetsUrl('image')}`
        );
        //体力
        this.hps.removeChildren();
        const kingdom =
            (general.isLord() && general.sourceData.isWars) ||
            general.kingdom === 'god'
                ? 'lord'
                : general.kingdom;
        if (general.hpmax > 5) {
            this.hps.addChild(
                UIGeneralHp.create(kingdom, general.sourceData.isWars ? 1 : 0.1)
            );
            this.hp_label.visible = true;
            this.hp_label.text = `${general.hp}/${general.hpmax}`;
        } else {
            this.hp_label.visible = false;
            const floor = Math.floor(general.hpmax);
            for (let i = 0; i < floor; i++) {
                this.hps.addChild(
                    UIGeneralHp.create(
                        kingdom,
                        general.sourceData.isWars ? 1 : 0.1
                    )
                );
            }
            if (general.hpmax % 1 !== 0) {
                this.hps.addChild(
                    UIGeneralHp.create(
                        kingdom,
                        general.sourceData.isWars ? 0.5 : 0.1
                    )
                );
            }
        }
        //势力
        if (general.isDual()) {
            this.kingdom2.visible = true;
            this.kingdom2.loadImage(
                `resources/card/texture/general/kingdom/${general.kingdom2}.png`
            );
        } else {
            this.kingdom2.visible = false;
        }
        if (general.isLord() && general.sourceData.isWars) {
            this.kingdom.loadImage(
                `resources/card/texture/general/kingdom/jun.png`
            );
        } else {
            this.kingdom.loadImage(
                `resources/card/texture/general/kingdom/${general.kingdom}.png`
            );
        }
    }

    public setZhulian(kingdom?: string) {
        if (!kingdom) {
            this.zhulian.visible = false;
            this.zhulian_zi.visible = false;
        } else {
            this.zhulian.visible = true;
            this.zhulian_zi.visible = true;
            this.zhulian.loadImage(
                `resources/card/texture/general/zhulian/icon/${kingdom}.png`
            );
            this.zhulian_zi.loadImage(
                `resources/card/texture/general/zhulian/zi/${kingdom}.png`
            );
        }
    }

    /** 设置军令牌数据 */
    public setCommand(command: number, visible: boolean = true) {
        this.type = 'command';
        this.command = command;
        this.command_back.visible = !visible;
        if (!visible) return;
        if (command >= 80) {
            this.img.visible = false;
            this.miaoji.visible = true;
        } else {
            this.img.visible = true;
            this.miaoji.visible = false;
        }
        this.command_label.text = sgs.getTranslation(`@desc:junling${command}`);
    }

    /** 设置技能牌数据 */
    public setSkill(skill: Skill) {
        this.type = 'card';
        this.card = this.vcard = undefined;
        this.skill = skill;
        this.setCardData({ name: `@${skill.trueName}` });
    }

    onGet(): void {
        Laya.Tween.killAll(this);
        this.timer.clearAll(this);
        this.alpha = 1;
        this.visible = true;
        this.flow = false;
    }

    onRet(): void {
        Laya.Tween.killAll(this);
        this.clearTimer(this, this._dispose);
        if (this.item) {
            this.item.onClick(undefined);
            this.item.setCanClick(true);
            this.item.setSelected(false);
            this.item.onLongClick(undefined);
        }
        this.label.text = '';
        this.flow = false;
        this.pos(0, 0);
        this.playAni(CardAni.None);
        this.setViewAs(undefined);
        this.setZhulian(undefined);
        this.cardtag.visible = false;
        this.card_image.loadImage(`resources/card/texture/card/none.png`);
        this.offAll(Laya.Event.CLICK);
        this.offAll(Laya.Event.MOUSE_DOWN);
        this.offAll(Laya.Event.MOUSE_UP);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Card, this);
    }

    public moveTo(
        x: number,
        y: number,
        bezier: boolean = false,
        dispose: boolean = true
    ) {
        let tween: Laya.Tween;
        if (bezier) {
            const arrs = Bezier.createBezierCurvePoints(
                [this, { x: 953, y: 487 }, { x, y }],
                0.5
            );
            tween = Laya.Tween.create(this)
                .duration(1500)
                .go(null, 0, arrs.length)
                .ease(Laya.Ease.expoOut)
                .onUpdate((tweener) => {
                    let value = Math.floor(tweener.value.get(null));
                    if (value >= arrs.length) {
                        value = arrs.length - 1;
                    }
                    const pos = arrs[value];
                    this.pos(pos.x, pos.y);
                });
        } else {
            tween = Laya.Tween.create(this)
                .duration(600)
                .to('x', x)
                .to('y', y)
                .ease(Laya.Ease.expoOut)
                .onStart(() => {
                    this.pos(this.x, this.y);
                });
        }
        if (dispose) {
            this.timerOnce(bezier ? 1500 : 600, this, this._dispose);
        }
    }

    public _dispose() {
        Laya.Tween.create(this)
            .duration(300)
            .to('alpha', 0)
            .then(() => {
                this.destroy();
            });
    }
}
