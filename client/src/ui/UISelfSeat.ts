const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { UISelfSeatBase } from './UISelfSeat.generated';

@regClass()
export class UISelfSeat extends UISelfSeatBase {
    public item: ChooseItemComp;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);
    }
}
