const { regClass } = Laya;
import { GameCard } from '../core/card/card';
import { CustomString } from '../core/custom/custom.type';
import { General } from '../core/general/general';
import { UICard } from './UICard';
import { UIRowItems } from './UIRowItems';
import { UIRowsBase } from './UIRows.generated';
import { UIWindow } from './UIWindow';

@regClass()
export class UIRows extends UIRowsBase {
    public window: UIWindow;
    public rows: UIRowItems[] = [];
    public items: Map<any, UICard> = new Map();

    onAwake(): void {
        this.rows.push(this.rows_items_0);
        this.rows.push(this.rows_items_1);
        this.rows.push(this.rows_items_2);
        this.rows.push(this.rows_items_3);
        this.rows.push(this.rows_items_4);
    }

    init(
        data: {
            title: CustomString;
            cards: any[];
        }[]
    ) {
        data.forEach((v, i) => {
            const row = this.rows.at(i);
            if (!row) return;
            row.areaname.text = this.window.room.getTranslation(v.title);
            row.visible = true;
            row.cards.width = Math.min(8 * 140, v.cards.length * 140);
            const interval = Math.min(row.cards.width / v.cards.length, 140);
            row.cards.width += 30;
            v.cards.forEach((card, index) => {
                if (typeof card === 'string') {
                    card =
                        this.window.room.game.getCard(card) ??
                        this.window.room.game.getGeneral(card);
                }
                let ui: UICard;
                if (card instanceof General) {
                    ui = UICard.createGeneral(card);
                } else if (card instanceof GameCard) {
                    ui = UICard.createCard(
                        card,
                        card.canVisible?.(this.window.room.self) ?? true
                    );
                } else if (typeof card === 'number') {
                    ui = UICard.createCommand(card, true);
                } else {
                    ui = UICard.createCard(card, true);
                }
                row.cards.addChild(ui);
                const x = interval * index + 70;
                const y = 97;
                ui.moveTo(x, y, false, false);
                this.items.set(card, ui);
                this.window.room.card.cards.push(ui);
            });
        });
        this.frameOnce(1, this, () => {
            this.window.setContent(this);
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
        this.rows.forEach((v) => (v.visible = false));
    }
}
