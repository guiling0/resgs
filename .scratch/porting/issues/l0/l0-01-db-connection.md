# L0-01: 数据库连接

**Type:** task
**Status:** resolved
**Blocked by:** —

## 问题

`server/src/db/index.ts` 需要提供 MongoDB 连接管理：

1. `connectDb()` — 连接 MongoDB，创建索引，缓存 db 实例
2. `getDB()` — 获取已连接实例，未连接时抛错
3. `closeDB()` — 关闭连接池，进程退出时调用

MongoDB 连接字符串：`mongodb://localhost:12698`，数据库名：`sgs`。

MongoClient 内置连接池（默认 maxPoolSize=100），不需要额外池化层。

## 索引

需覆盖以下集合：
- `users` — username(unique), nickname, ban/mute/gameBan 状态, role, registerTime
- `banned_ips` — ip(unique), until
- `admin_logs` — operatorId+createAt, action+createAt, target
- `season_stats` — userId+seasonId+mode(unique), seasonId+mode+score
- `season_snapshots` — seasonId(unique)
- `user_mode_stats` — userId+mode(unique), mode+winRate+total
- `user_fun_stats` — userId(unique)
- `general_stats` — generalId+mode(unique), mode+winRate+total
- `game_records` — gameId(unique), roomId, mode+endTime, players.userId+endTime

## 验收

- `connectDb()` 调用后 `getDB()` 返回可用 Db 实例
- 重复调用 `connectDb()` 不创建新连接
- 所有索引创建成功（MongoDB Compass 或 `db.collection.getIndexes()` 验证）

## Answer

（待实现）

## Comments

（待讨论）
