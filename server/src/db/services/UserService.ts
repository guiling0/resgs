import { ObjectId } from 'mongodb';
import { getDB } from '..';
import { DbUser } from '../models/user';
import bcrypt from 'bcryptjs';

export class UserService {
    static col() {
        return getDB().collection<DbUser>('users');
    }

    static async registerOrLogin({
        username,
        password,
        ip,
    }: {
        username: string;
        password: string;
        ip: string;
    }) {
        let user = await this.col().findOne({ username });

        if (!user) {
            const passwordHash = await bcrypt.hash(password, 10);
            const now = new Date();

            const result = await this.col().insertOne({
                username,
                nickname: username,
                passwordHash,
                avatar: '',
                registerIp: ip,
                registerTime: now,
                lastLoginTime: now,
                reputaionScore: 100,
                escapes: 0,
                cumulativeEscapes: 0,
                banned: {
                    isBanned: false,
                    until: null,
                    reason: '',
                    by: '',
                },
                muted: {
                    isMuted: false,
                    until: null,
                    reason: '',
                    by: '',
                },
                gameBanned: {
                    isGameBanned: false,
                    until: null,
                    reason: '',
                    by: '',
                },
                titles: [],
                currentTitle: null,
                role: 'player',
                recentGames: [],
            });

            return {
                userId: result.insertedId.toHexString(),
                username,
                nickname: username,
                avatar: '',
                role: 'player',
            };
        }

        if (!(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error('invalid password');
        }

        await this.col().updateOne(
            { _id: user._id },
            { $set: { lastLoginTime: new Date() } },
        );

        return {
            userId: user._id.toHexString(),
            username,
            nickname: user.nickname,
            avatar: user.avatar,
            role: user.role,
        };
    }

    static async findByUsername(username: string) {
        return await this.col().findOne({ username });
    }

    static async findById(userId: string) {
        return await this.col().findOne({ _id: new ObjectId(userId) });
    }

    static async validatePassword(user: DbUser, password: string) {
        return await bcrypt.compare(password, user.passwordHash);
    }
}
