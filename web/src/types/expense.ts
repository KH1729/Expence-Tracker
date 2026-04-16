/**
 * @description Expense row as returned by GET/POST/PATCH `/api/expenses` (camelCase).
 */
export interface Expense {
  id: number;
  description: string;
  amount: string;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}
