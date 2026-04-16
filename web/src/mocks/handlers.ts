import type { Expense } from '@/types/expense';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:4000';

let store: Expense[] = [];
let nextId = 1;

/**
 * @description Resets in-memory expense data used by MSW handlers (call in tests between cases).
 * @param seed - Optional rows to preload.
 */
export function resetExpenseMocks(seed: Expense[] = []): void {
  store = seed.map((e) => ({ ...e }));
  nextId = store.reduce((m, e) => Math.max(m, e.id), 0) + 1;
}

function successJson<T>(data: T, init?: number) {
  return HttpResponse.json({ success: true as const, data }, { status: init ?? 200 });
}

export const handlers = [
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
      category: string;
    };
    const now = new Date().toISOString();
    const row: Expense = {
      id: nextId++,
      description: body.description,
      amount: body.amount,
      category: body.category,
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
      category: string;
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
    const updated: Expense = {
      ...cur,
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.amount !== undefined ? { amount: body.amount } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      updatedAt: new Date().toISOString(),
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
