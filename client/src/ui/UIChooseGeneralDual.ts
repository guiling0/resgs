const { regClass } = Laya;
import { RoomGameComp } from '../comps/room/RoomGameComp';
import { ChooseGeneralData } from '../core/choose/types/choose.general';
import { General } from '../core/general/general';
import { WindowOptions } from '../core/room/room.types';
import { UICard } from './UICard';
import { UIChooseGeneralDualBase } from './UIChooseGeneralDual.generated';
import { UIWindow } from './UIWindow';

@regClass()
export class UIChooseGeneralDual extends UIChooseGeneralDualBase {
    public window: UIWindow;

    public items: Map<General, UICard> = new Map();
    public selecteds: Map<General, UICard> = new Map();

    init(data: ChooseGeneralData) {
        data.selectable.forEach((v, i) => {
            const general = UICard.createGeneral(v);
            this.generals.addChild(general);
            //有没有珠联璧合
            const zhulian = data.selectable.find((g) =>
                sgs.relationships.find(
                    (r) =>
                        (r[0] === v.id && r[1] === g.id) ||
                        (r[0] === g.id && r[1] === v.id)
                )
            );
            general.setZhulian(zhulian?.kingdom);
            this.items.set(v, general);
            general.item?.onLongClick(() => {
                this.window.room.card.showGeneralInfo([v]);
            });
        });
        this.frameOnce(2, this, () => {
            this.window?.setContent(this);
        });
    }

    onChange(
        type: 'add' | 'remove',
        item: General,
        selected: General[],
        onItemClick: Function
    ) {
        const ui = this.items.get(item);
        if (!ui) return;
        const fromPoint = Laya.Point.create();
        fromPoint.x = 70;
        fromPoint.y = 97.5;
        ui.localToGlobal(fromPoint, false, this.window);
        if (type === 'remove') {
            const newItem = this.selecteds.get(item);
            const x = newItem.x,
                y = newItem.y;
            Laya.Tween.create(newItem)
                .duration(500)
                .to('x', fromPoint.x)
                .to('y', fromPoint.y)
                .ease(Laya.Ease.expoOut)
                .then(() => {
                    newItem.destroy();
                    ui.visible = true;
                    this.selecteds.delete(item);
                    fromPoint.recover();
                });
            if (this.selecteds.size === 2 && selected.length === 1) {
                const deputy = this.selecteds.get(selected[0]);
                if (deputy.x > x) {
                    Laya.Tween.create(deputy)
                        .duration(500)
                        .to('x', x)
                        .to('y', y)
                        .ease(Laya.Ease.expoOut);
                }
            }
        }
        if (type === 'add') {
            const target = selected.length === 1 ? this.head : this.deputy;
            const targetPoint = Laya.Point.create();
            targetPoint.x = 70;
            targetPoint.y = 97.5;
            target.localToGlobal(targetPoint, false, this.window);
            const newItem = UICard.createGeneral(item);
            newItem.pos(fromPoint.x, fromPoint.y);
            newItem.item.onClick(() => {
                onItemClick(item);
            });
            this.window.addChild(newItem);
            Laya.Tween.create(newItem)
                .duration(500)
                .go('x', fromPoint.x, targetPoint.x)
                .go('y', fromPoint.y, targetPoint.y)
                .ease(Laya.Ease.expoOut)
                .onStart(() => {
                    ui.visible = false;
                })
                .then(() => {
                    this.selecteds.set(item, newItem);
                    targetPoint.recover();
                    fromPoint.recover();
                });
        }
    }

    des(): void {
        this.selecteds.forEach((v) => v.destroy());
        this.items.forEach((v) => v.destroy());
        this.selecteds.clear();
        this.items.clear();
    }
}
