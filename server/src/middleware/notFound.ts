import type { RequestHandler } from 'express';

/**
 * @description Returns a JSON 404 response for unknown routes.
 */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Not found',
    },
  });
};
