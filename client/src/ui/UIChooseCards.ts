const { regClass } = Laya;
import { GameCard } from '../core/card/card';
import { General } from '../core/general/general';
import { UICard } from './UICard';
import { UIChooseCardsBase } from './UIChooseCards.generated';
import { UIWindow } from './UIWindow';

@regClass()
export class UIChooseCards extends UIChooseCardsBase {
    public window: UIWindow;
    public items: Map<any, UICard> = new Map();

    init(data: any[]) {
        data.forEach((v) => {
            if (typeof v === 'string') {
                v =
                    this.window.room.game.getCard(v) ??
                    this.window.room.game.getGeneral(v);
            }
            let ui: UICard;
            if (v instanceof General) {
                ui = UICard.createGeneral(v);
                ui.item?.onLongClick(() => {
                    this.window.room.card.showGeneralInfo([v]);
                });
            } else if (v instanceof GameCard) {
                ui = UICard.createCard(
                    v,
                    v.canVisible?.(this.window.room.self) ?? true
                );
                ui.item?.onLongClick(() => {
                    if (v.canVisible(this.window.room.self)) {
                        this.window.room.card.showCardInfo(v);
                    }
                });
            } else if (typeof v === 'number') {
                ui = UICard.createCommand(v, true);
            } else {
                ui = UICard.createCard(v, true);
            }
            this.cards.addChild(ui);
            this.items.set(v, ui);
            this.window.room.card.cards.push(ui);
        });
        this.frameOnce(2, this, () => {
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
    }
}
