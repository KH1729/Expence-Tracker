import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'pino';
import { isHttpError } from '../errors/httpError.js';

/**
 * @description Maps thrown errors to JSON; {@link HttpError} preserves status and `error.code`.
 * @param logger - Structured logger (must not log secrets).
 * @returns Express error-handling middleware (declare after all routes).
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, _req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }

    if (isHttpError(err)) {
      if (err.statusCode >= 500) {
        logger.warn(
          { code: err.code, statusCode: err.statusCode },
          'Operational server error'
        );
      } else {
        logger.info(
          { code: err.code, statusCode: err.statusCode },
          'HTTP client error'
        );
      }

      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      });
      return;
    }

    logger.error({ err }, 'Unhandled request error');

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    });
  };
}
