const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { CustomString } from '../core/custom/custom.type';
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIOptionButtonBase } from './UIOptionButton.generated';

@regClass()
export class UIOptionButton extends UIOptionButtonBase {
    private static prefab: Laya.HierarchyResource;

    public static create(title: string) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/buttons/option.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Button1, () => {
            return this.prefab.create() as UIOptionButton;
        }) as UIOptionButton;
        node.setTitle(title);
        return node;
    }

    public item: ChooseItemComp;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);
    }

    public setTitle(title: string) {
        this.title = title;
    }

    onRet() {
        this.item?.onClick(undefined);
        this.offAll(Laya.Event.CLICK);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Button1, this);
    }
}
