const { regClass } = Laya;
import { shichangshiBase } from './shichangshi.generated';

const characters: { [key: string]: string } = {
    'mobile.cs_sunzhang': 'scs_effect_0',
    'mobile.cs_duangui': 'scs_effect_1',
    'mobile.cs_hankui': 'scs_effect_2',
    'mobile.cs_xiayun': 'scs_effect_3',
    'mobile.cs_bilan': 'scs_effect_4',
    'mobile.cs_gaowang': 'scs_effect_5',
    'mobile.cs_lisong': 'scs_effect_6',
    'mobile.cs_guosheng': 'scs_effect_7',
    'mobile.cs_zhaozhong': 'scs_effect_8',
    'mobile.cs_zhangrang': 'scs_effect_9',
};

@regClass()
export class shichangshi extends shichangshiBase {
    play(data: any = {}) {
        const uses = data.uses as string[];
        const news = data.news as string[];
        const comp = this.shichangshi_bagua.getComponent(
            Laya.Spine2DRenderNode
        );
        comp.play('play1', false, true);
        this.once(Laya.Event.STOPPED, () => {
            if (comp.animationName === 'play1') {
                comp.play('play2', true, true);
            }
        });
        this.timerOnce(500, this, () => {
            //已用过的直接设置为true
            uses.forEach((v) => {
                const node = (this as any)[characters[v]] as Laya.Sprite;
                node.visible = true;
                const ani = node.getComponent(Laya.Spine2DRenderNode);
                ani.play('play2', true, true);
            });
            news.forEach((v) => {
                const node = (this as any)[characters[v]] as Laya.Sprite;
                node.visible = true;
                const ani = node.getComponent(Laya.Spine2DRenderNode);
                ani.play('play1', true, true);
                node.once(Laya.Event.STOPPED, () => {
                    if (ani.animationName === 'play1') {
                        comp.play('play2', true, true);
                    }
                });
            });
        });
        this.timerOnce(3000, this, () => {
            comp.play('play3', false, true);
        });

        this.timerOnce(3500, this, () => {
            this.removeSelf();
        });
    }
}
