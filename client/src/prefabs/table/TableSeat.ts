const { regClass } = Laya;
import { SeatState } from '@shared/core/schema';
import { TableSeatBase } from './TableSeat.generated';
import { ResManager } from 'src/ResManager';

@regClass()
export class TableSeat extends TableSeatBase {
    set(state?: SeatState, isSelf: boolean = false, isOwner: boolean = false) {
        if (!state) {
            ResManager.clearSkin(this.avatar);
            this.playername.text = '';
            this.info.visible = false;
            ResManager.clearSkin(this.state);
            return;
        }
        ResManager.bindSkin(this.avatar, state.avatar);
        this.playername.text = state.nickname;
        this.playername.color = isSelf ? '#ff0000' : '#ffffff';
        //TODO 玩家胜率信息 暂时先隐藏
        this.info.visible = false;
        if (isOwner) {
            ResManager.bindSkin(this.state, 'resources/table/owner.png');
        } else if (state.ready) {
            ResManager.bindSkin(this.state, 'resources/table/ready.png');
        } else {
            ResManager.clearSkin(this.state);
        }
    }
}
