"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeIndexes = initializeIndexes;
async function initializeIndexes(db) {
    //武将统计索引
    await initializeGeneralIndexes(db);
    //用户集合索引
    await db.collection('users').createIndexes([
        {
            key: { username: 1 },
            unique: true,
            name: 'username_unique',
        },
        {
            key: { 'profile.online': 1, 'profile.lastLogin': -1 },
            name: 'online_status',
        },
        {
            key: { 'status.isBanned': 1, 'status.banExpires': 1 },
            name: 'ban_status',
        },
        {
            key: { ipHistory: 1 },
            name: 'ip_history',
        },
    ]);
    //系统配置索引
    await db.collection('system_config').createIndexes([
        {
            key: { _id: 1 },
            name: 'primary',
        },
        {
            key: { 'ipBlacklist.ip': 1, 'ipBlacklist.expiresAt': 1 },
            name: 'ip_blacklist',
            partialFilterExpression: { 'ipBlacklist.ip': { $exists: true } },
        },
    ]);
}
async function initializeGeneralIndexes(db) {
    const collection = db.collection('generals');
    // 1. 基础查询索引
    await collection.createIndex({ generalId: 1 }, { unique: true });
    // 2. 模式统计查询索引
    const modes = ['wars_temp_jin', 'wars_temp_xl'];
    for (const mode of modes) {
        // 胜率排行榜索引
        await collection.createIndex({
            [`statsByMode.${mode}.winRate`]: -1,
            [`statsByMode.${mode}.initialPicks`]: -1,
        });
        // 出场次数索引
        await collection.createIndex({
            [`statsByMode.${mode}.offered`]: -1,
        });
        // 身份表现索引
        await collection.createIndex({
            [`statsByMode.${mode}.asHead.winRate`]: -1,
            [`statsByMode.${mode}.asHead.initialPicks`]: -1,
        });
        await collection.createIndex({
            [`statsByMode.${mode}.asDeputy.winRate`]: -1,
            [`statsByMode.${mode}.asDeputy.initialPicks`]: -1,
        });
        // 野心家索引
        await collection.createIndex({
            [`statsByMode.${mode}.asAmbition.overallWinRate`]: -1,
            [`statsByMode.${mode}.asAmbition.totalTimes`]: -1,
        });
    }
    // 3. 部分索引（只索引常用数据）
    await collection.createIndex({ [`statsByMode.wars_temp_jin.offered`]: 1 }, {
        partialFilterExpression: {
            [`statsByMode.wars_temp_jin.offered`]: { $gt: 50 },
        },
    });
}
