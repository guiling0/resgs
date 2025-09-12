import { getDatabase } from '..';
import { UserManager } from '../../UserManager';
import { DbUser, UserWarsState } from '../models/User';
import { BanService } from './BanService';
import * as bcrypt from 'bcryptjs';

export class UserService {
    private readonly collection = getDatabase().collection<DbUser>('users');
    private readonly banService = new BanService();

    async registerOrLogin(
        username: string,
        password: string,
        ip: string
    ): Promise<DbUser> {
        //检查IP是否被封
        const ipCheck = await this.banService.isIpBanned(ip);
        if (ipCheck.isBanned) {
            throw new Error(`IP address is banned:${ipCheck.reason}`);
        }

        let user = await this.collection.findOne({ username });

        if (!user) {
            // 2. 检查IP注册限制
            const ipLimit = await this.checkIpRegistrationLimit(ip);
            if (!ipLimit) {
                throw new Error(`IP has reached the registration limit(${1})`);
            }
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);
            const newUser: DbUser = {
                username,
                nickname: username,
                passwordHash,
                salt,
                profile: {
                    reputationScore: 100,
                    doudizhuScore: 3000,
                    avatar: 'http://res.resgs.com/generals/shibingn/image.png',
                    titles: [],
                    lastLogin: new Date(),
                },
                registration: {
                    ip,
                    date: new Date(),
                },
                privileges: {
                    admin: false,
                    childAdmin: false,
                    betaTester: false,
                },
                status: {
                    isBanned: false,
                    isMuted: false,
                    isGameBanned: false,
                },
                ipHistory: [ip],
                statsByMode: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await this.collection.insertOne(newUser);
            return { ...newUser, _id: result.insertedId };
        }

        //检查密码
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            throw new Error('Invalid password');
        }

        // 检查账号状态
        if (user.status.isBanned) {
            if (
                !user.status.banExpires ||
                user.status.banExpires > new Date()
            ) {
                throw new Error('Account is banned');
            } else {
                await this.unBanUser(username);
            }
        }

        await this.collection.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    'profile.lastLogin': new Date(),
                    updatedAt: new Date(),
                },
                $addToSet: { ipHistory: ip },
            }
        );

        return user;
    }

    private async checkIpRegistrationLimit(ip: string) {
        const limit = 1;
        const count = await this.collection.countDocuments({
            'registration.ip': ip,
        });
        return count < limit;
    }

    /**
     * 封账号
     * @param username 用户名
     * @param reason 封禁原因
     * @param times 封禁时长(毫秒)
     * @param banIp 是否连带IP封禁
     */
    async banUser(
        username: string,
        reason: string,
        times?: number,
        banIp: boolean = true
    ) {
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');

        const expiresAt = times ? new Date(Date.now() + times) : undefined;

        await this.collection.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    'status.isBanned': true,
                    'status.banReason': reason,
                    'status.banExpires': expiresAt,
                    updatedAt: new Date(),
                },
            }
        );

        if (banIp && user.ipHistory?.length > 0) {
            for (const ip of user.ipHistory) {
                await this.banService.banIp(
                    ip,
                    `关联账号封禁：${reason}`,
                    times
                );
            }
        }
    }

    /**
     * 禁止发言
     * @param username 用户名
     * @param reason 封禁原因
     * @param times 封禁时长(毫秒)
     */
    async banMuted(username: string, reason: string, times?: number) {
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');
        const expiresAt = times ? new Date(Date.now() + times) : undefined;
        await this.collection.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    'status.isMuted': true,
                    'status.muteReason': reason,
                    'status.muteExpires': expiresAt,
                    updatedAt: new Date(),
                },
            }
        );
    }

    /**
     * 禁止参与游戏
     * @param username 用户名
     * @param reason 封禁原因
     * @param times 封禁时长(毫秒)
     */
    async banGame(username: string, reason: string, times?: number) {
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');
        const expiresAt = times ? new Date(Date.now() + times) : undefined;
        await this.collection.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    'status.isGameBanned': true,
                    'status.gameBanReason': reason,
                    'status.gameBanExpires': expiresAt,
                    updatedAt: new Date(),
                },
            }
        );
    }

    /** 解封账号 */
    async unBanUser(username: string) {
        await this.collection.updateOne(
            { username },
            {
                $set: {
                    'status.isBanned': false,
                    'status.banReason': null,
                    'status.banExpires': null,
                },
            }
        );
    }

    /** 解封游戏权限 */
    async unBanGame(username: string) {
        await this.collection.updateOne(
            { username },
            {
                $set: {
                    'status.isGameBanned': false,
                    'status.gameBanReason': null,
                    'status.gameBanExpires': null,
                },
            }
        );
    }

    /** 解除禁言 */
    async unBanMuted(username: string) {
        await this.collection.updateOne(
            { username },
            {
                $set: {
                    'status.isMuted': false,
                    'status.muteReason': null,
                    'status.muteExpires': null,
                },
            }
        );
    }

    /** 检查是否为管理员 */
    async checkAdmin(username: string) {
        return await this.collection.findOne({
            username,
            'privileges.admin': true,
        });
    }

    /** 修改头像 */
    async updateAvatar(username: string, avatar: string) {
        await this.collection.findOneAndUpdate(
            {
                username,
            },
            {
                $set: {
                    'profile.avatar': avatar,
                },
            }
        );
    }

    /** 记录游戏数据 */
    async recordGameResult(matchResult: MatchUserResult) {
        const { mode } = matchResult;

        if (mode === 'wars_temp_jin' || mode === 'wars_temp_xl') {
            await this.recordWarsGame(matchResult);
        }
    }

    /** 记录国战模式的数据 */
    async recordWarsGame(matchResult: MatchUserResult) {
        const mode_templete = matchResult.mode;
        const results = matchResult.players;
        if (results.length === 0) return;
        const usernames = results.map((v) => v.username);
        const now = new Date();

        await this.collection.updateMany(
            {
                username: { $in: usernames },
                [`statsByMode.${mode_templete}`]: { $exists: false },
            },
            {
                $set: {
                    [`statsByMode.${mode_templete}`]:
                        this.getDefaultWarsStates(),
                },
                $setOnInsert: { updatedAt: now },
            },
            { upsert: false }
        );

        const bulkOps = results.map((player) => {
            const update: any = {
                $inc: {
                    [`statsByMode.${mode_templete}.matches`]: 1,
                    ...(player.isWinner && {
                        [`statsByMode.${mode_templete}.wins`]: 1,
                    }),
                    ...(player.escaped && {
                        [`statsByMode.${mode_templete}.escapes`]: 1,
                    }),
                },
                $set: { updatedAt: now },
            };

            if (player.kingdom) {
                let kingdom: string;
                if (player.kingdom === 'wei') {
                    kingdom = 'asWei';
                }
                if (player.kingdom === 'shu') {
                    kingdom = 'asShu';
                }
                if (player.kingdom === 'wu') {
                    kingdom = 'asWu';
                }
                if (player.kingdom === 'qun') {
                    kingdom = 'asQun';
                }
                if (player.kingdom === 'jin') {
                    kingdom = 'asJin';
                }
                if (player.kingdom.includes('ye')) {
                    kingdom = 'asYe';
                }
                if (kingdom) {
                    const factionField = `statsByMode.${mode_templete}.${kingdom}`;
                    update.$inc[`${factionField}.matches`] = 1;
                    if (player.isWinner) {
                        update.$inc[`${factionField}.wins`] = 1;
                    }
                    if (player.escaped) {
                        update.$inc[`${factionField}.escapes`] = 1;
                    }
                }
            }

            return {
                updateOne: {
                    filter: { username: player.username },
                    update: update,
                },
            };
        });

        // 3. 执行批量更新
        if (bulkOps.length > 0) {
            await this.collection.bulkWrite(bulkOps);
        }
    }

    private getDefaultWarsStates(): UserWarsState {
        return {
            matches: 0,
            wins: 0,
            escapes: 0,
            asWei: { matches: 0, wins: 0, escapes: 0 },
            asShu: { matches: 0, wins: 0, escapes: 0 },
            asWu: { matches: 0, wins: 0, escapes: 0 },
            asQun: { matches: 0, wins: 0, escapes: 0 },
            asJin: { matches: 0, wins: 0, escapes: 0 },
            asYe: { matches: 0, wins: 0, escapes: 0 },
        };
    }
}

export interface MatchUserResult {
    mode: string;
    players: {
        username: string;
        kingdom: string;
        isWinner: boolean;
        escaped: boolean;
    }[];
}
