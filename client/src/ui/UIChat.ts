const { regClass } = Laya;
import { fastAudio, ServerConfig } from '../config';
import { ChatMessage } from '../core/room/room.types';
import { S } from '../singleton';
import { UIChatBase } from './UIChat.generated';

@regClass()
export class UIChat extends UIChatBase {
    onAwake(): void {
        //拉伸聊天框
        this.btn_show.on(Laya.Event.CLICK, this, this.onBtnShow);
        this.btn_hide.on(Laya.Event.CLICK, this, this.onBtnHide);
        //发送骰子
        this.btn_random.on(Laya.Event.CLICK, this, this.onBtnRandom);
        //展开表情
        this.btn_face.on(Laya.Event.CLICK, this, this.onBtnFace);
        //聊天发送
        this.btn_send.on(Laya.Event.CLICK, this, this.onBtnSend);
        this.inputChat.on(Laya.Event.KEY_DOWN, this, (e: any) => {
            if (e['keyCode'] === 13) {
                this.onBtnSend();
            }
        });
        //小表情点击
        for (let i = 0; i < 56; i++) {
            ((this as any)[`img_${i}`] as Laya.Image).on(
                Laya.Event.CLICK,
                () => {
                    this.inputChat.text += `<img src='resources/chat/texture/face/${
                        i + 1
                    }.png' width = 36 height=36/>`;
                    this.box.visible = false;
                }
            );
        }
        //快捷语音
        this.fast.on(Laya.Event.CHANGED, this, this.onFastSelected);
        this.fillFast([]);
    }

    public fillFast(audios: { url: string; text: string }[]) {
        this.fast.items = fastAudio.slice();
        this.fast.values = fastAudio.slice();
        audios.forEach((v) => {
            this.fast.items.unshift(v.text);
            this.fast.values.unshift(v.url);
        });
        this.fast.text = `快捷语音`;
    }

    protected onBtnShow() {
        if (this.height === 134) {
            this.height = 400;
        } else {
            this.height = 134;
            this.btn_show.url = 'resources/chat/texture/btn_chat_show.png';
        }
        this.chats.scroller.scrollBottom(true);
        this.btn_show.visible = false;
        this.btn_hide.visible = true;
    }

    protected onBtnHide() {
        if (this.height === 400) {
            this.height = 134;
        }
        this.chats.scroller.scrollBottom(true);
        this.btn_show.visible = true;
        this.btn_hide.visible = false;
    }

    protected onBtnRandom() {
        this.event('send', `$random:${Math.floor(Math.random() * 100) + 1}`);
    }

    protected onBtnFace() {
        this.box.visible = !this.box.visible;
    }

    protected onBtnSend() {
        if (this.inputChat.text === '') {
            return S.ui.toast('不能发送空内容');
        }
        this.event('send', this.inputChat.text);
        this.inputChat.text = '';
    }

    protected onFastSelected() {
        if (this.fast.selectedIndex !== -1) {
            const text = this.fast.value;
            const index = fastAudio.findIndex((v) => v === text);
            if (index !== -1) {
                //快捷语音
                this.event('send', `$fast:${index}`);
            } else {
                //武将技能
                this.event('send', `$audio:${text}`);
            }
            this.fast.text = `快捷语音`;
            this.box.visible = false;
        }
    }

    public onChat(from: string, message: ChatMessage) {
        const msg = message.message;
        let text = '';
        if (msg.includes('$fast')) {
            const index = parseInt(msg.split(':')[1]);
            S.ui.playAudio(
                `${ServerConfig.res_url}/audio/fast/female/${index + 1}.mp3`
            );
            text = fastAudio[index];
            this.addChatText(`[b]${from}[/b]：${text}`, !!message.spectate);
        } else if (msg.includes('$audio')) {
            const url = msg.split(':')[1];
            S.ui.playAudio(`${ServerConfig.res_url}/${url}`);
        } else if (msg.includes('$throw')) {
        } else if (msg.includes('$random')) {
            const num = parseInt(msg.split(':')[1]);
            this.addChatText(
                `[color=#00ff00][b]${from}[/b]骰出了[b]${num}[/b]点[/color]`,
                !!message.spectate
            );
        } else {
            text = msg;
            this.addChatText(`[b]${from}[/b]：${msg}`, !!message.spectate);
        }
        return text;
    }

    protected addChatText(message: string, spectate: boolean = false) {
        if (spectate) {
            message = '(旁观)' + message;
        }
        if (this.txt.text === '') {
            this.txt.text = message;
        } else {
            this.txt.text += '\n' + message;
        }
        this.callLater(() => {
            this.chats.scroller.scrollBottom(true);
        });
    }
}
