import { AreaId } from '../../core/area/area.type';
import { GameCard } from '../../core/card/card';
import {
    GameCardId,
    VirtualCardData,
    CardPut,
    CardType,
    CardSubType,
    CardSuit,
    CardAttr,
} from '../../core/card/card.types';
import { CustomString } from '../../core/custom/custom.type';
import { MoveData } from '../../core/event/types/event.move';
import { General } from '../../core/general/general';
import { GeneralId } from '../../core/general/general.type';
import { PlayerId } from '../../core/player/player.types';
import { UICard } from '../../ui/UICard';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { RoomGameComp } from './RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export class GameCardComp extends Laya.Script {
    declare owner: UIGameRoom;

    /** 固定区域卡牌 */
    public field_cards: UICard[] = [];
    /** 固定区域是否显示 */
    public field_show: boolean = false;
    /** 手牌区 */
    public hand_cards: UICard[] = [];
    /** 处理区 */
    public process_cards: UICard[] = [];
    /** 记录使用到的牌 */
    public cards: UICard[] = [];
    /** 是否展示技能 */
    public isShowSkill: boolean = false;
    /** 技能牌 */
    public skill_cards: UICard[] = [];

    public game: RoomGameComp;

    onAwake(): void {
        this.game = this.owner.getComponent(RoomGameComp);

        // 整理按钮点击事件
        this.owner.zhengli.on(Laya.Event.CLICK, this, () => {
            this.owner.zhengli_item.visible = !this.owner.zhengli_item.visible;
        });

        this.owner.sort_name.on(Laya.Event.CLICK, this, () => {
            this.sortHandCardsByName();
            this.owner.zhengli_item.visible = false;
        });
        this.owner.sort_point.on(Laya.Event.CLICK, this, () => {
            this.sortHandCardsByPoint();
            this.owner.zhengli_item.visible = false;
        });
        this.owner.sort_type.on(Laya.Event.CLICK, this, () => {
            this.sortHandCardsByType();
            this.owner.zhengli_item.visible = false;
        });
        this.owner.sort_suit.on(Laya.Event.CLICK, this, () => {
            this.sortHandCardsBySuit();
            this.owner.zhengli_item.visible = false;
        });

        this.owner.markbg.on(Laya.Event.CLICK, this, () => {
            this.markskills();
        });

        this.owner.houbeiqu.on(Laya.Event.CLICK, this, () => {
            this.game.window.showReserveWindow('后备区');
        });

        this.owner.houbeiqu.on(Laya.Event.MOUSE_DOWN, this, () => {
            this.owner.houbeiqu.startDrag();
        });
        this.owner.houbeiqu.on(Laya.Event.MOUSE_UP, this, () => {
            this.owner.houbeiqu.stopDrag();
        });
    }

    public markskills(show: boolean = !this.isShowSkill) {
        if (!show) {
            this.owner.markbg.loadImage(
                `resources/room/texture/game/gz_btn_biaoji00.png`
            );
            this.isShowSkill = false;
            this.owner.markhandbg.visible = false;
            this.skill_cards.forEach((v) => (v.visible = false));
        } else {
            this.owner.markbg.loadImage(
                `resources/room/texture/game/gz_btn_biaoji01.png`
            );
            this.isShowSkill = true;
            this.owner.markhandbg.visible = true;
            this.skill_cards = this.game.skills.filter(
                (v) =>
                    v instanceof UICard &&
                    v.skill &&
                    v.skill.player === this.game.self
            ) as UICard[];
            const handWidth = this.owner.markhandbg.width;
            const interval = Math.min(handWidth / this.skill_cards.length, 140);
            this.skill_cards.forEach((v, i) => {
                this.owner.markhandbg.addChild(v);
                v.visible = true;
                const x = i * (interval - 3) + 323;
                const y = 109;
                if (v.x !== x || v.y !== y) {
                    v.moveTo(x, y, false, false);
                }
            });
        }
    }

    handleCardsMark(card: GameCard, key: string) {
        if (key === 'mark.zi') {
            //马车特殊处理
            const mark = card.getMark(key);
            const ui = this.field_cards.find((v) => v.card === card);
            if (mark && !ui) {
                const ui = UICard.createCard(card, true);
                this.owner.cards.addChild(ui);
                this.field_cards.push(ui);
            } else if (!mark && ui) {
                ui.destroy();
                lodash.remove(this.field_cards, (v) => v === ui);
            }
            this.refreshHandCards();
        }
    }

    addHandCards(ui: UICard[]) {
        ui.slice().forEach((v) => {
            if (!this.hand_cards.includes(v)) {
                this.hand_cards.push(v);
            }
        });
        this.refreshHandCards();
    }

    removeHandCards(ui: UICard[]) {
        ui.slice().forEach((v) => {
            if (this.hand_cards.includes(v)) {
                v.destroy();
                lodash.remove(this.hand_cards, (c) => c === v);
            }
        });
        this.refreshHandCards();
    }

    public refreshHandCards() {
        const cards = this.hand_cards.filter((v) => !v.flow);
        //filedcards
        this.owner.machebg.visible =
            this.field_cards.length > 0 && this.field_show;
        let macheWidth = 0;
        if (this.owner.machebg.visible) {
            macheWidth = this.field_cards.length * 140 + 60;
            if (macheWidth < 200) macheWidth = 200;
            if (macheWidth > 489) macheWidth = 489;
            this.owner.machebg.width = macheWidth;
            const extras_interval = Math.min(
                macheWidth / this.field_cards.length,
                140
            );
            this.field_cards.forEach((v, i) => {
                v.visible = true;
                const x = i * (extras_interval - 3) + 338;
                const y = 981 - (v.item.selected ? 15 : 0);
                if (v.x !== x || v.y !== y) {
                    v.moveTo(x, y, false, false);
                }
                if (v.type === 'card' && v.card) {
                    v.setCard(v.card, v.card.canVisible(this.game.self));
                    v.item?.onLongClick(() => {
                        if (v.card && v.card.canVisible(this.game.self)) {
                            this.showCardInfo(v.card);
                        }
                    });
                }
                v.parent.addChild(v);
            });
        } else {
            this.field_cards.forEach((v, i) => {
                v.visible = false;
            });
        }
        //handcards
        const handWidth =
            this.owner.handbg.width -
            (this.owner.machebg.visible ? this.owner.machebg.width : 0);
        const interval = Math.min(handWidth / cards.length, 140);
        cards.forEach((v, i) => {
            const x =
                i * (interval - 3) +
                325 +
                (this.hand_cards.length - cards.length) * 4 +
                (this.owner.machebg.visible ? macheWidth - 10 : 0);
            const y = 981 - (v.item.selected ? 15 : 0);
            if (v.x !== x || v.y !== y) {
                v.moveTo(x, y, false, false);
            }
            if (v.type === 'card' && v.card) {
                v.setCard(v.card, v.card.canVisible(this.game.self));
                v.item?.onLongClick(() => {
                    if (v.card && v.card.canVisible(this.game.self)) {
                        this.showCardInfo(v.card);
                    }
                });
                v.cardtag.visible =
                    v.card.put === CardPut.Up &&
                    v.card.area === this.game.self.handArea;
            }
            v.parent.addChild(v);
        });
        this.owner.zhengli.visible = cards.length > 12;
        if (!this.owner.zhengli.visible) {
            this.owner.zhengli_item.visible = false;
        }
    }

    public flowHandCards(show: boolean = false) {
        if (show) {
            this.hand_cards.forEach((v) => (v.flow = false));
            this.refreshHandCards();
        } else {
            this.hand_cards.forEach((v, i) => {
                v.flow = true;
                const x =
                    i * 4 +
                    325 +
                    (this.owner.machebg.visible
                        ? this.owner.machebg.width - 10
                        : 0);
                const y = 981 - (v.item.selected ? 15 : 0);
                if (v.x !== x || v.y !== y) {
                    v.moveTo(x, y, false, false);
                }
            });
        }
    }

    addProcessCards(ui: UICard[]) {
        ui.slice().forEach((v) => {
            if (!this.process_cards.includes(v)) {
                this.process_cards.push(v);
            }
        });
        this.refreshProcessCards();
    }

    removeProcessCards(ui: UICard[]) {
        ui.slice().forEach((v) => {
            v.item.setCanClick(false);
            v.timerOnce(
                5000,
                v,
                function (this: UICard, cc: GameCardComp) {
                    if (cc.process_cards.includes(this)) {
                        this.destroy();
                        lodash.remove(cc.process_cards, (c) => c === this);
                    }
                },
                [this]
            );
        });
        this.owner.timerOnce(5000, this, () => {
            this.refreshProcessCards();
        });
    }

    refreshProcessCards() {
        const interval = Math.min(
            (1350 - 140) / this.process_cards.length,
            140
        );
        const maxWidth = Math.min(interval * this.process_cards.length, 1350);
        const _x = (1350 - maxWidth) / 2;
        this.process_cards.forEach((v, i) => {
            const x = interval * i + 363 + _x;
            const y = 500;
            if (v.type === 'card' && v.card) {
                v.item?.onLongClick(() => {
                    if (v.card && v.card.canVisible(this.game.self)) {
                        this.showCardInfo(v.card);
                    }
                });
            }
            if (v.x !== x || v.y !== y) {
                v.moveTo(x, y, false, false);
            }
        });
    }

    /**
     * 按牌名字母顺序整理手牌
     */
    private sortHandCardsByName() {
        this.hand_cards.sort((a, b) => {
            // 非card类型排最后
            if (a.type !== 'card') return b.type === 'card' ? 1 : 0;
            if (b.type !== 'card') return a.type === 'card' ? -1 : 0;

            const nameA = a.card?.name || '';
            const nameB = b.card?.name || '';
            return nameA.localeCompare(nameB);
        });
        this.refreshHandCards();
    }

    /**
     * 按牌类型整理手牌
     * 顺序：基本牌 -> 锦囊牌(普通 -> 延时) -> 装备牌(武器 -> 防具 -> 特殊坐骑 -> 防御坐骑 -> 进攻坐骑 -> 宝物)
     */
    private sortHandCardsByType() {
        const typePriority = (card: UICard): number => {
            // 非card类型排最后
            if (card.type !== 'card') return Number.MAX_SAFE_INTEGER;

            if (!card.card) return 0;

            // 基本牌
            if (card.card.type === CardType.Basic) return 100;

            // 锦囊牌
            if (card.card.type === CardType.Scroll) {
                // 普通锦囊
                if (card.card.subtype === CardSubType.InstantScroll) return 200;
                // 延时锦囊
                if (card.card.subtype === CardSubType.DelayedScroll) return 300;
            }

            // 装备牌
            if (card.card.type === CardType.Equip) {
                // 武器
                if (card.card.subtype === CardSubType.Weapon) return 400;
                // 防具
                if (card.card.subtype === CardSubType.Armor) return 500;
                // 特殊坐骑
                if (card.card.subtype === CardSubType.SpecialMount) return 600;
                // 防御坐骑
                if (card.card.subtype === CardSubType.DefensiveMount)
                    return 700;
                // 进攻坐骑
                if (card.card.subtype === CardSubType.OffensiveMount)
                    return 800;
                // 宝物
                if (card.card.subtype === CardSubType.Treasure) return 900; // 注意:宝物在EquipSubType中没有定义
            }
            // 未知类型排在非card类型之前
            return 0;
        };

        this.hand_cards.sort((a, b) => typePriority(a) - typePriority(b));
        this.refreshHandCards();
    }

    /**
     * 按花色整理手牌
     * 顺序：黑桃 -> 红桃 -> 梅花 -> 方片
     */
    private sortHandCardsBySuit() {
        const suitPriority = (card: UICard): number => {
            // 非card类型排最后
            if (card.type !== 'card') return Number.MAX_SAFE_INTEGER;

            if (!card.card) return Number.MAX_SAFE_INTEGER - 1;

            // 花色优先级：黑桃(1) -> 红桃(2) -> 梅花(3) -> 方片(4) -> None(0)
            return card.card.suit === CardSuit.None
                ? 5 // 将None排到最后
                : card.card.suit;
        };

        this.hand_cards.sort((a, b) => {
            const priorityA = suitPriority(a);
            const priorityB = suitPriority(b);
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // 同花色情况下按照点数排序
            const pointA = a.card?.number || 0;
            const pointB = b.card?.number || 0;
            return pointA - pointB;
        });
        this.refreshHandCards();
    }

    /**
     * 按点数整理手牌
     * 点数从小到达排序，相同点数按牌名字母顺序
     */
    private sortHandCardsByPoint() {
        this.hand_cards.sort((a, b) => {
            // 非card类型排最后
            if (a.type !== 'card') return b.type === 'card' ? 1 : 0;
            if (b.type !== 'card') return a.type === 'card' ? -1 : 0;

            const numberA = a.card?.number || 0;
            const numberB = b.card?.number || 0;
            if (numberA !== numberB) {
                return numberA - numberB;
            }
            const nameA = a.card?.name || '';
            const nameB = b.card?.name || '';
            return nameA.localeCompare(nameB);
        });
        this.refreshHandCards();
    }

    refreshEquipCards() {
        [
            this.game.selfComp.owner.equip31,
            this.game.selfComp.owner.equip32,
            this.game.selfComp.owner.equip33,
            this.game.selfComp.owner.equip34,
            this.game.selfComp.owner.equip35,
            this.game.selfComp.owner.equip36,
        ].forEach((v) => {
            const x = v.item.selected ? 131 : v.item.canClick ? 125 : 119;
            if (v.x !== x) {
                Laya.Tween.create(v)
                    .to('x', x)
                    .duration(600)
                    .ease(Laya.Ease.expoOut);
            }
        });
    }

    onMoveCards(
        datas: {
            cards: GameCardId[] | GeneralId[] | VirtualCardData[] | number[];
            fromArea: AreaId;
            toArea: AreaId;
            movetype: CardPut;
            puttype: CardPut;
            animation: boolean;
            moveVisibles: PlayerId[];
            cardVisibles: PlayerId[];
            /** 是否实际移动此牌 */
            isMove: boolean;
            /** 移动此牌时显示的文本 */
            label?: CustomString;
            log?: CustomString;
            viewas?: VirtualCardData;
        }[]
    ) {
        datas.forEach((v) => {
            let movecards: UICard[] = [],
                source = { x: 0, y: 0 },
                target = { x: 0, y: 0 },
                bezier = 0;
            const from = this.game.game.areas.get(v.fromArea);
            const to = this.game.game.areas.get(v.toArea);
            v.cards.forEach((_card) => {
                const card =
                    typeof _card === 'string'
                        ? this.game.game.getCard(_card) ??
                          this.game.game.getGeneral(_card)
                        : _card;
                if (!card) return;
                if (v.isMove && card instanceof GameCard) {
                    if (from && to) {
                        card._visibles.length = 0;
                        const visilbes = new Set<string>();
                        if (card.put === CardPut.Up) {
                            this.game.game.players.forEach((v) => {
                                visilbes.add(v.playerId);
                            });
                        }
                        from.visibles.forEach((v) => {
                            visilbes.add(v.playerId);
                        });
                        from.remove([card]);
                        to.add([card]);
                        card.put = v.puttype;
                        to.visibles.forEach((v) => {
                            visilbes.add(v.playerId);
                        });
                        v.cardVisibles.forEach((v) => visilbes.add(v));
                        card.setVisible(...visilbes);
                    }
                }
                let ui: UICard;
                let visible =
                    v.movetype === CardPut.Up ||
                    v.cardVisibles?.includes(this.game.selfId);
                if (card instanceof GameCard) {
                    ui = UICard.createCard(
                        card,
                        card.canVisible(this.game.self) || visible
                    );
                    if (from === this.game.self.handArea && v.isMove) {
                        //移除手牌中相同数据的卡牌
                        this.removeHandCards(
                            this.hand_cards.filter(
                                (v) => v.type === 'card' && v.card === card
                            )
                        );
                    }
                } else if (card instanceof General) {
                    ui = UICard.createGeneral(card, visible);
                } else if (typeof card === 'number') {
                    ui = UICard.createCommand(card);
                } else {
                    ui = UICard.createCard(card, visible);
                }
                if (ui) {
                    movecards.push(ui);
                    ui.setLabel(
                        v.label ? this.game.getTranslation(v.label) : ''
                    );
                    ui.setViewAs(v.viewas);
                }
            });
            if (v.log) {
                this.game.message.onLog(v.log);
            }
            v.cards.forEach((_card) => {
                const card =
                    typeof _card === 'string'
                        ? this.game.game.getCard(_card) ??
                          this.game.game.getGeneral(_card)
                        : _card;
                if (!card) return;
                if (v.isMove && card instanceof GameCard) {
                    card.put = v.puttype;
                    card._visibles.length = 0;
                    const visilbes = new Set<string>();
                    to.visibles.forEach((v) => {
                        visilbes.add(v.playerId);
                    });
                    v.cardVisibles.forEach((v) => visilbes.add(v));
                    card.setVisible(...visilbes);
                }
            });
            if (from && to) {
                //确定source点
                if (from.isPublic) {
                    source.x = 953;
                    source.y = 487;
                    if (from === this.game.game.drawArea) {
                        source.x = 1780;
                        source.y = 100;
                        bezier++;
                    }
                } else {
                    if (from.player === this.game.self) {
                        if (from === this.game.self.handArea) {
                            source.x = 960;
                            source.y = 855;
                        }
                        if (from === this.game.self.equipArea) {
                            source.x = 122;
                            source.y = 978;
                        }
                        if (from === this.game.self.judgeArea) {
                            source.x = 317;
                            source.y = 860;
                        }
                        if (
                            from === this.game.self.upArea ||
                            from === this.game.self.sideArea
                        ) {
                            source.x = 1787;
                            source.y = 972;
                        }
                    } else {
                        const player = this.game.players.get(
                            from.player.playerId
                        );
                        source.x = player?.owner.x;
                        source.y = player?.owner.y;
                        bezier++;
                    }
                }
                movecards.forEach((v) => {
                    this.owner.cards.addChild(v);
                    v.pos(source.x, source.y);
                });
                if (
                    !v.animation ||
                    (v.moveVisibles &&
                        v.moveVisibles.length > 0 &&
                        !v.moveVisibles.find((m) => m === this.game.selfId))
                ) {
                    movecards.forEach((v) => (v.visible = false));
                    this.owner.frameOnce(10, this, () => {
                        movecards.forEach((v) => v.destroy());
                    });
                    return;
                }
                //确定target点
                if (to.isPublic) {
                    if (to === this.game.game.drawArea) {
                        target.x = 1780;
                        target.y = 100;
                        bezier++;
                    } else {
                        this.addProcessCards(movecards);
                        movecards.length = 0;
                    }
                } else {
                    if (to.player === this.game.self) {
                        if (to === this.game.self.handArea) {
                            movecards.forEach((v) => {
                                v.setLabel(``);
                            });
                            this.addHandCards(movecards);
                            movecards.length = 0;
                        }
                        if (to === this.game.self.equipArea) {
                            target.x = 122;
                            target.y = 978;
                        }
                        if (to === this.game.self.judgeArea) {
                            target.x = 317;
                            target.y = 860;
                        }
                        if (
                            to === this.game.self.upArea ||
                            to === this.game.self.sideArea
                        ) {
                            target.x = 1787;
                            target.y = 972;
                        }
                    } else {
                        const player = this.game.players.get(
                            to.player.playerId
                        );
                        target.x = player?.owner.x;
                        target.y = player?.owner.y;
                        bezier++;
                    }
                }

                //移动卡牌
                const maxWidth = (movecards.length - 1) * 40 + 140;
                const _x = maxWidth / 2;
                movecards.forEach((v, i) => {
                    const dev = 40 * i + 70 - _x;
                    v.pos(source.x + dev, source.y);
                    v.moveTo(target.x + dev, target.y, bezier === 2, true);
                });
                // if (
                //     v.animation &&
                //     (!v.moveVisibles ||
                //         v.moveVisibles.length === 0 ||
                //         v.moveVisibles.includes(this.game.selfId))
                // ) {
                //     const maxWidth = (movecards.length - 1) * 40 + 140;
                //     const _x = maxWidth / 2;
                //     movecards.forEach((v, i) => {
                //         const dev = 40 * i + 70 - _x;
                //         v.pos(source.x + dev, source.y);
                //         v.moveTo(target.x + dev, target.y, bezier === 2, true);
                //     });
                // } else {
                //     movecards.forEach((v) => v.destroy());
                // }
            }
        });

        this.game.renderCardText();
    }

    public showCardInfo(card: GameCard) {
        if (!card) return;
        this.owner.card_note.visible = true;
        this.owner.card_note.text =
            `${sgs.getTranslation(card.name)}\n` +
            sgs.getTranslation(`@desc:${card.name}`);
        // if (this.translation_type === 1) {
        // } else {
        //     this.skill_t.text = sgs.getTranslation(`@desc2:${card.name}`);
        // }
        if (card.attr.includes(CardAttr.Recastable)) {
            this.owner.card_note.text += `\n※此牌可用于重铸`;
        }
        if (card.attr.includes(CardAttr.Transferable)) {
            this.owner.card_note.text += `\n※此牌可用于合纵`;
        }
        Laya.GRoot.inst.showPopup(this.owner.card_note);
    }
    public showGeneralInfo(card: General[]) {
        if (!card) return;
        this.owner.card_note.visible = true;
        this.owner.card_note.text = '';
        card.forEach((v) => {
            this.owner.card_note.text += sgs.getTranslation(v.trueName) + '\n';
            v.skills.forEach((s) => {
                let name = s;
                if (s.at(0) === '#') name = s.slice(1);
                const skill_name = sgs.getTranslation(name);
                this.owner.card_note.text += skill_name + '\n';
                if (s.at(0) === '#') {
                    this.owner.card_note.text += '(衍生技)';
                }
                const lang = sgs.getTranslation(`@desc:${name}`);
                this.owner.card_note.text += lang;
                // const soncepts: string[] = [];
                // Object.keys(sgs.concept[sgs.lang]).forEach((v) => {
                //     if (this.owner.card_note.text.includes(v)) {
                //         soncepts.push(v);
                //     }
                // });
                // soncepts.forEach((v) => {
                //     this.owner.card_note.text += `[color=#008000]\n[b][size=30]${v}[/size][/b]：${sgs.getConcept(
                //         v
                //     )}[/color]`;
                // });
                this.owner.card_note.text += ` \n`;
            });
            this.owner.card_note.text += ` \n`;
        });
        Laya.GRoot.inst.showPopup(this.owner.card_note);
    }
    public showInfo(text: string) {
        this.owner.card_note.visible = true;
        this.owner.card_note.text = text;
        Laya.GRoot.inst.showPopup(this.owner.card_note);
    }
}
