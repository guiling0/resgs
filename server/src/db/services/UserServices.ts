import { ObjectId } from 'mongodb';
import { getDB } from '..';
import { RecentGame, User } from '../models/user';
import bcrypt from 'bcryptjs';

export class UserService {
    static col() {
        return getDB().collection<User>('users');
    }

    /**
     * 注册或登录用户
     * @param username 用户名
     * @param password 密码
     * @param ip 登录IP
     * @returns 用户ID和用户名
     */
    static async registerOrLogin({
        username,
        password,
        ip,
    }: {
        username: string;
        password: string;
        ip: string;
    }) {
        //TODO 检查IP是否被封

        let user = await this.col().findOne({ username });

        if (!user) {
            //TODO 检查IP注册限制

            const passwordHash = await bcrypt.hash(password, 10);
            const now = new Date();

            const result = await this.col().insertOne({
                username,
                nickname: username,
                passwordHash,
                avatarUrl: '',
                registerIp: ip,
                registerTime: now,
                lastLoginTime: now,

                reputaionScore: 100,
                escapes: 0,
                cumulativeEscapes: 0,

                banned: {
                    isBanned: false,
                    reason: '',
                    until: null,
                    bannedBy: '',
                },
                muted: { isMuted: false, reason: '', until: null, mutedBy: '' },
                gameBanned: {
                    isGameBanned: false,
                    reason: '',
                    until: null,
                    gameBannedBy: '',
                },

                titles: [],
                currentTitle: null,
                role: 'player',
                recentGames: [],
            });

            return { userId: result.insertedId, username };
        }

        //检查密码
        if (!(await this.validatePassword(user, password))) {
            throw new Error('invalid password');
        }

        //TODO 检查账号封禁状态

        await this.updateLastLogin(user._id.toString());
        return { userId: user._id, username };
    }

    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @returns 用户
     */
    static async findByUsername(username: string) {
        return await this.col().findOne({ username });
    }

    /**
     * 根据ID查找用户
     * @param userId 用户ID
     * @returns 用户
     */
    static async findById(userId: string) {
        return await this.col().findOne({ _id: new ObjectId(userId) });
    }

    /**
     * 验证用户密码
     * @param user 用户
     * @param password 密码
     * @returns 是否验证通过
     */
    static async validatePassword(user: User, password: string) {
        return await bcrypt.compare(password, user.passwordHash);
    }

    /**
     * 更新用户最后登录时间
     * @param userId 用户ID
     */
    static async updateLastLogin(userId: string) {
        await this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { lastLoginTime: new Date() } },
        );
    }

    /**
     * 封禁用户
     * @param userId 用户ID
     * @param reason 封禁原因
     * @param operatorId 操作人ID
     * @param durationMinutes 封禁时长（分钟），null表示永久封禁
     * @returns 封禁结果
     */
    static async banUser({
        userId,
        reason,
        operatorId,
        durationMinutes = null,
    }: {
        userId: string;
        reason: string;
        operatorId: string;
        durationMinutes?: number | null;
    }) {
        const until = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000)
            : null;

        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    banned: {
                        isBanned: true,
                        reason,
                        until,
                        bannedBy: operatorId,
                    },
                },
            },
        );
    }

    /**
     * 禁言用户
     * @param userId 用户ID
     * @param reason 禁言原因
     * @param operatorId 操作人ID
     * @param durationMinutes 禁言时长（分钟），null表示永久禁言
     * @returns 禁言结果
     */
    static async muteUser({
        userId,
        reason,
        operatorId,
        durationMinutes = null,
    }: {
        userId: string;
        reason: string;
        operatorId: string;
        durationMinutes?: number | null;
    }) {
        const until = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000)
            : null;
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    muted: {
                        isMuted: true,
                        reason,
                        until,
                        mutedBy: operatorId,
                    },
                },
            },
        );
    }

    /**
     * 游戏封禁用户
     * @param userId 用户ID
     * @param reason 游戏封禁原因
     * @param operatorId 操作人ID
     * @param durationMinutes 游戏封禁时长（分钟），null表示永久游戏封禁
     * @returns 游戏封禁结果
     */
    static async gameBanUser({
        userId,
        reason,
        operatorId,
        durationMinutes = null,
    }: {
        userId: string;
        reason: string;
        operatorId: string;
        durationMinutes?: number | null;
    }) {
        const until = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000)
            : null;
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    gameBanned: {
                        isGameBanned: true,
                        reason,
                        until,
                        gameBannedBy: operatorId,
                    },
                },
            },
        );
    }

    /**
     * 解封用户
     * @param userId 用户ID
     * @param operatorId 操作人ID
     * @returns 解封结果
     */
    static async unbanUser(userId: string, operatorId: string) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { 'banned.isBanned': false, 'banned.until': null } },
        );
    }

    /**
     * 解禁言用户
     * @param userId 用户ID
     * @param operatorId 操作人ID
     * @returns 解禁言结果
     */
    static async unmuteUser(userId: string, operatorId: string) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { 'muted.isMuted': false, 'muted.until': null } },
        );
    }

    /**
     * 解游戏封禁用户
     * @param userId 用户ID
     * @param operatorId 操作人ID
     * @returns 解游戏封禁结果
     */
    static async ungameBanUser(userId: string, operatorId: string) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    'gameBanned.isGameBanned': false,
                    'gameBanned.until': null,
                },
            },
        );
    }

    /**
     * 检查并解封用户
     * @param userId 用户ID
     * @returns 解封结果
     */
    static async checkAndLiftBans(userId: string) {
        const now = new Date();
        const user = await this.col().findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return;
        }

        const updates: Record<string, any> = {};

        if (
            user.banned.isBanned &&
            user.banned.until &&
            user.banned.until < now
        ) {
            updates['banned.isBanned'] = false;
            updates['banned.until'] = null;
        }
        if (user.muted.isMuted && user.muted.until && user.muted.until < now) {
            updates['muted.isMuted'] = false;
            updates['muted.until'] = null;
        }
        if (
            user.gameBanned.isGameBanned &&
            user.gameBanned.until &&
            user.gameBanned.until < now
        ) {
            updates['gameBanned.isGameBanned'] = false;
            updates['gameBanned.until'] = null;
        }
        if (Object.keys(updates).length > 0) {
            await this.col().updateOne(
                { _id: new ObjectId(userId) },
                { $set: updates },
            );
        }
    }

    /**
     * 添加用户称号
     * @param userId 用户ID
     * @param title 称号
     * @returns 添加称号结果
     */
    static async addTitle(userId: string, title: string) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { titles: title } },
        );
    }

    /**
     * 切换用户称号
     * @param userId 用户ID
     * @param title 称号
     * @returns 切换称号结果
     */
    static async switchTitle(userId: string, title: string | null) {
        if (title) {
            const user = await this.col().findOne({
                _id: new ObjectId(userId),
            });
            if (!user?.titles.includes(title)) {
                throw new Error('未拥有该称号');
            }
        }
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { currentTitle: title } },
        );
    }

    /**
     * 添加用户最近游戏记录
     * @param userId 用户ID
     * @param game 游戏记录
     * @returns 添加游戏记录结果
     */
    static async addRecentGame(userId: string, game: RecentGame) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            {
                $push: {
                    recentGames: {
                        $each: [game],
                        $slice: -20,
                    },
                },
            },
        );
    }

    /**
     * 记录用户逃跑
     * @param userId 用户ID
     * @returns 记录逃跑结果
     */
    static async recordEscape(userId: string) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { escapes: 1, cumulativeEscapes: 1 } },
        );
    }

    /**
     * 调整用户声誉分数
     * @param userId 用户ID
     * @param score 调整分数
     * @returns 调整声誉分数结果
     */
    static async adjustReputationScore(userId: string, score: number) {
        return this.col().updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { reputaionScore: score } },
        );
    }

    /**
     * 检查用户是否为管理员或子管理员
     * @param userId 用户ID
     * @returns 是否为管理员或子管理员
     */
    static isAdmin(user: User): boolean {
        return user.role === 'admin' || user.role === 'childAdmin';
    }

    /**
     * 检查用户是否为测试员或管理员
     * @param userId 用户ID
     * @returns 是否为测试员或管理员
     */
    static isTester(user: User): boolean {
        return user.role === 'tester' || user.role === 'admin';
    }
}
