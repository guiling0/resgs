# L0-04: 服务入口 + Colyseus 启动

**Type:** task
**Status:** resolved
**Blocked by:** L0-01, L0-03

## 问题

重写 `server/src/index.ts` 和 `server/src/app.config.ts`，使服务可以启动。

### 4a. `app.config.ts`

- 使用 `defineServer` 定义 Colyseus Server
- `express` 回调中挂载：
  - `express.json()` 中间件
  - Auth 路由（来自 L0-03）
  - `/monitor` 面板
  - （开发环境）`/` playground
- 定义一个**占位 Room**（Colyseus 要求至少一个 room）：

```ts
// server/src/rooms/LobbyRoom.ts
import { Room } from 'colyseus';
export class LobbyRoom extends Room {
  onCreate() {}
  onJoin() {}
  onLeave() {}
}
```

### 4b. `index.ts`

启动顺序：
1. `connectDb()` — 连接数据库
2. `listen(app)` — 启动 Colyseus（默认端口 2567）

```ts
import { listen } from '@colyseus/tools';
import app from './app.config';
import { connectDb } from './db';

async function bootstrap() {
  await connectDb();
  await listen(app, 2567);
  console.log('[Server] L0 服务启动完成 — http://localhost:2567');
}

bootstrap().catch((err) => {
  console.error('[Server] 启动失败:', err);
  process.exit(1);
});
```

- **不 import sgs**，**不 import DataManager**（shared/ 为空）
- 进程退出时调用 `closeDB()`

### 4c. `tsconfig.json`

- 移除 `@shared/*` path alias（或保留但确保编译不报错）
- 确保 `include` 不包含 `../shared`

## 验收

```bash
cd server && npm start
# → [DB] MongoDB 连接成功: sgs
# → [DB] 索引创建完成
# → [Server] L0 服务启动完成 — http://localhost:2567
```

`curl http://localhost:2567/hi` → `"It's time to kick ass and chew bubblegum!"`

## Answer

（待实现）

## Comments

（待讨论）
