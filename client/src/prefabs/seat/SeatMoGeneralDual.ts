import { SeatMoGeneralDualBase } from './SeatMoGeneralDual.generated';
import { ISeatGeneral } from './ISeatGeneral';
import { General } from '@shared/core/general/General';

const { regClass } = Laya;

/** Mobile UI 座位中的双将展示 */
@regClass()
export class SeatMoGeneralDual extends SeatMoGeneralDualBase implements ISeatGeneral {
    onBind(general: General): void {
        // TODO: 根据 general 更新 img / qianfu / lock
    }

    onUnbind(): void {
        // TODO: 清理资源
    }

    updatePut(put: boolean): void {
        this.qianfu.visible = !put;
    }

    updateLock(locked: boolean): void {
        this.lock.visible = locked;
    }
}
