import { MOCK_SEED_CATEGORY_NAMES } from '@/mocks/mockSeedCategories';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:4000';

let store: Expense[] = [];
let nextId = 1;

let categoryStore: Category[] = [];
let nextCategoryId = 1;

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * @description Resets in-memory expense and category data used by MSW handlers (call in tests between cases).
 * @param seed - Optional expense rows to preload; categories are inferred from each row’s `category`.
 */
export function resetExpenseMocks(seed: Expense[] = []): void {
  store = seed.map((e) => ({ ...e }));
  nextId = store.reduce((m, e) => Math.max(m, e.id), 0) + 1;
  categoryStore = [];
  const seen = new Set<number>();
  for (const e of seed) {
    const c = e.category;
    if (!seen.has(c.id)) {
      seen.add(c.id);
      categoryStore.push({
        id: c.id,
        name: c.name,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      });
    }
  }
  nextCategoryId =
    categoryStore.reduce((m, c) => Math.max(m, c.id), 0) + 1;

  if (categoryStore.length === 0) {
    const ts = nowIso();
    MOCK_SEED_CATEGORY_NAMES.forEach((name, index) => {
      categoryStore.push({
        id: index + 1,
        name,
        createdAt: ts,
        updatedAt: ts,
      });
    });
    nextCategoryId = MOCK_SEED_CATEGORY_NAMES.length + 1;
  }
}

function successJson<T>(data: T, init?: number) {
  return HttpResponse.json({ success: true as const, data }, { status: init ?? 200 });
}

export const handlers = [
  http.get(`${BASE}/api/categories`, () => {
    const items = [...categoryStore].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return HttpResponse.json({
      success: true as const,
      data: { items },
    });
  }),

  http.post(`${BASE}/api/categories`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length === 0) {
      return HttpResponse.json(
        {
          success: false as const,
          error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
        },
        { status: 400 }
      );
    }
    const dup = categoryStore.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (dup) {
      return HttpResponse.json(
        {
          success: false as const,
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'Category already exists',
          },
        },
        { status: 409 }
      );
    }
    const ts = nowIso();
    const cat: Category = {
      id: nextCategoryId++,
      name,
      createdAt: ts,
      updatedAt: ts,
    };
    categoryStore.push(cat);
    return successJson({ category: cat }, 201);
  }),

  http.get(`${BASE}/api/expenses`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get('limit') ?? '20'))
    );
    const offset = Math.max(0, Number(url.searchParams.get('offset') ?? '0'));
    const slice = store.slice(offset, offset + limit);
    return HttpResponse.json({
      success: true as const,
      data: { items: slice, total: store.length },
    });
  }),

  http.get(`${BASE}/api/expenses/:id`, ({ params }) => {
    const id = Number(params.id);
    const row = store.find((e) => e.id === id);
    if (!row) {
      return HttpResponse.json(
        {
          success: false as const,
          error: { code: 'NOT_FOUND', message: 'Expense not found' },
        },
        { status: 404 }
      );
    }
    return successJson({ expense: row });
  }),

  http.post(`${BASE}/api/expenses`, async ({ request }) => {
    const body = (await request.json()) as {
      description: string;
      amount: string;
      categoryId: number;
    };
    const cat = categoryStore.find((c) => c.id === body.categoryId);
    if (!cat) {
      return HttpResponse.json(
        {
          success: false as const,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Invalid category',
          },
        },
        { status: 422 }
      );
    }
    const now = nowIso();
    const row: Expense = {
      id: nextId++,
      description: body.description,
      amount: body.amount,
      category: { id: cat.id, name: cat.name },
      createdAt: now,
      updatedAt: now,
    };
    store.push(row);
    return successJson({ expense: row }, 201);
  }),

  http.patch(`${BASE}/api/expenses/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as Partial<{
      description: string;
      amount: string;
      categoryId: number;
    }>;
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false as const,
          error: { code: 'NOT_FOUND', message: 'Expense not found' },
        },
        { status: 404 }
      );
    }
    const cur = store[idx];
    let resolvedCategory = cur.category;
    if (body.categoryId !== undefined) {
      const cat = categoryStore.find((c) => c.id === body.categoryId);
      if (!cat) {
        return HttpResponse.json(
          {
            success: false as const,
            error: {
              code: 'INVALID_CATEGORY',
              message: 'Invalid category',
            },
          },
          { status: 422 }
        );
      }
      resolvedCategory = { id: cat.id, name: cat.name };
    }
    const updated: Expense = {
      ...cur,
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.amount !== undefined ? { amount: body.amount } : {}),
      category: resolvedCategory,
      updatedAt: nowIso(),
    };
    store[idx] = updated;
    return successJson({ expense: updated });
  }),

  http.delete(`${BASE}/api/expenses/:id`, ({ params }) => {
    const id = Number(params.id);
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false as const,
          error: { code: 'NOT_FOUND', message: 'Expense not found' },
        },
        { status: 404 }
      );
    }
    store.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
