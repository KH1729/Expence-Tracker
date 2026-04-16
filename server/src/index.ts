import 'dotenv/config';
import { createServer } from 'node:http';
import pino from 'pino';
import { loadEnv } from './config/loadEnv.js';
import { createLogger } from './logger.js';
import { initializePool, pingDb } from './db/pool.js';
import { createApp } from './app.js';

const bootstrapLogger = pino({ level: 'info' });

try {
  const config = loadEnv();
  const logger = createLogger(config);
  const pool = initializePool(config);

  const app = createApp({
    config,
    logger,
    pingDatabase: () => pingDb(pool),
    pool,
  });

  const server = createServer(app);
  server.listen(config.port, () => {
    logger.info({ port: config.port }, 'HTTP server listening');
  });
} catch (err) {
  bootstrapLogger.error({ err }, 'Failed to start server');
  process.exit(1);
}
