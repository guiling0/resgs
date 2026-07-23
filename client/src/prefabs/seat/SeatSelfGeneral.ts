import { SeatSelfGeneralBase } from './SeatSelfGeneral.generated';
import { ISeatGeneral } from './ISeatGeneral';
import { General } from '@shared/core/general/General';
import { Player } from '@shared/core/player/Player';

const { regClass } = Laya;

/** OL UI 自己座位的武将展示 (含frames + nameinfo) */
@regClass()
export class SeatSelfGeneral extends SeatSelfGeneralBase implements ISeatGeneral {
    onBind(general: General): void {
        // TODO: 根据 general 更新 img / qianfu / lock / name_bg / gname / icon
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

    // ===== SelfSeat 专属帧状态 =====

    /** 刷新帧状态 */
    updateFrames(player: Player): void {
        // TODO: 更新 fanmian/diezhi/inplayphase/inresponse/jiustate/indying/diaohulishan/isSelected
    }

    /** 刷新名字和势力 */
    updateNameInfo(general: General): void {
        // TODO: name_bg = resources/game/name/{kingdom}.png
        // TODO: gname = sgs.getTranslation(general.trueName)
        // TODO: icon 暂未定义
    }
}
