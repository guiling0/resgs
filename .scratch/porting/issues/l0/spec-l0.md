# L0 Spec：加载 + 登录

> 里程碑：启动服务 → 登录（无 shared 依赖）

## 范围

| 层 | 内容 |
|---|---|
| shared/ | **不涉及** — shared/ 保持空，L0 全部逻辑在 server/ 内自包含 |
| 服务端 | 服务启动 + DB 连接 + Auth 路由 + JWT |
| 客户端 | LoadScene → EntryScene → 登录界面 |

## 验收标准

1. `npm start` 启动 Colyseus 服务，DB 连接成功
2. `POST /auth/login` — 新用户名 → 自动注册并返回 JWT
3. `POST /auth/login` — 已有用户名 + 正确密码 → 登录成功返回 JWT
4. `POST /auth/login` — 已有用户名 + 错误密码 → 401
5. 客户端 LoadScene 加载资源 → EntryScene 显示登录界面 → 输入用户名密码 → 调用服务端 → 进入大厅（L1 实现）

## 架构决策

- **无 shared 依赖**：L0 期间 shared/ 为空，`ILogger` 等接口从 `shared/core/` 复原（仅接口文件，不涉及引擎逻辑）
- **JWT 双 token**：Access Token 15min（内存），Refresh Token 7d（后续落库/内存）
- **单一登录入口**：只有 `POST /auth/login`，用户名不存在自动注册，同名即登录。前端只有一个登录按钮
- **Auth 走 Express 路由**：挂载在 Colyseus `defineServer` 的 `express` 回调中
- **MongoDB 连接池**：依赖 MongoClient 内置池（默认 maxPoolSize=100），不引入额外池化层
- **占位 Room**：Colyseus 要求至少一个 room 定义才能启动，L0 只定义空 Room（不实现游戏逻辑）

## 数据流

```
客户端                    Express 路由               MongoDB
  │                           │                        │
  ├─ POST /auth/login ───────▶│                        │
  │                           ├─ UserService           │
  │                           │  .registerOrLogin() ──▶│ 不存在 → insertOne()
  │                           │                        │ 存在   → findOne() + bcrypt
  │◀── { token, user } ──────┤                        │
```

## 不在此范围

- 房间创建/加入（L1）
- 大厅列表（L1）
- 任何游戏逻辑（L2+）
