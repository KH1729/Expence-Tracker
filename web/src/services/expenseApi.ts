import type { Expense } from '@/types/expense';

/**
 * @description Thrown when the API returns `{ success: false, error }` or a non-OK status.
 */
export class ApiError extends Error {
  public readonly name = 'ApiError';

  /**
   * @param code - Server error code (e.g. VALIDATION_ERROR).
   * @param message - Safe message for UI.
   * @param statusCode - HTTP status.
   */
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

interface ErrorBody {
  success: false;
  error: { code: string; message: string };
}

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  if (!('success' in value) || (value as { success: unknown }).success !== false)
    return false;
  const err = (value as { error?: unknown }).error;
  if (typeof err !== 'object' || err === null) return false;
  return (
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  );
}

/**
 * @description Reads and validates `NEXT_PUBLIC_API_BASE_URL` (no trailing slash).
 * @returns Base URL string.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error(
      'Missing NEXT_PUBLIC_API_BASE_URL. Copy web/.env.local.example to web/.env.local (or set in next.config env).'
    );
  }
  return raw.replace(/\/$/, '');
}

function expensesCollectionUrl(): URL {
  return new URL('/api/expenses', `${getApiBaseUrl()}/`);
}

function expenseItemUrl(id: number): URL {
  return new URL(`/api/expenses/${id}`, `${getApiBaseUrl()}/`);
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

/**
 * @description Maps a failed HTTP response to ApiError.
 */
async function rejectHttp(
  res: Response,
  body: unknown
): Promise<never> {
  if (isErrorBody(body)) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      res.status
    );
  }
  throw new ApiError(
    'UNKNOWN_ERROR',
    `Request failed (${res.status})`,
    res.status
  );
}

export interface ListResult {
  items: Expense[];
  total: number;
}

/**
 * @description Typed client for `/api/expenses` (list, CRUD).
 */
export const expenseApi = {
  /**
   * @description GET list with pagination.
   * @param limit - Page size (1–100).
   * @param offset - Row offset.
   * @returns Items and total row count.
   */
  async list(limit: number, offset: number): Promise<ListResult> {
    const url = expensesCollectionUrl();
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    const res = await fetch(url.toString(), { cache: 'no-store' });
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
      throw new ApiError('INVALID_RESPONSE', 'Unexpected list response', res.status);
    }
    const data = (body as { data: unknown }).data;
    if (
      typeof data !== 'object' ||
      data === null ||
      !('items' in data) ||
      !('total' in data)
    ) {
      throw new ApiError('INVALID_RESPONSE', 'Unexpected list data shape', res.status);
    }
    return {
      items: (data as { items: Expense[] }).items,
      total: (data as { total: number }).total,
    };
  },

  /**
   * @description GET one expense by id.
   * @param id - Numeric id.
   */
  async getById(id: number): Promise<Expense> {
    const res = await fetch(expenseItemUrl(id).toString(), { cache: 'no-store' });
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
      throw new ApiError('INVALID_RESPONSE', 'Unexpected get response', res.status);
    }
    const data = (body as { data: { expense: Expense } }).data;
    return data.expense;
  },

  /**
   * @description POST create expense.
   */
  async create(payload: {
    description: string;
    amount: string;
    category: string;
  }): Promise<Expense> {
    const res = await fetch(expensesCollectionUrl().toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      throw new ApiError('INVALID_RESPONSE', 'Unexpected create response', res.status);
    }
    const envelope = body as { data: unknown };
    const data = envelope.data;
    if (
      typeof data !== 'object' ||
      data === null ||
      !('expense' in data)
    ) {
      throw new ApiError('INVALID_RESPONSE', 'Unexpected create data shape', res.status);
    }
    return (data as { expense: Expense }).expense;
  },

  /**
   * @description PATCH partial update.
   */
  async patch(
    id: number,
    payload: Partial<{
      description: string;
      amount: string;
      category: string;
    }>
  ): Promise<Expense> {
    const res = await fetch(expenseItemUrl(id).toString(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      throw new ApiError('INVALID_RESPONSE', 'Unexpected patch response', res.status);
    }
    const patchEnvelope = body as { data: unknown };
    const patchData = patchEnvelope.data;
    if (
      typeof patchData !== 'object' ||
      patchData === null ||
      !('expense' in patchData)
    ) {
      throw new ApiError('INVALID_RESPONSE', 'Unexpected patch data shape', res.status);
    }
    return (patchData as { expense: Expense }).expense;
  },

  /**
   * @description DELETE by id (204 no body).
   */
  async remove(id: number): Promise<void> {
    const res = await fetch(expenseItemUrl(id).toString(), { method: 'DELETE' });
    if (res.status === 204) {
      return;
    }
    const body = await parseJsonUnknown(res);
    return rejectHttp(res, body);
  },
};
