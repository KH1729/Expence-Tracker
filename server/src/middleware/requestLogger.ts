import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';

/**
 * @description Express middleware that logs each request/response (method, URL, status, duration) via pino. Skips high-frequency `GET /health` polls. Does not log request bodies or Authorization headers.
 * @param logger - Root pino logger for the process.
 * @returns Express middleware compatible with `app.use(...)`.
 */
export function createRequestLogger(
  logger: Logger
): (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void {
  return pinoHttp({
    logger,
    genReqId: () => randomUUID(),
    autoLogging: {
      ignore: (req: IncomingMessage) => {
        const url = req.url ?? '';
        return url === '/health' || url.startsWith('/health?');
      },
    },
    customLogLevel: (
      _req: IncomingMessage,
      res: ServerResponse,
      err?: Error
    ) => {
      if (err) {
        return 'error';
      }
      const status = res.statusCode;
      if (status >= 500) {
        return 'error';
      }
      if (status >= 400) {
        return 'warn';
      }
      return 'info';
    },
  });
}
