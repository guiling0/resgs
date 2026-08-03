import type { ILogger, LogMeta } from './ILogger';

/** 前置标签着色（浏览器 console 用 %c + CSS） */
const TagColors = {
    room: '#00bcd4', // 青
    player: '#ffb300', // 黄
    event: '#9c27b0', // 紫
};

/** 浏览器环境判定（%c 样式仅在浏览器 console 生效） */
function supportsCssStyle(): boolean {
    return typeof window !== 'undefined';
}

/** 组装 console 调用参数：浏览器走 %c 着色，其余环境走纯文本 */
function buildArgs(message: string, extra?: LogMeta): unknown[] {
    if (!extra) return [message];
    const { roomId, playerId, event, ...rest } = extra;
    const restStr = Object.keys(rest).length > 0 ? JSON.stringify(rest) : null;

    if (supportsCssStyle()) {
        let text = '';
        const styles: string[] = [];
        if (roomId) {
            text += `%c[Room:${roomId}]`;
            styles.push(`color: ${TagColors.room}`);
        }
        if (playerId) {
            text += `%c[Player:${playerId}]`;
            styles.push(`color: ${TagColors.player}`);
        }
        if (event) {
            text += `%c[${event}]`;
            styles.push(`color: ${TagColors.event}`);
        }
        if (!text) return restStr ? [message, restStr] : [message];
        text += '%c%s';
        styles.push('color: inherit');
        const args: unknown[] = [text, ...styles, message];
        if (restStr) args.push(restStr);
        return args;
    }

    const tags: string[] = [];
    if (roomId) tags.push(`Room:${roomId}`);
    if (playerId) tags.push(`Player:${playerId}`);
    if (event) tags.push(event);
    const prefix = tags.length > 0 ? `[${tags.join('][')}] ` : '';
    const args: unknown[] = [`${prefix}${message}`];
    if (restStr) args.push(restStr);
    return args;
}

/** 通用 console 日志实现（ILogger 的 console 适配） */
export class ConsoleLogger implements ILogger {
    debug(message: string, extra?: LogMeta): void {
        console.debug(...buildArgs(message, extra));
    }

    info(message: string, extra?: LogMeta): void {
        console.info(...buildArgs(message, extra));
    }

    warn(message: string, extra?: LogMeta): void {
        console.warn(...buildArgs(message, extra));
    }

    error(message: string, extra?: LogMeta): void {
        console.error(...buildArgs(message, extra));
    }
}

/** 默认日志实例（Room 构造缺省使用） */
export const consoleLogger = new ConsoleLogger();
