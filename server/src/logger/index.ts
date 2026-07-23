import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { ILogger, LogMeta } from '@shared/core/ILogger';

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function buildPrefix(meta: LogMeta): string {
    const tags: string[] = [];
    if (meta.roomId) tags.push(`Room:${meta.roomId}`);
    if (meta.playerId) tags.push(`Player:${meta.playerId}`);
    if (meta.event) tags.push(meta.event);
    return tags.length > 0 ? `[${tags.join('][')}] ` : '';
}

// ANSI 颜色码
const Colors = {
    roomId: '\x1b[36m', // 青色
    playerId: '\x1b[33m', // 黄色
    event: '\x1b[35m', // 紫色
    reset: '\x1b[0m',
};

/** 构建带颜色的前缀标签（仅控制台使用） */
export function buildColoredPrefix(meta: LogMeta): string {
    const tags: string[] = [];
    if (meta.roomId)
        tags.push(`${Colors.roomId}Room:${meta.roomId}${Colors.reset}`);
    if (meta.playerId)
        tags.push(`${Colors.playerId}Player:${meta.playerId}${Colors.reset}`);
    if (meta.event) tags.push(`${Colors.event}${meta.event}${Colors.reset}`);
    return tags.length > 0 ? `[${tags.join('][')}] ` : '';
}

// 控制台格式（带颜色）
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const { roomId, playerId, event, ...rest } = meta as LogMeta &
            Record<string, any>;
        const prefix = buildColoredPrefix({ roomId, playerId, event });
        const filteredMeta: Record<string, any> = {};
        for (const key of Object.keys(rest)) {
            filteredMeta[key] = rest[key];
        }
        const metaStr = Object.keys(filteredMeta).length
            ? ` ${JSON.stringify(filteredMeta)}`
            : '';

        return `${timestamp} [${level}] ${prefix}${message}${metaStr}`;
    }),
);

// 文件格式（JSON）
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const { roomId, playerId, event, ...rest } = meta as LogMeta &
            Record<string, any>;
        const prefix = buildPrefix({ roomId, playerId, event });
        // 重组为 JSON，message 已包含前缀
        return JSON.stringify({
            timestamp,
            level,
            message: `${prefix}${message}`,
            ...rest,
        });
    }),
);

// 基础 logger（不带任何上下文）
export const logger: winston.Logger = winston.createLogger({
    level:
        (process.env.LOG_LEVEL as string) ||
        (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
        }),
        new DailyRotateFile({
            filename: path.join(logDir, 'resgs-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
            level: 'info',
        }),
        new DailyRotateFile({
            filename: path.join(logDir, 'resgs-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat,
            level: 'error',
        }),
    ],
});

export function createGameLogger(gameId: string): ILogger {
    const gamelogger = winston.createLogger({
        level:
            (process.env.LOG_LEVEL as string) ||
            (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transports: [
            new DailyRotateFile({
                filename: path.join(logDir, 'game', `${gameId}-%DATE%.log`),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                format: fileFormat,
                level: 'info',
            }),
            new DailyRotateFile({
                filename: path.join(
                    logDir,
                    'game',
                    `${gameId}-error-%DATE%.log`,
                ),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                format: fileFormat,
                level: 'error',
            }),
        ],
    });
    return {
        debug(message: string, extra?: LogMeta) {
            gamelogger.debug(message, extra);
            logger.debug(message, extra);
        },
        info(message: string, extra?: LogMeta) {
            gamelogger.info(message, extra);
            logger.info(message, extra);
        },
        warn(message: string, extra?: LogMeta) {
            gamelogger.warn(message, extra);
            logger.warn(message, extra);
        },
        error(message: string, extra?: LogMeta) {
            gamelogger.error(message, extra);
            logger.error(message, extra);
        },
    };
}
