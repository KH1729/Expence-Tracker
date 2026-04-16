import type { Pool } from 'mysql2/promise';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { mockConfig, mockLogger } from '../test/fixtures.js';

const categoryRow = {
  id: 1,
  name: 'Food',
  created_at: new Date('2026-04-16T10:00:00.000Z'),
  updated_at: new Date('2026-04-16T10:00:00.000Z'),
};

function poolWithQuery(query: ReturnType<typeof vi.fn>): Pool {
  return { query } as unknown as Pool;
}

describe('categories routes', () => {
  it('GET /api/categories returns items', async () => {
    const query = vi.fn().mockResolvedValueOnce([[categoryRow]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).get('/api/categories').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].name).toBe('Food');
  });

  it('POST /api/categories returns 201', async () => {
    const created = { ...categoryRow, id: 2, name: 'Travel' };
    const query = vi
      .fn()
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 2 }])
      .mockResolvedValueOnce([[created]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Travel' })
      .expect(201);
    expect(res.body.data.category.name).toBe('Travel');
  });

  it('POST /api/categories returns 409 on duplicate', async () => {
    const dupErr = Object.assign(new Error('Duplicate'), { code: 'ER_DUP_ENTRY' });
    const query = vi.fn().mockRejectedValueOnce(dupErr);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Food' })
      .expect(409);
    expect(res.body.error?.code).toBe('DUPLICATE_CATEGORY');
  });
});
