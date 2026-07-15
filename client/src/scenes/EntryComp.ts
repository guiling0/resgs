import { LoadingUI } from '../components/LoadingUI';
import { ResManager } from '../ResManager';

const { regClass, property } = Laya;

@regClass()
export class EntryComp extends Laya.Script {
    private _list: Laya.GList;
    private _notice: Laya.GTextField;

    private _noticeData: { title: string; content: string }[];

    async onAwake() {
        const o = this.owner as Laya.GWidget;
        this._list = o.getChild('title_list');
        this._notice = o.getChildByPath('notice_panel.notice');

        const noticeJson = await Laya.loader.load(
            `./update/notice.json`,
            Laya.Loader.JSON,
        );
        this._noticeData = noticeJson.data.list || [];

        //list
        this._list.itemRenderer = this._renderNoticeTitleList.bind(this);
        this._list.numItems = this._noticeData.length;
        this._list.on(
            Laya.UIEvent.ClickItem,
            this,
            this._onNoticeTitleClickItem,
        );

        //notice
        if (this._noticeData.length) {
            this._notice.text = this._noticeData[0].content;
        } else {
            this._notice.text = `无内容`;
        }
        this._notice.on(Laya.Event.LINK, (e: any) => {
            window.open(e);
        });
    }

    private _renderNoticeTitleList(index: number, obj: Laya.GButton) {
        obj.title = this._noticeData[index].title;
    }

    private _onNoticeTitleClickItem(item: Laya.GButton) {
        const index = this._noticeData.findIndex((i) => i.title === item.title);
        if (index === -1) {
            this._notice.text = `无内容`;
            return;
        }
        this._notice.text = this._noticeData[index].content;

        this._noticeData.forEach((v, i) => {
            const obj = this._list.getChildAt(i) as Laya.GButton;
            if (obj === item) {
                obj.titleColor = '#ff00ff';
            } else {
                obj.titleColor = '#ffffff';
            }
        });
    }
}
