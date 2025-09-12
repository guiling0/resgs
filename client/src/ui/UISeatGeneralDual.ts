const { regClass } = Laya;
import { ServerConfig } from '../config';
import { General } from '../core/general/general';
import { UISeatGeneralDualBase } from './UISeatGeneralDual.generated';

@regClass()
export class UISeatGeneralDual extends UISeatGeneralDualBase {
    public setImage(general?: General) {
        let url = '';
        if (general) {
            if (general.sourceData.isDualImage) {
                url = `${ServerConfig.res_url}/${general.getAssetsUrl(
                    'dual_image'
                )}`;
                this.img_dual.visible = true;
                this.img_dual.loadImage(url);
                return;
            } else {
                url = `${ServerConfig.res_url}/${general.getAssetsUrl(
                    'image'
                )}`;
                this.img_dual.visible = false;
            }
        } else {
            url = `resources/room/texture/game/uknown.png`;
        }
        this.img.loadImage(url);
    }

    /** 设置锁 */
    public setLock(value: boolean) {
        this.lock.visible = value;
    }

    /** 设置潜伏 */
    setQianfu(value: boolean, icon: boolean = true) {
        this.qianfu.visible = value;
        this.qianfu_icon.visible = icon;
    }
}
