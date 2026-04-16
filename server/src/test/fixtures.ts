import pino from 'pino';
import type { Pool } from 'mysql2/promise';
import { vi } from 'vitest';
import type { AppConfig } from '../config/loadEnv.js';

/** @description Minimal valid `AppConfig` for unit/integration tests. */
export const mockConfig: AppConfig = {
  mysqlHost: '127.0.0.1',
  mysqlPort: 3306,
  mysqlUser: 'test',
  mysqlPassword: 'test',
  mysqlDatabase: 'test',
  port: 4000,
  logLevel: 'info',
  corsOrigin: 'http://localhost:3000',
};

/** @description Silent pino logger for tests (no console noise). */
export const mockLogger = pino({ level: 'silent' });

/**
 * @description Minimal mysql2 pool mock for tests that do not hit `/api/expenses`.
 * @returns Pool with `query` stub returning empty rows.
 */
export function createMockPool(): Pool {
  return {
    query: vi.fn().mockResolvedValue([[]]),
  } as unknown as Pool;
}
