const { regClass } = Laya;
import { ScenesEnum } from '../enums';
import { S } from '../singleton';
import { UIAboutBase } from './UIAbout.generated';

@regClass()
export class UIAbout extends UIAboutBase {
    onAwake(): void {
        this.back.on(Laya.Event.CLICK, () => {
            S.ui.closeScene(ScenesEnum.About);
        });
    }
}
