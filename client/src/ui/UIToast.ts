const { regClass } = Laya;
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIToastBase } from './UIToast.generated';

@regClass()
export class UIToast extends UIToastBase {
    setToast(text: string) {
        this.text.text = text;
    }

    onGet() {
        this.pos(490, 493 - 94 * S.ui.toasts);
        S.ui.toasts++;
        this.alpha = 1;
        this.timerOnce(2000, this, () => {
            Laya.Tween.create(this)
                .to('y', -110)
                .to('alpha', 0)
                .duration(700)
                .then(() => {
                    this.destroy();
                });
        });
    }

    onRet() {
        S.ui.toasts--;
        Laya.Tween.killAll(this);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Toast, this);
    }
}
