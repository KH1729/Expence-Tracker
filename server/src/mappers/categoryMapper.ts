import type { Category } from '../types/category.js';

/**
 * @description Row shape from `categories` SELECT (snake_case).
 */
export interface CategoryRow {
  id: number | bigint | string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Converts a DB row to the public API {@link Category} shape.
 * @param row - Row from mysql2.
 * @returns API category with camelCase and ISO timestamps.
 */
export function mapCategoryRow(row: CategoryRow): Category {
  const idNum = typeof row.id === 'bigint' ? Number(row.id) : Number(row.id);
  return {
    id: idNum,
    name: row.name,
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
