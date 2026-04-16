'use client';

import { sumCents } from '@/lib/money';
import { expenseApi } from '@/services/expenseApi';
import { useEffect, useState } from 'react';

const PAGE = 100;

/**
 * @description Computes grand total by paginating GET /api/expenses until all rows are loaded.
 * @param totalRowCount - `total` from list API (null before first load).
 * @param refreshKey - Increment to recompute after mutations.
 * @returns Grand total in cents, loading, error, refetch.
 */
export function useGrandTotalSum(totalRowCount: number | null, refreshKey: number) {
  const [grandCents, setGrandCents] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (totalRowCount === null) {
      setGrandCents(null);
      return;
    }
    if (totalRowCount === 0) {
      setGrandCents(0n);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        let accumulated = 0;
        let sum = 0n;
        while (accumulated < totalRowCount) {
          const { items, total: apiTotal } = await expenseApi.list(PAGE, accumulated);
          if (cancelled) return;
          sum += sumCents(items.map((i) => i.amount));
          accumulated += items.length;
          if (items.length === 0) break;
          if (accumulated >= apiTotal) break;
        }
        if (!cancelled) {
          setGrandCents(sum);
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : 'Failed to compute total';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [totalRowCount, refreshKey]);

  return { grandCents, isLoading, error };
}
