import { z } from 'zod';

/**
 * @description Request body for POST /api/categories.
 */
export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(128),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

/**
 * @description First validation error message for mapping to `VALIDATION_ERROR`.
 * @param error - Zod error from `safeParse`.
 * @returns Human-readable message safe for clients.
 */
export function categoryZodErrorMessage(error: z.ZodError): string {
  const first = error.errors[0];
  if (!first) {
    return 'Validation failed';
  }
  return first.message;
}
