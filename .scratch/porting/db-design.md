# 数据库设计文档

> 状态：草案，待决策
> 目标数据量：2k+ 注册用户（增长中）、~1w 武将记录、~10 个模式

---

## 一、技术选型

| 项 | 决策 |
|---|---|
| 驱动 | MongoDB 原生 `mongodb` v7 |
| 密码 | `bcryptjs` |
| 认证 | JWT (`jsonwebtoken`) |
| 连接串 | `.env` 配置 |

---

## 二、集合设计（10 个集合）

### 2.1 `users` — 用户

```typescript
interface User {
    _id: ObjectId;
    username: string;         // 唯一索引
    passwordHash: string;     // bcrypt
    nickname: string;
    avatar: string;           // URL
    registerIp: string;
    registerTime: Date;
    lastLoginTime: Date;

    reputation: number;       // 默认 100，范围 0-110
    escapes: number;
    consecutiveEscapes: number;

    banned:    { until: Date | null; reason: string; by: string };
    muted:     { until: Date | null; reason: string; by: string };
    gameBanned:{ until: Date | null; reason: string; by: string };

    titles: string[];
    currentTitle: string | null;
    role: 'player' | 'tester' | 'admin';

    recentGames: {            // 最多 10 局
        gameId: string;
        mode: string;
        generals: string[];
        won: boolean;
        time: Date;
    }[];
}
```

> 模式统计已独立为 `user_mode_stats`（2.2），避免 User 文档膨胀。

### 2.2 `user_mode_stats` — 用户模式统计

```typescript
interface UserModeStat {
    _id: ObjectId;
    userId: ObjectId;        // 联合唯一: userId+mode
    mode: string;

    total: number;
    wins: number;
    losses: number;
    winRate: number;         // wins/total
    escapes: number;

    extraStats: Record<string, { total: number; wins: number; winRate: number }>;
    updatedAt: Date;
}
```

### 2.3 `user_fun_stats` — 趣味属性

```typescript
interface UserFunStat {
    _id: ObjectId;
    userId: ObjectId;        // 唯一索引

    // 乐不思蜀
    lebuUsed: number; lebuUsedJudgeCount: number; lebuUsedJudgeNotHeart: number;
    // 兵粮寸断
    bingliangUsed: number; bingliangUsedJudgeCount: number; bingliangUsedJudgeNotClub: number;
    // 乐/兵（作为目标）
    lebuTargetJudgeCount: number; lebuTargetJudgeHeart: number;
    bingliangTargetJudgeCount: number; bingliangTargetJudgeClub: number;
    // 八卦阵
    baguaJudgeCount: number; baguaJudgeRed: number;
    // 闪电
    shandianJudgeCount: number; shandianHitCount: number; shandianKillCount: number;
    // 社交
    flowersReceived: number; eggsReceived: number; likesReceived: number;
    // 极端记录
    mostDamageInOneTurn: number; mostCardsInHand: number;
    longestWinStreak: number; currentWinStreak: number;
    mostKillsInOneTurn: number; diedBeforeFirstTurn: number; maxSingleDamage: number;

    updatedAt: Date;
}
```

### 2.4 `generals` — 武将统计

```typescript
interface GeneralStat {
    _id: ObjectId;
    generalId: string;       // 联合唯一: generalId+mode
    mode: string;

    total: number; wins: number; losses: number; winRate: number;

    offered: number; picked: number; pickRate: number;  // Ban/Pick
    banned: number; banRate: number;

    headPicked: number; headWins: number; headWinRate: number;
    deputyPicked: number; deputyWins: number; deputyWinRate: number;
    averagePickOrder: number; totalPickOrder: number;

    updatedAt: Date;
}
```

### 2.5 `season_stats` — 赛季分数

```typescript
interface SeasonStats {
    _id: ObjectId;
    userId: ObjectId;        // 联合唯一: userId+seasonId+mode
    seasonId: string;
    mode: string;

    score: number;
    totalGames: number; wins: number; losses: number; winRate: number;
    subStats: Record<string, { total: number; wins: number }>;
    updatedAt: Date;
}
```

### 2.6 `season_snapshots` — 赛季快照

```typescript
interface SeasonSnapshot {
    _id: ObjectId;
    seasonId: string;
    snapshotTime: Date;
    rankings: { mode: string; top100: { userId: ObjectId; username: string; score: number; rank: number }[] }[];
    totalPlayers: number;
    totalGames: number;
}
```

### 2.7 `game_records` — 对局记录

```typescript
interface GameRecord {
    _id: string;             // 对局 ID（string，URL 传递）
    mode: string;
    roomId: string;
    players: { userId: ObjectId; username: string; generals: string[]; won: boolean; escaped: boolean; role?: string; kingdom?: string; mvpScore?: number }[];
    startTime: Date; endTime: Date; duration: number;
    replayPath?: string;     // 回放文件路径（文件系统存储）
    logFile?: string;
    createdAt: Date;
}
```

### 2.8 `admin_logs` — 管理员日志

```typescript
interface AdminLog {
    _id: ObjectId;
    action: 'ban' | 'unban' | 'mute' | 'unmute' | 'game_ban' | 'ungame_ban'
           | 'ban_ip' | 'unban_ip' | 'grant_title' | 'revoke_title'
           | 'season_end' | 'adjust_reputation';
    target: string; operator: string; reason: string;
    duration?: string; detail?: string;
    createdAt: Date;
}
```

### 2.9 `banned_ips` — IP 封禁

```typescript
interface BannedIp {
    _id: ObjectId;
    ip: string;              // 唯一索引
    reason: string; operator: string;
    until: Date | null;
    createdAt: Date;
}
```

### 2.10 `ai_training_data` — AI 训练（L4 启用）

```typescript
interface AiTrainingData {
    _id: ObjectId;
    gameId: string; mode: string; phase: string;
    context: { hp: number; handCount: number; enemies: number; allies: number; generalName: string };
    decision: { type: 'play_card' | 'use_skill' | 'respond' | 'discard' | 'pass'; cardOrSkill: string; targetCount: number; wasCorrect: boolean };
    timestamp: Date;
}
```

---

## 三、信誉分系统

| 分数 | 惩罚 | 持续 |
|---|---|---|
| < 80 | 禁游 | 20 分钟 |
| < 70 | 禁游 | 12 小时 |
| < 60 | 禁游 | 24 小时 |
| < 40 | 封号 | 24 小时 |

扣分：逃跑-10、连续逃跑额外-5/次、举报-3、屏蔽-6
恢复：正常完成一局+1（上限110）

---

## 四、赛季系统

- 管理员手动触发 `POST /api/admin/season/end`
- 生成 `season_snapshots` → 更新 `currentSeason` → 新对局写新赛季

---

## 五、待决策项

1. 信誉分初始值/阈值是否合适
2. 称号授予条件定义
3. AI 数据嵌入 game_records 还是独立
4. 回放：MongoDB vs 文件系统（推荐文件系统）
5. 管理员 Web 页面独立项目 vs Colyseus 路由（推荐挂路由）
