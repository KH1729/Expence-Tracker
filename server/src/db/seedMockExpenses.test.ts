import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Pool } from 'mysql2/promise';
import {
  MOCK_EXPENSE_SEED_ROWS,
  seedMockExpensesIfEmpty,
} from './seedMockExpenses.js';
import * as categoryRepository from '../services/categoryRepository.js';
import * as expenseRepository from '../services/expenseRepository.js';

vi.mock('../services/expenseRepository.js', () => ({
  countExpenses: vi.fn(),
  insertExpense: vi.fn(),
}));

vi.mock('../services/categoryRepository.js', () => ({
  findCategoryIdByName: vi.fn(),
  insertCategory: vi.fn(),
}));

describe('seedMockExpensesIfEmpty', () => {
  beforeEach(() => {
    vi.mocked(expenseRepository.countExpenses).mockReset();
    vi.mocked(expenseRepository.insertExpense).mockReset();
    vi.mocked(categoryRepository.findCategoryIdByName).mockReset();
    vi.mocked(categoryRepository.insertCategory).mockReset();

    const nameToId = new Map<string, number>();
    let nextId = 1;
    vi.mocked(categoryRepository.findCategoryIdByName).mockImplementation(
      async (_pool, name) => nameToId.get(name) ?? null
    );
    vi.mocked(categoryRepository.insertCategory).mockImplementation(
      async (_pool, name) => {
        const id = nextId;
        nextId += 1;
        nameToId.set(name, id);
        return id;
      }
    );
  });

  it('returns skipped when table already has rows', async () => {
    vi.mocked(expenseRepository.countExpenses).mockResolvedValue(3);
    vi.mocked(expenseRepository.insertExpense).mockResolvedValue(1);

    const result = await seedMockExpensesIfEmpty({} as Pool);

    expect(result).toEqual({ inserted: 0, skipped: true });
    expect(expenseRepository.insertExpense).not.toHaveBeenCalled();
  });

  it('inserts all mock rows when table is empty', async () => {
    vi.mocked(expenseRepository.countExpenses).mockResolvedValue(0);
    vi.mocked(expenseRepository.insertExpense).mockResolvedValue(1);

    const result = await seedMockExpensesIfEmpty({} as Pool);

    expect(result.skipped).toBe(false);
    expect(result.inserted).toBe(MOCK_EXPENSE_SEED_ROWS.length);
    expect(expenseRepository.insertExpense).toHaveBeenCalledTimes(
      MOCK_EXPENSE_SEED_ROWS.length
    );
  });
});
