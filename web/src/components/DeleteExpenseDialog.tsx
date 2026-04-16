'use client';

import type { Expense } from '@/types/expense';
import { useEffect, useRef } from 'react';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  isPending: boolean;
  onClose: () => void;
  /** @description Called when user confirms; may be async (mutation + refetch). */
  onConfirm: () => void | Promise<void>;
}

/**
 * @description Accessible confirmation dialog for deleting an expense (`<dialog>`).
 */
export function DeleteExpenseDialog({
  expense,
  isPending,
  onClose,
  onConfirm,
}: DeleteExpenseDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (expense) {
      el.showModal();
    } else {
      el.close();
    }
  }, [expense]);

  return (
    <dialog
      ref={ref}
      className="rounded-lg p-4 shadow-lg backdrop:bg-black/40"
      onClose={() => {
        onClose();
      }}
    >
      <h2 className="text-lg font-semibold">Delete expense?</h2>
      <p className="mt-2 text-sm text-zinc-600">
        {expense
          ? `Remove “${expense.description}” (${expense.amount})?`
          : null}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-1 dark:border-zinc-600"
          onClick={() => {
            ref.current?.close();
          }}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
          onClick={async () => {
            await onConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </dialog>
  );
}
