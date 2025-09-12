import { CardAttr } from '../../core/card/card.types';
import {
    ChooseCardData,
    ChooseVCardData,
} from '../../core/choose/types/choose.card';
import { ChooseCommandData } from '../../core/choose/types/choose.command';
import { ChooseGeneralData } from '../../core/choose/types/choose.general';
import { ChooseOptionsData } from '../../core/choose/types/choose.options';
import { ChoosePlayerData } from '../../core/choose/types/choose.player';
import { UICard } from '../../ui/UICard';
import { UIChooseCards } from '../../ui/UIChooseCards';
import { UIChooseGeneralDual } from '../../ui/UIChooseGeneralDual';
import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UIOptionButton } from '../../ui/UIOptionButton';
import { UIRows } from '../../ui/UIRows';
import { UISeat } from '../../ui/UISeat';
import { UISelfSeat } from '../../ui/UISelfSeat';
import { UIWindow } from '../../ui/UIWindow';
import { ScriptChooseComp } from './ScriptChooseComp';

const { regClass, property } = Laya;

@regClass()
export class ChooseCardComp extends ScriptChooseComp<
    ChooseCardData,
    UICard | UIEquipSelf
> {
    /** 额外创建的卡牌 */
    public cards: UICard[] = [];
    /** 用到的装备 */
    public equips: UIEquipSelf[] = [];

    private toggleSelection(): void {
        if (!this.data || !this.data.selectable || !this.items) return;

        const allSelected = this.result.length === this.data.selectable.length;
        const minCount =
            typeof this.data.count === 'number'
                ? this.data.count
                : this.data.count?.[0] || 0;

        // 如果已经达到最小选择数量，就不再继续选择
        if (this.result.length >= minCount && !allSelected) {
            return;
        }

        this.data.selectable.forEach((item: any) => {
            const ui = this.items.get(item);
            if (!allSelected) {
                if (!this.result.includes(item) && ui) {
                    this.onItemClick(item);
                }
            } else {
                if (this.result.includes(item) && ui) {
                    this.onItemClick(item);
                }
            }

            // 如果已经达到最小选择数量，停止继续选择
            if (this.result.length >= minCount) {
                return;
            }
        });
    }

    public init(data: ChooseCardData): void {
        if (!data.selecte_type || data.selecte_type === 'self') {
            data.selectable.forEach((v) => {
                //判断该牌是否在手牌区或者装备区
                const ui_card = this.game.card.hand_cards.find(
                    (c) => c.type === 'card' && c.card === v
                );
                if (ui_card) {
                    this.items.set(v, ui_card);
                    return;
                }
                const ui_equip = this.game.selfComp.equips.find(
                    (e) => e.card === v
                );
                if (ui_equip) {
                    this.items.set(v, ui_equip);
                    this.equips.push(ui_equip);
                    return;
                }
                const ui_field = this.game.card.field_cards.find(
                    (c) => c.type === 'card' && c.card === v
                );
                if (ui_field) {
                    this.items.set(v, ui_field);
                    return;
                }
                const ui = UICard.createCard(v, v.canVisible(this.game.self));
                this.cards.push(ui);
                this.items.set(v, ui);
                this.owner.cards.addChild(ui);
            });

            this.game.card.hand_cards.forEach((v) => {
                v.item.setSelected(false);
                v.item.setCanClick(false);
                if (
                    this.request.options.isPlayPhase &&
                    v.type === 'card' &&
                    v.card &&
                    v.card.hasAttr(CardAttr.Recastable)
                ) {
                    this.items.set(v.card, v);
                }
            });

            if (this.cards.length > 0) {
                this.game.card.addHandCards(this.cards);
            }

            //反选
            // this.owner.fanxuan.visible = true;
            // this.owner.fanxuan.on(Laya.Event.CLICK, this, this.toggleSelection);
        } else {
            let window = this.game.window.getWindow(data.windowOptions?.id);
            if (!window) {
                if (this.request.options.canCancle) {
                    data.windowOptions.buttons.push('cancle');
                }
                window = UIWindow.create(this.game, data.windowOptions);
                if (data.selecte_type === 'rows') {
                    window.setRows(data.data_rows);
                }
                if (data.selecte_type === 'win') {
                    window.setDatas(data.selectable);
                }
                if (data.selecte_type === 'items') {
                    window.setItems(data.data_items);
                }
                if (data.selecte_type === 'drags') {
                    window.setItems(data.data_items, true);
                }
            }
            const content = window.contentNode;
            content.items.forEach((v, k) => {
                this.items.set(k, v);
            });
            this.window = window;
        }

        super.init(data);
    }

    public refresh(): void {
        super.refresh();
        //手牌不显示已选
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(v.item.selected, false);
            if (
                this.request.options.isPlayPhase &&
                v.type === 'card' &&
                v.card &&
                v.card.hasAttr(CardAttr.Recastable) &&
                !this.base?.skill_ui &&
                this.result.length === 0
            ) {
                v.item.setCanClick(true);
            }
        });
        //装备牌
        this.equips.forEach((v) => {
            v.item.setSelected(v.item.selected, true);
            if (this.data.preMove ?? true) {
                if (v.skill) {
                    v.skill.setInvalids('#preMoveAsSelected', v.item.selected);
                }
            }
        });
        //手牌不显示已选
        this.game.card.field_cards.forEach((v) => {
            v.item.setSelected(v.item.selected, false);
        });
        this.game.card.refreshHandCards();
        this.game.card.refreshEquipCards();
    }

    des(): void {
        super.des();
        if (this.cards.length > 0) {
            this.game.card.removeHandCards(this.cards);
        }
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(false);
            v.item.setCanClick(true);
        });
        this.equips.forEach((v) => {
            v.item.setSelected(false);
            v.item.setCanClick(false);
            if (v.skill) {
                v.skill.setInvalids('#preMoveAsSelected', false);
            }
        });
        this.owner.fanxuan.off(Laya.Event.CLICK, this, this.toggleSelection);
        this.owner.fanxuan.visible = false;
        this.game.card.refreshHandCards();
        this.game.card.refreshEquipCards();
    }
}

export class ChoosePlayerComp extends ScriptChooseComp<
    ChoosePlayerData,
    UISeat | UISelfSeat
> {
    public init(data: ChoosePlayerData): void {
        if (!data.selectable) {
            data.selectable =
                data.excluesDeath ?? true
                    ? this.game.game.playerAlives
                    : this.game.game.players;
        }
        this.game.players.forEach((v) => {
            v.owner.item.setSelected(false);
            v.owner.item.setCanClick(false);
        });
        data.selectable.forEach((v) => {
            const ui = this.game.players.get(v.playerId);
            if (ui) {
                this.items.set(v, ui.owner);
            }
        });
        super.init(data);
    }

    public refresh_check(item: any): boolean {
        if (!super.refresh_check(item)) return false;

        return (
            (typeof this.data.count === 'number' &&
                this.result.length < this.data.count) ||
            (Array.isArray(this.data.count) &&
                this.result.length < this.data.count[1])
        );
    }
}

@regClass()
export class ChooseGeneralComp extends ScriptChooseComp<
    ChooseGeneralData,
    UICard
> {
    public init(data: ChooseGeneralData): void {
        if (!data.selecte_type || data.selecte_type === 'self') {
            //创建武将牌
            data.selectable.forEach((v) => {
                const ui = UICard.createGeneral(v);
                this.items.set(v, ui);
            });
            //TODO 折叠手牌
            //TODO 武将牌加入手牌
        } else {
            let window = this.game.window.getWindow(data.windowOptions?.id);
            if (!window) {
                if (this.request.options.canCancle) {
                    data.windowOptions.buttons.push('cancle');
                }
                window = UIWindow.create(this.game, data.windowOptions);
                if (data.selecte_type === 'rows') {
                    window.setRows(data.data_rows);
                }
                if (data.selecte_type === 'win') {
                    window.setDatas(data.selectable);
                }
                if (data.selecte_type === 'dual') {
                    window.setChooseGeneralDual(data);
                }
                if (data.selecte_type === 'single') {
                    //创建单将选择窗口
                }
                if (data.selecte_type === 'items') {
                    window.setItems(data.data_items);
                }
            }
            const content = window.contentNode;
            content.items.forEach((v, k) => {
                this.items.set(k, v);
            });
            this.window = window;
        }

        super.init(data);
    }

    public onChange(type: 'add' | 'remove', item: any): void {
        (this.window?.contentNode as any)?.onChange(
            type,
            item,
            this.result,
            (item: any) => {
                this.onItemClick(item);
            }
        );
        super.onChange(type, item);
    }

    public refresh_check(item: any): boolean {
        if (!super.refresh_check(item)) return false;

        return (
            (typeof this.data.count === 'number' &&
                this.result.length < this.data.count) ||
            (Array.isArray(this.data.count) &&
                this.result.length < this.data.count[1])
        );
    }

    des(): void {
        super.des();
        this.items.forEach((v) => v.destroy());
    }
}

@regClass()
export class ChooseOptionComp extends ScriptChooseComp<
    ChooseOptionsData,
    UIOptionButton
> {
    public buttons: UIOptionButton[] = [];

    public init(data: ChooseOptionsData): void {
        this.owner.selfseat.buttons.visible = false;
        data.selectable.forEach((v, i) => {
            let _value = sgs.utils.getString(v);
            let can_click = _value.at(0) !== '!';
            let value = can_click ? _value : _value.slice(1);
            const btn = UIOptionButton.create(
                this.game.getTranslation(
                    typeof v === 'string'
                        ? value
                        : {
                              text: value,
                              values: v.values,
                          }
                )
            );
            data.selectable[i] = _value;
            this.items.set(value, btn);
            this.owner.selfseat.options.addChild(btn);
        });

        if (this.request.options.canCancle) {
            const btn = UIOptionButton.create(
                this.game.getTranslation('cancle')
            );
            this.buttons.push(btn);
            this.owner.selfseat.options.addChild(btn);
            btn.on(Laya.Event.CLICK, this.base, this.base.onCancleClick);
        }

        super.init(data);
    }

    des(): void {
        super.des();
        this.owner.selfseat.buttons.visible = true;
        this.items.forEach((v) => v.destroy());
        this.buttons.forEach((v) => v.destroy());
    }

    public refresh_check(item: any): boolean {
        if (!super.refresh_check(item)) return false;

        return (
            (typeof this.data.count === 'number' &&
                this.result.length < this.data.count) ||
            (Array.isArray(this.data.count) &&
                this.result.length < this.data.count[1])
        );
    }
}

@regClass()
export class ChooseVCardComp extends ScriptChooseComp<ChooseVCardData, UICard> {
    private toggleSelection(): void {
        if (!this.data || !this.data.selectable || !this.items) return;

        const allSelected = this.result.length === this.data.selectable.length;
        const minCount =
            typeof this.data.count === 'number'
                ? this.data.count
                : this.data.count?.[0] || 0;

        // 如果已经达到最小选择数量，就不再继续选择
        if (this.result.length >= minCount && !allSelected) {
            return;
        }

        this.data.selectable.forEach((item: any) => {
            const ui = this.items.get(item);
            if (!allSelected) {
                if (!this.result.includes(item) && ui) {
                    this.onItemClick(item);
                }
            } else {
                if (this.result.includes(item) && ui) {
                    this.onItemClick(item);
                }
            }

            // 如果已经达到最小选择数量，停止继续选择
            if (this.result.length >= minCount) {
                return;
            }
        });
    }
    /** 额外创建的卡牌 */
    public cards: UICard[] = [];

    public init(data: ChooseVCardData): void {
        if (!data.selecte_type || data.selecte_type === 'self') {
            data.selectable.forEach((v) => {
                const ui = UICard.createCard(v, true);
                this.cards.push(ui);
                this.items.set(v, ui);
                this.owner.cards.addChild(ui);
            });

            this.game.card.hand_cards.forEach((v) => {
                v.item.setSelected(false);
                v.item.setCanClick(false);
            });
            this.game.card.flowHandCards();

            if (this.cards.length > 0) {
                this.game.card.addHandCards(this.cards);
            }

            //反选
            // this.owner.fanxuan.visible = true;
            // this.owner.fanxuan.on(Laya.Event.CLICK, this, this.toggleSelection);
        } else {
            let window = this.game.window.getWindow(data.windowOptions?.id);
            if (!window) {
                if (this.request.options.canCancle) {
                    data.windowOptions.buttons.push('cancle');
                }
                window = UIWindow.create(this.game, data.windowOptions);
                if (data.selecte_type === 'rows') {
                    window.setRows(data.data_rows);
                }
                if (data.selecte_type === 'win') {
                    window.setDatas(data.selectable);
                }
                if (data.selecte_type === 'items') {
                    window.setItems(data.data_items);
                }
            }
            const content = window.contentNode;
            content.items.forEach((v, k) => {
                this.items.set(k, v);
            });
            this.window = window;
        }

        super.init(data);
    }

    public refresh(): void {
        super.refresh();
        //手牌不显示已选
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(v.item.selected, false);
            if (
                this.request.options.isPlayPhase &&
                v.type === 'card' &&
                v.card &&
                v.card.hasAttr(CardAttr.Recastable) &&
                this.result.length === 0
            ) {
                v.item.setCanClick(true);
            }
        });
        this.game.card.refreshHandCards();
    }

    des(): void {
        super.des();
        if (this.cards.length > 0) {
            this.game.card.removeHandCards(this.cards);
        }
        this.game.card.flowHandCards(true);
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(false);
            v.item.setCanClick(true);
        });
        this.owner.fanxuan.off(Laya.Event.CLICK, this, this.toggleSelection);
        this.owner.fanxuan.visible = false;
        this.game.card.refreshHandCards();
    }
}

@regClass()
export class ChooseCommandComp extends ScriptChooseComp<
    ChooseCommandData,
    UICard
> {
    /** 额外创建的卡牌 */
    public cards: UICard[] = [];

    public init(data: ChooseCommandData): void {
        if (!data.selecte_type || data.selecte_type === 'self') {
            data.selectable.forEach((v) => {
                const ui = UICard.createCommand(v, true);
                this.cards.push(ui);
                this.items.set(v, ui);
                this.owner.cards.addChild(ui);
            });

            this.game.card.hand_cards.forEach((v) => {
                v.item.setSelected(false);
                v.item.setCanClick(false);
            });
            this.game.card.flowHandCards();

            if (this.cards.length > 0) {
                this.game.card.addHandCards(this.cards);
            }
        } else {
            let window = this.game.window.getWindow(data.windowOptions?.id);
            if (!window) {
                if (this.request.options.canCancle) {
                    data.windowOptions.buttons.push('cancle');
                }
                window = UIWindow.create(this.game, data.windowOptions);
                if (data.selecte_type === 'rows') {
                    window.setRows(data.data_rows);
                }
                if (data.selecte_type === 'win') {
                    window.setDatas(data.selectable);
                }
                if (data.selecte_type === 'items') {
                    window.setItems(data.data_items);
                }
            }
            const content = window.contentNode;
            content.items.forEach((v, k) => {
                this.items.set(k, v);
            });
            this.window = window;
        }

        super.init(data);
    }

    public refresh(): void {
        super.refresh();
        //手牌不显示已选
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(v.item.selected, false);
        });
        this.game.card.refreshHandCards();
    }

    des(): void {
        super.des();
        if (this.cards.length > 0) {
            this.game.card.removeHandCards(this.cards);
        }
        this.game.card.flowHandCards(true);
        this.game.card.hand_cards.forEach((v) => {
            v.item.setSelected(false);
            v.item.setCanClick(true);
        });
        this.game.card.refreshHandCards();
    }
}
