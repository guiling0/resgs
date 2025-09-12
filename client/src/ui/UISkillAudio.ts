const { regClass } = Laya;
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UISkillAudioBase } from './UISkillAudio.generated';

@regClass()
export class UISkillAudio extends UISkillAudioBase {
    private static prefab: Laya.HierarchyResource;

    public static create(text: string) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/about/skill_audio.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.SkillAudio, () => {
            return this.prefab.create() as UISkillAudio;
        }) as UISkillAudio;
        node.setText(text);
        return node;
    }

    setText(text: string) {
        this.txt.text = text;
    }

    onRet() {
        this.offAll(Laya.Event.CLICK);
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.SkillAudio, this);
    }
}
