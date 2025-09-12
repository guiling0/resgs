const { regClass } = Laya;
import { shitaishiciBase } from './shitaishici.generated';

@regClass()
export class shitaishici extends shitaishiciBase {
    play(data: any = {}) {
        const tostate = data.to ?? 2;
        this.getComponent(Laya.Spine2DRenderNode).play(
            `play${tostate}`,
            false,
            true
        );
        this.once(Laya.Event.STOPPED, () => {
            this.removeSelf();
        });
    }
}
