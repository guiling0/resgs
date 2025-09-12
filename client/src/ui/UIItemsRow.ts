const { regClass } = Laya;
import { UIItemItems } from './UIItemItems';
import { UIItemsRowBase } from './UIItemsRow.generated';

@regClass()
export class UIItemsRow extends UIItemsRowBase {
    public items: UIItemItems[] = [];

    onAwake(): void {
        this.items.push(this.items_items_0);
        this.items.push(this.items_items_1);
        this.items.push(this.items_items_2);
        this.items.push(this.items_items_3);
        this.items.push(this.items_items_4);
        this.items.push(this.items_items_5);
        this.items.push(this.items_items_6);
        this.items.push(this.items_items_7);
        this.items.push(this.items_items_8);
        this.items.push(this.items_items_9);
    }
}
