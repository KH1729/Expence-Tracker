import type { Pool } from 'mysql2/promise';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { mockConfig, mockLogger } from '../test/fixtures.js';

const sampleRow = {
  id: 1,
  description: 'Coffee',
  amount: '4.50',
  category: 'Food',
  created_at: new Date('2026-04-16T10:00:00.000Z'),
  updated_at: new Date('2026-04-16T10:00:00.000Z'),
};

function poolWithQuery(query: ReturnType<typeof vi.fn>): Pool {
  return { query } as unknown as Pool;
}

describe('expenses routes', () => {
  it('GET /api/expenses returns items and total', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[sampleRow]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).get('/api/expenses').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].amount).toBe('4.50');
  });

  it('GET /api/expenses/:id returns 404 when missing', async () => {
    const query = vi.fn().mockResolvedValueOnce([[]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).get('/api/expenses/99').expect(404);
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });

  it('GET /api/expenses/:id returns 200 when present', async () => {
    const query = vi.fn().mockResolvedValueOnce([[sampleRow]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).get('/api/expenses/1').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.id).toBe(1);
    expect(res.body.data.expense.description).toBe('Coffee');
    expect(res.body.data.expense.amount).toBe('4.50');
    expect(res.body.data.expense.category).toBe('Food');
  });

  it('POST /api/expenses returns 201', async () => {
    const created = {
      ...sampleRow,
      id: 10,
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 10 }])
      .mockResolvedValueOnce([[created]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .post('/api/expenses')
      .send({ description: 'Tea', amount: '2.00', category: 'Food' })
      .expect(201);
    expect(res.body.data.expense.id).toBe(10);
  });

  it('POST /api/expenses returns 400 on invalid amount', async () => {
    const query = vi.fn();
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .post('/api/expenses')
      .send({ description: 'Tea', amount: '-1', category: 'Food' })
      .expect(400);
    expect(res.body.error?.code).toBe('VALIDATION_ERROR');
    expect(query).not.toHaveBeenCalled();
  });

  it('PATCH /api/expenses/:id returns 200 when row exists', async () => {
    const updated = { ...sampleRow, description: 'Tea' };
    const query = vi
      .fn()
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[updated]]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .patch('/api/expenses/1')
      .send({ description: 'Tea' })
      .expect(200);
    expect(res.body.data.expense.description).toBe('Tea');
  });

  it('PATCH /api/expenses/:id returns 404 when missing', async () => {
    const query = vi.fn().mockResolvedValueOnce([{ affectedRows: 0 }]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app)
      .patch('/api/expenses/2')
      .send({ description: 'X' })
      .expect(404);
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });

  it('DELETE /api/expenses/:id returns 204', async () => {
    const query = vi.fn().mockResolvedValueOnce([{ affectedRows: 1 }]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    await request(app).delete('/api/expenses/3').expect(204);
  });

  it('DELETE /api/expenses/:id returns 404 when missing', async () => {
    const query = vi.fn().mockResolvedValueOnce([{ affectedRows: 0 }]);
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).delete('/api/expenses/999').expect(404);
    expect(res.body.error?.code).toBe('NOT_FOUND');
  });

  it('GET /api/expenses rejects invalid id param', async () => {
    const query = vi.fn();
    const app = createApp({
      config: mockConfig,
      logger: mockLogger,
      pingDatabase: async () => true,
      pool: poolWithQuery(query),
    });

    const res = await request(app).get('/api/expenses/abc').expect(400);
    expect(res.body.error?.code).toBe('VALIDATION_ERROR');
    expect(query).not.toHaveBeenCalled();
  });
});
