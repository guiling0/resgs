export interface LogMeta {
    roomId?: string;
    playerId?: string;
    event?: string;
    [key: string]: any;
}

export interface ILogger {
    debug(message: string, extra?: LogMeta): void;
    info(message: string, extra?: LogMeta): void;
    warn(message: string, extra?: LogMeta): void;
    error(message: string, extra?: LogMeta): void;
}
