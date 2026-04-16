import { Router } from 'express';
import type { Pool } from 'mysql2/promise';
import type { Logger } from 'pino';
import { HttpError } from '../errors/httpError.js';
import { mapCategoryRow } from '../mappers/categoryMapper.js';
import {
  categoryZodErrorMessage,
  createCategoryBodySchema,
} from '../schemas/categorySchemas.js';
import {
  findCategoryById,
  insertCategory,
  listCategories,
} from '../services/categoryRepository.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export interface CategoriesRouterDeps {
  pool: Pool;
  logger: Logger;
}

/**
 * @description Registers `/api/categories` routes (mount at `/api/categories`).
 * @param deps - Pool and logger.
 * @returns Express router.
 */
export function createCategoriesRouter(deps: CategoriesRouterDeps): Router {
  const { pool, logger } = deps;
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await listCategories(pool);
      res.status(200).json({
        success: true,
        data: {
          items: rows.map((row) => mapCategoryRow(row)),
        },
      });
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = createCategoryBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(
          400,
          'VALIDATION_ERROR',
          categoryZodErrorMessage(parsed.error)
        );
      }
      const id = await insertCategory(pool, parsed.data.name);
      logger.info({ categoryId: id }, 'Category created');
      const row = await findCategoryById(pool, id);
      if (!row) {
        throw new HttpError(
          500,
          'INTERNAL_ERROR',
          'Failed to load created category'
        );
      }
      res.status(201).json({
        success: true,
        data: { category: mapCategoryRow(row) },
      });
    })
  );

  return router;
}
