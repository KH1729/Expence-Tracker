import { z } from 'zod';

const descriptionField = z
  .string()
  .trim()
  .min(1, 'Description is required')
  .max(512, 'Description is too long');

const categoryField = z
  .string()
  .trim()
  .min(1, 'Category is required')
  .max(128, 'Category is too long');

const amountField = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid positive amount (max 2 decimal places)')
  .refine((val) => {
    const n = Number.parseFloat(val);
    return Number.isFinite(n) && n > 0;
  }, 'Amount must be greater than zero');

/**
 * @description Zod schema for POST /api/expenses body.
 */
export const expenseCreateSchema = z.object({
  description: descriptionField,
  amount: amountField,
  category: categoryField,
});

/**
 * @description Zod schema for PATCH /api/expenses/:id (at least one field).
 */
export const expensePatchSchema = z
  .object({
    description: descriptionField.optional(),
    amount: amountField.optional(),
    category: categoryField.optional(),
  })
  .refine(
    (data) =>
      data.description !== undefined ||
      data.amount !== undefined ||
      data.category !== undefined,
    { message: 'Change at least one field' }
  );

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpensePatchInput = z.infer<typeof expensePatchSchema>;
