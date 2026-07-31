import { EntryBase } from './Entry.generated';
import { LoadingUI } from 'src/components/LoadingUI';
import { apiClient } from 'src/api/ApiClient';
import { SceneManager } from 'src/SceneManager';
import { ToastUI } from 'src/components/ToastUI';
import { buildEntryUI, EntryUI } from 'src/ui/EntryUI';

const { regClass } = Laya;

@regClass()
export class Entry extends EntryBase {
    private _dom: EntryUI | null = null;
    private _noticeData: { title: string; content: string }[] = [];
    private _loggingIn: boolean = false;

    async onAwake(): Promise<void> {
        const container = document.getElementById('page-entry');
        if (!container) return;
        this._dom = buildEntryUI();
        container.appendChild(this._dom.container);

        await this._loadNotice();

        this._dom.loginBtn.addEventListener('click', () => this._onLogin());
        this._dom.password.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._onLogin();
        });

        const savedUser = localStorage.getItem('resgs_saved_username');
        const savedPass = localStorage.getItem('resgs_saved_password');
        if (savedUser && this._dom) {
            this._dom.username.value = savedUser;
            this._dom.password.value = savedPass || '';
            this._dom.saveInfo.checked = true;
        }

        document.getElementById('entry-more-settings')?.addEventListener('click', () => {
            ToastUI.show('暂未完成');
        });

        this._dom.btnGame.addEventListener('click', () => SceneManager.enter('game'));
        this._dom.btnAlone.addEventListener('click', () => ToastUI.show('暂未完成'));
        this._dom.btnExt.addEventListener('click', () => ToastUI.show('网页端暂不支持扩展管理'));
        this._dom.btnExit.addEventListener('click', () => {
            ToastUI.show('退出游戏，请通过关闭浏览器/标签页退出');
            window.close();
        });
    }

    onDestroy(): void {
        if (this._dom) {
            this._dom.container.remove();
            this._dom = null;
        }
    }

    private async _loadNotice(): Promise<void> {
        if (!this._dom) return;
        LoadingUI.show();
        try {
            const resp = await fetch('./update/notice.json');
            const noticeJson = await resp.json();
            this._noticeData = (noticeJson.list || []).map((item: any) => ({
                title: item.title,
                content: item.content.replace(/\n/g, '<br>'),
            }));
        } catch {
            this._dom.noticeEl.textContent = '公告数据加载失败';
            return;
        } finally {
            LoadingUI.hide();
        }

        if (this._noticeData.length > 0) {
            const allBtns: HTMLButtonElement[] = [];
            this._noticeData.forEach((item) => {
                const noticeBtn = document.createElement('button');
                noticeBtn.textContent = item.title;
                noticeBtn.style.cssText =
                    'width:100%;padding:16px 12px;background:rgba(255,255,255,.06);color:#ddd;border:none;border-radius:6px;margin-bottom:4px;cursor:pointer;text-align:left;font-size:22px;transition:background .2s;';
                noticeBtn.addEventListener('mouseenter', () => { noticeBtn.style.background = 'rgba(255,255,255,.12)'; });
                noticeBtn.addEventListener('mouseleave', () => { noticeBtn.style.background = 'rgba(255,255,255,.06)'; });
                noticeBtn.addEventListener('click', () => {
                    this._onNoticeClick(item, noticeBtn, allBtns);
                });
                this._dom!.titleList.appendChild(noticeBtn);
                allBtns.push(noticeBtn);
            });
            this._dom.noticeEl.innerHTML = this._ensureLinksNewTab(this._noticeData[0].content);
            allBtns[0].style.color = '#4FC3F7';
        } else {
            this._dom.noticeEl.textContent = '无内容';
        }
    }

    private _ensureLinksNewTab(html: string): string {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('a').forEach((a) => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });
        return doc.body.innerHTML;
    }

    private _onNoticeClick(item: { title: string; content: string }, active: HTMLButtonElement, all: HTMLButtonElement[]): void {
        if (!this._dom) return;
        this._dom.noticeEl.innerHTML = this._ensureLinksNewTab(item.content);
        all.forEach((b) => (b.style.color = '#ddd'));
        active.style.color = '#4FC3F7';
    }

    private async _onLogin(): Promise<void> {
        if (!this._dom || this._loggingIn) return;
        const username = this._dom.username.value.trim();
        const password = this._dom.password.value;

        if (!username || !password) {
            ToastUI.show('请输入用户名和密码');
            return;
        }

        this._loggingIn = true;
        this._dom.loginBtn.disabled = true;
        LoadingUI.show();
        ToastUI.show('正在登录...');

        try {
            const result = await apiClient.login(username, password);
            console.log('[Entry] 登录成功', result.user);
            ToastUI.show('登录成功');

            if (this._dom.saveInfo.checked) {
                localStorage.setItem('resgs_saved_username', username);
                localStorage.setItem('resgs_saved_password', password);
            } else {
                localStorage.removeItem('resgs_saved_username');
                localStorage.removeItem('resgs_saved_password');
            }

            SceneManager.enter('lobby');
        } catch (err) {
            ToastUI.show('登录失败');
            console.error('[Entry] 登录失败', err);
        } finally {
            LoadingUI.hide();
            if (this._dom) this._dom.loginBtn.disabled = false;
            this._loggingIn = false;
        }
    }
    /** 清理 DOM（兜底 onDestroy 未触发的情况） */
    static _cleanupDom(): void {
        const container = document.getElementById('page-entry');
        if (container) container.innerHTML = '';
    }
}
