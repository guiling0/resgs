# L0-05: 客户端 LoadScene → EntryScene → 登录界面

**Type:** task
**Status:** resolved
**Blocked by:** L0-04

## 问题

客户端 LayaAir 3.4 项目需实现加载流程到登录界面。

### 5a. 启动流程

```
App 启动 → LoadScene（资源加载 + 进度条）
         → EntryScene（登录/注册界面）
         → 登录成功 → 跳转 LobbyScene（L1 实现）
```

### 5b. 服务发现

从 `client/src/config.ts` 读取 `serverUrl`（默认 `ws://localhost:2567`），HTTP 请求用 `http://localhost:2567`。

### 5c. 登录界面功能

- 用户名输入框
- 密码输入框
- 注册/登录按钮
- 错误提示（密码错误、网络错误等）
- 登录成功后保存 token（localStorage 或内存）
- Colyseus SDK `client.http.post('/auth/register', ...)` 或直接 `fetch`

### 5d. Token 管理

- Access Token 保存到内存/LocalStorage
- 后续请求（L1+）通过 HTTP Header `Authorization: Bearer <token>` 携带

## 验收

1. 客户端启动 → LoadScene 加载进度条 → EntryScene
2. 输入用户名密码 → 点击注册 → 服务端返回 token
3. 输入用户名密码 → 点击登录 → 服务端返回 token
4. 密码错误 → 界面提示 "密码错误"
5. Token 已存储，可以在后续 L1 中使用

## Answer

（待实现）

## Comments

（待讨论）
