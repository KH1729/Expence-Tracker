import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { createMockPool, mockConfig, mockLogger } from './test/fixtures.js';

describe('createApp', () => {
  it('returns 200 and db up when ping succeeds', async () => {
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: createMockPool(),
    });

    const res = await request(app).get('/health').expect(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: 'ok', db: 'up' },
    });
  });

  it('returns 503 when database is down', async () => {
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => false,
      pool: createMockPool(),
    });

    const res = await request(app).get('/health').expect(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('returns 404 JSON for unknown routes', async () => {
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: createMockPool(),
    });

    const res = await request(app).get('/unknown').expect(404);
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });
});
