import { Router, Request, Response } from 'express';
import { UserService } from 'src/db/services/UserService';
import { signToken } from './jwt';
import { logger } from 'src/logger';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: '用户名或密码不能为空' });
            return;
        }

        if (typeof username !== 'string' || typeof password !== 'string') {
            res.status(400).json({
                error: '参数格式错误',
            });
            return;
        }

        const ip = req.ip || '127.0.0.1';
        const user = await UserService.registerOrLogin({
            username,
            password,
            ip,
        });
        const token = signToken({ userId: user.userId, username });

        res.json({
            token,
            user: {
                userId: user.userId,
                username: user.username,
                nickname: user.nickname,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (err: any) {
        if (err.message === 'invalid password') {
            res.status(401).json({ error: '密码错误' });
            return;
        }
        logger.error(`[Auth]login error:`, err);
        res.status(500).json({ error: '服务器错误' });
    }
});
