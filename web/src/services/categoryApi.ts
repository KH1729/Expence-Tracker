import type { Category } from '@/types/category';
import { ApiError, getApiBaseUrl } from './expenseApi';

function categoriesCollectionUrl(): URL {
  return new URL('/api/categories', `${getApiBaseUrl()}/`);
}

async function parseJsonUnknown(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      'PARSE_ERROR',
      'Invalid JSON from server',
      res.status
    );
  }
}

async function rejectHttp(res: Response, body: unknown): Promise<never> {
  if (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    (body as { success: unknown }).success === false &&
    'error' in body
  ) {
    const err = (body as { error: { code: string; message: string } }).error;
    throw new ApiError(err.code, err.message, res.status);
  }
  throw new ApiError(
    'UNKNOWN_ERROR',
    `Request failed (${res.status})`,
    res.status
  );
}

/**
 * @description Typed client for `/api/categories`.
 */
export const categoryApi = {
  /**
   * @description GET all categories for dropdowns.
   * @returns Category rows ordered by name.
   */
  async list(): Promise<{ items: Category[] }> {
    const res = await fetch(categoriesCollectionUrl().toString(), {
      cache: 'no-store',
    });
    const body = await parseJsonUnknown(res);
    if (!res.ok) {
      return rejectHttp(res, body);
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      !('success' in body) ||
      (body as { success: unknown }).success !== true ||
      !('data' in body)
    ) {
      throw new ApiError(
        'INVALID_RESPONSE',
        'Unexpected categories response',
        res.status
      );
    }
    const data = (body as { data: unknown }).data;
    if (
      typeof data !== 'object' ||
      data === null ||
      !('items' in data)
    ) {
      throw new ApiError(
        'INVALID_RESPONSE',
        'Unexpected categories data shape',
        res.status
      );
    }
    return { items: (data as { items: Category[] }).items };
  },

  /**
   * @description POST create category.
   * @param name - Display name (trimmed server-side).
   */
  async create(name: string): Promise<Category> {
    const res = await fetch(categoriesCollectionUrl().toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const body = await parseJsonUnknown(res);
    if (!res.ok) {
      return rejectHttp(res, body);
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      !('success' in body) ||
      (body as { success: unknown }).success !== true ||
      !('data' in body)
    ) {
      throw new ApiError(
        'INVALID_RESPONSE',
        'Unexpected create category response',
        res.status
      );
    }
    const envelope = body as { data: { category: Category } };
    return envelope.data.category;
  },
};
