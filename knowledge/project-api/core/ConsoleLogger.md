---
title: ConsoleLogger
type: api
id: api/core/ConsoleLogger
tags: [API, 核心域（shared/core 根）]
---

# ConsoleLogger（类）

- 签名：`export class ConsoleLogger implements ILogger`
- 位置：../../shared/core/ConsoleLogger.ts#L55

> 通用 console 日志实现（ILogger 的 console 适配）

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| debug | ` debug(message: string, extra?: LogMeta): void` |  |  |
| info | ` info(message: string, extra?: LogMeta): void` |  |  |
| warn | ` warn(message: string, extra?: LogMeta): void` |  |  |
| error | ` error(message: string, extra?: LogMeta): void` |  |  |

### consoleLogger（常量）

- 签名：`export const consoleLogger = new ConsoleLogger();`
- 位置：../../shared/core/ConsoleLogger.ts#L74

> 默认日志实例（Room 构造缺省使用）
