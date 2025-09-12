const { regClass } = Laya;
import { RoomGameComp } from '../comps/room/RoomGameComp';
import { ChooseGeneralData } from '../core/choose/types/choose.general';
import { CustomString } from '../core/custom/custom.type';
import { WindowOptions } from '../core/room/room.types';
import { EntityTypeEnum } from '../enums';
import { S } from '../singleton';
import { UIChooseCards } from './UIChooseCards';
import { UIChooseGeneralDual } from './UIChooseGeneralDual';
import { UIItems } from './UIItems';
import { UIOptionButton } from './UIOptionButton';
import { UIRows } from './UIRows';
import { UIWindowBase } from './UIWindow.generated';

@regClass()
export class UIWindow extends UIWindowBase {
    private static prefab: Laya.HierarchyResource;

    public static create(room: RoomGameComp, options: WindowOptions = {}) {
        if (!this.prefab) {
            this.prefab = Laya.loader.getRes('resources/window/window.lh');
        }
        const node = S.ui.getObjectFromPool(EntityTypeEnum.Window, () => {
            return this.prefab.create() as UIWindow;
        }) as UIWindow;
        node.set(room, options);
        return node;
    }

    public id: number;
    /** 倒计时的最大值 */
    protected _maxtime: number = 0;
    /** 倒计时当前值 */
    protected _time: number = 0;
    /** 是否是客户端主动打开的窗口 */
    public isActiveClinet: boolean = true;
    /** 内容 */
    public contentNode: UIChooseGeneralDual | UIRows | UIChooseCards | UIItems;
    /** 房间对象 */
    public room: RoomGameComp;
    /** 所有按钮 */
    public buttonNodes: Map<string, UIOptionButton> = new Map();

    public set(room: RoomGameComp, options: WindowOptions = {}) {
        this.room = room;
        this.isActiveClinet = true;
        this.visible = false;
        this.setOptions(options);
        this.close.offAll(Laya.Event.CLICK);
        this.close.on(Laya.Event.CLICK, () => {
            room.window.close(this);
        });
    }

    public setContent(node: typeof this.contentNode) {
        this.contentNode = node;
        this.content.height = Math.min(node.height, 650) + 24;
        this.content.width = node.width + 10;
        this.content.addChild(node);
        this.visible = true;
        this.center();
        this.content.scroller.scrollTop(false);
    }

    public setOptions(options: WindowOptions = {}) {
        //title
        this.id = options.id;
        this.title.text = this.room.getTranslation(options.title);
        this.close.visible = !!options.showCloseButton;
        if (options.timebar) {
            this.startCountDown(options.timebar, options.prompt);
        } else {
            this.endCountDown();
        }
        //buttons
        this.buttons.children.forEach((v) => {
            v.destroy();
        });
        this.buttons.removeChildren();
        this.buttonNodes.clear();
        options.buttons?.forEach((v, i) => {
            const btn = UIOptionButton.create(this.room.getTranslation(v));
            this.buttons.addChild(btn);
            this.buttonNodes.set(sgs.utils.getString(v), btn);
        });
    }

    /** 开始倒计时 */
    public startCountDown(time: number, prompt?: CustomString) {
        if (this.timebar.visible) {
            this.endCountDown();
        }
        this.prompt.text = prompt ? this.room.getTranslation(prompt) : '';
        this.timebar.visible = true;
        this.timebar.value = 1;
        this._time = this._maxtime = time;
        this.onCountDown();
        this.timer.loop(1000, this, this.onCountDown);
    }

    /** 结束倒计时 */
    public endCountDown() {
        if (this.timebar.visible) {
            this.timer.clear(this, this.onCountDown);
            this.timebar.visible = false;
            Laya.Tween.killAll(this.timebar);
            this.event('CountDownEnd');
            this.prompt.text = ``;
        }
    }

    /** 倒计时缓动 */
    protected onCountDown() {
        this._time -= 1;
        Laya.Tween.create(this.timebar)
            .duration(1000)
            .to('value', this._time / this._maxtime);
        if (this._time < -1) {
            this.endCountDown();
        }
    }

    destroy(): void {
        this.content_pool.addChild(this.contentNode);
        this.contentNode?.des();
        this.contentNode = undefined;
        this.general_dual.visible = false;
        this.rows.visible = false;
        this.cards.visible = false;
        this.buttons.children.forEach((v) => {
            v.destroy();
        });
        this.buttons.removeChildren();
        this.buttonNodes.clear();
        S.ui.retObjectFromPool(EntityTypeEnum.Window, this);
    }

    onRet() {
        this.content.size(0, 0);
    }

    setDatas(data: any[]) {
        this.cards.visible = true;
        this.cards.pos(0, 0);
        this.cards.window = this;
        this.contentNode = this.cards;
        this.cards.init(data);
    }

    setChooseGeneralDual(data: ChooseGeneralData) {
        this.general_dual.visible = true;
        this.general_dual.pos(0, 0);
        this.general_dual.window = this;
        this.contentNode = this.general_dual;
        this.general_dual.init(data);
    }

    setRows(
        data: {
            title: CustomString;
            cards: any[];
        }[]
    ) {
        this.rows.visible = true;
        this.rows.pos(0, 0);
        this.rows.window = this;
        this.contentNode = this.rows;
        this.rows.init(data);
    }

    setItems(
        data: {
            title: CustomString;
            items: {
                title: CustomString;
                card: any;
            }[];
        }[],
        isDrag: boolean = false
    ) {
        this.items.visible = true;
        this.items.pos(0, 0);
        this.items.window = this;
        this.contentNode = this.items;
        this.items.init(data, isDrag);
    }
}
