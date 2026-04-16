import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEnv } from './loadEnv.js';

describe('loadEnv', () => {
  const backup: NodeJS.ProcessEnv = {};

  beforeEach(() => {
    Object.assign(backup, process.env);
    process.env = { ...backup };
    process.env.MYSQL_HOST = '127.0.0.1';
    process.env.MYSQL_USER = 'u';
    process.env.MYSQL_PASSWORD = 'p';
    process.env.MYSQL_DATABASE = 'd';
    delete process.env.MYSQL_PORT;
    delete process.env.PORT;
    delete process.env.LOG_LEVEL;
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    process.env = backup;
  });

  it('returns typed config with defaults', () => {
    const config = loadEnv();
    expect(config.mysqlHost).toBe('127.0.0.1');
    expect(config.mysqlPort).toBe(3306);
    expect(config.port).toBe(4000);
    expect(config.logLevel).toBe('info');
    expect(config.corsOrigin).toBe('http://localhost:3000');
  });

  it('throws when MYSQL_HOST is missing', () => {
    delete process.env.MYSQL_HOST;
    expect(() => loadEnv()).toThrow();
  });
});
