import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * @description Wraps an async Express handler so rejections are passed to `next`.
 * @param fn - Async route handler.
 * @returns Express middleware that forwards errors to the error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
