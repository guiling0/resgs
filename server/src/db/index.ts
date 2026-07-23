import { Db, MongoClient } from 'mongodb';
import { logger } from '../logger';

const uri = 'mongodb://localhost:12698';
const dbName = 'ressgs';

let client: MongoClient;
let db: Db;

/** 连接数据库 */
export async function connectDb() {
    if (db) return db;
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    await createIndexes(db);
    logger.info('MongoDB 连接已建立');
    return db;
}

export function getDB(): Db {
    if (!db) throw new Error('MongoDB 未连接，请先调用 connectDb()');
    return db;
}

export async function closeDb() {
    if (client) {
        await client.close();
        logger.info('MongoDB 连接已关闭');
    }
}

async function createIndexes(database: Db) {
    const users = database.collection('users');
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ nickname: 1 });
    await users.createIndex({ 'banned.isBanned': 1, 'banned.until': 1 });
    await users.createIndex({ 'muted.isMuted': 1, 'muted.until': 1 });
    await users.createIndex({
        'gameBanned.isGameBanned': 1,
        'gameBanned.until': 1,
    });
    await users.createIndex({ role: 1 });
    await users.createIndex({ registerTime: -1 });

    const bannedIps = database.collection('banned_ips');
    await bannedIps.createIndex({ ip: 1 }, { unique: true });
    await bannedIps.createIndex({ until: 1 });

    const adminLogs = database.collection('admin_logs');
    await adminLogs.createIndex({ operatorId: 1, createAt: -1 });
    await adminLogs.createIndex({ action: 1, createAt: -1 });
    await adminLogs.createIndex({ target: 1 });

    const seasonStats = database.collection('season_stats');
    await seasonStats.createIndex(
        { userId: 1, seasonId: 1, mode: 1 },
        { unique: true },
    );
    await seasonStats.createIndex({ seasonId: 1, mode: 1, score: -1 });

    const seasonSnapshots = database.collection('season_snapshots');
    await seasonSnapshots.createIndex({ seasonId: 1 }, { unique: true });

    const userModeStats = database.collection('user_mode_stats');
    await userModeStats.createIndex({ userId: 1, mode: 1 }, { unique: true });
    await userModeStats.createIndex({ mode: 1, winRate: -1, total: -1 });
    await userModeStats.createIndex({ userId: 1 });

    const userFunStats = database.collection('user_fun_stats');
    await userFunStats.createIndex({ userId: 1 }, { unique: true });

    const generalStats = database.collection('general_stats');
    await generalStats.createIndex({ generalId: 1, mode: 1 }, { unique: true });
    await generalStats.createIndex({ mode: 1, winRate: -1, total: -1 });
    await generalStats.createIndex({ generalId: 1 });

    const gameRecords = database.collection('game_records');
    await gameRecords.createIndex({ gameId: 1 }, { unique: true });
    await gameRecords.createIndex({ roomId: 1 });
    await gameRecords.createIndex({ mode: 1, endTime: -1 });
    await gameRecords.createIndex({ 'players.userId': 1, endTime: -1 });

    logger.info('[DB] 索引创建完成');
}
