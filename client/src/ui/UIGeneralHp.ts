const { regClass } = Laya;
import { GeneralKingdom } from '../core/general/general.type';
import { UIGeneralHpBase } from './UIGeneralHp.generated';
import { S } from '../singleton';
import { EntityTypeEnum } from '../enums';

@regClass()
export class UIGeneralHp extends UIGeneralHpBase {
    private static prefab: Laya.HierarchyResource;
    public static create(kingdom: GeneralKingdom, number: 1 | 0.5 | 0.1 = 1) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/card/generalhp.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.GeneralHp, () => {
            return this.prefab.create() as UIGeneralHp;
        }) as UIGeneralHp;
        node.set(kingdom, number);
        return node;
    }

    set(kingdom: GeneralKingdom, number: 1 | 0.5 | 0.1 = 1) {
        this.hp_right.visible = number === 1;
        if (typeof kingdom === 'string') {
            if (number === 0.1) {
                this.hp_left.loadImage(
                    `resources/card/texture/general/hp/${kingdom}/${kingdom}hp_4.png`
                );
            } else {
                this.hp_left.loadImage(
                    `resources/card/texture/general/hp/${kingdom}/${kingdom}hp_0.png`
                );
                this.hp_right.loadImage(
                    `resources/card/texture/general/hp/${kingdom}/${kingdom}hp_2.png`
                );
            }
        } else {
            if (number === 0.1) {
                this.hp_left.loadImage(
                    `resources/card/texture/general/hp/${kingdom[0]}/${kingdom[0]}hp_4.png`
                );
            } else {
                this.hp_left.loadImage(
                    `resources/card/texture/general/hp/${kingdom[0]}/${kingdom[0]}hp_0.png`
                );
            }
            this.hp_right.loadImage(
                `resources/card/texture/general/hp/${kingdom[1]}/${kingdom[1]}hp_2.png`
            );
        }
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.GeneralHp, this);
    }
}
