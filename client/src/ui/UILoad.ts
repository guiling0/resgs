const { regClass } = Laya;
import { ScenesEnum } from '../enums';
import { S } from '../singleton';
import { UILoadBase } from './UILoad.generated';

@regClass()
export class UILoad extends UILoadBase {
    onAwake(): void {
        this.txt.text = '正在准备加载';
        // const int = sgs.utils.randomInt(1, 17);
        const int = 17;
        Laya.loader.load(
            [
                'animation/generlas/caomao/state2_beijing/BeiJing.json',
                'animation/generlas/caomao/state2_skin/XingXiang.json',
            ],
            Laya.Loader.SPINE,
            () => {
                this.txt.text = '正在加载{text=资源}...{value=0}%';
                S.res.initLoad(
                    this.onProgress.bind(this),
                    this.onComplete.bind(this)
                );
            }
        );
        // this.bg.loadImage(
        //     `resources/background/loading/${int}.png`,
        //     Laya.Handler.create(this, () => {
        //         this.txt.text = '正在加载{text=资源}...{value=0}%';
        //         S.res.initLoad(
        //             this.onProgress.bind(this),
        //             this.onComplete.bind(this)
        //         );
        //     })
        // );
    }

    onProgress(progress: number) {
        this.ProgressBar.value = progress;
        this.txt.setVar('value', (progress *= 100).toFixed(2));
    }

    onComplete() {
        this.onProgress(1);
        this.txt.text = '加载完成';
        Laya.timer.once(1800, this, () => {
            S.ui.closeScene(ScenesEnum.Load);
            S.ui.openScene(ScenesEnum.Entry);
        });
        //提前添加对象池
    }
}
