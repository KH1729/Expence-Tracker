/**
 * @description Operational HTTP error with a stable client-facing `code` and HTTP status.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;

  /**
   * @description Creates an error mapped by the global error handler to JSON (not a generic 500).
   * @param statusCode - HTTP status (e.g. 400, 404, 503).
   * @param code - Machine-readable code (e.g. `VALIDATION_ERROR`).
   * @param message - Safe, non-secret message for clients.
   */
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * @description Type guard for {@link HttpError} (works across `instanceof` boundaries).
 * @param value - Unknown thrown value.
 * @returns Whether `value` is an {@link HttpError}.
 */
export function isHttpError(value: unknown): value is HttpError {
  return value instanceof HttpError;
}
