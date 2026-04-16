import type { Expense } from '../types/expense.js';

/**
 * @description Row shape from `expenses` SELECT (snake_case, MySQL types).
 */
export interface ExpenseRow {
  id: number | bigint | string;
  description: string;
  amount: string | number;
  category: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Converts a DB row to the public API {@link Expense} shape.
 * @param row - Row from mysql2 (DECIMAL often string; id may be bigint).
 * @returns API expense with camelCase and ISO timestamps.
 */
export function mapExpenseRow(row: ExpenseRow): Expense {
  const idNum = typeof row.id === 'bigint' ? Number(row.id) : Number(row.id);
  const amountStr =
    typeof row.amount === 'string'
      ? normalizeTwoDecimalString(row.amount)
      : Number(row.amount).toFixed(2);

  return {
    id: idNum,
    description: row.description,
    amount: amountStr,
    category: row.category,
    createdAt: toIsoUtc(row.created_at),
    updatedAt: toIsoUtc(row.updated_at),
  };
}

function toIsoUtc(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return new Date(value as unknown as string).toISOString();
  }
  return value.toISOString();
}

function normalizeTwoDecimalString(raw: string): string {
  const num = Number(raw.trim());
  if (!Number.isFinite(num)) {
    return '0.00';
  }
  return num.toFixed(2);
}
