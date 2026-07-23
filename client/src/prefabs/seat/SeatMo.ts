import { SeatMoBase } from './SeatMo.generated';
import { ISeat } from './ISeat';
import { Player } from '@shared/core/player/Player';

const { regClass } = Laya;

/** Mobile UI 其他玩家座位 */
@regClass()
export class SeatMo extends SeatMoBase implements ISeat {
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
        // TODO: 同 Seat
    }

    updateCamp(player: Player): void {
        // TODO: 同 Seat
    }

    updateHp(player: Player): void {
        // TODO: 同 Seat
    }

    updateTurnState(player: Player): void {
        // TODO: 同 Seat
    }

    updateHandCount(player: Player): void {
        // TODO: 同 Seat
    }

    updateEquips(player: Player): void {
        // TODO: 同 Seat
    }
}
