const { regClass } = Laya;
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UITextMarkBase } from './UITextMark.generated';

@regClass()
export class UITextMark extends UITextMarkBase {
    private static prefab: Laya.HierarchyResource;

    public static create(value: string) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/room/textmark.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.TextMark, () => {
            return this.prefab.create() as UITextMark;
        }) as UITextMark;
        node.set(value);
        return node;
    }

    public set(value: string) {
        this.text = value;
    }

    onRet() {
        this.offAll(Laya.Event.CLICK);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.TextMark, this);
    }
}
