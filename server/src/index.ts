import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { sgs } from './core/sgs';
import extensions from './core/extensions.config';
import bodyParser from 'body-parser';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/game';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { CustomLobbyRoom } from './rooms/lobby';
import { createAuthRouter } from './routes/auth';
import { UserService } from './db/services/UserService';
import { BanService } from './db/services/BanService';
import { UserManager } from './UserManager';
import { createAdminRouter } from './routes/admin';
import { setupBanCleanup } from './scripts/banCleanup';
import { createAppRouter } from './routes/app';
import { connectToDatabase } from './db';
import { setupUserCleanup } from './scripts/userCleanup';

sgs.init('server', (name: string) => {
    require(`./extensions/${name}/index`);
});

for (const pkg of extensions) {
    const name = pkg.split('@')[0];
    sgs.loadPackage(name);
    sgs.extensions.push(pkg);
}

connectToDatabase()
    .catch((err) => {
        console.error('Database connection failed', err);
        process.exit(1);
    })
    .then(() => {
        start();
    });

async function start() {
    const userService = new UserService();
    const banService = new BanService();
    const userManager = UserManager.inst;
    const app = express();
    const port = 12699;

    const allowedOrigin = [
        'http://192.168.1.3:18090',
        'http://192.168.1.3:8000',
        'http://resgs.com/',
        'http://resgs.com/game/',
        'http://resgs.com',
        'http://resgs.com/game',
    ];

    app.use(
        cors({
            origin: allowedOrigin,
            methods: [
                'GET',
                'HEAD',
                'PUT',
                'PATCH',
                'POST',
                'DELETE',
                'OPTIONS',
            ], // 必须包含 OPTIONS
            allowedHeaders: ['Content-Type', 'x-user-name', 'x-user-token'], // 允许的请求头
            credentials: true,
        })
    );
    app.use(bodyParser.json());

    app.use('/auth', createAuthRouter(userService, userManager));
    app.use('/admin', createAdminRouter(userService, banService, userManager));
    app.use('/app', createAppRouter(userService, userManager));

    const gameServer = new Server({
        transport: new WebSocketTransport({
            server: createServer(app),
        }),
    });

    gameServer.define('lobby', CustomLobbyRoom);
    gameServer.define('game', GameRoom).enableRealtimeListing();

    app.use('/rooms', monitor());
    app.use('/playground', playground());

    gameServer.listen(port);
    console.log(`Server is listening on port ${port}`);

    gameServer.onShutdown(() => {
        console.log(`Server is Closed`);
    });

    //定时任务
    await setupBanCleanup(banService);
    await setupUserCleanup(userManager);
}
