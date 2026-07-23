import { Router, Request, Response } from 'express';
import { matchMaker } from '@colyseus/core';

export const statusRouter = Router();

statusRouter.get('/status', async (req: Request, res: Response) => {
    const rooms = await matchMaker.query();

    const onlinePlayers = rooms.reduce((sum, r) => sum + r.clients, 0);
    const roomCount = rooms.length;

    res.json({
        onlinePlayers,
        roomCount,
    });
});
