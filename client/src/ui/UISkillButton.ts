const { regClass } = Laya;
import { ChooseItemComp } from '../comps/ChooseItemComp';
import { Skill } from '../core/skill/skill';
import { SkillTag } from '../core/skill/skill.types';
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UISkillButtonBase } from './UISkillButton.generated';

@regClass()
export class UISkillButton extends UISkillButtonBase {
    private static prefab: Laya.HierarchyResource;

    public static create(skill: Skill) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/buttons/skill.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Button2, () => {
            return this.prefab.create() as UISkillButton;
        }) as UISkillButton;
        node.set(skill, 1);
        return node;
    }

    public item: ChooseItemComp;
    public skill: Skill;

    onAwake(): void {
        this.item = this.getComponent(ChooseItemComp);
    }

    set(skill: Skill, mode: number = 1) {
        this.skill = skill;
        if (!skill) return;
        let image = 'resources/buttons/texture/proactive.png';
        if (skill.effects.every((v) => v.hasTag(SkillTag.Lock))) {
            image = 'resources/buttons/texture/lock2.png';
        }
        if (skill.effects.find((v) => v.hasTag(SkillTag.Awake))) {
            image = 'resources/buttons/texture/awake.png';
        }
        if (skill.effects.find((v) => v.hasTag(SkillTag.Limit))) {
            image = 'resources/buttons/texture/limit.png';
        }
        if (this.img.url !== image) {
            this.img.loadImage(image);
        }
        this.title.text = sgs.getTranslation(skill.name);
        this.width = mode === 1 ? 85 : 173;
    }

    setPreShow(value: boolean) {
        this.alpha = value ? 1 : 0.5;
    }

    onGet() {
        this.visible = true;
        this.alpha = 1;
    }

    onRet() {
        this.visible = false;
        if (this.item) {
            this.item.onClick(undefined);
            this.item.setCanClick(true);
            this.item.setSelected(false);
        }
        this.offAll(Laya.Event.CLICK);
        this.title.text = ``;
    }

    destroy(): void {
        S.ui.retObjectFromPool(EntityTypeEnum.Button2, this);
    }
}
