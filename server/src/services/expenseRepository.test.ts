import type { Pool } from 'mysql2/promise';
import { describe, expect, it, vi } from 'vitest';
import {
  countExpenses,
  deleteExpenseById,
  findExpenseById,
  insertExpense,
  listExpenses,
} from './expenseRepository.js';

describe('expenseRepository', () => {
  it('countExpenses returns numeric total', async () => {
    const query = vi.fn().mockResolvedValue([[{ total: 3 }]]);
    const pool = { query } as unknown as Pool;
    await expect(countExpenses(pool)).resolves.toBe(3);
  });

  it('findExpenseById returns null when no rows', async () => {
    const query = vi.fn().mockResolvedValue([[]]);
    const pool = { query } as unknown as Pool;
    await expect(findExpenseById(pool, 99)).resolves.toBeNull();
  });

  it('insertExpense returns insertId', async () => {
    const query = vi.fn().mockResolvedValue([{ insertId: 5, affectedRows: 1 }]);
    const pool = { query } as unknown as Pool;
    await expect(
      insertExpense(pool, {
        description: 'a',
        amount: '1.00',
        categoryId: 2,
      })
    ).resolves.toBe(5);
  });

  it('listExpenses returns rows', async () => {
    const row = {
      id: 1,
      description: 'a',
      amount: '1.00',
      category_id: 1,
      category_name: 'c',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const query = vi.fn().mockResolvedValue([[row]]);
    const pool = { query } as unknown as Pool;
    await expect(listExpenses(pool, 10, 0)).resolves.toEqual([row]);
  });

  it('deleteExpenseById returns false when no row deleted', async () => {
    const query = vi.fn().mockResolvedValue([{ affectedRows: 0 }]);
    const pool = { query } as unknown as Pool;
    await expect(deleteExpenseById(pool, 1)).resolves.toBe(false);
  });
});
