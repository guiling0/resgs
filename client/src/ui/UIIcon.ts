const { regClass } = Laya;
import { VirtualCard } from '../core/card/vcard';
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIIconBase } from './UIIcon.generated';

@regClass()
export class UIIcon extends UIIconBase {
    private static prefab: Laya.HierarchyResource;

    public static create(data: VirtualCard) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/room/icon.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Icon, () => {
            return this.prefab.create() as UIIcon;
        }) as UIIcon;
        node.set(data);
        return node;
    }

    public card: VirtualCard;

    set(data: VirtualCard) {
        this.card = data;
        this.loadImage(`resources/room/texture/game/icon/${data.name}.png`);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Icon, this);
    }
}
