'use client';

import { ApiError, expenseApi } from '@/services/expenseApi';
import type { Expense } from '@/types/expense';
import { useCallback, useState } from 'react';

/**
 * @description Create / update / delete expenses with optional error message for UI.
 * @param onSettled - Called after each successful mutation (refetch lists / totals).
 */
export function useExpenseMutations(onSettled: () => void | Promise<void>) {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const wrap = useCallback(
    async (fn: () => Promise<unknown>) => {
      setPending(true);
      setActionError(null);
      try {
        await fn();
        await onSettled();
      } catch (e) {
        const message =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Request failed';
        setActionError(message);
      } finally {
        setPending(false);
      }
    },
    [onSettled]
  );

  const createExpense = useCallback(
    (payload: { description: string; amount: string; categoryId: number }) =>
      wrap(() => expenseApi.create(payload)),
    [wrap]
  );

  const updateExpense = useCallback(
    (
      id: number,
      payload: Partial<{
        description: string;
        amount: string;
        categoryId: number;
      }>
    ) => wrap(() => expenseApi.patch(id, payload)),
    [wrap]
  );

  const deleteExpense = useCallback(
    (id: number) => wrap(() => expenseApi.remove(id)),
    [wrap]
  );

  return {
    pending,
    actionError,
    clearActionError: () => {
      setActionError(null);
    },
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
