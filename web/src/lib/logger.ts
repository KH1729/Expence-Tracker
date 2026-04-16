/**
 * @description Development-only debug logger; no output in production (no console.log in prod).
 * @param message - Context label.
 * @param meta - Optional structured fields.
 */
export function devLog(message: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (meta !== undefined) {
    // eslint-disable-next-line no-console -- dev-only; gated above
    console.debug(`[expense-ui] ${message}`, meta);
    return;
  }
  // eslint-disable-next-line no-console -- dev-only; gated above
  console.debug(`[expense-ui] ${message}`);
}
