import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';

export interface HealthDependencies {
  pingDatabase: () => Promise<boolean>;
}

/**
 * @description Registers `GET /health` with database up/down reporting.
 * @param deps - `pingDatabase` must resolve connectivity without throwing for "up".
 * @returns Express router mounted at app root.
 */
export function createHealthRouter(deps: HealthDependencies): Router {
  const router = Router();

  router.get(
    '/health',
    asyncHandler(async (_req, res) => {
      const isUp = await deps.pingDatabase();
      if (isUp) {
        res.status(200).json({
          success: true,
          data: {
            status: 'ok',
            db: 'up',
          },
        });
        return;
      }

      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database unavailable',
        },
      });
    })
  );

  return router;
}
