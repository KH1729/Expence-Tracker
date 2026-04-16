import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { HttpError } from '../errors/httpError.js';
import type { ExpenseRow } from '../mappers/expenseMapper.js';
import type { PatchBody } from '../schemas/expenseSchemas.js';

function isDbConnectionError(err: unknown): boolean {
  if (err === null || typeof err !== 'object') {
    return false;
  }
  const code = 'code' in err ? String((err as { code: unknown }).code) : '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'ECONNRESET'
  );
}

function wrapDbError(err: unknown): never {
  if (isDbConnectionError(err)) {
    throw new HttpError(
      503,
      'SERVICE_UNAVAILABLE',
      'Database unavailable'
    );
  }
  throw err;
}

/**
 * @description Returns total row count for `expenses`.
 * @param pool - mysql2 pool.
 */
export async function countExpenses(pool: Pool): Promise<number> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM expenses'
    );
    const row = rows[0];
    const total = row?.['total'];
    return typeof total === 'bigint' ? Number(total) : Number(total ?? 0);
  } catch (err) {
    wrapDbError(err);
  }
}

const expenseSelectJoin = `SELECT e.id, e.description, e.amount,
  e.category_id, c.name AS category_name,
  e.created_at, e.updated_at
  FROM expenses e
  INNER JOIN categories c ON e.category_id = c.id`;

/**
 * @description Lists expenses ordered by `created_at DESC`, `id DESC`.
 * @param pool - mysql2 pool.
 * @param limit - Page size.
 * @param offset - Offset.
 */
export async function listExpenses(
  pool: Pool,
  limit: number,
  offset: number
): Promise<ExpenseRow[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${expenseSelectJoin}
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as ExpenseRow[];
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Fetches one expense by id or `null` if missing.
 * @param pool - mysql2 pool.
 * @param id - Primary key.
 */
export async function findExpenseById(
  pool: Pool,
  id: number
): Promise<ExpenseRow | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${expenseSelectJoin}
       WHERE e.id = ?
       LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return row as ExpenseRow;
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Inserts a new expense row.
 * @param pool - mysql2 pool.
 * @param input - Field values (amount as two-decimal string).
 * @returns New row id.
 */
export async function insertExpense(
  pool: Pool,
  input: { description: string; amount: string; categoryId: number }
): Promise<number> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO expenses (description, amount, category_id) VALUES (?, ?, ?)`,
      [input.description, input.amount, input.categoryId]
    );
    return Number(result.insertId);
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Updates only provided fields; returns updated row or `null` if id missing.
 * @param pool - mysql2 pool.
 * @param id - Primary key.
 * @param patch - Partial fields.
 */
export async function updateExpensePartial(
  pool: Pool,
  id: number,
  patch: PatchBody
): Promise<ExpenseRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.description !== undefined) {
    sets.push('description = ?');
    values.push(patch.description);
  }
  if (patch.amount !== undefined) {
    sets.push('amount = ?');
    values.push(patch.amount);
  }
  if (patch.categoryId !== undefined) {
    sets.push('category_id = ?');
    values.push(patch.categoryId);
  }

  if (sets.length === 0) {
    return findExpenseById(pool, id);
  }

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE expenses SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return findExpenseById(pool, id);
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Deletes expense by id; returns whether a row was removed.
 * @param pool - mysql2 pool.
 * @param id - Primary key.
 */
export async function deleteExpenseById(
  pool: Pool,
  id: number
): Promise<boolean> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM expenses WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    wrapDbError(err);
  }
}
