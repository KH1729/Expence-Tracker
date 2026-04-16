import type { Expense } from '@/types/expense';

interface ExpenseTableProps {
  items: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * @description Tabular list of expenses with edit/delete actions.
 */
export function ExpenseTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  if (isLoading) {
    return <p className="text-zinc-600">Loading expenses…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-600">
        No expenses yet. Add one using the form below.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium">Amount</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.id}
              className="border-t border-zinc-200 dark:border-zinc-700"
            >
              <td className="px-3 py-2">{row.description}</td>
              <td className="px-3 py-2 font-mono">{row.amount}</td>
              <td className="px-3 py-2">{row.category.name}</td>
              <td className="px-3 py-2 text-zinc-600">{formatWhen(row.createdAt)}</td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-blue-600 underline hover:no-underline"
                    onClick={() => {
                      onEdit(row);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-600 underline hover:no-underline"
                    onClick={() => {
                      onDelete(row);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
