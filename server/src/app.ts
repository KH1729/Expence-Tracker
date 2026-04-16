import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Pool } from 'mysql2/promise';
import type { AppConfig } from './config/loadEnv.js';
import { createHealthRouter } from './routes/health.js';
import { createExpensesRouter } from './routes/expenses.js';
import { createErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import type { Logger } from 'pino';

export interface CreateAppOptions {
  config: AppConfig;
  logger: Logger;
  pingDatabase: () => Promise<boolean>;
  pool: Pool;
}

/**
 * @description Builds the Express application with required middleware order.
 * @param options - Config, logger, and database ping callback.
 * @returns Configured Express app (not listening).
 */
export function createApp(options: CreateAppOptions): express.Express {
  const { config, logger, pingDatabase, pool } = options;
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
    })
  );
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(express.json());

  app.use(createHealthRouter({ pingDatabase }));
  app.use(
    '/api/expenses',
    createExpensesRouter({ pool, logger })
  );

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
