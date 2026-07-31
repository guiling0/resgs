import { Room } from './Room';
import { Player } from '../player/Player';

/**
 * 通讯管理器 — 向客户端发送消息。
 *
 * `broadcast` 为基础方法，其余均为快捷方法：
 * - sendLog: 游戏战报（面向玩家的日志）
 * - toast: 弹出提示
 * - playAudio: 播放配音/音效
 * - playBGM: 切换背景音乐
 * - playDirectLine: 播放指向线
 * - playAnimation: 播放动画
 *
 * 当前为桩实现，Phase 9（网络层）补充。
 */
export class BroadcastManager {
    constructor(readonly room: Room) {}

    /**
     * 基础广播方法。
     * @param msg 消息体
     * @param except 排除的玩家（不发送）
     */
    broadcast(msg: Record<string, any>, except?: Player[]): void {
        // TODO Phase 9: 通过网络层广播消息
    }

    /** 向指定玩家发送消息 */
    sendToPlayer(playerId: string, msg: Record<string, any>): void {
        // TODO Phase 9
    }

    /**
     * 发送游戏战报（面向玩家的日志）。
     * @param log 战报数据
     * @param toast 是否同时弹出提示
     */
    sendLog(log: Record<string, any>, toast?: boolean): void {
        // TODO Phase 9
    }

    /** 弹出提示 */
    toast(text: string, player?: Player): void {
        // TODO Phase 9
    }

    /** 播放配音/音效 */
    playAudio(url: string, player?: Player): void {
        // TODO Phase 9
    }

    /** 切换背景音乐 */
    playBGM(url: string): void {
        // TODO Phase 9
    }

    /** 播放指向线动画 */
    playDirectLine(from: Player, to: Player | Player[]): void {
        // TODO Phase 9
    }

    /** 播放动画（脸谱动画、特效等） */
    playAnimation(
        type: string,
        player: Player | Player[],
        data?: Record<string, any>,
    ): void {
        // TODO Phase 9
    }
}
