import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { HttpError } from '../errors/httpError.js';
import type { CategoryRow } from '../mappers/categoryMapper.js';

function isDuplicateNameError(err: unknown): boolean {
  if (err === null || typeof err !== 'object') {
    return false;
  }
  return 'code' in err && (err as { code: unknown }).code === 'ER_DUP_ENTRY';
}

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
 * @description Lists categories ordered by name, then id.
 * @param pool - mysql2 pool.
 */
export async function listCategories(pool: Pool): Promise<CategoryRow[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, created_at, updated_at
       FROM categories
       ORDER BY name ASC, id ASC`
    );
    return rows as CategoryRow[];
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Inserts a category row; maps duplicate name to HTTP 409.
 * @param pool - mysql2 pool.
 * @param name - Trimmed display name.
 * @returns New row id.
 */
export async function insertCategory(pool: Pool, name: string): Promise<number> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO categories (name) VALUES (?)`,
      [name]
    );
    return Number(result.insertId);
  } catch (err) {
    if (isDuplicateNameError(err)) {
      throw new HttpError(
        409,
        'DUPLICATE_CATEGORY',
        'A category with this name already exists'
      );
    }
    wrapDbError(err);
  }
}

/**
 * @description Loads category by primary key or `null`.
 * @param pool - mysql2 pool.
 * @param id - Category id.
 */
export async function findCategoryById(
  pool: Pool,
  id: number
): Promise<CategoryRow | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, created_at, updated_at FROM categories WHERE id = ? LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return row as CategoryRow;
  } catch (err) {
    wrapDbError(err);
  }
}

/**
 * @description Resolves category id by exact name (for seeding).
 * @param pool - mysql2 pool.
 * @param name - Category name.
 */
export async function findCategoryIdByName(
  pool: Pool,
  name: string
): Promise<number | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM categories WHERE name = ? LIMIT 1`,
      [name]
    );
    const row = rows[0];
    if (!row || !('id' in row)) {
      return null;
    }
    const raw = row['id'];
    return typeof raw === 'bigint' ? Number(raw) : Number(raw);
  } catch (err) {
    wrapDbError(err);
  }
}
