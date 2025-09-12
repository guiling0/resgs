import { CustomString } from '../../custom/custom.type';
import { GameState } from '../../enums';
import { MessageData, Message } from '../../message/message';
import { MsgWindow } from '../../message/message.window';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../room';

export class RoomBroadCastMixin {
    /**
     * 广播消息
     * @param message 需要发送的消息
     * @param except 指定玩家忽略这条消息
     */
    public broadcast(
        this: GameRoom,
        message: MessageData,
        except: GamePlayer[] = []
    ) {
        if (this.gameState === GameState.Ending) return;
        const msg: Message = {
            msgId: this.msgids++,
            roomId: this.roomId,
            time: new Date().getTime(),
            data: message,
            except: this.getPlayerIds(except),
        };
        if (message.type === 'MsgGameStart') {
            this.startMessage = msg;
        }
        if (this.propertyChanges.length > 0) {
            msg.data.propertyChanges = this.propertyChanges.slice();
            this.propertyChanges.length = 0;
        }
        if (this.markChanges.length > 0) {
            msg.data.markChanges = this.markChanges.slice();
            this.markChanges.length = 0;
        }
        this.broadCastMethod([msg, ...this.waitMessages]);
        this.messages.push(msg, ...this.waitMessages);
        this.waitMessages.length = 0;
    }

    /**
     * 发送一条战报
     * @param data 战报数据
     */
    public sendLog(
        this: GameRoom,
        log: CustomString,
        except: GamePlayer[] = []
    ) {
        this.broadcast({ type: 'None', log }, except);
    }

    /**
     * 通知客户端打开一个窗口，如果窗口已存在则会根据数据重新构建窗口
     * @param this
     * @param data
     * @param except
     * @returns
     */
    public window(
        this: GameRoom,
        data: Omit<MsgWindow, 'type'>,
        except: GamePlayer[] = []
    ) {
        const _data: any = data;
        if (_data.create) {
            _data.options.id = this.windowids++;
        }
        _data.type = 'MsgWindow';
        this.broadcast(_data, except);
        return _data.options.id;
    }

    /** 播放指向线 */
    public directLine(
        this: GameRoom,
        source: GamePlayer,
        tos: GamePlayer[],
        type: number = 1
    ) {
        this.broadcast({
            type: 'MsgPlayDirectLine',
            source: source.playerId,
            targets: this.getPlayerIds(tos),
            playType: type,
        });
    }

    /**
     * 等待一段时间
     * @param ms 等待时长，单位为秒
     * @param broadcast 是否通知客户端。如果通知会为所有角色同时开始读条
     */
    public async delay(this: GameRoom, ms: number, broadcast: boolean = false) {
        if (broadcast) {
            this.broadcast({ type: 'MsgDelay', ms });
        }
        return new Promise((resolve) => {
            setTimeout(resolve, ms * 1000);
        });
    }

    /** 设置并广播一个属性 */
    public setProperty<T extends keyof GameRoom>(
        this: GameRoom,
        key: T,
        value: GameRoom[T]
    ) {
        this[key] = value;
        this.propertyChanges.push(['room', this.roomId, key, value]);
    }

    /** 让玩家说话（并非游戏聊天） */
    public chat(this: GameRoom, player: GamePlayer, text: string) {
        this.broadcast({
            type: 'MsgGameChat',
            player: player.playerId,
            text,
        });
    }

    /** 在房间中显示一条提示 */
    public prompt(this: GameRoom, text: string) {
        this.broadcast({
            type: 'MsgGamePrompt',
            text,
        });
    }
}
