# L0-02: 用户注册/登录 Service

**Type:** task
**Status:** resolved
**Blocked by:** L0-01

## 问题

`server/src/db/services/UserServices.ts` — 封装用户相关的数据库操作。

### 核心方法

```ts
class UserService {
  static col(): Collection<User>
  static async registerOrLogin({ username, password, ip }): Promise<{ userId, username }>
  static async findByUsername(username): Promise<User | null>
  static async findById(userId): Promise<User | null>
  static async validatePassword(user, password): Promise<boolean>
  static async updateLastLogin(userId): Promise<void>
}
```

### registerOrLogin 逻辑

1. 根据 `username` 查找用户
2. **不存在** → 注册：
   - `bcrypt.hash(password, 10)` 生成 passwordHash
   - `insertOne()` 写入完整 User 文档（nickname=username, role='player', 默认字段）
   - 返回 `{ userId, username }`
3. **存在** → 登录：
   - `bcrypt.compare(password, user.passwordHash)` 验证密码
   - 密码错误抛 `'invalid password'`
   - 更新 `lastLoginTime`
   - 返回 `{ userId, username }`

### User 模型字段

已在 `server/src/db/models/user.ts` 定义，关键字段：
- `username` / `nickname` / `passwordHash` / `avatarUrl`
- `registerIp` / `registerTime` / `lastLoginTime`
- `banned` / `muted` / `gameBanned`（含 isBanned/reason/until/by）
- `role: 'player' | 'admin' | 'childAdmin' | 'tester'`
- `recentGames[]`

## 验收

- 新用户注册成功，数据库有完整文档
- 已有用户密码正确 → 登录成功，lastLoginTime 更新
- 已有用户密码错误 → 抛出 `'invalid password'`
- 可以通过 `findByUsername` / `findById` 查询到用户

## Answer

（待实现）

## Comments

（待讨论）
