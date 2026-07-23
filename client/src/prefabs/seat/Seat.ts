import { SeatBase } from './Seat.generated';
import { ISeat } from './ISeat';
import { Player } from '@shared/core/player/Player';

const { regClass } = Laya;

/** OL UI 其他玩家座位 */
@regClass()
export class Seat extends SeatBase implements ISeat {
    onBind(player: Player): void {
        // TODO: 绑定全部子组件
        this.updateFrames(player);
        this.updateCamp(player);
        this.updateHp(player);
        this.updateTurnState(player);
        this.updateHandCount(player);
        this.updateEquips(player);
    }

    onUnbind(): void {
        // TODO: 解绑并清理
    }

    updateFrames(player: Player): void {
        // TODO: fanmian=player.skip, diezhi=国战, inplayphase=phase===Play,
        //       inresponse=响应中, jiustate=酒状态, indying=濒死,
        //       diaohulishan=调虎离山, offline=离线, trust=托管
    }

    updateCamp(player: Player): void {
        // TODO: kingdom = 势力图标 (国战/常规/dashili)
        //       figure = 身份图 resources/game/figure/{role}.png
    }

    updateHp(player: Player): void {
        // TODO: shield/shield_label, hp 勾玉列表, hplabel
    }

    updateTurnState(player: Player): void {
        // TODO: turnstate 回合指示, seat 座位号, tiesuo 铁索
    }

    updateHandCount(player: Player): void {
        // TODO: handcard 背景(势力) + handlabel 手牌数
    }

    updateEquips(player: Player): void {
        // TODO: equips 装备区子节点
    }
}
