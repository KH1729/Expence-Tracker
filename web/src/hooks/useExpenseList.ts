'use client';

import { expenseApi } from '@/services/expenseApi';
import type { Expense } from '@/types/expense';
import { useCallback, useEffect, useState } from 'react';

/**
 * @description Paginated expense list with loading and error state.
 * @param initialLimit - Page size (default 20).
 * @returns List state, pagination controls, and refetch.
 */
export function useExpenseList(initialLimit = 20) {
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<Expense[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const r = await expenseApi.list(limit, offset);
      setItems(r.items);
      setTotal(r.total);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to load expenses';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const goNextPage = useCallback(() => {
    if (total === null) return;
    if (offset + limit < total) {
      setOffset((o) => o + limit);
    }
  }, [limit, offset, total]);

  const goPrevPage = useCallback(() => {
    setOffset((o) => Math.max(0, o - limit));
  }, [limit]);

  const canGoNext = total !== null && offset + limit < total;
  const canGoPrev = offset > 0;

  return {
    items,
    total,
    limit,
    offset,
    isLoading,
    error,
    refetch,
    setLimit,
    goNextPage,
    goPrevPage,
    canGoNext,
    canGoPrev,
    setOffset,
  };
}
