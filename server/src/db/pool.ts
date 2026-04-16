import { createPool } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import type { AppConfig } from '../config/loadEnv.js';

let pool: Pool | null = null;

/**
 * @description Creates a MySQL connection pool from validated configuration.
 * @param config - Application configuration with MySQL connection fields.
 * @returns mysql2 promise pool (singleton for the process).
 */
export function initializePool(config: AppConfig): Pool {
  pool = createPool({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}

/**
 * @description Returns the initialized pool or throws if `initializePool` was not called.
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

/**
 * @description Runs a lightweight query to verify database connectivity.
 * @param dbPool - mysql2 pool instance.
 * @returns `true` if `SELECT 1` succeeds, otherwise `false`.
 */
export async function pingDb(dbPool: Pool): Promise<boolean> {
  try {
    await dbPool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
