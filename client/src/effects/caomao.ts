const { regClass } = Laya;
import { caomaoBase } from './caomao.generated';

@regClass()
export class caomao extends caomaoBase {
    play(data: any = {}) {
        this.getComponent(Laya.Spine2DRenderNode).play('play', false, true);
        this.once(Laya.Event.STOPPED, () => {
            this.removeSelf();
        });
    }
}
