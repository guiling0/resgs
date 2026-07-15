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
import { createGameLogger, logger } from './logger/index';
import { sgs } from '@shared/core/sgs';
import { DataManager } from './DataManager';

sgs.init('server');

DataManager.load();

// Import Colyseus config
// import app from "./app.config.js";

// Create and listen on 2567 (or PORT environment variable.)
// listen(app);
