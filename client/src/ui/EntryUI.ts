/**
 * Entry 场景 UI 模板（纯 DOM，与 LayaAir 画布同步缩放）。
 */
import { el, div, btn, inputEl } from './Widget';

export interface EntryUI {
    container: HTMLElement;
    noticeEl: HTMLElement;
    titleList: HTMLElement;
    username: HTMLInputElement;
    password: HTMLInputElement;
    saveInfo: HTMLInputElement;
    loginBtn: HTMLButtonElement;
    btnGame: HTMLButtonElement;
    btnAlone: HTMLButtonElement;
    btnExt: HTMLButtonElement;
    btnExit: HTMLButtonElement;
    versionEl: HTMLElement;
}

export function buildEntryUI(): EntryUI {
    // ===== 1. 公告标题列表 =====
    const titleList = div().id('entry-title-list').style({
        position: 'absolute',
        left: '20px',
        top: '55px',
        width: '260px',
        height: '970px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '12px',
        overflowY: 'auto',
        padding: '12px 10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    }).raw;

    // ===== 2. 公告内容面板 =====
    const noticeEl = el('div').id('entry-notice').style({
        color: '#fff',
        fontSize: '28px',
        lineHeight: '1.8',
        padding: '24px 32px',
        wordWrap: 'break-word',
    }).raw;

    const noticePanel = div()
        .id('entry-notice-panel')
        .children(noticeEl)
        .style({
            position: 'absolute',
            left: '308px',
            top: '55px',
            width: '1280px',
            height: '970px',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '12px',
            overflowY: 'auto',
            boxSizing: 'border-box',
        });

    // ===== 3. 提示文字 =====
    const hintText = div()
        .text('每个IP只能注册一个账号\n首次登录自动注册')
        .style({
            position: 'absolute',
            left: '1610px',
            top: '85px',
            width: '290px',
            fontSize: '26px',
            color: '#ddd',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: '1.3',
        });

    // ===== 4. 登录表单 =====
    const username = inputEl('text', '用户名').id('entry-username').style({
        position: 'absolute',
        left: '1610px',
        top: '150px',
        width: '290px',
        height: '72px',
        fontSize: '36px',
        background: 'rgba(255,255,255,.1)',
        borderRadius: '8px',
        color: '#fff',
        padding: '0 16px',
        outline: 'none',
    }).raw;

    const password = inputEl('password', '密码').id('entry-password').style({
        position: 'absolute',
        left: '1610px',
        top: '242px',
        width: '290px',
        height: '72px',
        fontSize: '36px',
        background: 'rgba(255,255,255,.1)',
        borderRadius: '8px',
        color: '#fff',
        padding: '0 16px',
        outline: 'none',
    }).raw;

    // ===== 5. 记住密码 + 更多设置 =====
    const saveInfo = el('input')
        .attr('type', 'checkbox')
        .attr('id', 'entry-save-info')
        .style({ width: '22px', height: '22px' })
        .as<HTMLInputElement>().raw;

    const saveRow = div().children(saveInfo, ' 记住密码').style({
        position: 'absolute',
        left: '1610px',
        top: '336px',
        fontSize: '22px',
        color: '#aaa',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    });

    const moreSettings = el('span')
        .id('entry-more-settings')
        .text('更多设置')
        .style({
            position: 'absolute',
            right: '30px',
            top: '336px',
            fontSize: '22px',
            color: '#fff',
            textDecoration: 'underline',
            cursor: 'pointer',
        });

    // ===== 6. 进入游戏按钮 =====
    const loginBtn = el('button')
        .id('entry-btn-login')
        .cls('btn')
        .text('进入游戏')
        .style({
            position: 'absolute',
            left: '1610px',
            top: '400px',
            width: '290px',
            height: '64px',
            fontSize: '34px',
            background: 'linear-gradient(135deg,#4FC3F7,#29B6F6)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
        })
        .as<HTMLButtonElement>().raw;

    // ===== 7. 功能按钮 =====
    const sideBtnBase = {
        position: 'absolute' as const,
        left: '1610px',
        width: '290px',
        height: '70px',
        fontSize: '34px',
        color: '#fff',
        border: '2px solid rgba(255,255,255,.25)',
        borderRadius: '12px',
        background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        transition: 'background .2s, border-color .2s',
    } as const;

    const btnGame = btn('游戏场景预览')
        .id('entry-btn-game').cls('btn')
        .style({
            ...sideBtnBase,
            top: '581px',
            color: '#4FC3F7',
            borderColor: 'rgba(79,195,247,.35)',
        })
        .as<HTMLButtonElement>().raw;

    const btnAlone = btn('单机模式')
        .id('entry-btn-alone').cls('btn')
        .style({ ...sideBtnBase, top: '761px' })
        .as<HTMLButtonElement>().raw;

    const btnExt = btn('扩展管理')
        .id('entry-btn-ext').cls('btn')
        .style({ ...sideBtnBase, top: '851px' })
        .as<HTMLButtonElement>().raw;

    const btnExit = btn('退出游戏')
        .id('entry-btn-exit').cls('btn')
        .style({
            ...sideBtnBase,
            top: '955px',
            color: '#E57373',
            borderColor: 'rgba(229,115,115,.35)',
        })
        .as<HTMLButtonElement>().raw;

    // ===== 8. 版本号 =====
    const versionEl = div().id('entry-ver').text('v1.0.0').style({
        position: 'absolute',
        right: '30px',
        bottom: '24px',
        fontSize: '20px',
        color: '#555',
        textAlign: 'right',
    }).raw;

    // ===== 组装 =====
    const container = div().children(
        titleList,
        noticePanel.raw,
        hintText.raw,
        username,
        password,
        saveRow.raw,
        moreSettings.raw,
        loginBtn,
        btnGame,
        btnAlone,
        btnExt,
        btnExit,
        versionEl,
    ).raw;

    return {
        container,
        noticeEl,
        titleList,
        username,
        password,
        saveInfo,
        loginBtn,
        btnGame,
        btnAlone,
        btnExt,
        btnExit,
        versionEl,
    };
}
