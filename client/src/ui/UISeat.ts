const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { UISeatBase } from './UISeat.generated';

@regClass()
export class UISeat extends UISeatBase {
    public item: ChooseItemComp;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);

        this.guozhan_mark_small.on(Laya.Event.CLICK, this, () => {
            this.guozhan_mark_big.visible = true;
        });

        this.b_wei.on(Laya.Event.CLICK, this, () => {
            this.b_wei.grayed = this.s_wei.grayed = !this.b_wei.grayed;
            this.guozhan_mark_big.visible = false;
        });

        this.b_shu.on(Laya.Event.CLICK, this, () => {
            this.b_shu.grayed = this.s_shu.grayed = !this.b_shu.grayed;
            this.guozhan_mark_big.visible = false;
        });

        this.b_wu.on(Laya.Event.CLICK, this, () => {
            this.b_wu.grayed = this.s_wu.grayed = !this.b_wu.grayed;
            this.guozhan_mark_big.visible = false;
        });

        this.b_qun.on(Laya.Event.CLICK, this, () => {
            this.b_qun.grayed = this.s_qun.grayed = !this.b_qun.grayed;
            this.guozhan_mark_big.visible = false;
        });

        this.b_jin.on(Laya.Event.CLICK, this, () => {
            this.b_jin.grayed = this.s_jin.grayed = !this.b_jin.grayed;
            this.guozhan_mark_big.visible = false;
        });

        this.b_ye.on(Laya.Event.CLICK, this, () => {
            this.b_ye.grayed = this.s_ye.grayed = !this.b_ye.grayed;
            this.guozhan_mark_big.visible = false;
        });
    }
}
