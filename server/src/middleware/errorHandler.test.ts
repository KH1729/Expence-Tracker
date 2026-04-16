import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '../errors/httpError.js';
import { mockLogger } from '../test/fixtures.js';
import { createErrorHandler } from './errorHandler.js';

describe('createErrorHandler', () => {
  it('maps HttpError to JSON with matching status and code', () => {
    const handler = createErrorHandler(mockLogger);
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = {
      headersSent: false,
      status,
      json,
    } as unknown as Response;
    const next = vi.fn();

    handler(
      new HttpError(404, 'NOT_FOUND', 'Expense not found'),
      {} as Request,
      res,
      next
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Expense not found' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('maps unknown errors to 500 INTERNAL_ERROR', () => {
    const handler = createErrorHandler(mockLogger);
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = {
      headersSent: false,
      status,
      json,
    } as unknown as Response;
    const next = vi.fn();

    handler(new Error('boom'), {} as Request, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'boom' },
    });
  });
});
