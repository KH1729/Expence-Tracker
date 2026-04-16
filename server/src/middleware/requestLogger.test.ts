import { describe, expect, it } from 'vitest';
import { createRequestLogger } from './requestLogger.js';
import { mockLogger } from '../test/fixtures.js';

describe('createRequestLogger', () => {
  it('returns an Express-compatible middleware function', () => {
    const mw = createRequestLogger(mockLogger);
    expect(typeof mw).toBe('function');
    expect(mw.length).toBeGreaterThanOrEqual(2);
  });
});
