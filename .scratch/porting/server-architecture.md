# 服务端架构决策

## 一、数据库服务是否独立

**推荐：与 Colyseus 同一进程（共置）**

MongoDB 已是独立进程（`mongod`），Node.js 通过连接池访问。当前 2000+ 用户规模不需要 DB 独立服务层。

## 二、多线程/多进程

**推荐：多进程（PM2 cluster + Redis），非多线程**

Node.js 单线程执行 JS，正确缩放方式是多进程：

```
Nginx → Colyseus×N → Redis (Presence + Pub/Sub) → MongoDB
```

- `@colyseus/redis-presence`：跨进程房间发现、Lobby 全局唯一
- 开发阶段（L0-L6）单进程，L6 联机上线加 Redis + PM2

## 三、Service 层重设计原则

1. **依赖注入**：构造时接收 `Db` 实例，集合引用缓存
2. **批量操作**：`bulkWrite` 替代逐条 `updateOne`
3. **事务**：赛季切换等关键路径用 `session.withTransaction()`
4. **统一错误**：`Result<T, AppError>` 模式
5. **时机**：L0 用旧的 Service 打通，L1 后重写

## 四、回放存储

**推荐文件系统**：MongoDB 文档 16MB 限制 + 流式传输需求。`game_records.replayPath` 存路径，`GET /api/replay/:gameId` 文件流返回。

## 五、Admin Web

挂 Colyseus express 路由（`/admin/*`），不独立项目。

## 六、架构演进路线

```
L0-L1: 单进程 Colyseus + MongoDB (无 Redis)
L1 后: 重写 Service 层（依赖注入 + 批量 + Result 模式）
L6:    多进程 + Redis + PM2 + Nginx
```
