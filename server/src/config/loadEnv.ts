import { z } from 'zod';

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

const envSchema = z.object({
  MYSQL_HOST: z.string().min(1),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: logLevelSchema.default('info'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

export type AppConfig = {
  mysqlHost: string;
  mysqlPort: number;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
  port: number;
  logLevel: z.infer<typeof logLevelSchema>;
  corsOrigin: string;
};

/**
 * @description Validates `process.env` and returns a typed app configuration.
 * @returns Parsed configuration for MySQL, HTTP server, logging, and CORS.
 */
export function loadEnv(): AppConfig {
  const parsed = envSchema.parse(process.env);
  return {
    mysqlHost: parsed.MYSQL_HOST,
    mysqlPort: parsed.MYSQL_PORT,
    mysqlUser: parsed.MYSQL_USER,
    mysqlPassword: parsed.MYSQL_PASSWORD,
    mysqlDatabase: parsed.MYSQL_DATABASE,
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
    corsOrigin: parsed.CORS_ORIGIN,
  };
}
