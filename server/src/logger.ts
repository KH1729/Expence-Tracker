import pino from 'pino';
import type { AppConfig } from './config/loadEnv.js';

/**
 * @description Creates a pino logger using the configured log level.
 * @param config - Application configuration including `logLevel`.
 * @returns Root logger instance for the server process.
 */
export function createLogger(config: Pick<AppConfig, 'logLevel'>): pino.Logger {
  return pino({ level: config.logLevel });
}
