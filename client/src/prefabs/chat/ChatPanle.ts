const { regClass } = Laya;
import {
    CHAT_SOURCE_CONFIG,
    ChatMessage,
    ChatSource,
} from '@shared/core/message';
import { ChatPanleBase } from './ChatPanle.generated';
import { ToastUI } from 'src/components/ToastUI';

@regClass()
export class ChatPanle extends ChatPanleBase {
    private static _store: ChatMessage[] = [];

    private _source?: ChatSource;
    private _roomId?: string;
    private _hasTeam?: boolean;
    private _send?: (source: ChatSource, message: string) => void;

    private _messages: ChatMessage[] = [];
    private _filter: ChatSource | 'all' = 'all';
    private _filter_msgs: ChatMessage[] = [];

    private fastItems: { url: string; text: string }[] = [];

    onAwake(): void {
        this.messages.itemRenderer = this._renderChatList.bind(this);
        this.fasts.itemRenderer = this._renderFastList.bind(this);
        this.fasts.on(Laya.UIEvent.ClickItem, this, this._onFastListClickItem);

        // ===== 滚动到底部 =====
        this.btn_to_bottom.on(Laya.Event.CLICK, this, this._scrollToBottom);
        this.btn_to_bottom.visible = false;

        // ===== 表情 =====
        this.fasts.numItems = 0;
        this.btn_face.on(Laya.Event.CLICK, () => {
            if (!this.box.visible) this.box.visible = true;
            this.fastbg.visible = this.fasts.numItems > 0;
            Laya.GRoot.inst.showPopup(this.box, this.btn_face);
        });
        for (let i = 1; i <= 56; i++) {
            ((this as any)[`img_${i}`] as Laya.GImage).on(
                Laya.Event.CLICK,
                () => {
                    this.input_chat.text += `[face#${i}]`;
                    Laya.GRoot.inst.hidePopup(this.box);
                },
            );
        }

        // ===== 聊天发送 =====
        this.btn_random.on(Laya.Event.CLICK, this, this._onRandom);
        this.btn_send.on(Laya.Event.CLICK, this, this._onSend);
        this.input_chat.on(Laya.Event.KEY_DOWN, this, (e: Laya.Event) => {
            if (e.keyCode === 13) this._onSend();
        });

        // ===== 过滤 =====
        this._messages = ChatPanle._store.slice();
        this.setFilter('all');
    }

    onDestroy(): void {
        if (this._source === 'room' && this._roomId) {
            ChatPanle._store = ChatPanle._store.filter(
                (v) => v.roomId !== this._roomId,
            );
        }
    }

    cleanupRoom(roomId: string) {
        ChatPanle._store = ChatPanle._store.filter((v) => v.roomId !== roomId);
        this.messages.numItems = 0;
    }

    bind(
        source: 'lobby' | 'room',
        send: (source: ChatSource, message: string) => void,
        roomId?: string,
        hasTeam: boolean = false,
    ) {
        this._source = source;
        this._send = send;
        this._roomId = roomId;
        this._hasTeam = hasTeam;
        if (source === 'lobby') {
            this.btn_chat_room.visible = false;
            this.btn_chat_team.visible = false;
            this.cbox_source.visible = false;
        }
        if (source === 'room') {
            if (!hasTeam) {
                this.btn_chat_team.visible = false;
                this.cbox_source.items = ['大厅', '房间'];
                this.cbox_source.values = ['lobby', 'room'];
                this.cbox_source.selectedIndex = 1;
            }
        }
    }

    // ===== 快捷语音 =====
    fillFast(fasts: { url: string; text: string }[]) {
        this.fastItems.unshift(...fasts.reverse());
        this.fasts.numItems = fasts.length;
    }

    private _renderFastList(index: number, obj: Laya.GButton) {
        obj.title = this.fastItems[index].text;
    }
    private _onFastListClickItem(item: Laya.GButton): void {
        const index = this.fastItems.findIndex((i) => i.text === item.title);
        if (index === -1) {
            return ToastUI.show('找不到快捷语音配置');
        }
        this._sendMessage(
            this.cbox_source.value as ChatSource,
            `$audio:text=${this.fastItems[index].text};url=${this.fastItems[index].url}`,
        );
    }
    // ===== 聊天列表 =====
    private _renderChatList(index: number, obj: Laya.GButton) {
        const msg = this._filter_msgs[index];
        const message = msg.message;
        let text = '';
        if (msg.message.includes('$audio')) {
            //TODO 播放语音
        } else if (msg.message.includes('$random')) {
            const num = parseInt(message.split(':')[1]);
            text = `[color=#00ff00][b]${msg.sender}[/b]骰出了[b]${num}[/b]点[/color]`;
        } else {
            text = message;
            text = text.replaceAll(
                /\[face#(\d+)\]/g,
                '<img src="resources/chat/face/$1.png" width="36" height="36" />',
            );
            if (msg.sender === 'system') {
                text = `<font color='#E57373'>[系统]</font>${text}`;
            } else {
                text = `[b]${msg.sender}[/b]：${text}`;
            }
        }
        if (text === '') return;
        const cfg = CHAT_SOURCE_CONFIG[msg.source];
        text = `<font color='${cfg.color}'>[${cfg.label}]</font> ${text}`;
        obj.title = text;
    }

    append(msg: ChatMessage) {
        const atBottom = this._isAtBottom();
        if (!ChatPanle._store.find((v) => v.chatId === msg.chatId)) {
            ChatPanle._store.push(msg);
        }
        if (!this._messages.find((v) => v.chatId === msg.chatId)) {
            this._messages.push(msg);
            if (this._filter === msg.source || this._filter === 'all') {
                this._filter_msgs.push(msg);
                this.messages.numItems = this._filter_msgs.length;
            }
        }
        if (atBottom) this._scrollToBottom();
    }

    setFilter(source: ChatSource | 'all' = 'all') {
        this._filter = source;
        if (source === 'all') {
            this._filter_msgs = this._messages.slice();
        } else {
            this._filter_msgs = this._messages.filter(
                (v) => v.source === source,
            );
        }
        this.messages.numItems = this._filter_msgs.length;
    }

    // ===== 发送 =====
    private _onRandom() {
        this._sendMessage(
            this.cbox_source.value as ChatSource,
            `$random:${Math.floor(Math.random() * 100) + 1}`,
        );
    }

    private _onSend() {
        if (this._source === 'lobby' && this.cbox_source.value !== 'lobby') {
            return ToastUI.show('消息路径不合法');
        }
        if (
            (this.cbox_source.value === 'room' ||
                this.cbox_source.value === 'team') &&
            !this._roomId
        ) {
            return ToastUI.show('房间不存在');
        }
        if (this.cbox_source.value === 'team' && !this._hasTeam) {
            return ToastUI.show('队伍不存在');
        }
        if (this.input_chat.text === '') {
            return ToastUI.show('不能发送空消息');
        }
        this._sendMessage(
            this.cbox_source.value as ChatSource,
            this.input_chat.text,
        );
        this.input_chat.text = '';
        this.input_chat.focus();
    }

    private _sendMessage(source: ChatSource, message: string) {
        this._send?.(source, message);
    }

    // ===== 滚动到底部 =====
    private _isAtBottom(): boolean {
        return this.messages.scroller.percY >= 0.99;
    }

    private _scrollToBottom(): void {
        this.messages.scroller.setPercY(1, true);
        this.btn_to_bottom.visible = false;
    }
}
