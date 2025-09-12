import { ServerConfig } from '../../config';
import { EntityTypeEnum, res } from '../../enums';
import { S } from '../../singleton';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { SelfSeatComp } from '../player/SelfSeatComp';
import { RoomGameComp } from './RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export class GameAniComp extends Laya.Script {
    declare owner: UIGameRoom;

    public game: RoomGameComp;

    public jxxd_ani: Laya.Spine2DRenderNode;

    onStart(): void {
        this.game = this.owner.getComponent(RoomGameComp);

        this.jxxd_ani = this.owner.jxxd.getComponent(Laya.Spine2DRenderNode);
    }

    /**
     * 播放指向线
     * @param source 起始玩家ID
     * @param targets 目标玩家ID
     * @param type 播放方式
     * 1-起始玩家至所有玩家同时开始
     * 2-起始玩家到目标玩家[0]，起始玩家到目标玩家[1]....以此类推
     * 3-起始玩家到目标玩家[0]，目标玩家[0]-目标玩家[1]...以此类推
     */
    public playDirectLine(source: string, targets: string[], type: number = 1) {
        if (type === 1) {
            targets.forEach((v) => {
                this._playDirectLine(source, v);
            });
        }
        if (type === 2) {
            targets.forEach((v, i) => {
                this.owner.timerOnce(i * 850, this, () => {
                    this._playDirectLine(source, v);
                });
            });
        }
        if (type === 3) {
            targets.forEach((v, i) => {
                this.owner.timerOnce(i * 850, this, () => {
                    if (i === 0) {
                        this._playDirectLine(source, v);
                    } else {
                        this._playDirectLine(targets[i - 1], v);
                    }
                });
            });
        }
    }

    public _playDirectLine(source: string, target: string) {
        if (target === source) return;
        const from = this.game.players.get(source);
        if (!from) return;
        const sourcePos = from.isSelf
            ? { x: 960, y: 870 }
            : { x: from.owner.x, y: from.owner.y };
        const to = this.game.players.get(target);
        if (!to) return;
        const targetPos = to.isSelf
            ? { x: 960, y: 870 }
            : { x: to.owner.x, y: to.owner.y };
        if (sourcePos.x === targetPos.x && sourcePos.y === targetPos.y) return;
        const line = S.ui.getObjectFromPool(EntityTypeEnum.Line, () => {
            return new Laya.GImage();
        }) as Laya.GImage;
        Laya.Tween.killAll(line);
        line.loadImage(`resources/room/texture/game/line/line.png`);
        line.anchor(0, 0.5);
        line.size(0, 15);
        line.pos(sourcePos.x, sourcePos.y);
        line.rotation = 0;
        const x = Math.floor(targetPos.x - sourcePos.x);
        const y = Math.floor(targetPos.y - sourcePos.y);
        let rotation = Math.atan(y / x) / (Math.PI / 180);
        if (targetPos.x < sourcePos.x && targetPos.y < sourcePos.y) {
            line.rotation += 180 + rotation;
        }
        if (targetPos.x > sourcePos.x && targetPos.y < sourcePos.y) {
            line.rotation += rotation;
        }
        if (targetPos.x > sourcePos.x && targetPos.y > sourcePos.y) {
            line.rotation += rotation;
        }
        if (targetPos.x < sourcePos.x && targetPos.y > sourcePos.y) {
            line.rotation += 180 + rotation;
        }
        if (targetPos.y === sourcePos.y && targetPos.x < sourcePos.x) {
            line.rotation = 180;
        }
        if (targetPos.x === sourcePos.x) {
            if (targetPos.y < sourcePos.y) {
                line.rotation = 270;
            } else {
                line.rotation = 90;
            }
        }
        const width = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        Laya.Tween.create(line)
            .duration(500)
            .to('width', width)
            .onStart(() => {
                this.owner.addChild(line);
            })
            .then(() => {
                line.anchorX = 1;
                line.pos(targetPos.x, targetPos.y);
                Laya.Tween.create(line)
                    .duration(350)
                    .to('width', 0)
                    .then(() => {
                        S.ui.retObjectFromPool(EntityTypeEnum.Line, line);
                    });
            });
    }

    /** ban势力动画 */
    public banCountry(result: string) {
        this.owner.bancountry.play(result);
    }

    /** 觉醒限定 */
    public jxxd(type: 'awake' | 'limit', data: any = {}) {
        const general = this.game.game.getGeneral(data.general);
        const skill = this.game.game.getSkill(data.skill);
        if (!general || !skill) return;
        //武将图移动
        let comp = this.game.players.get(data.player);
        if (!comp) comp = this.owner.selfseat.getComponent(SelfSeatComp);
        let animation: string;
        let skillpos: { x: number; y: number } = { x: 0, y: 0 };
        let avatarPos: { x: number; y: number } = { x: 0, y: 0 };
        if (type === 'awake') {
            animation = 'animation1';
            skillpos = { x: 1059, y: 620 };
            avatarPos = { x: 685, y: 552 };
        } else {
            animation = 'animation2';
            skillpos = { x: 1059, y: 578 };
            avatarPos = { x: 680, y: 531 };
        }
        //加载武将图
        this.owner.avatar_jxxd.loadImage(
            `${ServerConfig.res_url}/${general.getAssetsUrl('image')}`
        );
        Laya.Tween.create(this.owner.avatar_jxxd)
            .duration(1000)
            .go('x', comp.isSelf ? 1784 : comp.owner.x, 960)
            .go('y', comp.isSelf ? 966 : comp.owner.x, 540)
            .go('scaleX', 0, 2)
            .go('scaleY', 0, 2)
            .ease(Laya.Ease.expoOut)
            .onStart(() => {
                this.owner.avatar_jxxd.visible = true;
                this.owner.skill_name.visible = true;
                this.owner.skill_name.pos(skillpos.x, skillpos.y);
                this.owner.avatar_jxxd.skew(0, 0);
            })
            .then(() => {
                this.owner.skill_name.text = this.game.getTranslation(
                    skill.name
                );
                Laya.Tween.create(this.owner.avatar_jxxd)
                    .duration(1000)
                    .delay(200)
                    .to('x', avatarPos.x)
                    .to('y', avatarPos.y)
                    .to('scaleX', 1.6)
                    .to('scaleY', 1.6)
                    .to('skewX', 10.5)
                    .to('skewY', -10)
                    .ease(Laya.Ease.expoOut);
            });
        //播放spine
        this.jxxd_ani.owner.visible = true;
        this.jxxd_ani.play(animation, false, true);
        this.jxxd_ani.owner.once(Laya.Event.STOPPED, () => {
            this.jxxd_ani.owner.visible = false;
            this.owner.avatar_jxxd.visible = false;
            this.owner.skill_name.text = ``;
            this.owner.skill_name.visible = false;
        });
    }

    public skills(ani: string, data: any = {}) {
        Laya.loader
            .load(`resources/room/cc_ani/${ani}.lh`)
            .then((prefab: Laya.Prefab) => {
                const node = prefab.create() as any;
                node.play(data);
                this.owner.addChild(node);
            });
    }
}
