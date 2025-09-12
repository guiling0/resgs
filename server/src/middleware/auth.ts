import { Request, Response, NextFunction } from 'express';
import { UserService } from '../db/services/UserService';
import { UserManager } from '../UserManager';

export function authenticateAdmin(userService: UserService) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = decodeURIComponent(
            req.headers['x-user-name'].toString()
        );
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            if (!userService.checkAdmin(userId)) {
                return res
                    .status(403)
                    .json({ error: 'Admin privileges required' });
            }
            next();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}

export function authenticateUser(userManager: UserManager) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = decodeURIComponent(
            req.headers['x-user-name'].toString()
        );
        const token = decodeURIComponent(
            req.headers['x-user-token'].toString()
        );
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            if (
                userManager.onlinePlayers[userId] &&
                userManager.onlinePlayers[userId].token === token
            ) {
                next();
            } else {
                return res.status(403).json({ error: 'User Token required' });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
