'use client';

import { sumCents } from '@/lib/money';
import { useExpenseList } from '@/hooks/useExpenseList';
import { useExpenseMutations } from '@/hooks/useExpenseMutations';
import { useGrandTotalSum } from '@/hooks/useGrandTotalSum';
import { categoryApi } from '@/services/categoryApi';
import { ApiError } from '@/services/expenseApi';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import { useCallback, useEffect, useState } from 'react';
import { DeleteExpenseDialog } from './DeleteExpenseDialog';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseTable } from './ExpenseTable';
import { SummaryBar } from './SummaryBar';

/**
 * @description Client shell: list, totals, create/edit forms, delete confirmation.
 */
export function ExpenseDashboard() {
  const {
    items,
    total,
    limit,
    offset,
    isLoading,
    error,
    refetch,
    goNextPage,
    goPrevPage,
    canGoNext,
    canGoPrev,
    setOffset,
  } = useExpenseList(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const onSettled = useCallback(async () => {
    await refetch();
    setRefreshKey((k) => k + 1);
  }, [refetch]);

  const {
    pending,
    actionError,
    clearActionError,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseMutations(onSettled);

  const { grandCents, isLoading: grandLoading, error: grandError } =
    useGrandTotalSum(total, refreshKey);

  const pageSubtotalCents = sumCents(items.map((i) => i.amount));

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError(null);
    void categoryApi
      .list()
      .then((r) => {
        if (!cancelled) {
          setCategories(r.items);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCategoriesError(
            e instanceof ApiError ? e.message : 'Failed to load categories'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleCreateCategory = useCallback(async (name: string) => {
    const c = await categoryApi.create(name);
    setCategories((prev) =>
      [...prev, c].sort((a, b) => a.name.localeCompare(b.name))
    );
    return c.id;
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      items.length === 0 &&
      total !== null &&
      total > 0 &&
      offset > 0
    ) {
      setOffset(Math.max(0, offset - limit));
    }
  }, [isLoading, items.length, total, offset, limit, setOffset]);

  const rangeStart = total === null || total === 0 ? 0 : offset + 1;
  const rangeEnd = offset + items.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Expenses</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Manage expenses against the Expense Tracker API.
      </p>

      <SummaryBar
        rowTotal={total}
        pageSubtotalCents={pageSubtotalCents}
        grandCents={grandCents}
        grandLoading={grandLoading}
        grandError={grandError}
      />

      {error ? (
        <div
          className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {categoriesError ? (
        <div
          className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          role="alert"
        >
          <p>{categoriesError}</p>
        </div>
      ) : null}

      {actionError ? (
        <div
          className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          <p>{actionError}</p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={() => {
              clearActionError();
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span data-testid="page-range">
          {total === null
            ? '…'
            : total === 0
              ? 'No rows'
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            onClick={() => {
              goPrevPage();
            }}
            disabled={!canGoPrev || isLoading}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-600"
            onClick={() => {
              goNextPage();
            }}
            disabled={!canGoNext || isLoading}
          >
            Next
          </button>
        </div>
      </div>

      <ExpenseTable
        items={items}
        isLoading={isLoading}
        onEdit={(row) => {
          setEditing(row);
        }}
        onDelete={(row) => {
          setDeleteTarget(row);
        }}
      />

      {editing ? (
        <ExpenseForm
          mode="edit"
          initial={editing}
          disabled={pending}
          categories={categories}
          isLoadingCategories={categoriesLoading}
          onCreateCategory={handleCreateCategory}
          onSubmitEdit={async (id, data) => {
            await updateExpense(id, data);
          }}
          onCancelEdit={() => {
            setEditing(null);
          }}
        />
      ) : (
        <ExpenseForm
          mode="create"
          disabled={pending}
          categories={categories}
          isLoadingCategories={categoriesLoading}
          onCreateCategory={handleCreateCategory}
          onSubmitCreate={async (data) => {
            await createExpense(data);
          }}
        />
      )}

      <DeleteExpenseDialog
        expense={deleteTarget}
        isPending={pending}
        onClose={() => {
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteExpense(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
