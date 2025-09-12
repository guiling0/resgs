const { regClass } = Laya;
import { shenlusuBase } from './shenlusu.generated';

@regClass()
export class shenlusu extends shenlusuBase {
    play(data: any = {}) {
        this.getComponent(Laya.Spine2DRenderNode).play('play', false, true);
        this.once(Laya.Event.STOPPED, () => {
            this.removeSelf();
        });
    }
}
