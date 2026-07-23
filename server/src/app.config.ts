import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
    LobbyRoom,
} from 'colyseus';
import express from 'express';
/**
 * Import your Room files
 */
import { GameRoom } from './rooms/GameRoom.js';
import { authRouter } from './auth/routes.js';
import { statusRouter } from './routes/status.js';

const server = defineServer({
    /**
     * Define your room handlers:
     */
    rooms: {
        lobby: defineRoom(LobbyRoom),
    },

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    express: (app) => {
        app.use(express.json());
        app.use('/auth', authRouter);
        app.use(statusRouter);
        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitoring/#restrict-access-to-the-panel-using-a-password
         */
        app.use('/monitor', monitor());

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== 'production') {
            app.use('/', playground());
        }
    },
});

export default server;
