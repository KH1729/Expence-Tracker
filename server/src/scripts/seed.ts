import 'dotenv/config';
import pino from 'pino';
import { loadEnv } from '../config/loadEnv.js';
import { createLogger } from '../logger.js';
import { initializePool } from '../db/pool.js';
import { seedMockExpensesIfEmpty } from '../db/seedMockExpenses.js';

const bootstrapLogger = pino({ level: 'info' });

/** @description CLI entry: loads env, connects to MySQL, runs mock expense seed when the table is empty. */
async function main(): Promise<void> {
  const config = loadEnv();
  const logger = createLogger(config);
  const pool = initializePool(config);

  try {
    const result = await seedMockExpensesIfEmpty(pool);
    if (result.skipped) {
      logger.info(
        'Skipping mock seed: expenses table already has rows. Truncate `expenses` in dev if you want to re-seed.'
      );
    } else {
      logger.info({ inserted: result.inserted }, 'Mock expenses inserted');
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  bootstrapLogger.error({ err }, 'Seed failed');
  process.exit(1);
});
