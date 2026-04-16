import type { Pool } from 'mysql2/promise';
import { countExpenses, insertExpense } from '../services/expenseRepository.js';
import {
  findCategoryIdByName,
  insertCategory,
} from '../services/categoryRepository.js';

/** @description Sample rows for local debugging (inserted only when `expenses` is empty). */
export const MOCK_EXPENSE_SEED_ROWS: ReadonlyArray<{
  description: string;
  amount: string;
  category: string;
}> = [
  {
    description: 'Weekly groceries',
    amount: '87.42',
    category: 'Food',
  },
  {
    description: 'Monthly transit pass',
    amount: '49.00',
    category: 'Transport',
  },
  {
    description: 'Coffee with team',
    amount: '12.50',
    category: 'Food',
  },
  {
    description: 'Cloud backup subscription',
    amount: '9.99',
    category: 'Subscriptions',
  },
  {
    description: 'Desk lamp',
    amount: '34.00',
    category: 'Home',
  },
];

/** @description Distinct category names from {@link MOCK_EXPENSE_SEED_ROWS}, sorted for stable seed order. */
export const MOCK_SEED_CATEGORY_NAMES: readonly string[] = [
  ...new Set(MOCK_EXPENSE_SEED_ROWS.map((r) => r.category)),
].sort((a, b) => a.localeCompare(b));

/**
 * @description Ensures category names exist and returns id for a display name.
 * @param pool - mysql2 pool.
 * @param name - Category label.
 */
async function ensureCategoryId(pool: Pool, name: string): Promise<number> {
  const existing = await findCategoryIdByName(pool, name);
  if (existing !== null) {
    return existing;
  }
  return insertCategory(pool, name);
}

/**
 * @description Inserts {@link MOCK_EXPENSE_SEED_ROWS} when the table has no rows; otherwise no-ops.
 * @param pool - mysql2 pool.
 * @returns Count of inserted rows and whether seeding was skipped.
 */
export async function seedMockExpensesIfEmpty(
  pool: Pool
): Promise<{ inserted: number; skipped: boolean }> {
  const total = await countExpenses(pool);
  if (total > 0) {
    return { inserted: 0, skipped: true };
  }

  for (const name of MOCK_SEED_CATEGORY_NAMES) {
    await ensureCategoryId(pool, name);
  }

  let inserted = 0;
  for (const row of MOCK_EXPENSE_SEED_ROWS) {
    const categoryId = await ensureCategoryId(pool, row.category);
    await insertExpense(pool, {
      description: row.description,
      amount: row.amount,
      categoryId,
    });
    inserted += 1;
  }
  return { inserted, skipped: false };
}
