import { Router } from 'express';
import type { Pool } from 'mysql2/promise';
import type { Logger } from 'pino';
import { HttpError } from '../errors/httpError.js';
import { mapExpenseRow } from '../mappers/expenseMapper.js';
import {
  createBodySchema,
  idParamSchema,
  listQuerySchema,
  patchBodySchema,
  zodErrorMessage,
} from '../schemas/expenseSchemas.js';
import {
  countExpenses,
  deleteExpenseById,
  findExpenseById,
  insertExpense,
  listExpenses,
  updateExpensePartial,
} from '../services/expenseRepository.js';
import { findCategoryById } from '../services/categoryRepository.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export interface ExpensesRouterDeps {
  pool: Pool;
  logger: Logger;
}

/**
 * @description Registers `/api/expenses` CRUD routes (mount at `/api/expenses`).
 * @param deps - Pool and logger.
 * @returns Express router.
 */
export function createExpensesRouter(deps: ExpensesRouterDeps): Router {
  const { pool, logger } = deps;
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(parsed.error));
      }
      const { limit, offset } = parsed.data;
      const total = await countExpenses(pool);
      const rows = await listExpenses(pool, limit, offset);
      res.status(200).json({
        success: true,
        data: {
          items: rows.map((row) => mapExpenseRow(row)),
          total,
        },
      });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const parsed = idParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(parsed.error));
      }
      const row = await findExpenseById(pool, parsed.data.id);
      if (!row) {
        throw new HttpError(404, 'NOT_FOUND', 'Expense not found');
      }
      res.status(200).json({
        success: true,
        data: { expense: mapExpenseRow(row) },
      });
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = createBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(parsed.error));
      }
      const category = await findCategoryById(pool, parsed.data.categoryId);
      if (!category) {
        throw new HttpError(
          422,
          'INVALID_CATEGORY',
          'Category does not exist'
        );
      }
      const id = await insertExpense(pool, parsed.data);
      logger.info({ expenseId: id }, 'Expense created');
      const row = await findExpenseById(pool, id);
      if (!row) {
        throw new HttpError(
          500,
          'INTERNAL_ERROR',
          'Failed to load created expense'
        );
      }
      res.status(201).json({
        success: true,
        data: { expense: mapExpenseRow(row) },
      });
    })
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const idParsed = idParamSchema.safeParse(req.params);
      if (!idParsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(idParsed.error));
      }
      const bodyParsed = patchBodySchema.safeParse(req.body);
      if (!bodyParsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(bodyParsed.error));
      }
      if (bodyParsed.data.categoryId !== undefined) {
        const category = await findCategoryById(pool, bodyParsed.data.categoryId);
        if (!category) {
          throw new HttpError(
            422,
            'INVALID_CATEGORY',
            'Category does not exist'
          );
        }
      }
      const row = await updateExpensePartial(
        pool,
        idParsed.data.id,
        bodyParsed.data
      );
      if (!row) {
        throw new HttpError(404, 'NOT_FOUND', 'Expense not found');
      }
      logger.info({ expenseId: idParsed.data.id }, 'Expense updated');
      res.status(200).json({
        success: true,
        data: { expense: mapExpenseRow(row) },
      });
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const parsed = idParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new HttpError(400, 'VALIDATION_ERROR', zodErrorMessage(parsed.error));
      }
      const removed = await deleteExpenseById(pool, parsed.data.id);
      if (!removed) {
        throw new HttpError(404, 'NOT_FOUND', 'Expense not found');
      }
      logger.info({ expenseId: parsed.data.id }, 'Expense deleted');
      res.status(204).send();
    })
  );

  return router;
}
