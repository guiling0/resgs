import { SeatGeneralBase } from './SeatGeneral.generated';
import { ISeatGeneral } from './ISeatGeneral';
import { General } from '@shared/core/general/General';

const { regClass } = Laya;

/** OL UI 座位中的单将展示 */
@regClass()
export class SeatGeneral extends SeatGeneralBase implements ISeatGeneral {
    onBind(general: General): void {
        // TODO: 根据 general 更新 img / qianfu / lock
    }

    onUnbind(): void {
        // TODO: 清理资源
    }

    updatePut(put: boolean): void {
        this.qianfu.visible = !put;
        // TODO: qianfu_icon 根据势力调整
    }

    updateLock(locked: boolean): void {
        this.lock.visible = locked;
    }
}
