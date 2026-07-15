import { ILogger } from '../core/ILogger';

/** 日志级别 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    OFF = 4,
}
/** 运行环境 */
enum RuntimeEnv {
    DEV = 'development',
    TEST = 'test',
    PROD = 'production',
}

/**
 * 客户端日志管理器
 * - 开发环境：输出到控制台
 * - 测试环境：输出到控制台 + 本地存储
 * - 生产环境：仅上报 Error，不输出 debug/info
 */
class ClientLogger implements ILogger {
    private level: LogLevel = LogLevel.DEBUG;
    private env: RuntimeEnv = RuntimeEnv.DEV;
    // private reportUrl: string = '/api/client-error';
    // private maxBufferSize: number = 100;
    // private buffer: Array<{
    //     level: LogLevel;
    //     message: string;
    //     meta?: any;
    //     time: number;
    // }> = [];
    // private flushInterval: number = 30000; // 30秒上报一次
    private timer: any = null;

    /** 初始化：根据环境设置日志级别 */
    init(env?: string, reportUrl?: string): void {
        if (env === 'production') {
            this.env = RuntimeEnv.PROD;
            this.level = LogLevel.ERROR; // 生产环境只记录 Error
        } else if (env === 'test') {
            this.env = RuntimeEnv.TEST;
            this.level = LogLevel.DEBUG;
        } else {
            this.env = RuntimeEnv.DEV;
            this.level = LogLevel.DEBUG;
        }

        // if (reportUrl) {
        //     this.reportUrl = reportUrl;
        // }

        // 启动定时上报
        this.startFlushTimer();

        // 全局错误捕获
        this.captureGlobalErrors();
    }

    /** 设置日志级别 */
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    /** Debug 日志（生产环境不输出） */
    debug(message: string, meta?: any): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    /** Info 日志 */
    info(message: string, meta?: any): void {
        this.log(LogLevel.INFO, message, meta);
    }

    /** Warn 日志 */
    warn(message: string, meta?: any): void {
        this.log(LogLevel.WARN, message, meta);
    }

    /** Error 日志（会立即上报） */
    error(message: string, error?: Error, meta?: any): void {
        this.log(LogLevel.ERROR, message, {
            ...meta,
            errorMsg: error?.message,
            stack: error?.stack,
        });
        // Error 级别立即上报
        this.reportImmediately(LogLevel.ERROR, message, meta);
    }

    /** 清空缓冲区 */
    flush(): void {
        // if (this.buffer.length === 0) return;
        // const logs = [...this.buffer];
        // this.buffer = [];
        // // 使用 sendBeacon 确保页面关闭时也能发送
        // const body = JSON.stringify({
        //     logs,
        //     env: this.env,
        //     ua: navigator.userAgent,
        // });
        // if (navigator.sendBeacon) {
        //     navigator.sendBeacon(this.reportUrl, body);
        // } else {
        //     fetch(this.reportUrl, {
        //         method: 'POST',
        //         body,
        //         headers: { 'Content-Type': 'application/json' },
        //         keepalive: true,
        //     }).catch(() => {});
        // }
    }

    /** 获取当前缓冲的日志（用于调试） */
    // getBuffer(): ReadonlyArray<{
    //     level: LogLevel;
    //     message: string;
    //     time: number;
    // }> {
    //     return this.buffer;
    // }

    // ========== 私有方法 ==========

    private log(level: LogLevel, message: string, meta?: any): void {
        if (level < this.level) return;

        const time = Date.now();

        // 开发/测试环境输出到控制台
        if (this.env !== RuntimeEnv.PROD) {
            this.printToConsole(level, message, meta);
        }

        // 测试环境缓存到 buffer
        // if (this.env === RuntimeEnv.TEST) {
        //     this.buffer.push({ level, message, meta, time });
        //     if (this.buffer.length >= this.maxBufferSize) {
        //         this.flush();
        //     }
        // }

        // 生产环境只缓存 Error 级别（已在 error() 方法中立即上报）
    }

    private printToConsole(level: LogLevel, message: string, meta?: any): void {
        const prefix = this.getLevelPrefix(level);
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`${prefix} ${message}${metaStr}`);
                break;
            case LogLevel.INFO:
                console.info(`${prefix} ${message}${metaStr}`);
                break;
            case LogLevel.WARN:
                console.warn(`${prefix} ${message}${metaStr}`);
                break;
            case LogLevel.ERROR:
                console.error(`${prefix} ${message}${metaStr}`);
                break;
        }
    }

    private getLevelPrefix(level: LogLevel): string {
        const prefixes = ['[DEBUG]', '[INFO]', '[WARN]', '[ERROR]'];
        return prefixes[level] || '[LOG]';
    }

    private reportImmediately(
        level: LogLevel,
        message: string,
        meta?: any,
    ): void {
        // const body = JSON.stringify({
        //     logs: [{ level, message, meta, time: Date.now() }],
        //     env: this.env,
        //     ua: navigator.userAgent,
        //     url: location.href,
        // });
        // if (navigator.sendBeacon) {
        //     navigator.sendBeacon(this.reportUrl, body);
        // } else {
        //     fetch(this.reportUrl, {
        //         method: 'POST',
        //         body,
        //         headers: { 'Content-Type': 'application/json' },
        //         keepalive: true,
        //     }).catch(() => {});
        // }
    }

    private startFlushTimer(): void {
        if (this.env === RuntimeEnv.DEV) return; // 开发环境不上报
        // this.timer = setInterval(() => this.flush(), this.flushInterval);
    }

    private captureGlobalErrors(): void {
        // 全局 JS 错误
        window.addEventListener('error', (event) => {
            this.error('全局错误', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        // Promise 未捕获异常
        window.addEventListener('unhandledrejection', (event) => {
            this.error(
                '未处理的 Promise 异常',
                new Error(event.reason?.message || String(event.reason)),
                {
                    reason: event.reason,
                },
            );
        });
    }
}

// 导出单例
export const logger = new ClientLogger();
