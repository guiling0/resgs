/**
 * 日志结构化元数据（可选附加字段）。
 */
export interface LogMeta {
    roomId?: string;
    playerId?: string;
    event?: string;
    [key: string]: unknown;
}

/** 日志抽象接口（Room 级日志统一经构造注入的 logger 输出） */
export interface ILogger {
    debug(message: string, extra?: LogMeta): void;
    info(message: string, extra?: LogMeta): void;
    warn(message: string, extra?: LogMeta): void;
    error(message: string, extra?: LogMeta): void;
}
