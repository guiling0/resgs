# L0-03: JWT 工具 + Auth 路由

**Type:** task
**Status:** resolved
**Blocked by:** L0-02

## 问题

提供 JWT 签发/验证工具，并挂载 Auth Express 路由到 Colyseus。

### 3a. JWT 工具 — `server/src/auth/jwt.ts`

```ts
export function signToken(payload: { userId: string; username: string }): string
export function verifyToken(token: string): { userId: string; username: string } | null
```

- Access Token 有效期 15 分钟
- 密钥默认 `'resgs-secret'`
- `verifyToken` 失败返回 `null`（不抛异常）

### 3b. Auth 路由 — 挂载在 `app.config.ts` 的 `express` 回调中

只有 **一个** 端点（前端只有一个登录按钮，用户名不存在自动注册）：

```
POST /auth/login   body: { username, password }  → { token, user }
```

- 从 `req.ip` 获取客户端 IP
- 调用 `UserService.registerOrLogin()` — 不存在即注册，存在即验证密码
- 成功后调用 `signToken()` 签发 JWT
- 返回 `user` 字段直接透传 `registerOrLogin` 的返回值（nickname/role 为数据库真实值）

```json
{
  "token": "eyJ...",
  "user": {
    "userId": "...",
    "username": "player1",
    "nickname": "大乔",
    "role": "player"
  }
}
```

- 错误时返回 `{ "error": "错误描述" }` + 对应 HTTP 状态码（401/400/500）

### 3c. Express JSON 中间件

需要 `express.json()` 解析 POST body。

## 验收

```bash
# 首次登录 → 自动注册
curl -X POST http://localhost:2567/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"123456"}'
# → { "token": "...", "user": { "userId": "...", "username": "test1", "nickname": "test1", "role": "player" } }

# 再次登录 → 验证密码
curl -X POST http://localhost:2567/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"123456"}'
# → { "token": "...", "user": { ... } }

# 密码错误
curl -X POST http://localhost:2567/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"wrong"}'
# → 401 { "error": "密码错误" }
```

## Answer

（待实现）

## Comments

（待讨论）
