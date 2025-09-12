const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { GameCard } from '../core/card/card';
import { CustomString } from '../core/custom/custom.type';
import { General } from '../core/general/general';
import { UICard } from './UICard';
import { UIItemsBase } from './UIItems.generated';
import { UIItemsRow } from './UIItemsRow';
import { UIWindow } from './UIWindow';

@regClass()
export class UIItems extends UIItemsBase {
    public window: UIWindow;
    public rows: UIItemsRow[] = [];
    public items: Map<any, UICard> = new Map();
    public datas: {
        title: CustomString;
        items: {
            title: CustomString;
            card: any;
            x?: number;
            y?: number;
        }[];
        condition?: number;
    }[];

    onAwake(): void {
        this.rows.push(this.items_0);
        this.rows.push(this.items_1);
        this.rows.push(this.items_2);
        this.rows.push(this.items_3);
        this.rows.push(this.items_4);
    }

    init(
        data: {
            title: CustomString;
            items: {
                title: CustomString;
                card: any;
                x?: number;
                y?: number;
            }[];
        }[],
        isDrag: boolean = false
    ) {
        this.datas = data;
        data.forEach((v, i) => {
            const row = this.rows.at(i);
            if (!row) return;
            row.areaname.text = this.window.room.getTranslation(v.title);
            row.visible = true;
            // row.areabg.visible = v.title !== '#hide';
            v.items.forEach((item, ii) => {
                row.items[ii].visible = true;
                row.items[ii].areaname.text = this.window.room.getTranslation(
                    item.title
                );
                const fromPoint = Laya.Point.create();
                row.items[ii].localToGlobal(fromPoint, false, this.window);
                item.x = fromPoint.x + 90;
                item.y = fromPoint.y + 132;
                if (item.card) {
                    if (typeof item.card === 'string') {
                        item.card =
                            this.window.room.game.getCard(item.card) ??
                            this.window.room.game.getGeneral(item.card);
                    }
                    let ui: UICard;
                    if (item.card instanceof General) {
                        ui = UICard.createGeneral(item.card);
                    } else if (item.card instanceof GameCard) {
                        ui = UICard.createCard(
                            item.card,
                            item.card.canVisible?.(this.window.room.self) ??
                                true
                        );
                    } else if (typeof item.card === 'number') {
                        ui = UICard.createCommand(item.card, true);
                    } else {
                        ui = UICard.createCard(item.card, true);
                    }
                    if (isDrag) {
                        this.window.addChild(ui);
                        ui.pos(fromPoint.x + 90, fromPoint.y + 132);
                    } else {
                        row.items[ii].addChild(ui);
                        ui.pos(70, 97);
                    }
                    this.items.set(item.card, ui);
                    this.window.room.card.cards.push(ui);
                }
            });
        });
        this.frameOnce(10, this, () => {
            this.window.setContent(this);
            if (isDrag) {
                this.items.forEach((v) => {
                    v.item.onClick(undefined);
                    v.item.setCanClick(true);
                    v.on(Laya.Event.MOUSE_DOWN, this, () => {
                        this.onStartDrag(v.item);
                    });
                    v.on(Laya.Event.MOUSE_UP, this, () => {
                        this.onEndDrag(v.item);
                    });
                });
                //刷新确定按钮
                const isok = this.datas.every((v, i) => {
                    if (v.condition) {
                        return (
                            v.items.filter((c) => !!c.card).length ===
                            v.condition
                        );
                    } else {
                        return true;
                    }
                });
                this.window.buttonNodes.forEach((v, k) => {
                    if (k === 'confirm') {
                        v.item.setCanClick(isok);
                        return;
                    }
                });
            }
        });
    }

    onChange(
        type: 'add' | 'remove',
        item: any,
        selected: any[],
        onItemClick: Function
    ) {}

    des(): void {
        this.items.forEach((v) => {
            lodash.remove(this.window.room.card.cards, (c) => c === v);
            v.destroy();
        });
        this.items.clear();
        this.rows.forEach((v) => {
            v.items.forEach((i) => (i.visible = false));
            v.visible = false;
        });
    }

    protected onStartDrag(item: ChooseItemComp) {
        item.owner.startDrag();
    }

    protected onEndDrag(item: ChooseItemComp) {
        const min = { x: 1920, y: 1080 };
        const target = { x: 0, y: 0 };
        this.datas.forEach((v) => {
            const y = Math.abs(v.items[0].y - item.owner.y);
            if (y < min.y) {
                min.y = y;
                target.y = v.items[0].y;
            }
            v.items.forEach((i) => {
                const x = Math.abs(i.x - item.owner.x);
                if (x < min.x) {
                    min.x = x;
                    target.x = i.x;
                }
            });
        });
        let source: {
            title: CustomString;
            card: any;
            x?: number;
            y?: number;
        };
        let to: {
            title: CustomString;
            card: any;
            x?: number;
            y?: number;
        };
        const ui = item.owner as UICard;
        this.datas.forEach((v) => {
            v.items.forEach((i) => {
                if (i.card === ui.card) source = i;
                if (i.x === target.x && i.y === target.y) to = i;
            });
        });
        if (to?.card && source) {
            const newui = this.items.get(to.card);
            newui.moveTo(source.x, source.y, false, false);
            ui.moveTo(to.x, to.y, false, false);
            [to.card, source.card] = [source.card, to.card];
        } else if (to) {
            ui.moveTo(to.x, to.y, false, false);
            to.card = ui.card;
            source.card = undefined;
        }

        //整理所有
        this.datas.forEach((v) => {
            const cards = v.items.map((c) => c.card).filter((c) => c);
            v.items.forEach((c, i) => {
                const ui = this.items.get(cards[i]);
                if (ui) {
                    ui.moveTo(v.items[i].x, v.items[i].y, false, false);
                    c.card = cards[i];
                } else {
                    c.card = undefined;
                }
            });
        });

        //刷新确定按钮
        const isok = this.datas.every((v, i) => {
            if (v.condition) {
                return v.items.filter((c) => !!c.card).length === v.condition;
            } else {
                return true;
            }
        });
        this.window.buttonNodes.forEach((v, k) => {
            if (k === 'confirm') {
                v.item.setCanClick(isok);
                return;
            }
        });
    }
}
