import { z } from 'zod';

const MAX_DECIMAL_10_2 = 99_999_999.99;

/**
 * @description Parses list query: limit (1–100, default 20), offset (≥0, default 0).
 */
export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

/**
 * @description Validates `:id` path param as a positive integer safe for JS `number` and MySQL BIGINT for this app.
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id must be a positive integer')
    .transform((s) => Number(s))
    .refine(
      (n) => Number.isInteger(n) && n > 0 && n <= Number.MAX_SAFE_INTEGER,
      'id is out of supported range'
    ),
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * @description Normalizes amount to a two-decimal string; accepts JSON string or number.
 */
export const amountFieldSchema = z
  .union([z.string(), z.number()])
  .superRefine((val, ctx) => {
    const raw =
      typeof val === 'string' ? val.trim() : Number.isFinite(val) ? String(val) : '';
    if (raw === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'amount is required' });
      return;
    }
    if (/[eE]/.test(raw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must not use scientific notation',
      });
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must be a positive number',
      });
      return;
    }
    if (num > MAX_DECIMAL_10_2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount exceeds maximum',
      });
      return;
    }
    const parts = raw.split('.');
    const frac = parts[1];
    if (frac !== undefined && frac.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must have at most 2 decimal places',
      });
    }
  })
  .transform((val) => {
    const num = Number(typeof val === 'string' ? val.trim() : val);
    return num.toFixed(2);
  });

const categoryIdFieldSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);

/**
 * @description Request body for POST /api/expenses.
 */
export const createBodySchema = z.object({
  description: z.string().trim().min(1).max(512),
  amount: amountFieldSchema,
  categoryId: categoryIdFieldSchema,
});

export type CreateBody = z.infer<typeof createBodySchema>;

/**
 * @description Request body for PATCH /api/expenses/:id — at least one field required.
 */
export const patchBodySchema = z
  .object({
    description: z.string().trim().min(1).max(512).optional(),
    amount: amountFieldSchema.optional(),
    categoryId: categoryIdFieldSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const has =
      data.description !== undefined ||
      data.amount !== undefined ||
      data.categoryId !== undefined;
    if (!has) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'At least one of description, amount, categoryId is required',
      });
    }
  });

export type PatchBody = z.infer<typeof patchBodySchema>;

/**
 * @description First validation error message for mapping to `VALIDATION_ERROR`.
 * @param error - Zod error from `safeParse`.
 * @returns Human-readable message safe for clients.
 */
export function zodErrorMessage(error: z.ZodError): string {
  const first = error.errors[0];
  if (!first) {
    return 'Validation failed';
  }
  return first.message;
}
