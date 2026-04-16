import { formatCents } from '@/lib/money';

interface SummaryBarProps {
  rowTotal: number | null;
  pageSubtotalCents: bigint;
  grandCents: bigint | null;
  grandLoading: boolean;
  grandError: string | null;
}

/**
 * @description Shows row count from API, page subtotal, and grand total (all rows).
 */
export function SummaryBar({
  rowTotal,
  pageSubtotalCents,
  grandCents,
  grandLoading,
  grandError,
}: SummaryBarProps) {
  return (
    <section
      className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
      aria-label="Expense totals"
    >
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Expenses (rows):{' '}
          </span>
          <span data-testid="row-count">{rowTotal ?? '—'}</span>
        </div>
        <div>
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Page subtotal:{' '}
          </span>
          <span data-testid="page-subtotal">{formatCents(pageSubtotalCents)}</span>
        </div>
        <div>
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Total spent (all):{' '}
          </span>
          {grandError ? (
            <span className="text-red-600" role="alert">
              {grandError}
            </span>
          ) : grandLoading ? (
            <span data-testid="grand-loading">Calculating…</span>
          ) : grandCents !== null ? (
            <span data-testid="grand-total">{formatCents(grandCents)}</span>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </section>
  );
}
