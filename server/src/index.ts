/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to host your server on Colyseus Cloud
 *
 * If you're self-hosting, you can see "Raw usage" from the documentation.
 *
 * See: https://docs.colyseus.io/server
 */
import { listen } from '@colyseus/tools';
import app from './app.config';
import { connectDb, closeDb } from './db';
import { logger } from './logger';

async function bootstrap() {
    await connectDb();
    await listen(app, 12699);
    logger.info('[Server]Server is running on port 12699');
}

bootstrap().catch((err) => {
    logger.error('[Server]Error in bootstrap', err);
    process.exit(1);
});

process.on('SIGINT', async () => {
    await closeDb();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDb();
    process.exit(0);
});

// Import Colyseus config
// import app from "./app.config.js";

// Create and listen on 2567 (or PORT environment variable.)
// listen(app);
