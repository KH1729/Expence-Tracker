/**
 * @description Expense entity as returned by the public JSON API (camelCase).
 */
export interface Expense {
  id: number;
  description: string;
  /** Two-decimal string (e.g. `"10.50"`). */
  amount: string;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}
