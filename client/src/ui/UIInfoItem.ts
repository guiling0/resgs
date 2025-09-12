const { regClass } = Laya;
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIInfoItemBase } from './UIInfoItem.generated';

@regClass()
export class UIInfoItem extends UIInfoItemBase {
    private static prefab: Laya.HierarchyResource;

    public static create() {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes(
                'resources/about/general_info_item.lh'
            );
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.InfoItem, () => {
            return this.prefab.create() as UIInfoItem;
        }) as UIInfoItem;
        return node;
    }

    onGet() {
        this.skill.visible = true;
    }

    onRet() {
        this.skill_t.text = '';
        this.skill_t.offAll(Laya.Event.LINK);
        this.list.children.forEach((v) => v.destroy());
        this.list.removeChildren();
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.InfoItem, this);
    }
}
