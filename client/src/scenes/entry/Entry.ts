import { DevPreview } from 'src/components/DevPreview';
import { EntryBase } from './Entry.generated';
import { LoadingUI } from 'src/components/LoadingUI';
import { apiClient } from 'src/api/ApiClient';
import { SceneManager } from 'src/SceneManager';
import { ToastUI } from 'src/components/ToastUI';

const { regClass } = Laya;

@regClass()
export class Entry extends EntryBase {
    /** 公告数据 */
    private _noticeData: { title: string; content: string }[];
    /** 登录中 */
    private _loggingIn: boolean = false;

    async onAwake(): Promise<void> {
        // ===== 公告加载 =====
        try {
            LoadingUI.show();
            const noticeJson = await Laya.loader.load(
                `./update/notice.json`,
                Laya.Loader.JSON,
            );
            this._noticeData = noticeJson.data.list || [];
        } catch {
            this.notice.text = '公告数据加载失败';
        } finally {
            LoadingUI.hide();
        }
        // ===== 公告部分监听 =====
        this.title_list.itemRenderer = this._renderNoticeTitleList.bind(this);
        this.title_list.numItems = this._noticeData.length;
        this.title_list.on(
            Laya.UIEvent.ClickItem,
            this,
            this._onNoticeTitleClickItem,
        );

        if (this._noticeData.length) {
            this.notice.text = this._noticeData[0].content;
        } else {
            this.notice.text = '无内容';
        }
        this.notice.on(Laya.Event.LINK, (e: any) => {
            window.open(e);
        });
        // ===== 登录按钮和回车登录 =====
        this.btn_entry_game.on(Laya.Event.CLICK, this, this._onLogin);
        this.input_password.on(Laya.Event.KEY_DOWN, this, (e: any) => {
            if (e.keyCode === 13) this._onLogin();
        });
    }

    /** 登录 */
    private async _onLogin(): Promise<void> {
        if (this._loggingIn) return;
        const username = this.input_username.text;
        const password = this.input_password.text;
        console.log(`[Entry] login`, username, password);
        if (!username || !password) {
            ToastUI.show('请输入用户名和密码');
            return;
        }

        this.btn_entry_game.enabled = false;
        this._loggingIn = true;
        LoadingUI.show();
        ToastUI.show('正在登录...');

        try {
            const result = await apiClient.login(username, password);
            console.log(`[Entry] login success`, result.user);
            ToastUI.show('登录成功');
            SceneManager.enter('lobby');
        } catch (err) {
            ToastUI.show('登录失败');
            console.error(`[Entry] login error`, err);
        } finally {
            LoadingUI.hide();
            this.btn_entry_game.enabled = true;
            this._loggingIn = false;
        }
    }

    /** 渲染公告标题列表 */
    private _renderNoticeTitleList(index: number, obj: Laya.GButton): void {
        obj.title = this._noticeData[index].title;
    }

    /** 点击公告标题 */
    private _onNoticeTitleClickItem(item: Laya.GButton): void {
        const index = this._noticeData.findIndex((i) => i.title === item.title);
        if (index === -1) {
            this.notice.text = '无内容';
            return;
        }
        this.notice.text = this._noticeData[index].content;

        for (let i = 0; i < this._noticeData.length; i++) {
            const obj = this.title_list.getChildAt(i) as Laya.GButton;
            obj.titleColor = obj === item ? '#ff00ff' : '#ffffff';
        }
    }
}
