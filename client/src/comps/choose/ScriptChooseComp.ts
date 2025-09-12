import { ChooseData } from '../../core/choose/choose.types';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { ChooseItemComp } from '../ChooseItemComp';
import { GameChooseComp } from './GameChooseComp';
import { UIWindow } from '../../ui/UIWindow';

const { regClass, property } = Laya;

@regClass()
export abstract class ScriptChooseComp<
    T extends ChooseData,
    ItemUI extends { item: ChooseItemComp }
> extends Laya.Script {
    public declare owner: UIGameRoom;

    public base: GameChooseComp;

    public get game() {
        return this.base?.game;
    }

    public data: T;
    /** 是否激活 */
    public enable: boolean = false;
    public handled: boolean = false;
    /** 备选项对应对象 */
    public items: Map<any, ItemUI> = new Map();
    /** 是否正在执行自动选择 */
    public isExecuteAudo: boolean = false;

    public get request() {
        return this.base?.request;
    }

    public get selectable(): any[] {
        return this.data?.selectable ?? [];
    }

    public get result(): any[] {
        return this.data?.result ?? [];
    }

    public set complete(value: boolean) {
        this.data.complete = value;
    }

    public get complete() {
        return this.data.complete;
    }

    public window: UIWindow;

    onAwake(): void {
        this.base = this.owner.getComponent(GameChooseComp);
    }

    public init(data: T) {
        this.data = data;
        (data as any).onChange?.call(
            this.request,
            'init',
            undefined,
            this.result
        );
        if (Array.isArray(data.count)) {
            data.count[0] = data.count[0] < 0 ? 0 : data.count[0];
            data.count[1] =
                data.count[1] < 0 ? data.selectable.length : data.count[1];
        } else {
            data.count = data.count < 0 ? 0 : data.count;
        }
        data.result = [];
        data.windowResult = [];

        this.items.forEach((v, k) => {
            v.item.onClick(() => {
                this.onItemClick(k);
            });
        });

        if (this.window) {
            this.game.window.open(this.window);
            //监听所有按钮
            this.window.buttonNodes.forEach((v, k) => {
                v.item.onClick(() => {
                    this.window.event(`click:${k}`);
                });
                this.window.on(`click:${k}`, () => {
                    if (k === 'cancle') {
                        this.request.result.cancle = true;
                    }
                    this.complete = true;
                    this.data.windowResult.push(k);
                    this.base.next();
                });
            });
        }
        data.auto_func = this.executeAuto.bind(this);
        if (data.auto) {
            data.auto_func();
        } else {
            this.refresh();
        }
    }

    public onItemClick(item: any) {
        if (!item) return;
        if (this.result.includes(item)) {
            lodash.remove(this.result, (v) => v === item);
            this.onChange('remove', item);
        } else {
            const length = this.result.length + 1;
            if (
                (typeof this.data.count === 'number' &&
                    length > this.data.count) ||
                (Array.isArray(this.data.count) && length > this.data.count[1])
            ) {
                const _item = this.result[0];
                if (_item) {
                    this.onItemClick(_item);
                }
            }
            this.result.push(item);
            this.onChange('add', item);
        }
        this.base?.next();
    }

    public onChange(type: 'add' | 'remove', item: any) {
        this.complete =
            this.isok() &&
            (!this.window ||
                this.data.windowOptions?.buttons?.filter((v) => v !== 'cancle')
                    .length === 0);
        (this.data as any).onChange?.call(
            this.request,
            type,
            item,
            this.result
        );
    }

    public refresh_check(item: any) {
        //超过最大选择数量不能选
        return (
            (typeof this.data.count === 'number' && this.data.count > 0) ||
            (Array.isArray(this.data.count) && this.data.count[1] > 0)
        );
    }

    public refresh() {
        if (!this.enable) this.result.length = 0;
        this.items.forEach((v, k) => {
            v.item.setSelected(this.result.includes(k));
            if (this.enable) {
                //自动选择不可选
                if (this.data.auto) {
                    v.item.setCanClick(false);
                    return;
                }
                /** 已选中的可选 */
                if (v.item.selected) {
                    v.item.setCanClick(true);
                    return;
                }
                v.item.setCanClick(
                    (this.data?.filter?.call(this.request, k, this.result) ??
                        true) &&
                        this.selectable?.includes(k) &&
                        this.refresh_check(k)
                );
            } else {
                v.item.setSelected(false);
                v.item.setCanClick(false);
            }
        });

        if (this.window) {
            //刷新窗口按钮
            this.window.buttonNodes.forEach((v, k) => {
                if (k === 'confirm') {
                    v.item.setCanClick(this.isok());
                    return;
                }
                if (k !== 'cancle') {
                    const e =
                        this.data.filter_buttons?.call(
                            this.request,
                            k,
                            this.result
                        ) ?? true;
                    v.item.setCanClick(e);
                }
            });
        }
    }

    public isok(): boolean {
        let testCount = false;
        const count = this.data.count;
        const number = this.result.length;
        if (typeof count === 'number') {
            testCount = number === count;
        } else if (Array.isArray(count)) {
            testCount = number >= count[0] && number <= count[1];
        }
        return (
            testCount &&
            (this.data.canConfirm?.call(this.request, this.result) ?? true)
        );
    }

    public executeAuto() {
        if (this.isExecuteAudo) return;
        this.isExecuteAudo = true;
        this.data.auto = true;
        while (true) {
            const length = this.result.length;
            const s_length = this.selectable.length;
            for (let i = 0; i < s_length; i++) {
                const item = this.selectable[i];
                if (this.result.includes(item)) continue;
                if (
                    this.data.type === 'option' &&
                    (item as string).at(0) === '!'
                )
                    continue;
                if (
                    !(
                        this.data.filter?.call(
                            this.request,
                            item,
                            this.result
                        ) ?? true
                    )
                )
                    continue;
                this.result.push(item);
                (this.data as any).onChange?.call(
                    this.request,
                    'add',
                    item,
                    this.result
                );
                // this.onItemClick(item);
                break;
            }
            let testCount = false;
            const count = this.data.count;
            const number = this.result.length;
            if (typeof count === 'number') {
                testCount = number === count;
            } else if (Array.isArray(count)) {
                testCount = number == count[1];
            }
            if (testCount) break;
            if (this.result.length === length) break;
        }
        this.complete =
            this.isok() &&
            (!this.window ||
                this.data.windowOptions?.buttons?.filter((v) => v !== 'cancle')
                    .length === 0);
        this.isExecuteAudo = false;
        this.owner.frameOnce(10, this, () => {
            this.base.next();
        });
    }

    des(): void {
        this.result.length = 0;
        this.items.forEach((v) => {
            v.item.onClick(undefined);
            v.item.setCanClick(true);
            v.item.setSelected(false);
        });
        if (this.window && this.window.isActiveClinet) {
            this.game.window.close(this.window);
        }
        this.window = undefined;
    }

    destroy(): void {
        this.des();
        super.destroy();
    }
}
