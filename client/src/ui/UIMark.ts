const { regClass } = Laya;
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIMarkBase } from './UIMark.generated';

@regClass()
export class UIMark extends UIMarkBase {
    private static prefab: Laya.HierarchyResource;

    public static create(url: string, value: number | string) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/room/mark.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Mark, () => {
            return this.prefab.create() as UIMark;
        }) as UIMark;
        node.set(url, value);
        return node;
    }

    public set(url: string, value: number | string) {
        this.loadImage(url);
        this.value.text = typeof value === 'number' ? value.toString() : '';
    }

    onRet() {
        this.size(21, 21);
        this.offAll(Laya.Event.CLICK);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Mark, this);
    }
}
