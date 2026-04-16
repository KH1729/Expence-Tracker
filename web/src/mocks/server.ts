import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * @description MSW server for Vitest (intercepts `fetch` to the API base URL).
 */
export const server = setupServer(...handlers);
