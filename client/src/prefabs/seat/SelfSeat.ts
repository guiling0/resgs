import { SelfSeatBase } from './SelfSeat.generated';
import { ISeat } from './ISeat';
import { Player } from '@shared/core/player/Player';

const { regClass } = Laya;

/** OL UI 自己的座位 (底部 1920×430) */
@regClass()
export class SelfSeat extends SelfSeatBase implements ISeat {
    onBind(player: Player): void {
        this.updateFrames(player);
        this.updateCamp(player);
        this.updateHp(player);
        this.updateTurnState(player);
        this.updateHandCount(player);
        this.updateEquips(player);
    }

    onUnbind(): void {}

    updateFrames(player: Player): void {
        // TODO: fanmian/diezhi/inplayphase/inresponse/jiustate/indying/diaohulishan/offline/trust/isSelected
    }

    updateCamp(player: Player): void {
        // TODO: kingdom 势力图 + figure 身份图(无身份模式隐藏)
        //       guozhan_k_mark 国战势力标记
        //       k_mark 常规势力标记
    }

    updateHp(player: Player): void {
        // TODO: shield/shield_label + hp 勾玉 + hplabel(>5时文本显示)
    }

    updateTurnState(player: Player): void {
        // TODO: turnstate + seat 座位号 + tiesuo 铁索 + rest 休整
    }

    updateHandCount(player: Player): void {
        // TODO: handcard (resources/game/hand/{kingdom}.png) + handlabel
    }

    updateEquips(player: Player): void {
        // TODO: equips 装备区
    }
}
